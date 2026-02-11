/**
 * BackendAgent — Firestore Data & Business Logic
 *
 * All Firestore reads/writes. Zero UI knowledge.
 * Depends on CloudAgent for the shared Firestore `db` instance.
 *
 * Design: Schema-discovery-first. Collection names and field mappings
 * are configurable via SchemaConfig so we can adapt once we run the
 * discover-schema script against prod.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  query,
  limit,
  startAfter,
  orderBy,
  where,
  DocumentSnapshot,
  QueryDocumentSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from './CloudAgent';
import { parsePrice } from '../utils/price';
import type {
  Chamber,
  ChamberProduct,
  MembershipLead,
  LoginPayload,
  SignUpPayload,
  AuthResponse,
  MembershipPayload,
  TransactionResult,
  MemberRecord,
  MembershipTier,
} from '../../types';

// ---------------------------------------------------------------------------
// Schema Configuration
// ---------------------------------------------------------------------------

/**
 * Determines how products are stored in Firestore.
 */
export enum ProductSource {
  TOP_LEVEL_COLLECTION = 'TOP_LEVEL_COLLECTION',
  SUBCOLLECTION = 'SUBCOLLECTION',
  INLINE_TIERS = 'INLINE_TIERS',
}

export interface SchemaConfig {
  organizationsCollection: string;
  leadsCollection: string;
  productsCollection: string;
  productSource: ProductSource;
  /** The field name used for organization name indexing in Firestore (e.g. 'name' or 'org_name') */
  orgNameField: string;
}

const DEFAULT_SCHEMA_CONFIG: SchemaConfig = {
  organizationsCollection: 'organizations',
  leadsCollection: 'leads',
  productsCollection: 'products',
  productSource: ProductSource.SUBCOLLECTION,
  orgNameField: 'name', // or 'org_name' for legacy data
};

export interface OrganizationWithProducts extends Chamber {
  products: ChamberProduct[];
}

// ---------------------------------------------------------------------------
// Field Mapping Helpers
// ---------------------------------------------------------------------------

function mapDocToChamber(docSnap: DocumentSnapshot): Chamber | null {
  if (!docSnap.exists()) return null;

  const d = docSnap.data()!;

  return {
    id: docSnap.id,
    name: d.name ?? d.org_name ?? d.chamberName ?? 'Unnamed Organization',
    region: d.region ?? d.location ?? d.city ?? '',
    address: d.address ?? d.streetAddress ?? undefined,
    coordinates: d.coordinates ?? d.geo ?? undefined,
    industryTags: Array.isArray(d.industryTags)
      ? d.industryTags
      : Array.isArray(d.tags)
        ? d.tags
        : [],
    description: d.description ?? d.about ?? '',
    logoUrl: d.logoUrl ?? d.logo ?? '',
    websiteDomain: d.websiteDomain ?? d.domain ?? d.website ?? '',
    verificationStatus: d.verificationStatus ?? 'Unverified',
    stripeConnected: d.stripeConnected ?? false,
    tiers: {
      bronze: d.tiers?.bronze ?? 0,
      silver: d.tiers?.silver ?? 0,
      gold: d.tiers?.gold ?? 0,
    },
  };
}

function mapDocToProduct(
  docSnap: QueryDocumentSnapshot,
  chamberId: string,
): ChamberProduct {
  const d = docSnap.data();

  return {
    id: docSnap.id,
    chamberId: d.chamberId ?? chamberId,
    name: d.name ?? d.productName ?? 'Unnamed Product',
    description: d.description ?? '',
    pricingType: d.pricingType === 'Contact' ? 'Contact' : 'Fixed',
    price: typeof d.price === 'number' ? d.price : undefined,
    benefits: Array.isArray(d.benefits) ? d.benefits : [],
  };
}

function tiersToProducts(
  tiers: Record<string, unknown>,
  chamberId: string,
): ChamberProduct[] {
  return Object.entries(tiers)
    .map(([tierName, val]) => {
      const price = typeof val === 'number' ? val : parsePrice(String(val));
      return { tierName, price };
    })
    .filter(({ price }) => price > 0)
    .map(({ tierName, price }) => ({
      id: `${chamberId}_tier_${tierName}`,
      chamberId,
      name: tierName.charAt(0).toUpperCase() + tierName.slice(1),
      description: `${tierName.charAt(0).toUpperCase() + tierName.slice(1)} tier membership`,
      pricingType: 'Fixed' as const,
      price,
      benefits: [],
    }));
}

// ---------------------------------------------------------------------------
// BackendAgent Singleton
// ---------------------------------------------------------------------------

class BackendAgent {
  private static instance: BackendAgent;
  private config: SchemaConfig;

  private constructor(config?: Partial<SchemaConfig>) {
    this.config = { ...DEFAULT_SCHEMA_CONFIG, ...config };
    console.log('[BackendAgent] Re-Initialized with schema config:', JSON.stringify(this.config, null, 2));
  }

  public static getInstance(config?: Partial<SchemaConfig>): BackendAgent {
    if (!BackendAgent.instance) {
      BackendAgent.instance = new BackendAgent(config);
    }
    return BackendAgent.instance;
  }

  public updateConfig(patch: Partial<SchemaConfig>): void {
    this.config = { ...this.config, ...patch };
    console.log('[BackendAgent] Schema config updated:', JSON.stringify(this.config, null, 2));
  }

  // -----------------------------------------------------------------------
  // Organizations
  // -----------------------------------------------------------------------

  async getOrganizations(
    pageSize = 20,
    lastDoc?: DocumentSnapshot,
  ): Promise<{ items: Chamber[]; lastDoc: DocumentSnapshot | null }> {
    console.log(`[BackendAgent] getOrganizations(pageSize=${pageSize}, cursor=${lastDoc?.id ?? 'none'})`);

    const colRef = collection(db, this.config.organizationsCollection);
    const q = lastDoc
      ? query(colRef, orderBy(this.config.orgNameField), startAfter(lastDoc), limit(pageSize))
      : query(colRef, orderBy(this.config.orgNameField), limit(pageSize));

    const snapshot = await getDocs(q);
    const items: Chamber[] = [];
    snapshot.forEach((docSnap) => {
      const chamber = mapDocToChamber(docSnap);
      if (chamber) items.push(chamber);
    });

    return { 
      items, 
      lastDoc: snapshot.docs[snapshot.docs.length - 1] ?? null 
    };
  }

  async getOrganization(id: string): Promise<OrganizationWithProducts | null> {
    console.log(`[BackendAgent] getOrganization(${id})`);
    const docRef = doc(db, this.config.organizationsCollection, id);
    const docSnap = await getDoc(docRef);
    const chamber = mapDocToChamber(docSnap);

    if (!chamber) return null;
    const products = await this.getProducts(id);
    return { ...chamber, products };
  }

  /** Alias for backward compatibility */
  async getChambers(pageSize?: number, lastDoc?: DocumentSnapshot) { return this.getOrganizations(pageSize, lastDoc); }
  async getChamber(id: string) { return this.getOrganization(id); }
  async getChamberById(id: string) { return this.getOrganization(id); }
  async getOrganizationById(id: string) { return this.getOrganization(id); }
  async saveChamberProduct(p: any) { return this.saveProduct(p); }
  async deleteChamberProduct(id: string) { return this.deleteProduct(id); }
  async getChamberProducts(id: string) { return this.getProducts(id); }
  async getProductsByChamberId(id: string) { return this.getProducts(id); }

  async searchOrganizations(searchQuery: string, industryTag?: string): Promise<Chamber[]> {
    console.log(`[BackendAgent] searchOrganizations("${searchQuery}", "${industryTag ?? 'none'}")`);
    
    // If query is empty, return empty
    const term = searchQuery.trim();
    if (!term && !industryTag) return [];

    // Attempt native Firestore range query for prefix matching
    try {
      const colRef = collection(db, this.config.organizationsCollection);
      
      // Basic prefix query: [term, term + \uf8ff]
      const q = term 
        ? query(colRef, where(this.config.orgNameField, '>=', term), where(this.config.orgNameField, '<=', term + '\uf8ff'), limit(50))
        : query(colRef, limit(50));

      const snapshot = await getDocs(q);
      const results: Chamber[] = [];
      snapshot.forEach(docSnap => {
        const chamber = mapDocToChamber(docSnap);
        if (chamber) {
          // Additional client-side filter for industry tag if provided (case-insensitive)
          if (industryTag) {
            const match = chamber.industryTags.some(t => t.toLowerCase() === industryTag.toLowerCase());
            if (!match) return;
          }
          results.push(chamber);
        }
      });

      // If we found local results, return them
      if (results.length > 0) return results;

      // Fallback to gasShim for "fuzzy" search if Firestore returns nothing (or for complex tag logic)
      const { searchChambers } = await import('../../services/gasShim');
      return searchChambers(searchQuery, industryTag);
    } catch (err) {
      console.warn('[BackendAgent] Firestore search failed, falling back to gasShim:', err);
      const { searchChambers } = await import('../../services/gasShim');
      return searchChambers(searchQuery, industryTag);
    }
  }

  /** Alias for backward compatibility */
  async searchChambers(searchQuery: string, industryTag?: string) { return this.searchOrganizations(searchQuery, industryTag); }

  async getAllOrganizations(): Promise<Chamber[]> {
    // Large fetch for "All" (limit 500)
    const { items } = await this.getOrganizations(500);
    return items;
  }

  /** Alias for backward compatibility */
  async getAllChambers() { return this.getAllOrganizations(); }

  // -----------------------------------------------------------------------
  // Products (strategy-based)
  // -----------------------------------------------------------------------

  async getProducts(chamberId: string): Promise<ChamberProduct[]> {
    switch (this.config.productSource) {
      case ProductSource.TOP_LEVEL_COLLECTION:
        return this.getProductsFromTopLevel(chamberId);
      case ProductSource.SUBCOLLECTION:
        return this.getProductsFromSubcollection(chamberId);
      case ProductSource.INLINE_TIERS:
        return this.getProductsFromInlineTiers(chamberId);
      default:
        return this.getProductsFromSubcollection(chamberId);
    }
  }

  private async getProductsFromTopLevel(chamberId: string): Promise<ChamberProduct[]> {
    const colRef = collection(db, this.config.productsCollection);
    const snapshot = await getDocs(query(colRef, where('chamberId', '==', chamberId), limit(100)));
    return snapshot.docs.map(docSnap => mapDocToProduct(docSnap, chamberId));
  }

  private async getProductsFromSubcollection(chamberId: string): Promise<ChamberProduct[]> {
    const subRef = collection(db, this.config.organizationsCollection, chamberId, 'products');
    const snapshot = await getDocs(subRef);
    return snapshot.docs.map(docSnap => mapDocToProduct(docSnap, chamberId));
  }

  private async getProductsFromInlineTiers(chamberId: string): Promise<ChamberProduct[]> {
    const docRef = doc(db, this.config.organizationsCollection, chamberId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return [];
    
    const data = docSnap.data();
    const tiers = data.tiers ?? data.products ?? {};
    return tiersToProducts(tiers as Record<string, unknown>, chamberId);
  }

  // -----------------------------------------------------------------------
  // Business Logic Methods
  // -----------------------------------------------------------------------

  async createLead(lead: MembershipLead): Promise<boolean> {
    try {
      const colRef = collection(db, this.config.leadsCollection);
      await addDoc(colRef, { ...lead, createdAt: Timestamp.now() });
      return true;
    } catch (error) {
      console.error('[BackendAgent] createLead failed:', error);
      return false;
    }
  }

  async loginUser(payload: LoginPayload): Promise<AuthResponse> {
    const { loginUser } = await import('../../services/gasShim');
    return loginUser(payload);
  }

  async registerUser(payload: SignUpPayload): Promise<AuthResponse> {
    const { registerUser } = await import('../../services/gasShim');
    return registerUser(payload);
  }

  /** Legacy alias for FrontendAgent compat */
  async login(payload: LoginPayload) { return this.loginUser(payload); }
  async register(payload: SignUpPayload) { return this.registerUser(payload); }

  async processMembership(payload: MembershipPayload): Promise<TransactionResult> {
    const { processMembership } = await import('../../services/gasShim');
    return processMembership(payload);
  }

  async processCheckout(payload: any) { return this.processMembership(payload); }

  // -----------------------------------------------------------------------
  // Admin Stubs
  // -----------------------------------------------------------------------

  async claimListing(email: string, chamberId: string) {
    const { claimListing } = await import('../../services/gasShim');
    return claimListing(chamberId, email);
  }

  async verifyOTP(email: string, code: string) {
    const { verifyOTP } = await import('../../services/gasShim');
    return { status: await verifyOTP(code) ? 'success' : 'error' };
  }

  async getMembersByChamberId(chamberId: string) {
    const { getPendingMembers } = await import('../../services/gasShim');
    return getPendingMembers(chamberId);
  }

  async approveMember(memberId: string) {
    const { approveMember } = await import('../../services/gasShim');
    return approveMember(memberId);
  }

  async saveProduct(product: any) {
    const { saveChamberProduct } = await import('../../services/gasShim');
    return saveChamberProduct(product);
  }

  async deleteProduct(id: string) {
    const { deleteChamberProduct } = await import('../../services/gasShim');
    return deleteChamberProduct(id);
  }

  async getAISuggestions(name: string) {
    const { generateAISuggestions } = await import('../../services/gasShim');
    const tiers = await generateAISuggestions(name, 'Default Region');
    return { description: tiers[0]?.description ?? '', services: tiers[0]?.benefits ?? [] };
  }

  // -----------------------------------------------------------------------
  // Discovery
  // -----------------------------------------------------------------------

  async discoverSchema(): Promise<void> {
    const candidates = ['organizations', 'orgs', 'chambers', 'leads', 'products'];
    console.log('[BackendAgent] ── Client Discovery ──');
    for (const name of candidates) {
      try {
        const snapshot = await getDocs(query(collection(db, name), limit(1)));
        console.log(`  ${snapshot.empty ? '📂' : '✅'} ${name}: ${snapshot.size} doc(s)`);
      } catch (e) {
        console.log(`  🔒 ${name}: Access restricted`);
      }
    }
  }
}

export const backendAgent = BackendAgent.getInstance();
export default backendAgent;

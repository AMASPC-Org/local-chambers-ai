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
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { db, auth, functions, googleProvider, linkedInProvider } from './CloudAgent';
import { httpsCallable } from 'firebase/functions';
import { GoogleAuthProvider, signInWithPopup, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, User as FirebaseUser } from 'firebase/auth';
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
  UserProfile,
  VerificationResponse,
  MembershipPacketResponse
} from '../types';
import { chamberService } from '../services/ChamberService';


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

  // Spread ALL raw Firestore fields first, then overlay normalized Chamber fields.
  // This preserves research data (org_name, executive, website, services,
  // membership_tiers, data_quality, key_events, etc.) for the profile page
  // while also providing the standard Chamber interface fields.
  return {
    ...d,
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
    verificationStatus: d.verificationStatus ?? 'Verified',
    stripeConnected: d.stripeConnected ?? false,
    ownerId: d.ownerId,
    tiers: {
      bronze: d.tiers?.bronze ?? 0,
      silver: d.tiers?.silver ?? 0,
      gold: d.tiers?.gold ?? 0,
    },
  } as Chamber;
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

  private get baseUrl(): string {
    const env = (import.meta as any).env;
    return env?.VITE_AMA_API_URL || process.env.VITE_AMA_API_URL || 'http://localhost:8080';
  }

  private async apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown API error' }));
        throw new Error(errorData.error || errorData.message || `API error: ${response.status}`);
      }

      return await response.json();
    } catch (e: any) {
      console.error(`[BackendAgent] API Call Failed [${endpoint}]:`, e);
      throw e;
    }
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
  async saveChamberProduct(p: ChamberProduct | Omit<ChamberProduct, 'id'>) { return this.saveProduct(p); }
  async deleteChamberProduct(id: string) { return this.deleteProduct(id); }
  async getChamberProducts(id: string) { return this.getProducts(id); }
  async getProductsByChamberId(id: string) { return this.getProducts(id); }

  async searchOrganizations(searchQuery: string, industryTag?: string, filters?: import('../services/ChamberService').ChamberFilters): Promise<Chamber[]> {
    console.log(`[BackendAgent] Proxying to ChamberService.find_chamber("${searchQuery}", "${industryTag ?? 'none'}")`);

    return chamberService.find_chamber(searchQuery, {
      industryTags: industryTag ? [industryTag] : undefined,
      ...filters,
    });
  }

  /** Alias for backward compatibility */
  async searchChambers(searchQuery: string, industryTag?: string, filters?: import('../services/ChamberService').ChamberFilters) { return this.searchOrganizations(searchQuery, industryTag, filters); }

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
    return this.apiCall<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async registerUser(payload: SignUpPayload): Promise<AuthResponse> {
    return this.apiCall<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // -----------------------------------------------------------------------
  // Real Firebase Auth Implementation
  // -----------------------------------------------------------------------

  private mapFirebaseUserToUser(user: FirebaseUser): UserProfile {
    return {
      id: user.uid,
      email: user.email || '',
      firstName: user.displayName?.split(' ')[0] || '',
      lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
      companyName: '',
      isNonProfit: false,
    };
  }

  async signInWithGoogle(): Promise<AuthResponse> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return {
        status: 'success',
        user: this.mapFirebaseUserToUser(result.user)
      };
    } catch (error: any) {
      console.error('[BackendAgent] Google sign-in failed:', error);
      return { status: 'error', message: error.message };
    }
  }

  async signInWithLinkedIn(): Promise<AuthResponse> {
    try {
      const result = await signInWithPopup(auth, linkedInProvider);
      return {
        status: 'success',
        user: this.mapFirebaseUserToUser(result.user)
      };
    } catch (error: any) {
      console.error('[BackendAgent] LinkedIn sign-in failed:', error);
      return { status: 'error', message: error.message };
    }
  }

  async logout(): Promise<void> {
    await signOut(auth);
  }

  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  }

  /** Legacy alias for FrontendAgent compat */
  async login(payload: LoginPayload) { return this.loginUser(payload); }
  async register(payload: SignUpPayload) { return this.registerUser(payload); }

  async processMembership(payload: MembershipPayload): Promise<TransactionResult> {
    if (payload.paymentMethod === 'Card') {
      return this.apiCall<TransactionResult>('/api/checkout/create-session', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    }

    // Invoice flow
    return this.apiCall<TransactionResult>('/api/memberships/enroll', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  /**
   * Alias for processMembership for useCheckout hook
   */
  async processCheckout(payload: any): Promise<TransactionResult> {
    return this.processMembership(payload);
  }



  // -----------------------------------------------------------------------
  // Admin Stubs
  // -----------------------------------------------------------------------

  async claimListing(email: string, chamberId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const verifyClaim = httpsCallable<{ chamberId: string, email: string }, VerificationResponse>(functions, 'verifyChamberClaim');
      const result = await verifyClaim({ chamberId, email });
      const data = result.data;
      if (data.success) {
        return { success: true, message: 'Claim verification started. Please check your email and the chamber website.' };
      } else {
        return { success: false, error: data.message || 'Verification failed.' };
      }
    } catch (error: any) {
      console.error('Error claiming listing:', error);
      return { success: false, error: error.message || 'An unexpected error occurred.' };
    }
  }

  async verifyOTP(email: string, code: string) {
    return this.apiCall<{ status: string }>('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, code })
    });
  }

  async getMembersByChamberId(chamberId: string) {
    return this.apiCall<any[]>(`/api/memberships/pending?chamberId=${chamberId}`);
  }

  async approveMember(memberId: string) {
    return this.apiCall<any>('/api/memberships/approve', {
      method: 'POST',
      body: JSON.stringify({ memberId })
    });
  }

  async saveProduct(product: ChamberProduct | Omit<ChamberProduct, 'id'>) {
    return this.apiCall<any>('/api/products', {
      method: 'POST',
      body: JSON.stringify(product)
    });
  }

  async deleteProduct(id: string) {
    return this.apiCall<any>(`/api/products/${id}`, {
      method: 'DELETE'
    });
  }

  async getAISuggestions(name: string) {
    return this.apiCall<{ description: string, services: string[] }>(`/api/ai/suggestions?name=${encodeURIComponent(name)}`);
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
  async generateMembershipPacket(chamberId: string, userData: any): Promise<MembershipPacketResponse> {
    try {
      const generatePacket = httpsCallable<{ chamberId: string, userData: any }, MembershipPacketResponse>(functions, 'generateMembershipPacket');
      const result = await generatePacket({ chamberId, userData });
      return result.data;
    } catch (error: any) {
      console.error('Error generating membership packet:', error);
      throw error;
    }
  }
}

export const backendAgent = BackendAgent.getInstance();
export default backendAgent;

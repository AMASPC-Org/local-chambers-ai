import { 
  collection, 
  query, 
  getDocs, 
  doc, 
  getDoc, 
  limit, 
  startAfter, 
  orderBy, 
  where,
  QueryDocumentSnapshot,
  DocumentData,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './CloudAgent';

export interface Organization {
  id: string;
  org_name: string; // From seeded data
  name?: string;     // Alias for frontend compatibility
  org_type?: string;
  city?: string;
  state?: string;
  website?: string;
  region?: string;   // For Search/Profile
  address?: string;  // For Profile
  description?: string; // For Search/Profile
  industryTags?: string[]; // For Search/Profile
  logoUrl?: string; // For Search/Profile
  verificationStatus?: 'Unverified' | 'Verified' | 'Pending';
  services?: string[]; // For Profile
  data_quality?: {
    completeness_score: number;
    last_updated?: string;
  };
  executive?: {
    name: string;
    title: string;
  };
  membership_tiers?: Array<{
    name: string;
    annual_cost: string;
    description: string;
  }>;
  [key: string]: any; 
}

export interface Lead {
  org_id: string;
  email: string;
  name: string;
  message?: string;
  source: string;
  created_at: any;
}

class BackendAgent {
  private static instance: BackendAgent;

  private constructor() {}

  public static getInstance(): BackendAgent {
    if (!BackendAgent.instance) {
      BackendAgent.instance = new BackendAgent();
    }
    return BackendAgent.instance;
  }

  /**
   * Fetches organizations with pagination
   */
  public async getOrganizations(pageSize: number = 10, lastDoc?: QueryDocumentSnapshot<DocumentData>) {
    try {
      const orgsCol = collection(db, 'organizations');
      let q = query(orgsCol, orderBy('org_name'), limit(pageSize));
      
      if (lastDoc) {
        q = query(orgsCol, orderBy('org_name'), startAfter(lastDoc), limit(pageSize));
      }

      const snapshot = await getDocs(q);
      const organizations = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.org_name, // Map for frontend
          ...data
        } as Organization;
      });

      return {
        organizations,
        lastDoc: snapshot.docs[snapshot.docs.length - 1]
      };
    } catch (error) {
      console.error('[BackendAgent] Error fetching organizations:', error);
      throw error;
    }
  }

  /**
   * Simple search implementation (client-side filter for now or basic 'where' if indexed)
   * Note: Firestore doesn't support full-text search without Algolia/Elastic.
   */
  public async searchOrganizations(term: string) {
    try {
      const orgsCol = collection(db, 'organizations');
      const q = query(
        orgsCol, 
        where('org_name', '>=', term), 
        where('org_name', '<=', term + '\uf8ff'),
        limit(20)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.org_name,
          ...data
        } as Organization;
      });
    } catch (error) {
      console.error('[BackendAgent] Error searching organizations:', error);
      throw error;
    }
  }

  /**
   * Fetches a single organization by ID
   */
  public async getOrganizationById(id: string): Promise<Organization | null> {
    try {
      const docRef = doc(db, 'organizations', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return { 
          id: docSnap.id, 
          name: data.org_name,
          ...data 
        } as Organization;
      }
      return null;
    } catch (error) {
      console.error('[BackendAgent] Error fetching organization:', error);
      throw error;
    }
  }

  /**
   * Creates a lead record
   */
  public async createLead(lead: Omit<Lead, 'created_at'>) {
    try {
      const leadsCol = collection(db, 'leads');
      const docRef = await addDoc(leadsCol, {
        ...lead,
        created_at: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('[BackendAgent] Error creating lead:', error);
      throw error;
    }
  }

  // --- Auth Stubs for Frontend Integration ---
  
  public async login(credentials: any) {
    console.log('[BackendAgent] Stub Login for:', credentials.email);
    return { status: 'success', user: { email: credentials.email, id: 'user-123' } };
  }

  public async register(userData: any) {
    console.log('[BackendAgent] Stub Register for:', userData.email);
    return { status: 'success', user: { ...userData, id: 'user-123' } };
  }
}

export const backendAgent = BackendAgent.getInstance();

import { collection, getDocs, query, where, orderBy, limit, DocumentData } from 'firebase/firestore';
import { db } from '../agents/CloudAgent';
import { Chamber } from '../types';

export interface ChamberFilters {
  region?: string;
  industryTags?: string[];
  prefixMatch?: boolean;
}

/**
 * ChamberService
 * 
 * Responsible for finding and retrieving Chamber of Commerce data.
 * Acts as the Source of Truth for chamber discovery.
 */
class ChamberService {
  private static instance: ChamberService;
  private readonly collectionName = 'organizations'; // Primary collection matched with seed script

  private constructor() { }

  public static getInstance(mockDb?: any): ChamberService {
    if (!ChamberService.instance) {
      ChamberService.instance = new ChamberService();
      if (mockDb) {
        // We can't easily overwrite the imported 'db' constant, 
        // so we'll add a 'db' property and use it instead of the import.
        (ChamberService.instance as any).db = mockDb;
      }
    }
    return ChamberService.instance;
  }

  // Helper to get the db (either injected or default)
  private getDb() {
    return (this as any).db || db;
  }

  /**
   * Finds chambers based on a text query and optional filters.
   * Returns a strict JSON array of Chamber objects.
   * 
   * @param queryText - Search term for chamber name or region
   * @param filters - Optional filters for region or tags
   */
  async find_chamber(queryText: string, filters?: ChamberFilters): Promise<Chamber[]> {
    console.log(`[ChamberService] find_chamber("${queryText}", ${JSON.stringify(filters)})`);

    try {
      // 1. Sanitize input
      const term = queryText.trim();

      // 2. Build Query
      const chambersRef = collection(this.getDb(), this.collectionName);
      // Note: Seeded data uses 'org_name' (not 'name') and has no 'verificationStatus'.
      // All seeded records are verified source-of-truth research data.

      let q;

      if (term) {
        // Fetch all and filter client-side for case-insensitive, substring search
        // Firestore prefix queries are case-sensitive and only match from the start,
        // so we use client-side filtering for a small dataset.
        // Increasing limit to 500 to prevent alphabetical cutoff during search/autocomplete
        q = query(chambersRef, orderBy('org_name'), limit(500));
      } else if (filters?.region) {
        // Filter by region
        q = query(
          chambersRef,
          where('region', '==', filters.region),
          orderBy('org_name'),
          limit(50)
        );
      } else {
        // No filters - list all
        q = query(
          chambersRef,
          orderBy('org_name'),
          limit(50)
        );
      }

      console.log(`[ChamberService] Executing find_chamber query with term="${term || ''}"`);
      const snapshot = await getDocs(q);
      const results: Chamber[] = [];

      // Tokenize search term for bidirectional word-level matching
      const lowerTerm = term.toLowerCase();
      const searchWords = lowerTerm.split(/\s+/).filter(Boolean);

      snapshot.forEach((doc) => {
        const data = doc.data();
        // Spread raw data first, then overlay mapped Chamber fields.
        // This lets UI components access both raw fields (org_name, city, state, services)
        // AND the normalized Chamber interface fields (name, region, etc.).
        const chamber = { ...data, ...this.mapDocToChamber(doc.id, data) } as Chamber;
        let match = true;

        if (term && searchWords.length > 0) {
          if (filters?.prefixMatch) {
            // Prefix match: org_name must start with the query (trimmed for robustness)
            const orgName = (data.org_name || '').toLowerCase();
            match = orgName.startsWith(lowerTerm.trim());
          } else {
            // Word-level bidirectional match across key fields
            // e.g. "chambers" matches "chamber" because one contains the other as a substring
            const docWords = [
              data.org_name, data.city, data.state, data.region,
              ...(Array.isArray(data.services) ? data.services : [])
            ].filter(Boolean).join(' ').toLowerCase().split(/\s+/);
            match = searchWords.every((sw: string) =>
              docWords.some((dw: string) => dw.includes(sw) || sw.includes(dw))
            );
          }
        }

        // In-memory region filter (case-insensitive)
        if (match && filters?.region && !chamber.region?.toLowerCase().includes(filters.region.toLowerCase())) {
          match = false;
        }

        if (match) {
          results.push(chamber);
        }
      });

      return results;

    } catch (error) {
      console.error('[ChamberService] find_chamber error:', error);
      // Fallback to empty array to maintain strict JSON return type
      return [];
    }
  }

  /**
   * Retrieves a single chamber by ID.
   */
  async get_chamber(id: string): Promise<Chamber | null> {
    // This logic duplicates BackendAgent's getOrganization for now, 
    // but ensures strict typing and separation of concerns.
    console.log(`[ChamberService] get_chamber("${id}")`);
    // Implementation deferred to BackendAgent integration to avoid circular deps or duplication 
    // for this specific 'find' task, but defining interface here.
    return null;
  }

  private mapDocToChamber(id: string, data: DocumentData): Chamber {
    return {
      id: id,
      // Map from seeded 'org_name' to Chamber 'name', with fallback
      name: data.org_name ?? data.name ?? 'Unnamed Chamber',
      region: data.region ?? '',
      address: data.address,
      coordinates: data.coordinates,
      industryTags: Array.isArray(data.industryTags) ? data.industryTags :
        Array.isArray(data.advocacy_priorities) ? data.advocacy_priorities : [],
      description: data.description ?? (data.services ? data.services.join(', ') : ''),
      logoUrl: data.logoUrl ?? '',
      websiteDomain: data.websiteDomain ?? data.website ?? '',
      verificationStatus: data.verificationStatus ?? 'Verified',
      stripeConnected: data.stripeConnected ?? false,
      ownerId: data.ownerId,
      tiers: data.tiers ?? data.membership_tiers ?? { bronze: 0, silver: 0, gold: 0 }
    };
  }
}

export const chamberService = ChamberService.getInstance();

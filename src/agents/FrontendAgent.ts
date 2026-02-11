import { useState, useEffect, useCallback } from 'react';
import { backendAgent, Organization } from './BackendAgent';
import { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';

/**
 * Hook to fetch and manage a list of organizations with pagination
 */
export function useOrganizations(pageSize: number = 10) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | undefined>(undefined);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const fetchOrganizations = useCallback(async (isNextPage: boolean = false) => {
    setLoading(true);
    try {
      const result = await backendAgent.getOrganizations(pageSize, isNextPage ? lastDoc : undefined);
      
      if (isNextPage) {
        setOrganizations(prev => [...prev, ...result.organizations]);
      } else {
        setOrganizations(result.organizations);
      }

      setLastDoc(result.lastDoc);
      setHasMore(result.organizations.length === pageSize);
      setError(null);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [pageSize, lastDoc]);

  // Initial fetch
  useEffect(() => {
    fetchOrganizations();
  }, []); // Only on mount

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchOrganizations(true);
    }
  };

  const refresh = () => {
    setLastDoc(undefined);
    fetchOrganizations(false);
  };

  return { organizations, loading, error, hasMore, loadMore, refresh };
}

/**
 * Hook to fetch a single organization by ID
 */
export function useOrganization(id: string) {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchOrg = async () => {
      setLoading(true);
      try {
        const org = await backendAgent.getOrganizationById(id);
        setOrganization(org);
        setError(null);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrg();
  }, [id]);

  return { organization, loading, error };
}

/**
 * Hook for lead creation
 */
export function useLead() {
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const submitLead = async (orgId: string, name: string, email: string, message: string, source: string) => {
    setSubmitting(true);
    setSuccess(false);
    setError(null);
    try {
      await backendAgent.createLead({
        org_id: orgId,
        name,
        email,
        message,
        source
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  };

  return { submitLead, submitting, success, error };
}

/**
 * Hook for searching organizations
 */
export function useSearch() {
  const [results, setResults] = useState<Organization[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const search = useCallback(async (query: string) => {
    setLoading(true);
    try {
      const data = await backendAgent.searchOrganizations(query);
      setResults(data);
      setError(null);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { results, loading, error, search };
}

// Aliases for backward compatibility
export { useLead as useLeadSubmit };

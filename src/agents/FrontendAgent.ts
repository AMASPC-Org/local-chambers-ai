import { useState, useEffect, useCallback } from 'react';
import { backendAgent } from './BackendAgent';
import type {
  Chamber,
  MembershipLead,
  LoginPayload,
  SignUpPayload,
  MembershipPayload,
  ChamberProduct
} from '../types';
import { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';

/**
 * Hook to fetch and manage a list of organizations with pagination
 */
export function useOrganizations(pageSize: number = 10) {
  const [chambers, setChambers] = useState<Chamber[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | undefined>(undefined);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const fetchChambers = useCallback(async (isNextPage: boolean = false) => {
    setLoading(true);
    try {
      const result = await backendAgent.getOrganizations(pageSize, isNextPage ? lastDoc : undefined);

      if (isNextPage) {
        setChambers(prev => [...prev, ...result.items]);
      } else {
        setChambers(result.items);
      }

      setLastDoc(result.lastDoc);
      setHasMore(result.items.length === pageSize);
      setError(null);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [pageSize, lastDoc]);

  // Initial fetch
  useEffect(() => {
    fetchChambers();
  }, []); // Only on mount

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchChambers(true);
    }
  };

  const refresh = () => {
    setLastDoc(undefined);
    fetchChambers(false);
  };

  return { chambers, loading, error, hasMore, loadMore, refresh, organizations: chambers };
}

/**
 * Hook to fetch a single organization by ID
 */
export function useChamber(id: string) {
  const [organization, setChamber] = useState<Chamber | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchOrg = async () => {
      setLoading(true);
      try {
        const org = await backendAgent.getChamberById(id);
        setChamber(org);
        setError(null);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrg();
  }, [id]);

  return { organization, data: organization, loading, error };
}

// Alias for backward compatibility
export { useChamber as useOrganization };

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
        chamberId: orgId,
        userName: name,
        userEmail: email,
        userPhone: '', // placeholder as this hook doesn't provide it
        productId: 'general',
        productName: 'General Inquiry',
        message,
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
 * @deprecated Use `useChambers` with React Query instead.
 */
export function useSearch() {
  const [results, setResults] = useState<Chamber[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const search = useCallback(async (query: string) => {
    if (!query) return;
    setLoading(true);
    try {
      const orgs = await backendAgent.searchChambers(query);
      setResults(orgs);
      setError(null);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { results, loading, error, search };
}

// Alias for backward compatibility
export { useSearch as useSearchOrganizations };

/**
 * Hook for login
 */
export function useLogin() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: any): Promise<{ status: 'success'; user: any } | { status: 'error'; message: string }> => {
    setLoading(true);
    setError(null);
    try {
      const response = await backendAgent.login(credentials);
      return response as { status: 'success'; user: any };
    } catch (err: any) {
      const message = err.message || 'Login failed';
      setError(message);
      return { status: 'error', message };
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
}

/**
 * Hook for Google OAuth
 */
export function useGoogleSignIn() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = async (): Promise<{ status: 'success'; user: any } | { status: 'error'; message: string }> => {
    setLoading(true);
    setError(null);
    try {
      const response = await backendAgent.signInWithGoogle();
      return response as any;
    } catch (err: any) {
      const message = err.message || 'Google sign-in failed';
      setError(message);
      return { status: 'error', message };
    } finally {
      setLoading(false);
    }
  };

  return { signIn, loading, error };
}

/**
 * Hook for LinkedIn OAuth
 */
export function useLinkedInSignIn() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = async (): Promise<{ status: 'success'; user: any } | { status: 'error'; message: string }> => {
    setLoading(true);
    setError(null);
    try {
      const response = await backendAgent.signInWithLinkedIn();
      return response as any;
    } catch (err: any) {
      const message = err.message || 'LinkedIn sign-in failed';
      setError(message);
      return { status: 'error', message };
    } finally {
      setLoading(false);
    }
  };

  return { signIn, loading, error };
}

/**
 * Hook for sign up
 */
export function useSignUp() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const register = async (userData: any): Promise<{ status: 'success'; user: any } | { status: 'error'; message: string }> => {
    setLoading(true);
    setError(null);
    try {
      const response = await backendAgent.register(userData);
      return response as { status: 'success'; user: any };
    } catch (err: any) {
      const message = err.message || 'Registration failed';
      setError(message);
      return { status: 'error', message };
    } finally {
      setLoading(false);
    }
  };

  return { register, loading, error };
}

/**
 * Hook for Admin Dashboard - Members management
 */
export function useAdminMembers(chamberId?: string) {
  const [chamber, setChamber] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (!chamberId) return;
    const loadData = async () => {
      setLoading(true);
      try {
        const [c, m] = await Promise.all([
          backendAgent.getChamberById(chamberId),
          backendAgent.getMembersByChamberId(chamberId)
        ]);
        setChamber(c);
        setMembers(m);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [chamberId]);

  const approve = async (memberId: string) => {
    setProcessingId(memberId);
    try {
      await backendAgent.approveMember(memberId);
      setMembers(prev => prev.map(m => m.id === memberId ? { ...m, status: 'Active' } : m));
    } finally {
      setProcessingId(null);
    }
  };

  return { chamber, members, loading, approve, processingId };
}

/**
 * Hook for Admin Product Builder
 */
export function useChamberProducts(chamberId?: string) {
  const [chamber, setChamber] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    if (!chamberId) return;
    const loadData = async () => {
      setLoading(true);
      try {
        const [c, p] = await Promise.all([
          backendAgent.getChamberById(chamberId),
          backendAgent.getProductsByChamberId(chamberId)
        ]);
        setChamber(c);
        setProducts(p as any[]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [chamberId]);

  const save = async (product: any) => {
    setSaving(true);
    try {
      const result = await backendAgent.saveProduct(product);
      if (!product.id || product.id.startsWith('temp_')) {
        setProducts(prev => prev.map(p => p.id === product.id ? { ...p, id: result.id } : p));
      }
    } finally {
      setSaving(false);
    }
  };

  const remove = async (productId: string) => {
    try {
      await backendAgent.deleteProduct(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (err) {
      console.error(err);
    }
  };

  return { chamber, products, setProducts, loading, saving, save, remove };
}

/**
 * Hook for Admin OTP verification
 */
export function useVerifyOTP() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const verify = async (otp: string) => {
    setLoading(true);
    setError(null);
    try {
      // Note: AdminVerify.tsx only passes code. Email is in location state.
      // This is a stub that always succeeds for dummy codes.
      const result = await backendAgent.verifyOTP('admin@chamber.com', otp);
      return result.status === 'success';
    } catch (err) {
      setError(err);
      return false;
    } finally {
      setLoading(false);
    }
  };
  return { verify, loading, error };
}

/**
 * Hook for claiming a listing
 */
export function useClaimListing() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [chambers, setChambers] = useState<any[]>([]);

  useEffect(() => {
    const fetchChambers = async () => {
      const orgs = await backendAgent.getAllChambers();
      setChambers(orgs);
    };
    fetchChambers();
  }, []);

  const claim = async (orgId: string, email: string) => {
    setLoading(true);
    setError(null);
    try {
      return await backendAgent.claimListing(email, orgId);
    } catch (err: any) {
      setError(err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };
  return { chambers, claim, loading, error };
}

/**
 * Hook for AI profile suggestions
 */
export function useAISuggestions() {
  const [loading, setLoading] = useState(false);
  const generate = async (name: string, region: string) => {
    setLoading(true);
    try {
      // Map to MembershipTier structure expected by AdminWizard
      const suggestions = await backendAgent.getAISuggestions(name);
      return [
        { name: 'Bronze', price: 500, description: suggestions.description, benefits: suggestions.services.slice(0, 2) },
        { name: 'Silver', price: 1200, description: suggestions.description, benefits: suggestions.services.slice(0, 3) },
        { name: 'Gold', price: 2500, description: suggestions.description, benefits: suggestions.services }
      ];
    } finally {
      setLoading(false);
    }
  };
  return { generate, loading };
}

/**
 * Hook for checkout processing
 */
export function useCheckout() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const process = async (payload: any) => {
    setLoading(true);
    try {
      const res = await backendAgent.processCheckout(payload);
      setResult(res);
      return res;
    } finally {
      setLoading(false);
    }
  };
  return { process, processing: loading, result };
}

// Aliases for backward compatibility
export { useLead as useLeadSubmit };

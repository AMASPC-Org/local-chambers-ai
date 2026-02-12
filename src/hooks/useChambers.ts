import { useQuery } from '@tanstack/react-query';
import { backendAgent } from '../agents/BackendAgent';
import { Chamber } from '../types';

export interface UseChambersOptions {
  query?: string;
  industryTag?: string;
  region?: string;
  enabled?: boolean;
}

export function useChambers({ query = '', industryTag, region, enabled = true }: UseChambersOptions = {}) {
  return useQuery({
    queryKey: ['chambers', query, industryTag, region],
    queryFn: async () => {
      console.log(`[useChambers] Fetching for query: "${query}" tag: "${industryTag}" region: "${region}"`);
      return backendAgent.searchChambers(query, industryTag, { region });
    },
    enabled: enabled && (query.length > 0 || !!industryTag || !!region),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

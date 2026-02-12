import { useState, useEffect, useRef, useCallback } from 'react';
import { backendAgent } from '../agents/BackendAgent';
import { Chamber } from '../types';

/**
 * useAutocomplete — UI-agnostic autocomplete hook.
 *
 * Debounces the input and fetches prefix-matched chamber suggestions.
 * Does NOT handle navigation or selection — consumers decide what to do
 * when a suggestion is clicked.
 *
 * @param debounceMs - Debounce delay in milliseconds (default 300)
 */
export function useAutocomplete(debounceMs = 300) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Chamber[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Track the latest request to avoid race conditions
  const latestRequestRef = useRef(0);

  // Debounce the query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  // Fetch suggestions when debounced query changes
  useEffect(() => {
    if (debouncedQuery.length < 1) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    const requestId = ++latestRequestRef.current;
    setIsLoading(true);

    backendAgent
      .searchChambers(debouncedQuery, undefined, { prefixMatch: true })
      .then((results) => {
        // Only apply if this is still the latest request
        if (requestId === latestRequestRef.current) {
          setSuggestions(results);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error('[useAutocomplete] Error fetching suggestions:', err);
        if (requestId === latestRequestRef.current) {
          setSuggestions([]);
          setIsLoading(false);
        }
      });
  }, [debouncedQuery]);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
  }, []);

  return {
    /** Current raw query text */
    query,
    /** Set the raw query text (drives debounce → fetch) */
    setQuery,
    /** Prefix-matched Chamber suggestions */
    suggestions,
    /** True while a fetch is in-flight */
    isLoading,
    /** Manually clear the suggestions dropdown */
    clearSuggestions,
  };
}

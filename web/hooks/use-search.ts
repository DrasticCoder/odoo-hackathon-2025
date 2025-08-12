import { useState, useEffect, useCallback } from 'react';
import { SearchService, UniversalSearchQuery, UniversalSearchResponse } from '@/services/search.service';
import { useDebounce } from '@/hooks/use-debounce';

interface UseSearchOptions {
  debounceMs?: number;
  minQueryLength?: number;
  autoSearch?: boolean;
}

export function useSearch(options: UseSearchOptions = {}) {
  const { debounceMs = 300, minQueryLength = 2, autoSearch = true } = options;

  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<UniversalSearchResponse | null>(null);

  const debouncedQuery = useDebounce(query, debounceMs);

  const search = useCallback(
    async (searchQuery: UniversalSearchQuery) => {
      if (!searchQuery.q || searchQuery.q.length < minQueryLength) {
        setResults(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await SearchService.universalSearch(searchQuery);
        setResults(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while searching');
        setResults(null);
      } finally {
        setIsLoading(false);
      }
    },
    [minQueryLength]
  );

  const quickSearch = useCallback(
    async (searchQuery: string, limit = 5) => {
      if (!searchQuery || searchQuery.length < minQueryLength) {
        setResults(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await SearchService.quickSearch(searchQuery, limit);
        setResults(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while searching');
        setResults(null);
      } finally {
        setIsLoading(false);
      }
    },
    [minQueryLength]
  );

  const clearResults = useCallback(() => {
    setResults(null);
    setError(null);
    setQuery('');
  }, []);

  // Auto-search when query changes (if enabled)
  useEffect(() => {
    if (autoSearch && debouncedQuery) {
      search({ q: debouncedQuery });
    }
  }, [debouncedQuery, search, autoSearch]);

  return {
    query,
    setQuery,
    isLoading,
    error,
    results,
    search,
    quickSearch,
    clearResults,
  };
}

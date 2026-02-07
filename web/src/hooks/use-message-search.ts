"use client";

import { useState, useCallback, useRef } from "react";
import type { SearchResult, PagedResult } from "@/types";
import { searchMessages } from "@/lib/api/search";

export function useMessageSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const search = useCallback(
    async (
      searchTerm: string,
      conversationId?: string,
      page: number = 1
    ) => {
      if (searchTerm.length < 2) {
        setResults([]);
        setTotalCount(0);
        return;
      }

      setIsLoading(true);
      try {
        const response = await searchMessages({
          q: searchTerm,
          conversationId,
          page,
          pageSize: 20,
        });
        if (response.success && response.data) {
          const data = response.data as PagedResult<SearchResult>;
          setResults(page === 1 ? data.items : [...results, ...data.items]);
          setTotalCount(data.totalCount);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [results]
  );

  const debouncedSearch = useCallback(
    (searchTerm: string, conversationId?: string) => {
      setQuery(searchTerm);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        search(searchTerm, conversationId);
      }, 300);
    },
    [search]
  );

  const clearSearch = useCallback(() => {
    setQuery("");
    setResults([]);
    setTotalCount(0);
  }, []);

  return {
    query,
    results,
    isLoading,
    totalCount,
    search,
    debouncedSearch,
    clearSearch,
  };
}

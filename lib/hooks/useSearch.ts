'use client';

import { useMutation } from '@tanstack/react-query';
import type { ParticipantSearchResult } from '@/types';

interface SearchVariables {
  query: string;
}

/** TanStack Query mutation for searching participants by reg number or email */
export function useSearch() {
  return useMutation({
    mutationFn: async ({ query }: SearchVariables): Promise<ParticipantSearchResult[]> => {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Search failed');
      }

      const json = await res.json();
      return json.data;
    },
  });
}

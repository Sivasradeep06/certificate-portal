'use client';

import { useQuery } from '@tanstack/react-query';
import type { CertificateTemplate } from '@/types';

/** Fetch certificate templates for a given event */
export function useEventTemplates(eventId: string) {
  return useQuery({
    queryKey: ['templates', eventId],
    queryFn: async (): Promise<CertificateTemplate[]> => {
      const res = await fetch(`/api/events/${eventId}/templates`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to fetch templates');
      }
      const json = await res.json();
      return json.data;
    },
    enabled: !!eventId,
  });
}

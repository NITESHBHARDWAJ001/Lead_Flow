import { useQuery } from '@tanstack/react-query';
import { leadService } from '@/services/lead.service';
import { QUERY_KEYS } from '@/constants';
import type { LeadFilters } from '@/types';

export function useLeads(filters?: LeadFilters) {
  return useQuery({
    queryKey: [...QUERY_KEYS.LEADS, filters],
    queryFn: () => leadService.list(filters),
    staleTime: 30 * 1000,
  });
}

export function useLead(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.LEAD(id),
    queryFn: () => leadService.getById(id),
    enabled: !!id,
  });
}

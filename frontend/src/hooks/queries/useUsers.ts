import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { QUERY_KEYS } from '@/constants';
import type { UserFilters } from '@/types';

export function useUsers(filters?: UserFilters) {
  return useQuery({
    queryKey: [...QUERY_KEYS.USERS, filters],
    queryFn: () => userService.list(filters),
    staleTime: 30 * 1000,
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.USER(id),
    queryFn: () => userService.getById(id),
    enabled: !!id,
  });
}

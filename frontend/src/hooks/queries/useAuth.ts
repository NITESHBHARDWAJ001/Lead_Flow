import { useQuery } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { QUERY_KEYS } from '@/constants';
import { getToken } from '@/api/axios';

export function useMe() {
  return useQuery({
    queryKey: QUERY_KEYS.AUTH_ME,
    queryFn: () => authService.getMe(),
    enabled: !!getToken(),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

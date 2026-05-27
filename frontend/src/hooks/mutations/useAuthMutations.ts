import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import { QUERY_KEYS } from '@/constants';

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authService.login(email, password),
    onSuccess: (data) => {
      // Synchronously populate the cache so AuthProvider sees isAuthenticated=true
      // before the navigate() call renders ProtectedRoute
      queryClient.setQueryData(QUERY_KEYS.AUTH_ME, data.user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return () => {
    authService.logout();
    queryClient.clear();
    navigate('/login');
  };
}

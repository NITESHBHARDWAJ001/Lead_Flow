import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userService, type CreateUserPayload, type UpdateUserPayload } from '@/services/user.service';
import { QUERY_KEYS } from '@/constants';

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUserPayload) => userService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS });
    },
  });
}

export function useUpdateUser(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateUserPayload) => userService.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER(id) });
    },
  });
}

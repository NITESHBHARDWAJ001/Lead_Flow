import { useMutation, useQueryClient } from '@tanstack/react-query';
import { leadService, type CreateLeadPayload, type UpdateLeadPayload } from '@/services/lead.service';
import { QUERY_KEYS } from '@/constants';

export function useCreateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateLeadPayload) => leadService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LEADS });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_DASHBOARD });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EMPLOYEE_DASHBOARD });
    },
  });
}

export function useUpdateLead(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateLeadPayload) => leadService.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LEADS });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LEAD(id) });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_DASHBOARD });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EMPLOYEE_DASHBOARD });
    },
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => leadService.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LEADS });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_DASHBOARD });
    },
  });
}

import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard.service';
import { QUERY_KEYS } from '@/constants';

export function useAdminDashboard() {
  return useQuery({
    queryKey: QUERY_KEYS.ADMIN_DASHBOARD,
    queryFn: () => dashboardService.getAdminDashboard(),
    staleTime: 60 * 1000,
  });
}

export function useEmployeeDashboard() {
  return useQuery({
    queryKey: QUERY_KEYS.EMPLOYEE_DASHBOARD,
    queryFn: () => dashboardService.getEmployeeDashboard(),
    staleTime: 60 * 1000,
  });
}

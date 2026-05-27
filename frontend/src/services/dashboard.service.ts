import { apiClient } from '@/api/axios';
import { ENDPOINTS } from '@/api/endpoints';
import type { AdminDashboardData, ApiResponse, EmployeeDashboardData } from '@/types';

export const dashboardService = {
  async getAdminDashboard(): Promise<AdminDashboardData> {
    const { data } = await apiClient.get<ApiResponse<AdminDashboardData>>(
      ENDPOINTS.DASHBOARD.ADMIN,
    );
    return data.data;
  },

  async getEmployeeDashboard(): Promise<EmployeeDashboardData> {
    const { data } = await apiClient.get<ApiResponse<EmployeeDashboardData>>(
      ENDPOINTS.DASHBOARD.EMPLOYEE,
    );
    return data.data;
  },
};

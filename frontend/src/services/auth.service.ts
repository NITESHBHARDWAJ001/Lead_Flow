import { apiClient, setToken, clearToken } from '@/api/axios';
import { ENDPOINTS } from '@/api/endpoints';
import type { ApiResponse, AuthUser, LoginResponse } from '@/types';

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const { data } = await apiClient.post<ApiResponse<LoginResponse>>(ENDPOINTS.AUTH.LOGIN, {
      email,
      password,
    });
    setToken(data.data.token);
    return data.data;
  },

  async getMe(): Promise<AuthUser> {
    const { data } = await apiClient.get<ApiResponse<AuthUser>>(ENDPOINTS.AUTH.ME);
    return data.data;
  },

  logout(): void {
    clearToken();
  },
};

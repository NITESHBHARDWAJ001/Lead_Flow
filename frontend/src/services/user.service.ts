import { apiClient } from '@/api/axios';
import { ENDPOINTS } from '@/api/endpoints';
import type { ApiResponse, PaginatedData, User, UserFilters } from '@/types';

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role?: 'ADMIN' | 'EMPLOYEE';
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  password?: string;
  isActive?: boolean;
}

export const userService = {
  async list(filters?: UserFilters): Promise<PaginatedData<User>> {
    const params = new URLSearchParams();
    if (filters?.search) params.set('search', filters.search);
    if (filters?.role) params.set('role', filters.role);
    if (filters?.isActive !== undefined) params.set('isActive', String(filters.isActive));
    if (filters?.page) params.set('page', String(filters.page));
    if (filters?.limit) params.set('limit', String(filters.limit));

    const { data } = await apiClient.get<ApiResponse<PaginatedData<User>>>(
      `${ENDPOINTS.USERS.LIST}?${params.toString()}`,
    );
    return data.data;
  },

  async getById(id: string): Promise<User> {
    const { data } = await apiClient.get<ApiResponse<User>>(ENDPOINTS.USERS.BY_ID(id));
    return data.data;
  },

  async create(payload: CreateUserPayload): Promise<User> {
    const { data } = await apiClient.post<ApiResponse<User>>(ENDPOINTS.USERS.CREATE, payload);
    return data.data;
  },

  async update(id: string, payload: UpdateUserPayload): Promise<User> {
    const { data } = await apiClient.patch<ApiResponse<User>>(ENDPOINTS.USERS.UPDATE(id), payload);
    return data.data;
  },
};

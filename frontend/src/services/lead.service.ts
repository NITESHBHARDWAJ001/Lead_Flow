import { apiClient } from '@/api/axios';
import { ENDPOINTS } from '@/api/endpoints';
import type { ApiResponse, Lead, LeadFilters, LeadSource, LeadStatus, PaginatedData } from '@/types';

export interface CreateLeadPayload {
  name: string;
  phone: string;
  email?: string;
  source: LeadSource;
  status?: LeadStatus;
  notes?: string;
  assignedToId?: string;
}

export interface UpdateLeadPayload {
  name?: string;
  phone?: string;
  email?: string;
  source?: LeadSource;
  status?: LeadStatus;
  notes?: string;
  assignedToId?: string;
}

export const leadService = {
  async list(filters?: LeadFilters): Promise<PaginatedData<Lead>> {
    const params = new URLSearchParams();
    if (filters?.search) params.set('search', filters.search);
    if (filters?.status) params.set('status', filters.status);
    if (filters?.source) params.set('source', filters.source);
    if (filters?.employeeId) params.set('employeeId', filters.employeeId);
    if (filters?.page) params.set('page', String(filters.page));
    if (filters?.limit) params.set('limit', String(filters.limit));
    if (filters?.sortBy) params.set('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.set('sortOrder', filters.sortOrder);

    const { data } = await apiClient.get<ApiResponse<PaginatedData<Lead>>>(
      `${ENDPOINTS.LEADS.LIST}?${params.toString()}`,
    );
    return data.data;
  },

  async getById(id: string): Promise<Lead> {
    const { data } = await apiClient.get<ApiResponse<Lead>>(ENDPOINTS.LEADS.BY_ID(id));
    return data.data;
  },

  async create(payload: CreateLeadPayload): Promise<Lead> {
    const { data } = await apiClient.post<ApiResponse<Lead>>(ENDPOINTS.LEADS.CREATE, payload);
    return data.data;
  },

  async update(id: string, payload: UpdateLeadPayload): Promise<Lead> {
    const { data } = await apiClient.patch<ApiResponse<Lead>>(
      ENDPOINTS.LEADS.UPDATE(id),
      payload,
    );
    return data.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(ENDPOINTS.LEADS.DELETE(id));
  },
};

export type Role = 'ADMIN' | 'EMPLOYEE';
export type LeadStatus = 'INTERESTED' | 'NOT_INTERESTED' | 'CONVERTED';
export type LeadSource = 'CALL' | 'WHATSAPP' | 'FIELD';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { assignedLeads: number };
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  source: LeadSource;
  status: LeadStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: { id: string; name: string; email: string };
  assignedTo: { id: string; name: string; email: string };
  statusHistory?: StatusHistoryEntry[];
}

export interface StatusHistoryEntry {
  id: string;
  oldStatus: LeadStatus | null;
  newStatus: LeadStatus;
  createdAt: string;
  changedBy: { id: string; name: string };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface AdminDashboardData {
  stats: {
    totalLeads: number;
    interestedLeads: number;
    convertedLeads: number;
    notInterestedLeads: number;
    totalEmployees: number;
    conversionRate: number;
  };
  statusDistribution: Array<{ status: string; count: number; color: string }>;
  leadsPerMonth: Array<{ month: string; total: number; converted: number }>;
  employeePerformance: Array<{
    id: string;
    name: string;
    email: string;
    isActive: boolean;
    totalLeads: number;
    convertedLeads: number;
    interestedLeads: number;
    conversionRate: number;
  }>;
}

export interface EmployeeDashboardData {
  stats: {
    totalLeads: number;
    interestedLeads: number;
    convertedLeads: number;
    notInterestedLeads: number;
    conversionRate: number;
  };
  statusDistribution: Array<{ status: string; count: number; color: string }>;
  recentLeads: Array<{
    id: string;
    name: string;
    phone: string;
    status: LeadStatus;
    source: LeadSource;
    updatedAt: string;
  }>;
}

export interface LeadFilters {
  search?: string;
  status?: LeadStatus;
  source?: LeadSource;
  employeeId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UserFilters {
  search?: string;
  role?: Role;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

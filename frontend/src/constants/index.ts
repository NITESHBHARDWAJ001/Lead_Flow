import type { LeadSource, LeadStatus } from '@/types';

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  INTERESTED: 'Interested',
  NOT_INTERESTED: 'Not Interested',
  CONVERTED: 'Converted',
};

export const LEAD_STATUS_COLORS: Record<LeadStatus, string> = {
  INTERESTED: 'bg-blue-100 text-blue-700 border-blue-200',
  NOT_INTERESTED: 'bg-red-100 text-red-700 border-red-200',
  CONVERTED: 'bg-green-100 text-green-700 border-green-200',
};

export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  CALL: 'Call',
  WHATSAPP: 'WhatsApp',
  FIELD: 'Field',
};

export const LEAD_SOURCE_ICONS: Record<LeadSource, string> = {
  CALL: '📞',
  WHATSAPP: '💬',
  FIELD: '🚗',
};

export const QUERY_KEYS = {
  AUTH_ME: ['auth', 'me'],
  USERS: ['users'],
  USER: (id: string) => ['users', id],
  LEADS: ['leads'],
  LEAD: (id: string) => ['leads', id],
  ADMIN_DASHBOARD: ['dashboard', 'admin'],
  EMPLOYEE_DASHBOARD: ['dashboard', 'employee'],
} as const;

export const DEFAULT_PAGE_SIZE = 10;

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    ME: '/auth/me',
  },
  USERS: {
    LIST: '/users',
    CREATE: '/users',
    BY_ID: (id: string) => `/users/${id}`,
    UPDATE: (id: string) => `/users/${id}`,
  },
  LEADS: {
    LIST: '/leads',
    CREATE: '/leads',
    BY_ID: (id: string) => `/leads/${id}`,
    UPDATE: (id: string) => `/leads/${id}`,
    DELETE: (id: string) => `/leads/${id}`,
  },
  DASHBOARD: {
    ADMIN: '/dashboard/admin',
    EMPLOYEE: '/dashboard/employee',
  },
} as const;

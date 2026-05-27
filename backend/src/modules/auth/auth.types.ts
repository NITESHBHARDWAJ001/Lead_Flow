import type { Role } from '@prisma/client';

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

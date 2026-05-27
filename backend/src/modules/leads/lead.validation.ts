import { z } from 'zod';
import { LeadStatus, LeadSource } from '@prisma/client';

export const createLeadSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: z
    .string()
    .min(7, 'Phone must be at least 7 characters')
    .max(20)
    .regex(/^[+\d\s\-().]+$/, 'Invalid phone number format'),
  email: z.string().email('Invalid email').optional().or(z.literal('')).transform(v => v || undefined),
  source: z.nativeEnum(LeadSource),
  status: z.nativeEnum(LeadStatus).optional().default(LeadStatus.INTERESTED),
  notes: z.string().max(2000).optional(),
  assignedToId: z.string().cuid('Invalid user ID').optional(),
});

export const updateLeadSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().min(7).max(20).regex(/^[+\d\s\-().]+$/).optional(),
  email: z.string().email().optional().or(z.literal('')).transform(v => v || undefined),
  source: z.nativeEnum(LeadSource).optional(),
  status: z.nativeEnum(LeadStatus).optional(),
  notes: z.string().max(2000).optional(),
  assignedToId: z.string().cuid().optional(),
});

export const listLeadsQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  status: z.nativeEnum(LeadStatus).optional(),
  source: z.nativeEnum(LeadSource).optional(),
  employeeId: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
export type ListLeadsQuery = z.infer<typeof listLeadsQuerySchema>;

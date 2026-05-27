import type { Prisma, Role } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { NotFoundError, AuthorizationError } from '../../utils/errors';
import { parsePagination, buildPaginatedResponse } from '../../utils/pagination';
import type { CreateLeadInput, UpdateLeadInput, ListLeadsQuery } from './lead.validation';

const LEAD_SELECT = {
  id: true,
  name: true,
  phone: true,
  email: true,
  source: true,
  status: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
  createdBy: { select: { id: true, name: true, email: true } },
  assignedTo: { select: { id: true, name: true, email: true } },
} satisfies Prisma.LeadSelect;

export async function createLeadService(
  input: CreateLeadInput,
  requesterId: string,
  requesterRole: Role,
) {
  const assignedToId =
    requesterRole === 'ADMIN' ? (input.assignedToId ?? requesterId) : requesterId;

  const lead = await prisma.lead.create({
    data: {
      name: input.name,
      phone: input.phone,
      email: input.email,
      source: input.source,
      status: input.status,
      notes: input.notes,
      createdById: requesterId,
      assignedToId,
    },
    select: LEAD_SELECT,
  });

  await prisma.leadStatusHistory.create({
    data: {
      leadId: lead.id,
      newStatus: lead.status,
      changedById: requesterId,
    },
  });

  return lead;
}

export async function listLeadsService(query: ListLeadsQuery, requesterId: string, requesterRole: Role) {
  const { page, limit, skip, take, sortBy, sortOrder } = parsePagination(
    query as Record<string, string | undefined>,
  );

  const where: Prisma.LeadWhereInput = {};

  if (requesterRole === 'EMPLOYEE') {
    where.assignedToId = requesterId;
  }

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { phone: { contains: query.search, mode: 'insensitive' } },
      { email: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  if (query.status) where.status = query.status;
  if (query.source) where.source = query.source;
  if (query.employeeId && requesterRole === 'ADMIN') where.assignedToId = query.employeeId;

  const validSortFields = ['name', 'status', 'source', 'createdAt', 'updatedAt'];
  const orderField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';

  const [leads, total] = await prisma.$transaction([
    prisma.lead.findMany({
      where,
      select: LEAD_SELECT,
      skip,
      take,
      orderBy: { [orderField]: sortOrder },
    }),
    prisma.lead.count({ where }),
  ]);

  return buildPaginatedResponse(leads, total, page, limit);
}

export async function getLeadByIdService(id: string, requesterId: string, requesterRole: Role) {
  const lead = await prisma.lead.findUnique({
    where: { id },
    select: {
      ...LEAD_SELECT,
      statusHistory: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          oldStatus: true,
          newStatus: true,
          createdAt: true,
          changedBy: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!lead) throw new NotFoundError('Lead not found');

  if (requesterRole === 'EMPLOYEE' && lead.assignedTo.id !== requesterId) {
    throw new AuthorizationError('You can only view your assigned leads');
  }

  return lead;
}

export async function updateLeadService(
  id: string,
  input: UpdateLeadInput,
  requesterId: string,
  requesterRole: Role,
) {
  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) throw new NotFoundError('Lead not found');

  if (requesterRole === 'EMPLOYEE' && lead.assignedToId !== requesterId) {
    throw new AuthorizationError('You can only update your assigned leads');
  }

  const oldStatus = lead.status;

  const updated = await prisma.lead.update({
    where: { id },
    data: {
      ...(input.name && { name: input.name }),
      ...(input.phone && { phone: input.phone }),
      ...(input.email !== undefined && { email: input.email }),
      ...(input.source && { source: input.source }),
      ...(input.status && { status: input.status }),
      ...(input.notes !== undefined && { notes: input.notes }),
      ...(input.assignedToId && requesterRole === 'ADMIN' && { assignedToId: input.assignedToId }),
    },
    select: LEAD_SELECT,
  });

  if (input.status && input.status !== oldStatus) {
    await prisma.leadStatusHistory.create({
      data: {
        leadId: id,
        oldStatus,
        newStatus: input.status,
        changedById: requesterId,
      },
    });
  }

  return updated;
}

export async function deleteLeadService(id: string) {
  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) throw new NotFoundError('Lead not found');

  await prisma.lead.delete({ where: { id } });
}

import bcrypt from 'bcryptjs';
import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { ConflictError, NotFoundError } from '../../utils/errors';
import { parsePagination, buildPaginatedResponse } from '../../utils/pagination';
import type { CreateUserInput, UpdateUserInput, ListUsersQuery } from './user.validation';

const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      assignedLeads: true,
    },
  },
} satisfies Prisma.UserSelect;

export async function createUserService(input: CreateUserInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new ConflictError('Email already in use');

  const password = await bcrypt.hash(input.password, 12);

  return prisma.user.create({
    data: { ...input, password },
    select: USER_SELECT,
  });
}

export async function listUsersService(query: ListUsersQuery) {
  const { page, limit, skip, take, sortBy, sortOrder } = parsePagination(
    query as Record<string, string | undefined>,
  );

  const where: Prisma.UserWhereInput = {};

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { email: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  if (query.role) where.role = query.role;
  if (query.isActive !== undefined) where.isActive = query.isActive;

  const validSortFields = ['name', 'email', 'createdAt', 'updatedAt'];
  const orderField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      select: USER_SELECT,
      skip,
      take,
      orderBy: { [orderField]: sortOrder },
    }),
    prisma.user.count({ where }),
  ]);

  return buildPaginatedResponse(users, total, page, limit);
}

export async function getUserByIdService(id: string) {
  const user = await prisma.user.findUnique({ where: { id }, select: USER_SELECT });
  if (!user) throw new NotFoundError('User not found');
  return user;
}

export async function updateUserService(id: string, input: UpdateUserInput) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new NotFoundError('User not found');

  if (input.email && input.email !== user.email) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) throw new ConflictError('Email already in use');
  }

  const data: Prisma.UserUpdateInput = { ...input };
  if (input.password) {
    data.password = await bcrypt.hash(input.password, 12);
  }

  return prisma.user.update({
    where: { id },
    data,
    select: USER_SELECT,
  });
}

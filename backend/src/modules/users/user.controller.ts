import type { Request, Response } from 'express';
import {
  createUserService,
  listUsersService,
  getUserByIdService,
  updateUserService,
} from './user.service';
import { sendSuccess, sendCreated } from '../../utils/response';
import { asyncHandler } from '../../utils/asyncHandler';
import type { CreateUserInput, UpdateUserInput, ListUsersQuery } from './user.validation';

export const createUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = await createUserService(req.body as CreateUserInput);
  sendCreated(res, user, 'Employee created successfully');
});

export const listUsers = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await listUsersService(req.query as unknown as ListUsersQuery);
  sendSuccess(res, result);
});

export const getUserById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = await getUserByIdService(req.params.id);
  sendSuccess(res, user);
});

export const updateUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = await updateUserService(req.params.id, req.body as UpdateUserInput);
  sendSuccess(res, user, 'User updated successfully');
});

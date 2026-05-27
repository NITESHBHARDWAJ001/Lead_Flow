import type { Request, Response } from 'express';
import { loginService } from './auth.service';
import { sendSuccess } from '../../utils/response';
import { asyncHandler } from '../../utils/asyncHandler';
import type { LoginInput } from './auth.validation';

export const login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as LoginInput;
  const result = await loginService(email, password);
  sendSuccess(res, result, 'Login successful');
});

export const getMe = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  sendSuccess(res, req.user, 'User fetched successfully');
});

import type { Request, Response, NextFunction } from 'express';
import type { AsyncHandler } from '../types';

export const asyncHandler =
  (fn: AsyncHandler) =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

import type { Request, Response, NextFunction } from 'express';
import type { Role } from '@prisma/client';
import { AuthorizationError, AuthenticationError } from '../utils/errors';

export function authorize(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AuthenticationError());
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new AuthorizationError());
      return;
    }

    next();
  };
}

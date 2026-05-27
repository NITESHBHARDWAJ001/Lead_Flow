import type { Request, Response, NextFunction } from 'express';
import { NotFoundError } from '../utils/errors';

export function notFound(req: Request, _res: Response, next: NextFunction): void {
  next(new NotFoundError(`Route ${req.originalUrl} not found`));
}

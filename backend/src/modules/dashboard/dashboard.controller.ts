import type { Request, Response } from 'express';
import { getAdminDashboardService, getEmployeeDashboardService } from './dashboard.service';
import { sendSuccess } from '../../utils/response';
import { asyncHandler } from '../../utils/asyncHandler';
import { AuthenticationError } from '../../utils/errors';

export const getAdminDashboard = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    const data = await getAdminDashboardService();
    sendSuccess(res, data, 'Admin dashboard data');
  },
);

export const getEmployeeDashboard = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new AuthenticationError();
    const data = await getEmployeeDashboardService(req.user.id);
    sendSuccess(res, data, 'Employee dashboard data');
  },
);

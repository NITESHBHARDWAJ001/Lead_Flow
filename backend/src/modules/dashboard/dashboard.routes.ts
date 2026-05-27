import { Router } from 'express';
import { getAdminDashboard, getEmployeeDashboard } from './dashboard.controller';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /dashboard/admin:
 *   get:
 *     tags: [Dashboard]
 *     summary: Admin dashboard analytics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin analytics data
 *       403:
 *         description: Forbidden
 */
router.get('/admin', authorize(Role.ADMIN), getAdminDashboard);

/**
 * @swagger
 * /dashboard/employee:
 *   get:
 *     tags: [Dashboard]
 *     summary: Employee personal dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Employee analytics data
 */
router.get('/employee', getEmployeeDashboard);

export default router;

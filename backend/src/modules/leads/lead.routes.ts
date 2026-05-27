import { Router } from 'express';
import { createLead, listLeads, getLeadById, updateLead, deleteLead } from './lead.controller';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { validate } from '../../middlewares/validate';
import { createLeadSchema, updateLeadSchema, listLeadsQuerySchema } from './lead.validation';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /leads:
 *   get:
 *     tags: [Leads]
 *     summary: List leads (Admins see all, Employees see their own)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer } }
 *       - { in: query, name: limit, schema: { type: integer } }
 *       - { in: query, name: search, schema: { type: string } }
 *       - { in: query, name: status, schema: { type: string, enum: [INTERESTED, NOT_INTERESTED, CONVERTED] } }
 *       - { in: query, name: source, schema: { type: string, enum: [CALL, WHATSAPP, FIELD] } }
 *       - { in: query, name: employeeId, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Paginated list of leads
 */
router.get('/', validate(listLeadsQuerySchema, 'query'), listLeads);

/**
 * @swagger
 * /leads:
 *   post:
 *     tags: [Leads]
 *     summary: Create a new lead
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, phone, source]
 *             properties:
 *               name: { type: string }
 *               phone: { type: string }
 *               email: { type: string }
 *               source: { type: string, enum: [CALL, WHATSAPP, FIELD] }
 *               status: { type: string, enum: [INTERESTED, NOT_INTERESTED, CONVERTED] }
 *               notes: { type: string }
 *               assignedToId: { type: string }
 *     responses:
 *       201:
 *         description: Lead created
 */
router.post('/', validate(createLeadSchema), createLead);

/**
 * @swagger
 * /leads/{id}:
 *   get:
 *     tags: [Leads]
 *     summary: Get lead by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Lead found
 */
router.get('/:id', getLeadById);

/**
 * @swagger
 * /leads/{id}:
 *   patch:
 *     tags: [Leads]
 *     summary: Update lead
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Lead updated
 */
router.patch('/:id', validate(updateLeadSchema), updateLead);

/**
 * @swagger
 * /leads/{id}:
 *   delete:
 *     tags: [Leads]
 *     summary: Delete lead (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Lead deleted
 */
router.delete('/:id', authorize(Role.ADMIN), deleteLead);

export default router;

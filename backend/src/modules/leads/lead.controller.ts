import type { Request, Response } from 'express';
import {
  createLeadService,
  listLeadsService,
  getLeadByIdService,
  updateLeadService,
  deleteLeadService,
} from './lead.service';
import { sendSuccess, sendCreated } from '../../utils/response';
import { asyncHandler } from '../../utils/asyncHandler';
import { AuthenticationError } from '../../utils/errors';
import type { CreateLeadInput, UpdateLeadInput, ListLeadsQuery } from './lead.validation';

export const createLead = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw new AuthenticationError();
  const lead = await createLeadService(req.body as CreateLeadInput, req.user.id, req.user.role);
  sendCreated(res, lead, 'Lead created successfully');
});

export const listLeads = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw new AuthenticationError();
  const result = await listLeadsService(
    req.query as unknown as ListLeadsQuery,
    req.user.id,
    req.user.role,
  );
  sendSuccess(res, result);
});

export const getLeadById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw new AuthenticationError();
  const lead = await getLeadByIdService(req.params.id, req.user.id, req.user.role);
  sendSuccess(res, lead);
});

export const updateLead = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw new AuthenticationError();
  const lead = await updateLeadService(
    req.params.id,
    req.body as UpdateLeadInput,
    req.user.id,
    req.user.role,
  );
  sendSuccess(res, lead, 'Lead updated successfully');
});

export const deleteLead = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  await deleteLeadService(req.params.id);
  sendSuccess(res, null, 'Lead deleted successfully');
});

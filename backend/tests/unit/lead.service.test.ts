import { createLeadService, deleteLeadService } from '../../src/modules/leads/lead.service';
import { prisma } from '../../src/lib/prisma';
import { NotFoundError } from '../../src/utils/errors';

jest.mock('../../src/lib/prisma', () => ({
  prisma: {
    lead: { create: jest.fn(), findUnique: jest.fn(), delete: jest.fn(), findMany: jest.fn(), count: jest.fn() },
    leadStatusHistory: { create: jest.fn() },
    $transaction: jest.fn(),
  },
}));

const mockLeadCreate = prisma.lead.create as jest.Mock;
const mockLeadFindUnique = prisma.lead.findUnique as jest.Mock;
const mockLeadDelete = prisma.lead.delete as jest.Mock;
const mockHistoryCreate = prisma.leadStatusHistory.create as jest.Mock;

const baseLead = {
  id: 'lead-1',
  name: 'Alice',
  phone: '+1-555-0100',
  email: null,
  source: 'CALL' as const,
  status: 'INTERESTED' as const,
  notes: null,
  createdById: 'user-1',
  assignedToId: 'user-2',
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: { id: 'user-1', name: 'Admin', email: 'admin@test.com' },
  assignedTo: { id: 'user-2', name: 'Employee', email: 'emp@test.com' },
};

describe('Lead Service', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('createLeadService', () => {
    it('should create a lead and record status history', async () => {
      mockLeadCreate.mockResolvedValue(baseLead);
      mockHistoryCreate.mockResolvedValue({});

      const result = await createLeadService(
        { name: 'Alice', phone: '+1-555-0100', source: 'CALL', status: 'INTERESTED' },
        'user-1',
        'ADMIN',
      );

      expect(mockLeadCreate).toHaveBeenCalledTimes(1);
      expect(mockHistoryCreate).toHaveBeenCalledTimes(1);
      expect(result.name).toBe('Alice');
    });

    it('should assign to self when employee creates lead', async () => {
      mockLeadCreate.mockResolvedValue({ ...baseLead, assignedToId: 'emp-1' });
      mockHistoryCreate.mockResolvedValue({});

      await createLeadService(
        { name: 'Bob', phone: '+1-555-0200', source: 'WHATSAPP', status: 'INTERESTED' },
        'emp-1',
        'EMPLOYEE',
      );

      expect(mockLeadCreate).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ assignedToId: 'emp-1' }) }),
      );
    });
  });

  describe('deleteLeadService', () => {
    it('should delete a lead successfully', async () => {
      mockLeadFindUnique.mockResolvedValue(baseLead);
      mockLeadDelete.mockResolvedValue({});

      await deleteLeadService('lead-1');

      expect(mockLeadDelete).toHaveBeenCalledWith({ where: { id: 'lead-1' } });
    });

    it('should throw NotFoundError if lead does not exist', async () => {
      mockLeadFindUnique.mockResolvedValue(null);

      await expect(deleteLeadService('nonexistent')).rejects.toThrow(NotFoundError);
    });
  });
});

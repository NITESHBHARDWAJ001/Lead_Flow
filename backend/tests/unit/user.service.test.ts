import { createUserService, updateUserService } from '../../src/modules/users/user.service';
import { prisma } from '../../src/lib/prisma';
import { ConflictError, NotFoundError } from '../../src/utils/errors';

jest.mock('../../src/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

const mockFindUnique = prisma.user.findUnique as jest.Mock;
const mockCreate = prisma.user.create as jest.Mock;
const mockUpdate = prisma.user.update as jest.Mock;

const baseUser = {
  id: 'user-1',
  name: 'John Doe',
  email: 'john@test.com',
  role: 'EMPLOYEE' as const,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  _count: { assignedLeads: 0 },
};

describe('User Service', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('createUserService', () => {
    it('should create a user with hashed password', async () => {
      mockFindUnique.mockResolvedValue(null);
      mockCreate.mockResolvedValue(baseUser);

      const result = await createUserService({
        name: 'John Doe',
        email: 'john@test.com',
        password: 'Admin@123',
        role: 'EMPLOYEE',
      });

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'John Doe',
            email: 'john@test.com',
          }),
        }),
      );
      expect(result.name).toBe('John Doe');
    });

    it('should throw ConflictError if email already exists', async () => {
      mockFindUnique.mockResolvedValue(baseUser);

      await expect(
        createUserService({ name: 'Jane', email: 'john@test.com', password: 'Admin@123', role: 'EMPLOYEE' }),
      ).rejects.toThrow(ConflictError);
    });
  });

  describe('updateUserService', () => {
    it('should update a user name', async () => {
      mockFindUnique.mockResolvedValueOnce(baseUser).mockResolvedValueOnce(null);
      mockUpdate.mockResolvedValue({ ...baseUser, name: 'Updated Name' });

      const result = await updateUserService('user-1', { name: 'Updated Name' });

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'user-1' } }),
      );
      expect(result.name).toBe('Updated Name');
    });

    it('should throw NotFoundError if user does not exist', async () => {
      mockFindUnique.mockResolvedValue(null);

      await expect(updateUserService('bad-id', { name: 'X' })).rejects.toThrow(NotFoundError);
    });

    it('should throw ConflictError if new email is taken', async () => {
      mockFindUnique
        .mockResolvedValueOnce(baseUser)
        .mockResolvedValueOnce({ ...baseUser, id: 'other-user' });

      await expect(
        updateUserService('user-1', { email: 'taken@test.com' }),
      ).rejects.toThrow(ConflictError);
    });
  });
});

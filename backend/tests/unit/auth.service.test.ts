import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { loginService } from '../../src/modules/auth/auth.service';
import { prisma } from '../../src/lib/prisma';
import { AuthenticationError } from '../../src/utils/errors';

jest.mock('../../src/lib/prisma', () => ({
  prisma: { user: { findUnique: jest.fn() } },
}));
jest.mock('../../src/lib/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

const mockFindUnique = prisma.user.findUnique as jest.Mock;

describe('Auth Service - loginService', () => {
  const mockUser = {
    id: 'user-1',
    name: 'Test Admin',
    email: 'admin@test.com',
    password: bcrypt.hashSync('Admin@123', 10),
    role: 'ADMIN' as const,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => jest.clearAllMocks());

  it('should return token and user on valid credentials', async () => {
    mockFindUnique.mockResolvedValue(mockUser);

    const result = await loginService('admin@test.com', 'Admin@123');

    expect(result.token).toBeDefined();
    expect(result.user.email).toBe('admin@test.com');
    expect(result.user.role).toBe('ADMIN');

    const decoded = jwt.decode(result.token) as { id: string };
    expect(decoded.id).toBe('user-1');
  });

  it('should throw AuthenticationError for unknown email', async () => {
    mockFindUnique.mockResolvedValue(null);

    await expect(loginService('unknown@test.com', 'password')).rejects.toThrow(
      AuthenticationError,
    );
  });

  it('should throw AuthenticationError for wrong password', async () => {
    mockFindUnique.mockResolvedValue(mockUser);

    await expect(loginService('admin@test.com', 'wrongpassword')).rejects.toThrow(
      AuthenticationError,
    );
  });

  it('should throw AuthenticationError for inactive user', async () => {
    mockFindUnique.mockResolvedValue({ ...mockUser, isActive: false });

    await expect(loginService('admin@test.com', 'Admin@123')).rejects.toThrow(
      AuthenticationError,
    );
  });
});

import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../src/app';
import { env } from '../../src/config/env';

jest.mock('../../src/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn().mockResolvedValue(null),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn().mockImplementation(async (ops: unknown) =>
      Array.isArray(ops) ? Promise.all(ops as Promise<unknown>[]) : (ops as () => unknown)(),
    ),
  },
}));
jest.mock('../../src/lib/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

const makeToken = (role: 'ADMIN' | 'EMPLOYEE') =>
  jwt.sign({ id: 'test-user', email: `${role.toLowerCase()}@test.com`, role, name: 'Test User' }, env.JWT_SECRET, { expiresIn: '1h' });

describe('Users API', () => {
  it('GET /api/v1/users - should return 401 without token', async () => {
    const res = await request(app).get('/api/v1/users');
    expect(res.status).toBe(401);
  });

  it('GET /api/v1/users - should return 403 for EMPLOYEE role', async () => {
    const token = makeToken('EMPLOYEE');
    const res = await request(app)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it('GET /api/v1/users - should return 200 for ADMIN role', async () => {
    const token = makeToken('ADMIN');
    const res = await request(app)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('items');
  });

  it('POST /api/v1/users - should return 400 for missing fields', async () => {
    const token = makeToken('ADMIN');
    const res = await request(app)
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test' });
    expect(res.status).toBe(400);
  });

  it('POST /api/v1/users - should return 400 for weak password', async () => {
    const token = makeToken('ADMIN');
    const res = await request(app)
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test User', email: 'test@example.com', password: '12345678' });
    expect(res.status).toBe(400);
  });

  it('POST /api/v1/users - should return 403 for EMPLOYEE role', async () => {
    const token = makeToken('EMPLOYEE');
    const res = await request(app)
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test', email: 'new@test.com', password: 'Admin@123' });
    expect(res.status).toBe(403);
  });
});

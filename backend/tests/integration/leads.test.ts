import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../src/app';
import { env } from '../../src/config/env';

jest.mock('../../src/lib/prisma', () => ({
  prisma: {
    lead: {
      findUnique: jest.fn().mockResolvedValue(null),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    leadStatusHistory: { create: jest.fn() },
    $transaction: jest.fn().mockImplementation(async (ops: unknown) =>
      Array.isArray(ops) ? Promise.all(ops as Promise<unknown>[]) : (ops as () => unknown)(),
    ),
  },
}));
jest.mock('../../src/lib/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

const makeToken = (role: 'ADMIN' | 'EMPLOYEE', id = 'test-user') =>
  jwt.sign({ id, email: `${role.toLowerCase()}@test.com`, role, name: 'Test User' }, env.JWT_SECRET, { expiresIn: '1h' });

describe('Leads API - Authorization', () => {
  it('GET /api/v1/leads - should return 401 without token', async () => {
    const res = await request(app).get('/api/v1/leads');
    expect(res.status).toBe(401);
  });

  it('GET /api/v1/leads - should return 200 with valid token', async () => {
    const token = makeToken('ADMIN');
    const res = await request(app)
      .get('/api/v1/leads')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('items');
    expect(res.body.data).toHaveProperty('total');
  });

  it('POST /api/v1/leads - should return 400 for missing required fields', async () => {
    const token = makeToken('ADMIN');
    const res = await request(app)
      .post('/api/v1/leads')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Only Name' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/v1/leads/:id - should return 404 for nonexistent ID', async () => {
    const token = makeToken('ADMIN');
    const res = await request(app)
      .get('/api/v1/leads/clfake1234567890abcdefgh')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  it('DELETE /api/v1/leads/:id - should return 403 for EMPLOYEE role', async () => {
    const token = makeToken('EMPLOYEE');
    const res = await request(app)
      .delete('/api/v1/leads/clfake1234567890abcdefgh')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });
});

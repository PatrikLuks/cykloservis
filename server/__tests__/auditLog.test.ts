import request from 'supertest';
import app, { connectDb, disconnectDb } from '../app';
import AuditLog from '../models/AuditLog';
import { User } from '../models/User';

jest.setTimeout(20000);

describe('AuditLog API', () => {
  let user: any;
  let token: string;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await connectDb();
    user = await User.create({ email: `audit${Date.now()}@mail.com`, password: 'Test1234!', name: 'Audit User' });
    token = 'mock-token';
    await AuditLog.create({ userId: user._id, action: 'test_action', details: 'test details' });
  });

  afterAll(async () => {
    await AuditLog.deleteMany({ userId: user._id });
    await User.deleteOne({ _id: user._id });
    await disconnectDb();
  });

  it('should return audit logs for user', async () => {
    const res = await request(app)
      .get(`/api/audit-logs?userId=${user._id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.logs)).toBe(true);
    expect(res.body.logs[0].action).toBe('test_action');
  });
});

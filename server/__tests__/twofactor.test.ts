import request from 'supertest';
import app, { connectDb, disconnectDb } from '../app';
import { User } from '../models/User';
import speakeasy from 'speakeasy';

jest.setTimeout(20000);

describe('2FA API', () => {
  let user: any;
  let token: string;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await connectDb();
    user = await User.create({ email: `2fa${Date.now()}@mail.com`, password: 'Test1234!', name: '2FA User' });
    token = 'mock-token';
  });

  afterAll(async () => {
    await User.deleteOne({ _id: user._id });
    await disconnectDb();
  });

  it('should setup 2FA and verify token', async () => {
    // Setup
    const setupRes = await request(app)
      .post('/api/twofactor/setup')
      .set('Authorization', `Bearer ${token}`);
    expect(setupRes.status).toBe(200);
    expect(setupRes.body.secret).toBeDefined();
    // Generate valid token
    const token2fa = speakeasy.totp({ secret: setupRes.body.secret, encoding: 'base32' });
    // Verify
    const verifyRes = await request(app)
      .post('/api/twofactor/verify')
      .set('Authorization', `Bearer ${token}`)
      .send({ token: token2fa });
    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.success).toBe(true);
  });
});

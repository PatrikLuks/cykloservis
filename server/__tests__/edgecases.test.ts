import request from 'supertest';
import app, { connectDb, disconnectDb } from '../app';
import { User } from '../models/User';

jest.setTimeout(20000);

describe('Edge cases & Security', () => {
  let user: any;
  let token: string;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await connectDb();
    user = await User.create({ email: `edge${Date.now()}@mail.com`, password: 'Test1234!', name: 'Edge User' });
    token = 'mock-token';
  });

  afterAll(async () => {
    await User.deleteOne({ _id: user._id });
    await disconnectDb();
  });

  it('should not allow unauthorized access to notifications', async () => {
    const res = await request(app).get('/api/notification');
    expect(res.status).toBe(401);
  });

  it('should not allow unauthorized role change', async () => {
    const res = await request(app)
      .put(`/api/role/user/${user._id}/role`)
      .send({ role: 'owner' });
    expect(res.status).toBe(401);
  });

  it('should not allow 2FA verify without setup', async () => {
    const res = await request(app)
      .post('/api/twofactor/verify')
      .set('Authorization', `Bearer ${token}`)
      .send({ token: '123456' });
    expect(res.status).toBe(400);
  });
});

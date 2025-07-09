import request from 'supertest';
import app, { connectDb, disconnectDb } from '../app';
import { User } from '../models/User';

jest.setTimeout(20000);

describe('Notification Preferences API', () => {
  let user: any;
  let token: string;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await connectDb();
    user = await User.create({ email: `prefs${Date.now()}@mail.com`, password: 'Test1234!', name: 'Prefs User' });
    token = 'mock-token';
  });

  afterAll(async () => {
    await User.deleteOne({ _id: user._id });
    await disconnectDb();
  });

  it('should get and update notification preferences', async () => {
    // Get
    let res = await request(app)
      .get('/api/notificationPreferences')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    // Update
    res = await request(app)
      .put('/api/notificationPreferences')
      .set('Authorization', `Bearer ${token}`)
      .send({ email: false, push: true, types: ['system'] });
    expect(res.status).toBe(200);
    expect(res.body.email).toBe(false);
    expect(res.body.types).toContain('system');
  });
});

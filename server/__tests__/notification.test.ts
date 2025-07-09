import request from 'supertest';
import app, { connectDb, disconnectDb } from '../app';
import { User } from '../models/User';
import Notification from '../models/Notification';

jest.setTimeout(20000);

// Helper pro vytvoření uživatele a přihlášení
async function createUserAndLogin() {
  const email = `test${Date.now()}@mail.com`;
  const password = 'Test1234!';
  const user = await User.create({ email, password, name: 'Test User' });
  // Simulace loginu a získání tokenu
  // ... zde případně doplnit reálný login, pokud je potřeba JWT apod.
  return { user, token: 'mock-token', id: user._id };
}

describe('Notification API', () => {
  let user: any;
  let token: string;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await connectDb();
    const res = await createUserAndLogin();
    user = res.user;
    token = res.token;
  });

  afterAll(async () => {
    await Notification.deleteMany({ userId: user._id });
    await User.deleteOne({ _id: user._id });
    await disconnectDb();
  });

  it('should return notifications for user', async () => {
    await Notification.create({ userId: user._id, type: 'system', message: 'Test notifikace' });
    const res = await request(app)
      .get('/api/notification')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should mark notification as read', async () => {
    const notif = await Notification.create({ userId: user._id, type: 'system', message: 'Test2' });
    const res = await request(app)
      .post(`/api/notification/${notif._id}/read`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    const updated = await Notification.findById(notif._id);
    expect(updated?.read).toBe(true);
  });
});

import request from 'supertest';
import app, { connectDb, disconnectDb } from '../app';
import { User } from '../models/User';
import { ServiceRecord } from '../models/ServiceRecord';

jest.setTimeout(20000);

describe('AI Recommendation API', () => {
  let user: any;
  let token: string;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await connectDb();
    user = await User.create({ email: `ai${Date.now()}@mail.com`, password: 'Test1234!', name: 'AI User' });
    token = 'mock-token';
    await ServiceRecord.create({ userId: user._id, date: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000), description: 'Servis' });
  });

  afterAll(async () => {
    await ServiceRecord.deleteMany({ userId: user._id });
    await User.deleteOne({ _id: user._id });
    await disconnectDb();
  });

  it('should return recommendation for user', async () => {
    const res = await request(app)
      .get('/api/ai/recommendation')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.recommendation).toBeDefined();
  });
});

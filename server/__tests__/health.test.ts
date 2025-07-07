import request from 'supertest';
import app, { connectDb, disconnectDb } from '../app';

describe('API health', () => {
  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await connectDb();
  });
  afterAll(async () => {
    await disconnectDb();
  });

  it('GET /api/hello returns welcome message', async () => {
    const res = await request(app).get('/api/hello');
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/Vítejte/);
  });
});

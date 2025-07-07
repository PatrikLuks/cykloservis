import request from 'supertest';
import app, { connectDb, disconnectDb } from '../app';

const api = request(app);

describe('Autentizace', () => {
  const email = `testuser${Date.now()}@test.cz`;
  const password = 'testheslo123';
  const name = 'Testovací Uživatel';

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await connectDb();
  });
  afterAll(async () => {
    await disconnectDb();
  });

  it('zaregistruje nového uživatele', async () => {
    const res = await api.post('/api/register').send({ email, password, name });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.name).toBe(name);
  });

  it('neumožní registraci se stejným e-mailem', async () => {
    const res = await api.post('/api/register').send({ email, password, name });
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/existuje/);
  });

  it('přihlásí uživatele', async () => {
    const res = await api.post('/api/login').send({ email, password });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.name).toBe(name);
  });

  it('odmítne špatné heslo', async () => {
    const res = await api.post('/api/login').send({ email, password: 'spatneheslo' });
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/přihlašovací/);
  });
});

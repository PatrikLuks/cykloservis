import request from 'supertest';
import app, { connectDb, disconnectDb } from '../app';

jest.setTimeout(20000);
const api = request(app);

describe('Kola (CRUD, validace, bezpečnost)', () => {
  let token = '';
  let bikeId = '';
  const user = {
    email: `bikeuser${Date.now()}@test.cz`,
    password: 'testheslo123',
    name: 'Bike Tester'
  };
  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await connectDb();
    await api.post('/api/register').send(user);
    const res = await api.post('/api/login').send({ email: user.email, password: user.password });
    token = res.body.token;
  });
  afterAll(async () => {
    await disconnectDb();
  });

  it('odmítne přidání kola bez názvu', async () => {
    const res = await api.post('/api/bikes')
      .set('Authorization', `Bearer ${token}`)
      .send({ brand: 'TestBrand' });
    expect(res.status).toBe(400);
  });

  it('vytvoří nové kolo', async () => {
    const res = await api.post('/api/bikes')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'TestBike', brand: 'TestBrand' });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.createdAt).toBeDefined();
    // Ověření, že createdAt je platné ISO datum a blízké aktuálnímu času
    const createdAt = new Date(res.body.createdAt);
    expect(!isNaN(createdAt.getTime())).toBe(true);
    const now = Date.now();
    expect(Math.abs(now - createdAt.getTime())).toBeLessThan(60000); // do 1 minuty
    bikeId = res.body.id;
  });

  it('neumožní smazat cizí kolo', async () => {
    // Registrace jiného uživatele
    const res2 = await api.post('/api/register').send({ email: `other${Date.now()}@test.cz`, password: 'testheslo123', name: 'Other' });
    const login2 = await api.post('/api/login').send({ email: res2.body.email || `other${Date.now()}@test.cz`, password: 'testheslo123' });
    const token2 = login2.body.token;
    const res = await api.delete(`/api/bikes/${bikeId}`)
      .set('Authorization', `Bearer ${token2}`);
    expect([401, 404]).toContain(res.status);
  });
});

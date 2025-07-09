import request from 'supertest';
import app, { connectDb, disconnectDb } from '../app';
import { User } from '../models/User';

jest.setTimeout(20000);

describe('Role API', () => {
  let owner: any;
  let member: any;
  let token: string;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await connectDb();
    owner = await User.create({ email: `owner${Date.now()}@mail.com`, password: 'Test1234!', name: 'Owner', role: 'owner', permissions: ['manage_team'] });
    member = await User.create({ email: `member${Date.now()}@mail.com`, password: 'Test1234!', name: 'Member', role: 'member' });
    // Simulace loginu a získání tokenu pro ownera
    token = 'mock-token';
  });

  afterAll(async () => {
    await User.deleteOne({ _id: owner._id });
    await User.deleteOne({ _id: member._id });
    await disconnectDb();
  });

  it('should change role and permissions of user', async () => {
    const res = await request(app)
      .put(`/api/role/user/${member._id}/role`)
      .set('Authorization', `Bearer ${token}`)
      .send({ role: 'mechanic', permissions: ['edit_bike'] });
    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('mechanic');
    expect(res.body.user.permissions).toContain('edit_bike');
  });
});

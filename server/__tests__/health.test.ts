import request from 'supertest';
import express from 'express';

const app = require('../index');

describe('API health', () => {
  it('GET /api/hello returns welcome message', async () => {
    const res = await request('http://localhost:3001').get('/api/hello');
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/Vítejte/);
  });
});

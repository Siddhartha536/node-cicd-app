const request = require('supertest');
const app = require('../src/app');

describe('Health Check', () => {
  test('GET /health → 200 with status healthy', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('healthy');
  });
});

describe('Users API', () => {
  test('GET /api/users → returns array of users', async () => {
    const res = await request(app).get('/api/users');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('POST /api/users → creates a user successfully', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ name: 'Charlie', role: 'tester' });
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('Charlie');
    expect(res.body.role).toBe('tester');
  });

  test('POST /api/users → fails with missing fields', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});
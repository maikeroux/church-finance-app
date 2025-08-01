const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const User = require('../src/models/user');

process.env.MONGO_URI = 'mongodb://localhost:27017/userdb_test';


beforeAll(async () => {
  await mongoose.connect('mongodb://localhost:27017/userdb_test');
});

beforeEach(async () => {
  await User.deleteMany({});
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  }
});

let token;

describe('Auth Routes', () => {
  it('POST /api/auth/register - should register a user', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'admin@example.com',
      password: 'password123',
      role: 'superadmin'
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('User registered');
  });

  it('POST /api/auth/login - should return JWT for valid credentials', async () => {
    await request(app).post('/api/auth/register').send({
      email: 'admin@example.com',
      password: 'password123',
      role: 'superadmin'
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'admin@example.com',
      password: 'password123'
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
  });

  it('GET /api/auth/me - should return current user info with valid token', async () => {
    // Register and login fresh user
    await request(app).post('/api/auth/register').send({
      email: 'me@example.com',
      password: 'password123',
      role: 'admin'
    });

    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'me@example.com',
      password: 'password123'
    });

    const token = loginRes.body.token;

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe('me@example.com');
  });

});

describe('RBAC Protected Route: /api/users', () => {
  it('GET /api/users - superadmin should succeed', async () => {
    await request(app).post('/api/auth/register').send({
      email: 'superadmin@test.com',
      password: 'testpass',
      role: 'superadmin'
    });

    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'superadmin@test.com',
      password: 'testpass'
    });

    const token = loginRes.body.token;

    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/users - viewer should get 403 Forbidden', async () => {
    await request(app).post('/api/auth/register').send({
      email: 'viewer@test.com',
      password: 'testpass',
      role: 'viewer'
    });

    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'viewer@test.com',
      password: 'testpass'
    });

    const token = loginRes.body.token;

    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/insufficient role/i);
  });

  it('GET /api/users - no token should return 401', async () => {
    const res = await request(app).get('/api/users');
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/missing or invalid/i);
  });
});

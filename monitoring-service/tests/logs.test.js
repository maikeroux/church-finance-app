const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../app');
require('dotenv').config();

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

const testToken = jwt.sign(
  { id: 'test-user-id', role: 'admin', service: 'user-service' },
  process.env.JWT_SECRET
);

describe('POST /api/logs', () => {
  it('should create a log entry', async () => {
    const res = await request(app)
      .post('/api/logs')
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        action: 'LOGIN_SUCCESS',
        service: 'user-service',
        metadata: { ip: '127.0.0.1' }
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('action', 'LOGIN_SUCCESS');
  });

  it('should reject unauthenticated request', async () => {
    const res = await request(app)
      .post('/api/logs')
      .send({ action: 'LOGIN_ATTEMPT', service: 'user-service' });

    expect(res.statusCode).toBe(401); // consistent with updated middleware
  });

  it('should reject request with invalid token', async () => {
    const res = await request(app)
      .post('/api/logs')
      .set('Authorization', 'Bearer invalid.token.value')
      .send({ action: 'LOGIN_FAIL', service: 'user-service' });

    expect(res.statusCode).toBe(401); // consistent with updated middleware
  });
});

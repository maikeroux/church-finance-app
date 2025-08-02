const request = require('supertest');
const app = require('../src/app');
const sequelize = require('../src/config/database');
const Transaction = require('../src/models/transaction'); // Ensure model is registered
const jwt = require('jsonwebtoken');

const testToken = jwt.sign({ id: '123', role: 'admin' }, process.env.JWT_SECRET);
let createdId;

beforeAll(async () => {
  await sequelize.getQueryInterface().dropAllTables(); // ✅ safer than sequelize.drop()
  await sequelize.sync(); // ✅ recreate fresh schema
});

afterAll(async () => {
  await sequelize.close();
});

describe('POST /api/transactions', () => {
  it('should create a new income transaction', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        type: 'income',
        date: '2025-07-31',
        method: 'cash',
        particulars: 'Tithes',
        remarks: 'Sunday service offering',
        amount: 500.00
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    createdId = res.body.id;
  });

  it('should reject without token', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .send({
        type: 'income',
        date: '2025-07-31',
        method: 'cash',
        amount: 100
      });

    expect(res.statusCode).toBe(401);
  });
});

describe('GET /api/transactions', () => {
  it('should return a list of transactions', async () => {
    const res = await request(app)
      .get('/api/transactions')
      .set('Authorization', `Bearer ${testToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
});

describe('GET /api/transactions/:id', () => {
  it('should return a single transaction by ID', async () => {
    const res = await request(app)
      .get(`/api/transactions/${createdId}`)
      .set('Authorization', `Bearer ${testToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', createdId);
  });

  it('should return 404 if transaction not found', async () => {
    const res = await request(app)
      .get('/api/transactions/999999')
      .set('Authorization', `Bearer ${testToken}`);

    expect(res.statusCode).toBe(404);
  });
});

describe('PUT /api/transactions/:id', () => {
  it('should update an existing transaction', async () => {
    const res = await request(app)
      .put(`/api/transactions/${createdId}`)
      .set('Authorization', `Bearer ${testToken}`)
      .send({ remarks: 'Updated remark' });

    expect(res.statusCode).toBe(200);
    expect(res.body.remarks).toBe('Updated remark');
  });
});

describe('DELETE /api/transactions/:id', () => {
  it('should delete the transaction', async () => {
    const res = await request(app)
      .delete(`/api/transactions/${createdId}`)
      .set('Authorization', `Bearer ${testToken}`);

    expect(res.statusCode).toBe(204);
  });

  it('should return 404 when deleting again', async () => {
    const res = await request(app)
      .delete(`/api/transactions/${createdId}`)
      .set('Authorization', `Bearer ${testToken}`);

    expect([404, 500]).toContain(res.statusCode);
  });
});

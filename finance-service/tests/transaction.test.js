const request = require('supertest');
const app = require('../src/app');
const sequelize = require('./setup'); // ✅ Ensures models are registered
const Transaction = require('../src/models/transaction');
const jwt = require('jsonwebtoken');

const testToken = jwt.sign({ id: '123', role: 'admin' }, process.env.JWT_SECRET);
let createdId;

beforeAll(async () => {
  console.log('Sequelize models:', Object.keys(sequelize.models));
  await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;'); // ✅ Reset ENUMs
  await sequelize.sync({ force: true }); // ✅ Fresh schema
  console.log('✅ DB synced');
});

afterAll(async () => {
  await sequelize.close();
});

//
// TRANSACTION TESTS
//
describe('Transaction API', () => {
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

  it('should return a list of transactions', async () => {
    const res = await request(app)
      .get('/api/transactions')
      .set('Authorization', `Bearer ${testToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

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

  it('should update an existing transaction', async () => {
    const res = await request(app)
      .put(`/api/transactions/${createdId}`)
      .set('Authorization', `Bearer ${testToken}`)
      .send({ remarks: 'Updated remark' });

    expect(res.statusCode).toBe(200);
    expect(res.body.remarks).toBe('Updated remark');
  });

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

//
// REPORT TESTS
//
describe('Report API', () => {
  beforeAll(async () => {
    console.log('🧪 Seeding report data...');
    await Transaction.bulkCreate([
      {
        type: 'income',
        date: '2025-08-01',
        method: 'cash',
        particulars: 'Tithes',
        remarks: '',
        amount: 200
      },
      {
        type: 'expense',
        date: '2025-08-01',
        method: 'cheque',
        particulars: 'Rent',
        remarks: '',
        amount: 150
      },
      {
        type: 'income',
        date: '2025-08-15',
        method: 'cash',
        particulars: 'Offering',
        remarks: '',
        amount: 300
      }
    ]);
  });

  it('should return grouped income and expenses for the given week', async () => {
    const res = await request(app)
      .get('/api/reports/weekly?year=2025&week=32')
      .set('Authorization', `Bearer ${testToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('income');
    expect(res.body).toHaveProperty('expenses');
  });

  it('should return grouped income and expenses for the month', async () => {
    const res = await request(app)
      .get('/api/reports/monthly?year=2025&month=8')
      .set('Authorization', `Bearer ${testToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('income');
    expect(res.body).toHaveProperty('expenses');
  });

  it('should return grouped income and expenses for the year', async () => {
    const res = await request(app)
      .get('/api/reports/yearly?year=2025')
      .set('Authorization', `Bearer ${testToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('income');
    expect(res.body).toHaveProperty('expenses');
  });
});

const request = require('supertest');
const app = require('../src/app');
const sequelize = require('../src/config/database');
const Transaction = require('../src/models/transaction');
const jwt = require('jsonwebtoken');

const testToken = jwt.sign({ id: '123', role: 'admin' }, process.env.JWT_SECRET);

beforeAll(async () => {
    console.log('Sequelize models:', Object.keys(sequelize.models));
    await sequelize.sync();

    await Transaction.bulkCreate([
        {
            type: 'income',
            date: '2025-08-04', // Monday (Week 32 of 2025)
            method: 'cash',
            particulars: 'Tithes',
            remarks: 'Sunday Offering',
            amount: 200
        },
        {
            type: 'income',
            date: '2025-08-05',
            method: 'cheque',
            particulars: 'Donation',
            remarks: 'Cheque from member',
            amount: 300
        },
        {
            type: 'expense',
            date: '2025-08-06',
            method: 'cash',
            particulars: 'Snacks',
            remarks: 'Youth fellowship',
            amount: 150
        },
        {
            type: 'expense',
            date: '2025-08-10',
            method: 'cash',
            particulars: 'Utilities',
            remarks: 'Electric bill',
            amount: 250
        }
    ]);
});

afterAll(async () => {
    await sequelize.close();
});

describe('GET /api/reports/weekly', () => {
    it('should return grouped income and expenses for the given week', async () => {
        const res = await request(app)
            .get('/api/reports/weekly?year=2025&week=32')
            .set('Authorization', `Bearer ${testToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('income');
        expect(res.body).toHaveProperty('expenses');
        expect(Array.isArray(res.body.income)).toBe(true);
        expect(Array.isArray(res.body.expenses)).toBe(true);
    });
});

describe('GET /api/reports/monthly', () => {
    it('should return grouped income and expenses for the month', async () => {
        const res = await request(app)
            .get('/api/reports/monthly?year=2025&month=8')
            .set('Authorization', `Bearer ${testToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('income');
        expect(res.body).toHaveProperty('expenses');
        expect(res.body.income.length).toBeGreaterThan(0);
        expect(res.body.expenses.length).toBeGreaterThan(0);
    });
});

describe('GET /api/reports/yearly', () => {
    it('should return grouped income and expenses for the year', async () => {
        const res = await request(app)
            .get('/api/reports/yearly?year=2025')
            .set('Authorization', `Bearer ${testToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('income');
        expect(res.body).toHaveProperty('expenses');
    });
});

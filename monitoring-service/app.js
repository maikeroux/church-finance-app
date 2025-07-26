const express = require('express');
const app = express();
const logsRouter = require('./routes/logs');
const mongoose = require('mongoose');
const client = require('prom-client');

app.use(express.json());

client.collectDefaultMetrics();

app.get('/health', (_, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'UP' : 'DOWN';
  res.status(200).json({
    status: dbStatus === 'UP' ? 'UP' : 'DEGRADED',
    db: dbStatus,
    service: 'monitoring-service',
    timestamp: new Date()
  });
});

app.get('/metrics', async (_, res) => {
  try {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
  } catch (err) {
    res.status(500).end(err.message);
  }
});

app.use('/api/logs', logsRouter);

module.exports = app;

const reportService = require('../services/reportService');
const logEvent = require('../utils/logEvent');

exports.getWeeklyReport = async (req, res, next) => {
  try {
    const { year, week } = req.query;
    if (!year || !week) return res.status(400).json({ error: 'Missing year or week query param' });

    const result = await reportService.generateWeeklyReport({ year, week });

    await logEvent({
      userId: req.user.id,
      action: 'GET_WEEKLY_REPORT',
      service: 'finance-service',
      metadata: {
        year,
        week,
        method: req.method,
        path: req.path,
        role: req.user.role
      }
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.getMonthlyReport = async (req, res, next) => {
  try {
    const { year, month } = req.query;
    if (!year || !month) return res.status(400).json({ error: 'Missing year or month query param' });

    const result = await reportService.generateMonthlyReport({ year, month });

    await logEvent({
      userId: req.user.id,
      action: 'GET_MONTHLY_REPORT',
      service: 'finance-service',
      metadata: {
        year,
        month,
        method: req.method,
        path: req.path,
        role: req.user.role
      }
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.getYearlyReport = async (req, res, next) => {
  try {
    const { year } = req.query;
    if (!year) return res.status(400).json({ error: 'Missing year query param' });

    const result = await reportService.generateYearlyReport({ year });

    await logEvent({
      userId: req.user.id,
      action: 'GET_YEARLY_REPORT',
      service: 'finance-service',
      metadata: {
        year,
        method: req.method,
        path: req.path,
        role: req.user.role
      }
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};

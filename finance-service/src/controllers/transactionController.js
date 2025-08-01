const transactionService = require('../services/transactionService');
const logEvent = require('../utils/logEvent');

exports.createTransaction = async (req, res, next) => {
  try {
    const transaction = await transactionService.createTransaction(req.body);

    await logEvent({
      userId: req.user.id,
      action: 'ADD_TRANSACTION',
      service: 'finance-service',
      metadata: transaction.toJSON()
    });

    res.status(201).json(transaction);
  } catch (err) {
    next(err);
  }
};

exports.getAllTransactions = async (req, res, next) => {
  try {
    const transactions = await transactionService.getAllTransactions(req.query);
    res.json(transactions);
  } catch (err) {
    next(err);
  }
};

exports.getTransactionById = async (req, res, next) => {
  try {
    const transaction = await transactionService.getTransactionById(req.params.id);
    if (!transaction) return res.status(404).json({ message: 'Not found' });
    res.json(transaction);
  } catch (err) {
    next(err);
  }
};

exports.updateTransaction = async (req, res, next) => {
  try {
    const updated = await transactionService.updateTransaction(req.params.id, req.body);

    await logEvent({
      userId: req.user.id,
      action: 'UPDATE_TRANSACTION',
      service: 'finance-service',
      metadata: { id: req.params.id, changes: req.body }
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

exports.deleteTransaction = async (req, res, next) => {
  try {
    await transactionService.deleteTransaction(req.params.id);

    await logEvent({
      userId: req.user.id,
      action: 'DELETE_TRANSACTION',
      service: 'finance-service',
      metadata: { id: req.params.id }
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

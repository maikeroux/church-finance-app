const Transaction = require('../models/transaction');

exports.createTransaction = (data) => Transaction.create(data);

exports.getAllTransactions = (query) => {
  const filters = {};

  if (query.type) filters.type = query.type;
  if (query.method) filters.method = query.method;
  if (query.date) filters.date = query.date;

  return Transaction.findAll({ where: filters });
};

exports.getTransactionById = (id) => Transaction.findByPk(id);

exports.updateTransaction = async (id, data) => {
  const transaction = await Transaction.findByPk(id);
  if (!transaction) throw new Error('Transaction not found');
  return transaction.update(data);
};

exports.deleteTransaction = async (id) => {
  const transaction = await Transaction.findByPk(id);
  if (!transaction) throw new Error('Transaction not found');
  return transaction.destroy();
};

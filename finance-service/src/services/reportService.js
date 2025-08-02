const { Op } = require('sequelize');
const Transaction = require('../models/transaction');

const getWeekRange = (year, week) => {
  const start = new Date(year, 0, 1 + (week - 1) * 7);
  const day = start.getDay();
  const diff = start.getDate() - day + (day === 0 ? -6 : 1);
  const weekStart = new Date(start.setDate(diff));
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  return { weekStart, weekEnd };
};

const fetchGroupedTransactions = async (startDate, endDate) => {
  const transactions = await Transaction.findAll({
    where: {
      date: { [Op.between]: [startDate, endDate] }
    },
    raw: true,
  });

  const grouped = {
    income: [],
    expenses: [],
  };

  for (const tx of transactions) {
    const entry = {
      method: tx.method,
      particulars: tx.particulars,
      remarks: tx.remarks,
      amount: tx.amount,
    };

    if (tx.type === 'income') {
      grouped.income.push(entry);
    } else if (tx.type === 'expense') {
      grouped.expenses.push(entry);
    }
  }

  return grouped;
};

exports.generateWeeklyReport = async ({ year, week }) => {
  const { weekStart, weekEnd } = getWeekRange(+year, +week);
  return await fetchGroupedTransactions(weekStart, weekEnd);
};

exports.generateMonthlyReport = async ({ year, month }) => {
  const start = new Date(+year, +month - 1, 1);
  const end = new Date(+year, +month, 0); // last day of month
  return await fetchGroupedTransactions(start, end);
};

exports.generateYearlyReport = async ({ year }) => {
  const start = new Date(+year, 0, 1);
  const end = new Date(+year, 11, 31);
  return await fetchGroupedTransactions(start, end);
};

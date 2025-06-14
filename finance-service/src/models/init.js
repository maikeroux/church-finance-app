const { Sequelize, DataTypes } = require("sequelize");
const sequelize = new Sequelize(process.env.PG_URI);

const Transaction = sequelize.define("Transaction", {
  type: { type: DataTypes.ENUM("income", "expense"), allowNull: false },
  amount: { type: DataTypes.FLOAT, allowNull: false },
  category: { type: DataTypes.STRING },
  date: { type: DataTypes.DATE, defaultValue: Sequelize.NOW }
});

module.exports = { sequelize, Transaction };

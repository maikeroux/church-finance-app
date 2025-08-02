require('dotenv').config();
const app = require('./src/app');
const sequelize = require('./src/config/database');

// ✅ Load the Transaction model
require('./src/models/transaction');

const PORT = process.env.PORT || 3002;

(async () => {
  let retries = 5;
  while (retries) {
    try {
      console.log(`JWT_SECRET in test: ${process.env.JWT_SECRET}`);
      await sequelize.authenticate();
      console.log('✅ DB Connected');

      // ✅ Only sync models and start server if not in test mode
      if (process.env.NODE_ENV !== 'test') {
        await sequelize.sync(); // Or use { force: true } for dev reset
        console.log('📦 Models synced to DB');

        app.listen(PORT, () => {
          console.log(`🚀 Finance Service running on port ${PORT}`);
        });
      }

      break;
    } catch (err) {
      console.error(`❌ Unable to connect to DB (attempt ${6 - retries}):`, err.message);
      retries -= 1;
      await new Promise(res => setTimeout(res, 5000));
    }
  }
})();

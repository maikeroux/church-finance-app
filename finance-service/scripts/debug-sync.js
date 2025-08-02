require('dotenv').config({ path: '.env.test' });
const sequelize = require('../tests/setup');

(async () => {
  try {
    console.log('Models:', Object.keys(sequelize.models));

    await sequelize.sync({ force: true });
    console.log('✅ Sync success');
    process.exit(0);
  } catch (err) {
    console.error('❌ Sync failed:', err);
    process.exit(1);
  }
})();

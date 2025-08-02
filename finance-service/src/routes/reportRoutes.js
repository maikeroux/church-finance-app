const express = require('express');
const router = express.Router();
const controller = require('../controllers/reportController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/weekly', authorizeRoles('viewer', 'admin', 'superadmin'), controller.getWeeklyReport);
router.get('/monthly', authorizeRoles('viewer', 'admin', 'superadmin'), controller.getMonthlyReport);
router.get('/yearly', authorizeRoles('viewer', 'admin', 'superadmin'), controller.getYearlyReport);

module.exports = router;

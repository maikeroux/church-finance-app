const express = require('express');
const router = express.Router();
const controller = require('../controllers/transactionController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/', authorizeRoles('viewer', 'admin', 'superadmin'), controller.getAllTransactions);
router.get('/:id', authorizeRoles('viewer', 'admin', 'superadmin'), controller.getTransactionById);
router.post('/', authorizeRoles('admin', 'superadmin'), controller.createTransaction);
router.put('/:id', authorizeRoles('admin', 'superadmin'), controller.updateTransaction);
router.delete('/:id', authorizeRoles('admin', 'superadmin'), controller.deleteTransaction);

module.exports = router;

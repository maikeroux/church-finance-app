const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createLog } = require('../controllers/logController');

router.post('/', auth, createLog);

module.exports = router;

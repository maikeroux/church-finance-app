const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createLog, getLogs } = require('../controllers/logController');

router.post('/', auth, (req, res, next) => {
    console.log('Incoming Log Request Body:', req.body);
    next();
}, createLog);

router.get('/', getLogs);

module.exports = router;

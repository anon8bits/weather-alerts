const express = require('express');
const { getDailyReport } = require('../controllers/weatherController');

const router = express.Router();

router.get('/daily-report', getDailyReport);

module.exports = router;

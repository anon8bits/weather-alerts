const express = require('express');
const { getDailyReport, getLatestWeatherByCity } = require('../controllers/weatherController');

const router = express.Router();

router.get('/daily-report', getDailyReport);
router.get('/latest/:city', getLatestWeatherByCity);

module.exports = router;

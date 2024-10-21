const express = require('express');
const { setAlert, fetchAlerts } = require('../controllers/alertController');

const router = express.Router();

router.post('/set-alert', setAlert);
router.get('/alerts', fetchAlerts);

module.exports = router;

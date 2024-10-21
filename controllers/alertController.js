const { createAlert, getAlerts } = require('../models/alertModel');

const setAlert = async (req, res) => {
    const { email, type, threshold } = req.body;

    if (!email || !type || threshold === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        await createAlert(email, type, threshold);
        res.json({ message: 'Alert set successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Error setting alert' });
    }
};

const fetchAlerts = async (req, res) => {
    try {
        const alerts = await getAlerts();
        res.json(alerts);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching alerts' });
    }
};

module.exports = {
    setAlert,
    fetchAlerts,
};

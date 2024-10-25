const { executeModification, executeQuery } = require('../db');

const createAlert = async (email, type, threshold, city) => {
    try {
        const query = `INSERT INTO user_alerts (email, type, threshold, city) 
                      VALUES (?, ?, ?, ?)`;
        return await executeModification(query, [email, type, threshold, city]);
    } catch (err) {
        console.error('Database error:', err);
        throw new Error('Error creating alert');
    }
};

const getAlerts = async () => {
    try {
        const query = `SELECT * FROM user_alerts`;
        return await executeQuery(query);
    } catch (err) {
        console.error('Database error:', err);
        throw new Error('Error fetching alerts');
    }
};

module.exports = {
    createAlert,
    getAlerts,
};

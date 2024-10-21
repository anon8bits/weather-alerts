const { poolPromise, sql } = require('../db');

const createAlert = async (email, type, threshold) => {
    try {
        const pool = await poolPromise;
        const query = `INSERT INTO user_alerts (email, type, threshold) VALUES (@Email, @Type, @Threshold)`;
        const result = await pool.request()
            .input('Email', sql.VarChar, email)
            .input('Type', sql.VarChar, type)
            .input('Threshold', sql.Float, threshold)
            .query(query);
        return result;
    } catch (err) {
        throw new Error('Error creating alert');
    }
};

const getAlerts = async () => {
    try {
        const pool = await poolPromise;
        const query = `SELECT * FROM user_alerts`;
        const result = await pool.request().query(query);
        return result.recordset;
    } catch (err) {
        throw new Error('Error fetching alerts');
    }
};

module.exports = {
    createAlert,
    getAlerts,
};

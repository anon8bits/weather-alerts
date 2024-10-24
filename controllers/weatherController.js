const { db } = require('../db');

const getDailyReport = async (req, res) => {
    try {
        const { city, limit } = req.query;
        const limitValue = parseInt(limit, 10);

        if (isNaN(limitValue)) {
            return res.status(400).json({ error: 'Invalid limit parameter' });
        }

        const query = `
            SELECT city, date, avg_temp, min_temp, max_temp, dominant_weather
            FROM daily_weather_summary
            WHERE city = ? 
            ORDER BY date DESC
            LIMIT ?;
        `;
        
        db.all(query, [city, limitValue], (err, rows) => {
            if (err) {
                console.error('Error fetching weather report:', err);
                return res.status(500).json({ error: 'Error fetching weather report' });
            }
            res.json(rows);
        });

    } catch (err) {
        console.error('Unexpected error:', err);
        res.status(500).json({ error: 'Unexpected error fetching weather report' });
    }
};

const getLatestWeatherByCity = (req, res) => {
    const city = req.params.city;

    const query = `
    SELECT * FROM weather_data 
    WHERE LOWER(city) = LOWER(?) 
    ORDER BY timestamp DESC 
    LIMIT 1;
    `;

    db.get(query, [city], (err, row) => {
        if (err) {
            console.error("Error fetching latest weather data:", err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (!row) {
            return res.status(404).json({ message: 'No data found for the specified city' });
        }

        const io = req.app.get('socketio');
        io.emit('weatherUpdate', row);
        res.json(row);
    });
};

module.exports = {
    getDailyReport,
    getLatestWeatherByCity,
};

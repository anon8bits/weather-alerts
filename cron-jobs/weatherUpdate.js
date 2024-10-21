const cron = require('node-cron');
const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const dbPath = path.resolve(__dirname, '../weather.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        createTables();
    }
});

function createTables() {
    db.run(`CREATE TABLE IF NOT EXISTS weather_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        city TEXT NOT NULL,
        temperature REAL,
        feels_like REAL,
        pressure INTEGER,
        humidity INTEGER,
        weather TEXT,
        timestamp TEXT NOT NULL
    )`, (err) => {
        if (err) {
            console.error('Error creating weather_data table:', err.message);
        }
    });

    db.run(`CREATE TABLE IF NOT EXISTS daily_weather_summary (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        city TEXT NOT NULL,
        date TEXT NOT NULL,
        avg_temp REAL,
        min_temp REAL,
        max_temp REAL,
        dominant_weather TEXT,
        avg_feels_like REAL,
        avg_pressure REAL,
        avg_humidity REAL,
        record_count INTEGER
    )`, (err) => {
        if (err) {
            console.error('Error creating daily_weather_summary table:', err.message);
        }
    });
}

// Cron job to fetch weather data every 5 minutes
cron.schedule('*/5 * * * *', async () => {
    console.log('Running weather data collection...');

    const cities = [
        { name: 'Delhi', lat: 28.7041, lon: 77.1025 },
        { name: 'Mumbai', lat: 19.0760, lon: 72.8777 },
        { name: 'Chennai', lat: 13.0827, lon: 80.2707 },
        { name: 'Bangalore', lat: 12.9716, lon: 77.5946 },
        { name: 'Kolkata', lat: 22.5726, lon: 88.3639 },
        { name: 'Hyderabad', lat: 17.3850, lon: 78.4867 }
    ];

    const apiKey = process.env.OPENWEATHER_API_KEY;

    for (const city of cities) {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&appid=${apiKey}&units=metric`;

        try {
            const response = await axios.get(url);
            const weatherData = {
                city: city.name,
                temperature: response.data.main.temp,
                feels_like: response.data.main.feels_like,
                pressure: response.data.main.pressure,
                humidity: response.data.main.humidity,
                weather: response.data.weather[0].main,
                timestamp: new Date().toISOString()
            };

            db.run(`INSERT INTO weather_data (city, temperature, feels_like, pressure, humidity, weather, timestamp)
                VALUES (?, ?, ?, ?, ?, ?, ?)`, [
                weatherData.city,
                weatherData.temperature,
                weatherData.feels_like,
                weatherData.pressure,
                weatherData.humidity,
                weatherData.weather,
                weatherData.timestamp
            ], (err) => {
                if (err) {
                    console.error(`Error inserting data for ${city.name}:`, err);
                } else {
                    console.log(`Weather data for ${city.name} inserted successfully.`);
                }
            });

        } catch (error) {
            console.error(`Error fetching data for ${city.name}:`, error.message);
        }
    }
});

cron.schedule('0 0 * * *', async () => {
    console.log('Running daily aggregation...');

    const ist = new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000));
    ist.setDate(ist.getDate() - 1);
    const yesterday = ist.toISOString().split('T')[0];

    try {
        db.all(`SELECT city, AVG(temperature) as avg_temp, MIN(temperature) as min_temp, MAX(temperature) as max_temp,
                AVG(feels_like) as avg_feels_like, AVG(pressure) as avg_pressure, AVG(humidity) as avg_humidity, 
                weather, COUNT(*) as record_count
                FROM weather_data
                WHERE DATE(timestamp) = ?
                GROUP BY city`, [yesterday], (err, rows) => {
            if (err) {
                console.error('Error fetching data for aggregation:', err.message);
                return;
            }

            if (rows.length === 0) {
                console.log('No data found for aggregation');
                return;
            }

            db.run('BEGIN TRANSACTION');

            rows.forEach((row) => {
                db.run(`INSERT INTO daily_weather_summary (city, date, avg_temp, min_temp, max_temp, dominant_weather, 
                    avg_feels_like, avg_pressure, avg_humidity, record_count)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
                    row.city,
                    yesterday,
                    row.avg_temp,
                    row.min_temp,
                    row.max_temp,
                    row.weather,
                    row.avg_feels_like,
                    row.avg_pressure,
                    row.avg_humidity,
                    row.record_count
                ], (err) => {
                    if (err) {
                        console.error(`Error inserting summary for ${row.city}:`, err.message);
                    } else {
                        console.log(`Daily summary for ${row.city} inserted successfully.`);
                    }
                });
            });

            db.run('COMMIT');
        });

        db.run(`DELETE FROM weather_data WHERE DATE(timestamp) = ?`, [yesterday], (err) => {
            if (err) {
                console.error('Error deleting old records:', err.message);
            } else {
                console.log('Old records deleted successfully.');
            }
        });

    } catch (error) {
        console.error('Error in daily aggregation:', error.message);
    }
});

const cron = require('node-cron');
const axios = require('axios');
const path = require('path');
const WeatherAlertSystem = require('./WeatherAlertSystem');
const { executeQuery, executeModification } = require('../db');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Weather data collection - runs every 5 minutes
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
        try {
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&appid=${apiKey}&units=metric`;
            const response = await axios.get(url);
            
            const weatherData = {
                city: city.name,
                temperature: response.data.main.temp,
                feels_like: response.data.main.feels_like,
                pressure: response.data.main.pressure,
                humidity: response.data.main.humidity,
                weather: response.data.weather[0].main,
                wind_speed: response.data.wind.speed,
                timestamp: new Date().toISOString()
            };

            // Insert weather data using executeModification
            await executeModification(
                `INSERT INTO weather_data (city, temperature, feels_like, pressure, humidity, weather, timestamp)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    weatherData.city,
                    weatherData.temperature,
                    weatherData.feels_like,
                    weatherData.pressure,
                    weatherData.humidity,
                    weatherData.weather,
                    weatherData.timestamp
                ]
            );
            
            console.log(`Weather data for ${city.name} inserted successfully.`);
            await checkCityAlerts(city.name, weatherData);

        } catch (error) {
            console.error(`Error processing ${city.name}:`, error);
        }
    }
});

async function checkCityAlerts(city, weatherData) {
    try {
        const alerts = await executeQuery(
            `SELECT a.*, s.is_triggered, s.last_triggered_at, s.recovered_at, s.current_value 
             FROM user_alerts a 
             LEFT JOIN alert_states s ON a.id = s.alert_id 
             WHERE a.city = ?`,
            [city]
        );

        for (const alert of alerts) {
            await processAlert(alert, weatherData);
        }
    } catch (error) {
        console.error(`Error checking alerts for ${city}:`, error);
    }
}

async function processAlert(alert, weatherData) {
    const currentValue = getCurrentValue(alert.type, weatherData);
    const isConditionMet = checkCondition(alert, weatherData);
    
    try {
        if (alert.is_triggered === null) {
            await executeModification(
                `INSERT INTO alert_states (alert_id, is_triggered, current_value) 
                 VALUES (?, 0, ?)`,
                [alert.id, currentValue]
            );
            alert.is_triggered = false;
        }

        await executeModification(
            `UPDATE alert_states 
             SET current_value = ? 
             WHERE alert_id = ?`,
            [currentValue, alert.id]
        );

        if (isConditionMet && !alert.is_triggered) {
            await triggerAlert(alert, weatherData);
        } else if (!isConditionMet && alert.is_triggered) {
            await recordRecovery(alert, weatherData);
        }
    } catch (error) {
        console.error('Error processing alert:', error);
    }
}

async function triggerAlert(alert, weatherData) {
    const now = new Date().toISOString();
    
    try {
        // Send alert email
        await alertSystem.sendAlerts([alert], weatherData);

        // Update alert state
        await executeModification(
            `UPDATE alert_states 
             SET is_triggered = 1, last_triggered_at = ? 
             WHERE alert_id = ?`,
            [now, alert.id]
        );

        // Record in history
        await executeModification(
            `INSERT INTO alert_history (alert_id, triggered_at, weather_conditions, event_type) 
             VALUES (?, ?, ?, 'triggered')`,
            [alert.id, now, JSON.stringify(weatherData)]
        );
    } catch (error) {
        console.error('Error triggering alert:', error);
    }
}

async function recordRecovery(alert, weatherData) {
    const now = new Date().toISOString();
    
    try {
        await executeModification(
            `UPDATE alert_states 
             SET is_triggered = 0, recovered_at = ? 
             WHERE alert_id = ?`,
            [now, alert.id]
        );

        await executeModification(
            `INSERT INTO alert_history (alert_id, triggered_at, weather_conditions, event_type) 
             VALUES (?, ?, ?, 'recovered')`,
            [alert.id, now, JSON.stringify(weatherData)]
        );
    } catch (error) {
        console.error('Error recording recovery:', error);
    }
}

// Daily aggregation job - runs at midnight
cron.schedule('0 0 * * *', async () => {
    console.log('Running daily aggregation...');

    const ist = new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000));
    ist.setDate(ist.getDate() - 1);
    const yesterday = ist.toISOString().split('T')[0];

    try {
        const dailyData = await executeQuery(
            `SELECT city, 
                    AVG(temperature) as avg_temp, 
                    MIN(temperature) as min_temp, 
                    MAX(temperature) as max_temp,
                    AVG(feels_like) as avg_feels_like, 
                    AVG(pressure) as avg_pressure, 
                    AVG(humidity) as avg_humidity,
                    weather,
                    COUNT(*) as record_count
             FROM weather_data
             WHERE DATE(timestamp) = ?
             GROUP BY city`,
            [yesterday]
        );

        if (dailyData.length === 0) {
            console.log('No data found for aggregation');
            return;
        }

        // Insert summaries
        for (const row of dailyData) {
            await executeModification(
                `INSERT INTO daily_weather_summary 
                 (city, date, avg_temp, min_temp, max_temp, dominant_weather, 
                  avg_feels_like, avg_pressure, avg_humidity, record_count)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
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
                ]
            );
            console.log(`Daily summary for ${row.city} inserted successfully.`);
        }

        // Clean up old data
        await executeModification(
            `DELETE FROM weather_data WHERE DATE(timestamp) = ?`,
            [yesterday]
        );
        console.log('Old records deleted successfully.');

    } catch (error) {
        console.error('Error in daily aggregation:', error);
    }
});

// Keep the utility functions unchanged
const getCurrentValue = (alertType, weatherData) => {
    switch (alertType.toLowerCase()) {
        case 'temperature_above':
        case 'temperature_below':
            return weatherData.temperature;
        case 'wind_speed':
            return weatherData.wind_speed;
        case 'humidity':
            return weatherData.humidity;
        default:
            return null;
    }
};

const checkCondition = (alert, weatherData) => {
    switch (alert.type.toLowerCase()) {
        case 'temperature_above':
            return weatherData.temperature > alert.threshold;
        case 'temperature_below':
            return weatherData.temperature < alert.threshold;
        case 'rain':
            return weatherData.weather.toLowerCase() === 'rain';
        case 'snow':
            return weatherData.weather.toLowerCase() === 'snow';
        case 'thunderstorm':
            return weatherData.weather.toLowerCase() === 'thunderstorm';
        case 'wind_speed':
            return weatherData.wind_speed > alert.threshold;
        case 'humidity':
            return weatherData.humidity > alert.threshold;
        default:
            return false;
    }
};

const alertSystem = new WeatherAlertSystem({
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
});

module.exports = {
    getCurrentValue,
    checkCondition
};
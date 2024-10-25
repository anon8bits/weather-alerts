const nodemailer = require('nodemailer');

class WeatherAlertSystem {
    constructor(emailConfig) {
        // Validate email configuration
        if (!emailConfig?.user || !emailConfig?.pass) {
            throw new Error('Invalid email configuration');
        }

        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: emailConfig.user,
                pass: emailConfig.pass
            }
        });

        // Keep track of alerts to prevent spam
        this.lastAlertsSent = new Map(); // key: email+type+city, value: timestamp
        this.ALERT_COOLDOWN = 1800000; // 30 minutes in milliseconds
    }

    findTriggeredAlerts(alerts, weatherData) {
        if (!Array.isArray(alerts) || !weatherData) {
            console.error('Invalid input to findTriggeredAlerts');
            return [];
        }

        const now = Date.now();
        return alerts.filter(alert => {
            try {
                // Check cooldown period
                const alertKey = `${alert.email}-${alert.type}-${alert.city}`;
                const lastSent = this.lastAlertsSent.get(alertKey) || 0;
                if (now - lastSent < this.ALERT_COOLDOWN) {
                    return false;
                }

                // Validate city match
                if (alert.city.toLowerCase() !== weatherData.city.toLowerCase()) {
                    return false;
                }

                const triggered = this.checkAlertCondition(alert, weatherData);
                if (triggered) {
                    this.lastAlertsSent.set(alertKey, now);
                }
                return triggered;
            } catch (err) {
                console.error(`Error processing alert: ${err.message}`, { alert, weatherData });
                return false;
            }
        });
    }

    checkAlertCondition(alert, weatherData) {
        switch (alert.type.toLowerCase()) {
            case 'temperature_above':
                return weatherData.temperature > alert.threshold;
            case 'temperature_below':
                return weatherData.temperature < alert.threshold;
            case 'rain':
                return weatherData.weather.toLowerCase().includes('rain');
            case 'snow':
                return weatherData.weather.toLowerCase().includes('snow');
            case 'thunderstorm':
                return weatherData.weather.toLowerCase().includes('thunderstorm');
            case 'humidity':
                return weatherData.humidity > alert.threshold;
            default:
                console.warn(`Unknown alert type: ${alert.type}`);
                return false;
        }
    }

    async sendAlerts(triggeredAlerts, weatherData) {
        if (!Array.isArray(triggeredAlerts) || triggeredAlerts.length === 0) {
            return;
        }

        const results = await Promise.allSettled(
            triggeredAlerts.map(alert => this.sendSingleAlert(alert, weatherData))
        );

        // Log any failures
        results.forEach((result, index) => {
            if (result.status === 'rejected') {
                console.error('Failed to send alert:', {
                    alert: triggeredAlerts[index],
                    error: result.reason
                });
            }
        });
    }

    async sendSingleAlert(alert, weatherData) {
        try {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: alert.email,
                subject: `Weather Alert: ${this.getAlertSubject(alert, weatherData)}`,
                html: this.generateAlertEmail(alert, weatherData)
            };

            await this.transporter.sendMail(mailOptions);
            console.log(`Alert sent successfully to ${alert.email} for ${alert.type} in ${alert.city}`);
        } catch (err) {
            console.error(`Failed to send alert email: ${err.message}`);
            throw err; // Re-throw for handling in sendAlerts
        }
    }

    getAlertSubject(alert, weatherData) {
        const city = weatherData.city;
        switch (alert.type.toLowerCase()) {
            case 'temperature_above':
                return `Temperature Above ${alert.threshold}°C in ${city}`;
            case 'temperature_below':
                return `Temperature Below ${alert.threshold}°C in ${city}`;
            case 'rain':
                return `Rain Alert for ${city}`;
            case 'snow':
                return `Snow Alert for ${city}`;
            case 'thunderstorm':
                return `Thunderstorm Alert for ${city}`;
            case 'humidity':
                return `High Humidity Alert for ${city}`;
            default:
                return `Weather Alert for ${city}`;
        }
    }

    generateAlertEmail(alert, weatherData) {
        const timestamp = new Date(weatherData.timestamp).toLocaleString('en-US', {
            timeZone: 'UTC',
            timeZoneName: 'short'
        });

        return `
            <!DOCTYPE html>
            <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #333;">Weather Alert for ${weatherData.city}</h2>
                <p>Your weather alert condition has been met:</p>
                <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <p><strong>Alert Type:</strong> ${alert.type}</p>
                    <p><strong>Threshold:</strong> ${this.formatThreshold(alert)}</p>
                    <p><strong>Current Value:</strong> ${this.getCurrentValue(alert, weatherData)}</p>
                </div>
                <h3 style="color: #333;">Current Weather Conditions:</h3>
                <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
                    <p><strong>Temperature:</strong> ${weatherData.temperature}°C</p>
                    <p><strong>Feels Like:</strong> ${weatherData.feels_like}°C</p>
                    <p><strong>Humidity:</strong> ${weatherData.humidity}%</p>
                    <p><strong>Pressure:</strong> ${weatherData.pressure} hPa</p>
                    <p><strong>Weather Condition:</strong> ${weatherData.weather}</p>
                    <p><strong>Time:</strong> ${timestamp}</p>
                </div>
                <p style="color: #666; font-size: 12px; margin-top: 20px;">
                    You received this alert because you subscribed to weather updates for ${weatherData.city}.
                    This alert will not be sent again for the next 30 minutes.
                </p>
            </body>
            </html>
        `;
    }

    formatThreshold(alert) {
        switch (alert.type.toLowerCase()) {
            case 'temperature_above':
            case 'temperature_below':
                return `${alert.threshold}°C`;
            case 'humidity':
                return `${alert.threshold}%`;
            case 'rain':
            case 'snow':
            case 'thunderstorm':
                return 'Any occurrence';
            default:
                return alert.threshold?.toString() || 'N/A';
        }
    }

    getCurrentValue(alert, weatherData) {
        switch (alert.type.toLowerCase()) {
            case 'temperature_above':
            case 'temperature_below':
                return `${weatherData.temperature}°C`;
            case 'rain':
            case 'snow':
            case 'thunderstorm':
                return weatherData.weather;
            case 'humidity':
                return `${weatherData.humidity}%`;
            default:
                return 'N/A';
        }
    }
}

module.exports = WeatherAlertSystem;
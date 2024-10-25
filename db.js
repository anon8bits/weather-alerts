const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'weather.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Failed to connect to SQLite database:', err.message);
    } else {
        console.log('Connected to SQLite database');
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
    
        db.run(`CREATE TABLE IF NOT EXISTS user_alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL,
            type TEXT NOT NULL,
            threshold REAL NOT NULL,
            city TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                console.error('Error creating user_alerts table:', err.message);
            }
        });
    
        db.run(`CREATE TABLE IF NOT EXISTS alert_states (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            alert_id INTEGER NOT NULL,
            is_triggered BOOLEAN NOT NULL DEFAULT 0,
            last_triggered_at TEXT,
            recovered_at TEXT,
            current_value REAL,
            FOREIGN KEY (alert_id) REFERENCES user_alerts(id)
        )`, (err) => {
            if (err) {
                console.error('Error creating alert_states table:', err.message);
            }
        });
    
        db.run(`CREATE TABLE IF NOT EXISTS alert_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            alert_id INTEGER,
            triggered_at TEXT NOT NULL,
            recovered_at TEXT,
            weather_conditions TEXT NOT NULL,
            event_type TEXT NOT NULL,
            FOREIGN KEY (alert_id) REFERENCES user_alerts(id)
        )`, (err) => {
            if (err) {
                console.error('Error creating alert_history table:', err.message);
            }
        });
    }
});

// For SELECT queries
function executeQuery(query, params = []) {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) {
                console.error('Error executing query:', err.message);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

// For INSERT, UPDATE, DELETE queries
function executeModification(query, params = []) {
    return new Promise((resolve, reject) => {
        db.run(query, params, function(err) {
            if (err) {
                console.error('Error executing modification:', err.message);
                reject(err);
            } else {
                resolve({ 
                    lastID: this.lastID, 
                    changes: this.changes 
                });
            }
        });
    });
}

// Graceful shutdown
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        } else {
            console.log('Database connection closed.');
        }
        process.exit(err ? 1 : 0);
    });
});

module.exports = {
    db,
    executeQuery,
    executeModification
};
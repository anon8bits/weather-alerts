import React, { useEffect, useState, createContext } from 'react';
import io from 'socket.io-client';

const SERVER_URL = 'http://localhost:5000';

export const WeatherContext = createContext({
  latestWeather: null,
  loading: true,
  error: null
});

export const WeatherProvider = ({ children, selectedCity }) => {
  const [latestWeather, setLatestWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socket] = useState(() => io(SERVER_URL));

  useEffect(() => {
    setLoading(true);
    setError(null);

    const fetchWeatherData = async () => {
      try {
        const response = await fetch(`${SERVER_URL}/weather/latest/${selectedCity}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setLatestWeather(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching weather data:", error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchWeatherData();

    const handleWeatherUpdate = (data) => {
      if (data.city.toLowerCase() === selectedCity.toLowerCase()) {
        setLatestWeather(data);
        setLoading(false);
      }
    };

    socket.on('weatherUpdate', handleWeatherUpdate);

    // Error handling for socket connection
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setError('Failed to connect to weather updates');
    });

    return () => {
      socket.off('weatherUpdate', handleWeatherUpdate);
      socket.off('connect_error');
    };
  }, [selectedCity, socket]);

  return (
    <WeatherContext.Provider value={{ latestWeather, loading, error }}>
      {children}
    </WeatherContext.Provider>
  );
};
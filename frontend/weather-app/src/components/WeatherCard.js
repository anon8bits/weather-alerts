import React, { useContext } from 'react';
import {
  Cloud,
  Sun,
  CloudRain,
  Thermometer,
  Droplet,
  CloudFog,
  Cloudy,
  Cigarette
} from 'lucide-react';
import { WeatherContext } from '../contexts/WeatherProvider';

const WeatherCard = () => {
  const { latestWeather, loading, error, unit } = useContext(WeatherContext);

  const celsiusToFahrenheit = (celsius) => {
    return (celsius * 9 / 5) + 32;
  };

  const formatTemperature = (celsius) => {
    if (unit === 'fahrenheit') {
      return Math.round(celsiusToFahrenheit(celsius));
    }
    return Math.round(celsius);
  };

  if (loading) {
    return (
      <div className="w-full max-w-md p-6 bg-gray-800/50 rounded-lg">
        <div className="text-white text-center">Loading weather data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-md p-6 bg-gray-800/50 rounded-lg">
        <div className="text-red-400 text-center">Error fetching weather data: {error}</div>
      </div>
    );
  }

  if (!latestWeather) {
    return (
      <div className="w-full max-w-md p-6 bg-gray-800/50 rounded-lg">
        <div className="text-white text-center">No weather data available.</div>
      </div>
    );
  }

  const getWeatherIcon = (weather) => {
    switch (weather.toLowerCase()) {
      case 'rain':
        return <CloudRain className="text-blue-300" size={48} />;
      case 'clouds':
        return <Cloudy className="text-gray-300" size={48} />;
      case 'haze':
        return <CloudFog className="text-gray-400" size={48} />;
      case 'smoke':
        return <Cigarette className="text-gray-400" size={48} />;
      case 'mist':
        return <CloudFog className="text-blue-200" size={48} />;
      case 'clear':
        return <Sun className="text-yellow-300" size={48} />;
      default:
        return <Cloud className="text-gray-300" size={48} />;
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 shadow-lg border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {latestWeather.city}
          </h2>
          <div>{getWeatherIcon(latestWeather.weather)}</div>
        </div>

        <div className="text-center mb-6">
          <p className="text-gray-300 mb-2">{latestWeather.weather}</p>
          <p className="text-4xl font-bold text-white">
            {formatTemperature(latestWeather.temperature)}°{unit === 'celsius' ? 'C' : 'F'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-white">
          <div className="flex items-center gap-3">
            <Thermometer className="text-orange-400" size={24} />
            <div>
              <p className="text-sm text-gray-300">Feels Like</p>
              <p className="font-medium">
                {formatTemperature(latestWeather.feels_like)}°{unit === 'celsius' ? 'C' : 'F'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 border-l border-gray-600 pl-4">
            <Droplet className="text-blue-400" size={24} />
            <div>
              <p className="text-sm text-gray-300">Humidity</p>
              <p className="font-medium">{latestWeather.humidity}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;
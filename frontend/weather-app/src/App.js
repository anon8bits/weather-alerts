import React, { useState, useEffect } from 'react';
import WeatherCard from './components/WeatherCard';
import AlertForm from './components/AlertForm';
import { WeatherProvider, WeatherContext } from './contexts/WeatherProvider';

const cities = ['Delhi', 'Mumbai', 'Chennai', 'Hyderabad', 'Bangalore', 'Kolkata'];

const UnitSelector = () => {
  const { unit, setUnit } = React.useContext(WeatherContext);
  return (
    <div className="flex items-center gap-2">
      <span className="text-white font-medium">Unit:</span>
      <div className="flex">
        <button
          onClick={() => setUnit('celsius')}
          className={`px-3 py-1.5 rounded-l-md transition-colors ${
            unit === 'celsius'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          °C
        </button>
        <button
          onClick={() => setUnit('fahrenheit')}
          className={`px-3 py-1.5 rounded-r-md transition-colors ${
            unit === 'fahrenheit'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          °F
        </button>
      </div>
    </div>
  );
};

export default function App() {
  const [selectedCity, setSelectedCity] = useState(() => {
    return localStorage.getItem('selectedCity') || 'Delhi';
  });

  useEffect(() => {
    localStorage.setItem('selectedCity', selectedCity);
  }, [selectedCity]);

  const handleCityChange = (e) => {
    setSelectedCity(e.target.value);
  };

  return (
    <WeatherProvider selectedCity={selectedCity}>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
        <div className="max-w-xl mx-auto space-y-8">
          <div className="flex justify-between items-center gap-4 p-4 bg-gray-800/50 rounded-lg">
            <div className="flex items-center gap-3">
              <label htmlFor="citySelect" className="text-white font-medium">
                Select City:
              </label>
              <select 
                id="citySelect" 
                value={selectedCity} 
                onChange={handleCityChange}
                className="bg-gray-700 text-white border-gray-600 rounded-md px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
            <UnitSelector />
          </div>
          
          <div className="flex justify-center px-4">
            <WeatherCard />
          </div>

          <div className="flex justify-center px-4">
            <AlertForm selectedCity={selectedCity} />
          </div>
        </div>
      </div>
    </WeatherProvider>
  );
}

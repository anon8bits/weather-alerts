import React, { useState } from 'react';
import WeatherCard from './components/WeatherCard';
import AlertForm from './components/AlertForm';
import { WeatherProvider } from './contexts/WeatherProvider';

const cities = ['Delhi', 'Mumbai', 'Chennai', 'Hyderabad', 'Bangalore', 'Kolkata'];

export default function App() {
  const [selectedCity, setSelectedCity] = useState('Delhi');

  const handleCityChange = (e) => {
    setSelectedCity(e.target.value);
  };

  return (
    <WeatherProvider selectedCity={selectedCity}>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
        <div className="max-w-xl mx-auto space-y-8">
          <div className="flex justify-center items-center gap-3 p-4 bg-gray-800/50 rounded-lg">
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
          
          <div className="flex justify-center px-4">
            <WeatherCard />
          </div>

          <div className="flex justify-center px-4">
            <AlertForm />
          </div>
        </div>
      </div>
    </WeatherProvider>
  );
} 
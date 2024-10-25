import React, { useState } from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { useContext } from 'react';
import { WeatherContext } from '../contexts/WeatherProvider';

const AlertForm = ({ selectedCity }) => {
  const [formData, setFormData] = useState({
    email: '',
    alertType: '',
    threshold: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(''); // New state for success message

  const { unit } = useContext(WeatherContext);

  const alertTypes = [
    { value: 'temperature-above', label: 'Temperature Above', requiresThreshold: true },
    { value: 'temperature-below', label: 'Temperature Below', requiresThreshold: true },
    { value: 'rain', label: 'Rain', requiresThreshold: false },
    { value: 'snow', label: 'Snow', requiresThreshold: false },
    { value: 'thunderstorm', label: 'Thunderstorm', requiresThreshold: false },
    { value: 'humidity', label: 'Humidity', requiresThreshold: true },
  ];

  const validateThreshold = (value, type) => {
    const num = parseFloat(value);
    if (isNaN(num)) return 'Please enter a valid number';
    if (num < 0) return 'Value cannot be negative';
    
    switch (type) {
      case 'temperature-above':
      case 'temperature-below':
        if (num > 60) return 'Temperature threshold seems too high';
        if (num < -90) return 'Temperature threshold seems too low';
        break;
      case 'humidity':
        if (num > 100) return 'Humidity cannot exceed 100%';
        break;
    }
    return '';
  };

  const convertToCelsius = (fahrenheit) => (fahrenheit - 32) * 5 / 9;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage(''); // Clear any previous success message

    // Validation
    if (!formData.email || !formData.alertType) {
      setError('Please fill in all required fields');
      return;
    }

    const selectedType = alertTypes.find(type => type.value === formData.alertType);

    // Use a default random threshold if not required
    const thresholdValue = selectedType?.requiresThreshold 
      ? parseFloat(formData.threshold) || 0
      : Math.random() * 10; // Random value (0-10) if threshold is not required

    if (selectedType?.requiresThreshold) {
      const thresholdError = validateThreshold(formData.threshold, formData.alertType);
      if (thresholdError) {
        setError(thresholdError);
        return;
      }
    }

    // Convert threshold to Celsius if unit is Fahrenheit
    const convertedThreshold = unit === 'fahrenheit' 
      ? convertToCelsius(thresholdValue)
      : thresholdValue;

    // API submission
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/alerts/set-alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          type: formData.alertType,
          threshold: convertedThreshold,
          city: selectedCity,  // Ensure the city is included
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to set alert');
      }

      // Show success message
      setSuccessMessage('Alert set successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);

      // Reset form on success
      setFormData({
        email: '',
        alertType: '',
        threshold: '',
      });
      
    } catch (err) {
      setError('Failed to set alert. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const showThreshold = alertTypes.find(type => type.value === formData.alertType)?.requiresThreshold;

  return (
    <div className="w-full max-w-md bg-gray-800/50 rounded-xl p-6 shadow-lg border border-gray-700">
      <h2 className="text-xl font-bold text-white mb-4">Weather Alerts</h2>
      
      {/* Success Alert */}
      {successMessage && (
        <div className="flex items-center gap-2 text-green-500 bg-green-800/50 rounded-md p-3 mb-4">
          <CheckCircle size={20} />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full bg-gray-700 text-white border-gray-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label htmlFor="alertType" className="block text-sm font-medium text-gray-300 mb-1">
            Alert Type
          </label>
          <select
            id="alertType"
            name="alertType"
            value={formData.alertType}
            onChange={handleChange}
            className="w-full bg-gray-700 text-white border-gray-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select alert type</option>
            {alertTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {showThreshold && (
          <div>
            <label htmlFor="threshold" className="block text-sm font-medium text-gray-300 mb-1">
              {formData.alertType.includes('temperature') 
                ? `Temperature Threshold (${unit === 'celsius' ? '°C' : '°F'})` 
                : 'Humidity Threshold (%)'}
            </label>
            <input
              type="number"
              id="threshold"
              name="threshold"
              value={formData.threshold}
              onChange={handleChange}
              className="w-full bg-gray-700 text-white border-gray-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              step="0.1"
              required
            />
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? 'Setting Alert...' : 'Set Alert'}
        </button>
      </form>
    </div>
  );
};

export default AlertForm;
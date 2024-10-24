import React, { useState } from 'react';

const AlertForm = () => {
  const [email, setEmail] = useState('');
  const [threshold, setThreshold] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log('Alert settings:', { email, threshold });
  };

  return (
    <div className="w-full max-w-md bg-gray-800/50 rounded-xl p-6 shadow-lg border border-gray-700">
      <h2 className="text-xl font-bold text-white mb-4">Weather Alerts</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-gray-700 text-white border-gray-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label htmlFor="threshold" className="block text-sm font-medium text-gray-300 mb-1">
            Temperature Threshold (°C)
          </label>
          <input
            type="number"
            id="threshold"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            className="w-full bg-gray-700 text-white border-gray-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          Set Alert
        </button>
      </form>
    </div>
  );
};

export default AlertForm;
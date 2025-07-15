import React from "react";

const LocationError = ({ error, onRetry }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-8 shadow-lg max-w-md text-center">
        <div className="text-red-500 text-6xl mb-4">📍</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Location Access Required
        </h2>
        <p className="text-gray-600 mb-4">
          {error ||
            "Please allow location access to get weather information for your area."}
        </p>
        <button
          onClick={onRetry}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  );
};

export default LocationError;

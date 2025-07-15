import React from "react";
import WeatherCard from "./WeatherCard";
import WeatherChart from "./WeatherChart";
import LocalNews from "./LocalNews";

const DashboardLayout = ({ coords }) => {
  // Loading state when coordinates are not available
  if (!coords) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">
            Getting your location...
          </h2>
          <p className="text-gray-500 mt-2">
            Please allow location access for personalized weather & news
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🌦️📰 Weather & News Hub
          </h1>
          <p className="text-gray-600 text-lg">
            Your personalized dashboard for weather insights and latest news
          </p>
          <div
            className="mt-4 text-sm text-gray-500"
            aria-label="Current location coordinates"
          >
            📍 Personalized content for: {coords.lat.toFixed(2)},{" "}
            {coords.lon.toFixed(2)}
          </div>
        </header>

        {/* Main Content */}
        <main className="space-y-8 max-w-6xl mx-auto">
          {/* Weather Section */}
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">🌤️</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Weather Analysis
                </h2>
                <p className="text-gray-600 text-sm">
                  Current conditions and detailed forecasts
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-auto">
                <WeatherCard coords={coords} />
              </div>
              <div className="h-auto">
                <WeatherChart coords={coords} />
              </div>
            </div>
          </section>

          {/* News Section */}
          <section className="w-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">📰</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Latest News & Updates
                </h2>
                <p className="text-gray-600 text-sm">
                  Stay informed with current events and breaking news
                </p>
              </div>
            </div>

            <LocalNews coords={coords} />
          </section>
        </main>

        {/* Footer */}
        <footer className="text-center mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            🌍 Your personalized weather and news dashboard • Updated in
            real-time
          </p>
          <p className="text-gray-400 text-xs mt-2">
            Weather data and news aggregated from multiple reliable sources
          </p>
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;

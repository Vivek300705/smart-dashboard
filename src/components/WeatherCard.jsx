import React, { useState, useEffect } from "react";
import {
  MapPin,
  Thermometer,
  Eye,
  Wind,
  Droplet,
  Sun,
  Cloud,
  CloudRain,
  Snowflake,
  Zap,
} from "lucide-react";
import { getWeatherData } from "../services/api";

const WeatherCard = ({ coords = { lat: 40.7128, lon: -74.006 } }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setLoading(true);
        setError(null);

        const weatherData = await getWeatherData(coords.lat, coords.lon);
        setWeather(weatherData);
      } catch (err) {
        setError(err.message || "Failed to fetch weather data");
        console.error("Error fetching weather:", err);
      } finally {
        setLoading(false);
      }
    };

    if (coords && coords.lat && coords.lon) {
      fetchWeatherData();
    }
  }, [coords]);

  const getWeatherIcon = (weatherMain) => {
    switch (weatherMain?.toLowerCase()) {
      case "clear":
        return <Sun className="w-8 h-8 text-yellow-300" />;
      case "clouds":
        return <Cloud className="w-8 h-8 text-gray-200" />;
      case "rain":
        return <CloudRain className="w-8 h-8 text-blue-200" />;
      case "snow":
        return <Snowflake className="w-8 h-8 text-white" />;
      case "thunderstorm":
        return <Zap className="w-8 h-8 text-yellow-300" />;
      default:
        return <Sun className="w-8 h-8 text-yellow-300" />;
    }
  };

  if (loading) {
    return (
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-2xl p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="animate-pulse">
            <div className="h-6 bg-white/20 rounded-lg mb-6 w-3/4"></div>
            <div className="h-20 bg-white/20 rounded-lg mb-6 w-1/2 mx-auto"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-4 bg-white/20 rounded"></div>
              <div className="h-4 bg-white/20 rounded"></div>
              <div className="h-4 bg-white/20 rounded"></div>
              <div className="h-4 bg-white/20 rounded"></div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative overflow-hidden bg-gradient-to-br from-red-500 via-pink-600 to-rose-700 rounded-2xl p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold mb-2">Weather Unavailable</h3>
          <p className="text-sm opacity-90">{error}</p>
        </div>
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-2xl p-8 text-white shadow-2xl transform hover:scale-105 transition-all duration-300">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-blue-200" />
            <span className="text-lg font-semibold">
              {weather.location?.name || "Current Location"}
              {weather.location?.country && `, ${weather.location.country}`}
            </span>
          </div>
          {getWeatherIcon(weather.current.weather[0].main)}
        </div>

        {/* Temperature Display */}
        <div className="text-center mb-8">
          <div className="text-7xl font-bold mb-2 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
            {Math.round(weather.current.temp)}°
          </div>
          <div className="text-xl opacity-90 capitalize font-medium">
            {weather.current.weather[0].description}
          </div>
        </div>

        {/* Weather Details Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 flex items-center gap-3 hover:bg-white/20 transition-colors">
            <div className="p-2 bg-orange-500/30 rounded-full">
              <Thermometer className="w-4 h-4 text-orange-200" />
            </div>
            <div>
              <div className="text-xs opacity-70">Feels like</div>
              <div className="font-semibold">
                {Math.round(weather.current.feels_like)}°C
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 flex items-center gap-3 hover:bg-white/20 transition-colors">
            <div className="p-2 bg-cyan-500/30 rounded-full">
              <Wind className="w-4 h-4 text-cyan-200" />
            </div>
            <div>
              <div className="text-xs opacity-70">Wind</div>
              <div className="font-semibold">
                {weather.current.wind_speed} m/s
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 flex items-center gap-3 hover:bg-white/20 transition-colors">
            <div className="p-2 bg-blue-500/30 rounded-full">
              <Droplet className="w-4 h-4 text-blue-200" />
            </div>
            <div>
              <div className="text-xs opacity-70">Humidity</div>
              <div className="font-semibold">{weather.current.humidity}%</div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 flex items-center gap-3 hover:bg-white/20 transition-colors">
            <div className="p-2 bg-purple-500/30 rounded-full">
              <Eye className="w-4 h-4 text-purple-200" />
            </div>
            <div>
              <div className="text-xs opacity-70">Visibility</div>
              <div className="font-semibold">
                {weather.current.visibility} km
              </div>
            </div>
          </div>
        </div>

        {/* Bottom gradient accent */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 opacity-60"></div>
      </div>
    </div>
  );
};

export default WeatherCard;
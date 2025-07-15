import React, { useState, useEffect, useRef,useMemo } from "react";
import { Calendar, TrendingUp, Thermometer,  } from "lucide-react";
// import { Calendar, TrendingUp, Thermometer, Cloud, Sun } from "lucide-react";
import { getWeatherData } from "../services/api";

const WeatherChart = ({ coords = { lat: 40.7128, lon: -74.006 } }) => {
  const canvasRef = useRef(null);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [animationProgress, setAnimationProgress] = useState(0);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getWeatherData(coords.lat, coords.lon);
        setWeatherData(data);
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

  // Convert weather data to chart format
  const temps = useMemo(() => {
    return (
      weatherData?.daily?.map((day) => ({
        temp: day.temp.day,
        date: new Date(day.dt * 1000).toLocaleDateString("en-US", {
          weekday: "short",
        }),
        weather: day.weather[0].main.toLowerCase(),
      })) || []
    );
  }, [weatherData]);

  // Animation effect
  useEffect(() => {
    if (!temps.length || loading) return;

    const animateChart = () => {
      const duration = 1500;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease out animation
        const easeOutProgress = 1 - Math.pow(1 - progress, 3);
        setAnimationProgress(easeOutProgress);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      animate();
    };

    animateChart();
  }, [temps, loading]);

  useEffect(() => {
    if (!temps.length || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const { width, height } = canvas;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#f8fafc");
    gradient.addColorStop(1, "#f1f5f9");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Calculate dimensions
    const padding = 60;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Find min/max temps for scaling
    const minTemp = Math.min(...temps.map((t) => t.temp)) - 2;
    const maxTemp = Math.max(...temps.map((t) => t.temp)) + 2;
    const tempRange = maxTemp - minTemp || 1;

    // Draw subtle grid lines
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 6]);
    for (let i = 0; i <= 5; i++) {
      const y = padding + (i * chartHeight) / 5;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Create gradient for the area under the curve
    const areaGradient = ctx.createLinearGradient(
      0,
      padding,
      0,
      height - padding
    );
    areaGradient.addColorStop(0, "rgba(59, 130, 246, 0.4)");
    areaGradient.addColorStop(0.5, "rgba(59, 130, 246, 0.2)");
    areaGradient.addColorStop(1, "rgba(59, 130, 246, 0.02)");

    // Draw area under curve with animation
    ctx.fillStyle = areaGradient;
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);

    temps.forEach((temp, i) => {
      const x = padding + (i * chartWidth) / (temps.length - 1);
      const targetY =
        padding +
        chartHeight -
        ((temp.temp - minTemp) / tempRange) * chartHeight;

      // Apply animation progress
      const animatedY =
        height - padding - (height - padding - targetY) * animationProgress;

      if (i === 0) {
        ctx.lineTo(x, animatedY);
      } else {
        ctx.lineTo(x, animatedY);
      }
    });

    ctx.lineTo(width - padding, height - padding);
    ctx.closePath();
    ctx.fill();

    // Draw temperature line with enhanced shadow and animation
    ctx.shadowColor = "rgba(59, 130, 246, 0.4)";
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 3;
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();

    temps.forEach((temp, i) => {
      const x = padding + (i * chartWidth) / (temps.length - 1);
      const targetY =
        padding +
        chartHeight -
        ((temp.temp - minTemp) / tempRange) * chartHeight;

      // Apply animation progress
      const animatedY =
        height - padding - (height - padding - targetY) * animationProgress;

      if (i === 0) {
        ctx.moveTo(x, animatedY);
      } else {
        ctx.lineTo(x, animatedY);
      }
    });
    ctx.stroke();

    // Reset shadow
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Draw points and labels with enhanced styling and animation
    ctx.font = "700 13px system-ui";
    ctx.textAlign = "center";

    temps.forEach((temp, i) => {
      const x = padding + (i * chartWidth) / (temps.length - 1);
      const targetY =
        padding +
        chartHeight -
        ((temp.temp - minTemp) / tempRange) * chartHeight;

      // Apply animation progress
      const animatedY =
        height - padding - (height - padding - targetY) * animationProgress;

      // Draw enhanced point with multiple gradients
      const outerRadius = 8;
      const innerRadius = 6;

      // Outer glow
      const glowGradient = ctx.createRadialGradient(
        x,
        animatedY,
        0,
        x,
        animatedY,
        outerRadius * 2
      );
      glowGradient.addColorStop(0, "rgba(59, 130, 246, 0.3)");
      glowGradient.addColorStop(1, "rgba(59, 130, 246, 0)");
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(x, animatedY, outerRadius * 2, 0, 2 * Math.PI);
      ctx.fill();

      // Main point
      const pointGradient = ctx.createRadialGradient(
        x,
        animatedY,
        0,
        x,
        animatedY,
        innerRadius
      );
      pointGradient.addColorStop(0, "#ffffff");
      pointGradient.addColorStop(0.4, "#60a5fa");
      pointGradient.addColorStop(1, "#1d4ed8");

      ctx.fillStyle = pointGradient;
      ctx.beginPath();
      ctx.arc(x, animatedY, innerRadius, 0, 2 * Math.PI);
      ctx.fill();

      // Add enhanced point border
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Inner highlight
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(x - 2, animatedY - 2, 2, 0, 2 * Math.PI);
      ctx.fill();

      // Draw temperature label with enhanced background
      const labelWidth = 36;
      const labelHeight = 22;
      const labelX = x - labelWidth / 2;
      const labelY = animatedY - 35;

      // Label background with gradient
      const labelGradient = ctx.createLinearGradient(
        labelX,
        labelY,
        labelX,
        labelY + labelHeight
      );
      labelGradient.addColorStop(0, "rgba(255, 255, 255, 0.95)");
      labelGradient.addColorStop(1, "rgba(59, 130, 246, 0.1)");
      ctx.fillStyle = labelGradient;
      ctx.fillRect(labelX, labelY, labelWidth, labelHeight);

      // Label border
      ctx.strokeStyle = "rgba(59, 130, 246, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(labelX, labelY, labelWidth, labelHeight);

      // Temperature text
      ctx.fillStyle = "#1f2937";
      ctx.font = "700 12px system-ui";
      ctx.fillText(`${Math.round(temp.temp)}°C`, x, animatedY - 20);

      // Draw day label with better styling
      ctx.fillStyle = "#4b5563";
      ctx.font = "600 11px system-ui";
      ctx.fillText(temp.date, x, height - 20);
    });

    // Draw y-axis labels with better styling
    ctx.fillStyle = "#6b7280";
    ctx.font = "500 11px system-ui";
    ctx.textAlign = "right";

    for (let i = 0; i <= 5; i++) {
      const y = padding + (i * chartHeight) / 5;
      const temp = maxTemp - (i * tempRange) / 5;
      ctx.fillText(`${Math.round(temp)}°C`, padding - 15, y + 4);
    }

    // Add chart title
    ctx.fillStyle = "#374151";
    ctx.font = "600 14px system-ui";
    ctx.textAlign = "left";
    ctx.fillText("Temperature", padding, 30);
  }, [temps, animationProgress]);

  if (loading) {
    return (
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 rounded-2xl p-8 shadow-2xl">
        <div className="absolute inset-0 bg-white/20"></div>
        <div className="relative z-10">
          <div className="animate-pulse">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-blue-300 rounded-full animate-spin"></div>
              <div className="h-6 bg-blue-300 rounded-lg w-48"></div>
            </div>
            <div className="h-64 bg-gradient-to-br from-blue-200 to-indigo-300 rounded-xl"></div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/20 rounded-full -translate-y-16 translate-x-16"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative overflow-hidden bg-gradient-to-br from-red-50 via-pink-50 to-rose-100 rounded-2xl p-6 shadow-2xl">
        <div className="absolute inset-0 bg-white/20"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-500/20 rounded-full">
              <Calendar className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-red-700">Chart Error</h3>
          </div>
          <div className="flex items-center justify-center text-red-600 h-48">
            <div className="text-center">
              <div className="text-4xl mb-4">⚠️</div>
              <p className="font-medium">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const avgTemp =
    temps.reduce((sum, temp) => sum + temp.temp, 0) / temps.length;
  const trend = temps[temps.length - 1]?.temp > temps[0]?.temp ? "up" : "down";
  const tempDiff = Math.abs(temps[temps.length - 1]?.temp - temps[0]?.temp);

  return (
    <div
      className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 rounded-2xl p-6 shadow-2xl transform hover:scale-[1.02] transition-all duration-500"
      style={{ paddingBottom: "2.5rem" }}
    >
      {/* Enhanced background decorative elements */}
      <div className="absolute inset-0 bg-white/20"></div>
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-200/30 to-indigo-300/20 rounded-full -translate-y-20 translate-x-20"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-indigo-200/30 to-purple-300/20 rounded-full translate-y-16 -translate-x-16"></div>
      <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-blue-100/20 rounded-full -translate-x-12 -translate-y-12"></div>

      {/* Content */}
      <div className="relative z-10">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-full backdrop-blur-sm">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                7-Day Temperature Trend
              </h3>
              <p className="text-sm text-gray-600">Weather Analytics</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2 bg-white/40 backdrop-blur-sm rounded-full px-3 py-2">
              <Thermometer className="w-4 h-4 text-orange-500" />
              <span className="text-gray-700 font-medium">
                Avg: {Math.round(avgTemp)}°C
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white/40 backdrop-blur-sm rounded-full px-3 py-2">
              <TrendingUp
                className={`w-4 h-4 ${
                  trend === "up" ? "text-green-500" : "text-red-500 rotate-180"
                }`}
              />
              <span className="text-gray-700 font-medium">
                {trend === "up" ? "+" : "-"}
                {Math.round(tempDiff)}°C
              </span>
            </div>
          </div>
        </div>

        {/* Enhanced Chart Container */}
        <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-white/30 shadow-lg">
          <canvas
            ref={canvasRef}
            width={600}
            height={280}
            className="w-full h-auto"
          />
        </div>

        {/* Enhanced bottom accent */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 opacity-70 rounded-b-2xl"></div>
      </div>
    </div>
  );
};

export default WeatherChart;

import { useState, useEffect } from "react";

export const useGeolocation = () => {
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser");
      // Fallback to default location (New York)
      setCoords({
        lat: 40.7128,
        lon: -74.006,
      });
      setLoading(false);
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 600000,
    };

    const onSuccess = (position) => {
      setCoords({
        lat: position.coords.latitude,
        lon: position.coords.longitude,
      });
      setLoading(false);
      setError(null);
    };

    const onError = (error) => {
      console.log("Geolocation error:", error);
      let errorMessage = "Failed to get location";

      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = "Location access denied by user";
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = "Location information unavailable";
          break;
        case error.TIMEOUT:
          errorMessage = "Location request timed out";
          break;
        default:
          errorMessage = "Unknown location error";
          break;
      }

      setError(errorMessage);

      // Fallback to default location
      setCoords({
        lat: 40.7128,
        lon: -74.006,
      });
      setLoading(false);
    };

    navigator.geolocation.getCurrentPosition(onSuccess, onError, options);
  }, []);

  const retry = () => {
    setLoading(true);
    setError(null);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
          setLoading(false);
        },
        (error) => {
          console.log("Retry geolocation error:", error);
          setError("Failed to get location after retry");
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    }
  };

  return { coords, loading, error, retry };
};

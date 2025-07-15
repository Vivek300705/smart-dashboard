import React from "react";
import { useGeolocation } from "./hooks/useGeolocation";
import LoadingSpinner from "./components/LoadingSpinner";
import LocationError from "./components/LocationError";
import DashboardLayout from "./components/DashboardLayout";

const App = () => {
  const { coords, loading, error, retry } = useGeolocation();

  if (loading) {
    return <LoadingSpinner message="Getting your location..." />;
  }

  if (error && !coords) {
    return <LocationError error={error} onRetry={retry} />;
  }

  return <DashboardLayout coords={coords} />;
};

export default App;

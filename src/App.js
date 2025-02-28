import React, { useState, useEffect } from 'react';
import { GoogleMap, Polyline, useLoadScript } from '@react-google-maps/api';
import { saveLocation, getLocations } from './db';

// Map settings
const mapContainerStyle = {
  width: '100%',
  height: '400px',
};
const center = {
  lat: 37.7749, // Default center (San Francisco)
  lng: -122.4194,
};
const options = {
  disableDefaultUI: true,
  zoomControl: true,
};

function App() {
  const [location, setLocation] = useState(null); // Current location
  const [tracking, setTracking] = useState(false); // Tracking state
  const [locationHistory, setLocationHistory] = useState([]); // Location history

  // Load location history when the component mounts
  useEffect(() => {
    async function loadHistory() {
      const history = await getLocations();
      setLocationHistory(history);
    }
    loadHistory();
  }, []);

  // Handle location tracking
  useEffect(() => {
    let watchId;

    if (tracking) {
      watchId = navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const newLocation = { latitude, longitude };
          setLocation(newLocation);
          await saveLocation(newLocation); // Save location to the database
          const updatedHistory = await getLocations(); // Refresh history
          setLocationHistory(updatedHistory);
        },
        (error) => {
          console.error('Error fetching location:', error);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [tracking]);

  // Load the Google Maps script
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: 'AIzaSyAO9Cyj6sQ40f-PYM7jDmJpYiPNzfU0_PE', // Replace with your API key
  });

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Maps...</div>;

  // Convert location history to a path for the Polyline
  const path = locationHistory.map((loc) => ({
    lat: loc.latitude,
    lng: loc.longitude,
  }));

  return (
    <div>
      <h1>Location Tracker</h1>
      <button onClick={() => setTracking(!tracking)}>
        {tracking ? 'Stop Tracking' : 'Start Tracking'}
      </button>
      {location && (
        <p>
          Current Location: {location.latitude}, {location.longitude}
        </p>
      )}
      <h2>Location History</h2>
      <ul>
        {locationHistory.map((loc, index) => (
          <li key={index}>
            {loc.latitude}, {loc.longitude} - {new Date(loc.timestamp).toLocaleTimeString()}
          </li>
        ))}
      </ul>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={14}
        center={path.length > 0 ? path[path.length - 1] : center} // Center on the latest location
        options={options}
      >
        <Polyline
          path={path}
          options={{
            strokeColor: '#FF0000',
            strokeOpacity: 1.0,
            strokeWeight: 2,
          }}
        />
      </GoogleMap>
    </div>
  );
}

export default App;

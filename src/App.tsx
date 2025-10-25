import { useState } from 'react';
import './App.css';
import { GoogleMap } from './components/GoogleMapSimple';

function App() {
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>({
    lat: -29.9577,  // Charqueadas, RS, Brazil - R. Gen. Balbão, 81 - Centro
    lng: -51.6253
  });

  const handleLocationChange = (lat: number, lng: number) => {
    setCurrentLocation({ lat, lng });
    console.log(`Location changed to: ${lat}, ${lng}`);
  };

  return (
    <div className="app-container">
      {/* Full-screen map */}
      <GoogleMap
        currentLocation={currentLocation}
        onLocationChange={handleLocationChange}
      />
    </div>
  );
}

export default App;

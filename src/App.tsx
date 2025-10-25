import { useState, useEffect, useCallback } from 'react';
import './styles/index.css';
import { GoogleMap } from './components/GoogleMapSimple';
import { LoadingSpinner, ErrorIndicator, BottomSheet } from './components/ui';
import { useWaterways } from './hooks/useWaterways';
import type { WaterwayData, Location } from './types';
import { DEFAULT_LOCATION } from './constants';

function App() {
  const { waterways, loading, error, fetchWaterways } = useWaterways();
  const [currentLocation, setCurrentLocation] = useState<Location | null>(DEFAULT_LOCATION);
  const [isRiversPanelOpen, setIsRiversPanelOpen] = useState(false);

  const handleLocationChange = useCallback(async (lat: number, lng: number) => {
    const newLocation = { lat, lng };
    setCurrentLocation(newLocation);
    await fetchWaterways(newLocation);
  }, [fetchWaterways]);

  // Load initial waterways when component mounts
  useEffect(() => {
    fetchWaterways(DEFAULT_LOCATION);
  }, [fetchWaterways]);

  const handleWaterwayClick = useCallback((waterway: WaterwayData) => {
    if (waterway.coordinates.length > 0) {
      const firstPoint = waterway.coordinates[0];
      setCurrentLocation({ lat: firstPoint.lat, lng: firstPoint.lng });
      setIsRiversPanelOpen(false);
    }
  }, []);

  const toggleRiversPanel = useCallback(() => {
    setIsRiversPanelOpen(!isRiversPanelOpen);
  }, [isRiversPanelOpen]);

  return (
    <div className="app-container">
      {/* Full-screen map */}
      <GoogleMap
        currentLocation={currentLocation}
        onLocationChange={handleLocationChange}
        waterways={waterways}
      />

      {/* Loading indicator */}
      {loading && <LoadingSpinner message="Finding waterways..." />}
      
      {/* Error indicator */}
      {error && <ErrorIndicator message={error} />}

      {/* Instructions overlay - Mobile first */}
      {!loading && !error && waterways.length === 0 && (
        <div className="instructions-overlay">
          <div className="instructions-card">
            <div className="instructions-icon">🌊</div>
            <h3>Discover Waterways</h3>
            <p>Tap anywhere on the map to find nearby rivers and streams</p>
            <div className="location-info">📍 Charqueadas, RS, Brazil</div>
          </div>
        </div>
      )}

      {/* Google Maps style bottom sheet */}
      <BottomSheet
        waterways={waterways}
        isOpen={isRiversPanelOpen}
        onToggle={toggleRiversPanel}
        onWaterwayClick={handleWaterwayClick}
      />
    </div>
  );
}

export default App;

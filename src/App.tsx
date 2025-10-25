import { useState, useEffect, useCallback } from 'react';
import './App.css';
import { GoogleMap } from './components/GoogleMapSimple';
import { overpassApi, type WaterwayData, type OverpassQueryParams, OverpassApiError } from './services/overpassApi';

function App() {
  const [waterways, setWaterways] = useState<WaterwayData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>({
    lat: -29.9577,  // Charqueadas, RS, Brazil - R. Gen. Balbão, 81 - Centro
    lng: -51.6253
  });
  const [isRiversPanelOpen, setIsRiversPanelOpen] = useState(false);

  console.log('App render - waterways:', waterways.length, 'loading:', loading, 'error:', error, 'panelOpen:', isRiversPanelOpen);

  const handleLocationChange = useCallback(async (lat: number, lng: number) => {
    setCurrentLocation({ lat, lng });
    setLoading(true);
    setError(null);

    try {
      console.log('=== OVERPASS API WATERWAY REQUEST ===');
      console.log(`Location: ${lat}, ${lng}`);
      
      const params: OverpassQueryParams = {
        lat,
        lng,
        radius: 10000, // 10km radius
        waterTypes: ['river', 'stream', 'canal']
      };

      const nearbyWaterways = await overpassApi.getWaterways(params);
      
      console.log(`Total waterways found: ${nearbyWaterways.length}`);
      console.log('---');
      
      nearbyWaterways.slice(0, 10).forEach((waterway, index) => {
        console.log(`${index + 1}. ${waterway.name}`);
        console.log(`   Type: ${waterway.type}`);
        console.log(`   OSM ID: ${waterway.id}`);
        console.log(`   Coordinates: ${waterway.coordinates.length} points`);
        console.log('   ---');
      });
      
      console.log('=== END OVERPASS RESPONSE ===\n');
      
      setWaterways(nearbyWaterways);
      // Don't auto-open the rivers panel - let user control it
      // if (nearbyWaterways.length > 0) {
      //   setIsRiversPanelOpen(true);
      // }
    } catch (err) {
      if (err instanceof OverpassApiError) {
        setError(`Overpass API Error: ${err.message}`);
      } else {
        setError('An unexpected error occurred while fetching waterway data');
      }
      setWaterways([]);
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array since we don't depend on any changing values

  // Load initial waterways when component mounts
  useEffect(() => {
    if (currentLocation) {
      handleLocationChange(currentLocation.lat, currentLocation.lng);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount, not when currentLocation changes

  const handleRiverClick = (waterway: WaterwayData) => {
    if (waterway.coordinates.length > 0) {
      // Use the first coordinate of the river as the navigation point
      const firstPoint = waterway.coordinates[0];
      console.log(`Navigating to ${waterway.name} at:`, firstPoint);
      setCurrentLocation({ lat: firstPoint.lat, lng: firstPoint.lng });
      
      // Close the bottom sheet when a river is selected
      setIsRiversPanelOpen(false);
    }
  };

  const toggleRiversPanel = () => {
    setIsRiversPanelOpen(!isRiversPanelOpen);
  };

  return (
    <div className="app-container">
      {/* Full-screen map */}
      <GoogleMap
        currentLocation={currentLocation}
        onLocationChange={handleLocationChange}
        waterways={waterways}
      />

      {/* Loading indicator */}
      {loading && (
        <div className="loading-indicator">
          <div className="loading-spinner"></div>
          <span>Finding waterways...</span>
        </div>
      )}
      
      {/* Error indicator */}
      {error && (
        <div className="error-indicator">
          <span>⚠️ {error}</span>
        </div>
      )}

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
      {waterways.length > 0 && (
        <div className={`bottom-sheet ${isRiversPanelOpen ? 'expanded' : 'collapsed'}`}>
          {/* Handle bar for dragging */}
          <div className="bottom-sheet-handle" onClick={toggleRiversPanel}>
            <div className="handle-bar"></div>
          </div>
          
          {/* Bottom sheet header */}
          <div className="bottom-sheet-header" onClick={toggleRiversPanel}>
            <div className="header-content">
              <div className="header-icon">🌊</div>
              <div className="header-text">
                <h3>Waterways nearby</h3>
                <p>{waterways.length} {waterways.length === 1 ? 'result' : 'results'}</p>
              </div>
            </div>
            <div className="expand-icon">
              {isRiversPanelOpen ? '⌄' : '⌃'}
            </div>
          </div>

          {/* Rivers list - Only visible when expanded */}
          {isRiversPanelOpen && (
            <div className="bottom-sheet-content">
              <div className="rivers-list">
                {waterways.map((waterway) => (
                  <div
                    key={waterway.id}
                    className="river-item"
                    onClick={() => handleRiverClick(waterway)}
                  >
                    <div className="river-info">
                      <div className="river-icon">
                        {waterway.type === 'river' ? '🏞️' : waterway.type === 'stream' ? '🏊' : '🚣'}
                      </div>
                      <div className="river-details">
                        <h4 className="river-name">{waterway.name}</h4>
                        <p className="river-meta">
                          {waterway.type.charAt(0).toUpperCase() + waterway.type.slice(1)} • {waterway.coordinates.length} points
                        </p>
                      </div>
                    </div>
                    <div className="river-action">
                      <div className="navigate-icon">→</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;

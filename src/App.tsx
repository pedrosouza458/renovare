import { useState, useEffect, useCallback } from 'react';
import './styles/index.css';
import GoogleMapSimple from './components/GoogleMapSimple';
import { LoadingSpinner, ErrorIndicator, BottomSheet } from './components/ui';
import { AddPinpointButton } from './components/ui/AddPinpointButton';
import { CreatePinpointForm } from './components/ui/CreatePinpointForm';
import { useWaterways } from './hooks/useWaterways';
import { usePinpoints } from './hooks/usePinpoints';
import type { WaterwayData, Location } from './types';
import type { Pinpoint, PostType } from './types/pinpoint';
import { DEFAULT_LOCATION } from './constants';

function App() {
  const { waterways, loading, error, fetchWaterways } = useWaterways();
  const { pinpoints, createPinpointWithPost, addPostToPinpoint, deletePinpoint } = usePinpoints();
  const [currentLocation, setCurrentLocation] = useState<Location | null>(DEFAULT_LOCATION);
  const [isPinpointsPanelOpen, setIsPinpointsPanelOpen] = useState(false);
  const [selectedPinpoint, setSelectedPinpoint] = useState<Pinpoint | null>(null);
  const [isAddingPinpoint, setIsAddingPinpoint] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createFormLocation, setCreateFormLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Load initial waterways when component mounts
  useEffect(() => {
    fetchWaterways(DEFAULT_LOCATION);
  }, [fetchWaterways]);

  const handleWaterwayClick = useCallback((waterway: WaterwayData) => {
    if (waterway.coordinates.length > 0) {
      const firstPoint = waterway.coordinates[0];
      setCurrentLocation({ lat: firstPoint.lat, lng: firstPoint.lng });
    }
  }, []);

  const handlePinpointClick = useCallback((pinpoint: Pinpoint) => {
    setSelectedPinpoint(pinpoint);
    setIsPinpointsPanelOpen(true);
  }, []);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    if (isAddingPinpoint) {
      setCreateFormLocation({ lat, lng });
      setShowCreateForm(true);
      setIsAddingPinpoint(false);
    }
  }, [isAddingPinpoint]);

  const handleCreatePinpoint = useCallback((postData: { type: PostType; title: string; description: string }) => {
    if (createFormLocation) {
      try {
        const newPinpoint = createPinpointWithPost(
          createFormLocation.lat, 
          createFormLocation.lng, 
          postData
        );
        setSelectedPinpoint(newPinpoint);
        setIsPinpointsPanelOpen(true);
        setShowCreateForm(false);
        setCreateFormLocation(null);
      } catch (error) {
        // Handle business rule errors
        alert(error instanceof Error ? error.message : 'Failed to create pinpoint. Please try again.');
      }
    }
  }, [createFormLocation, createPinpointWithPost]);

  const handleCancelCreate = useCallback(() => {
    setShowCreateForm(false);
    setCreateFormLocation(null);
    setIsAddingPinpoint(false);
  }, []);

  const togglePinpointsPanel = useCallback(() => {
    setIsPinpointsPanelOpen(!isPinpointsPanelOpen);
    if (!isPinpointsPanelOpen) {
      setSelectedPinpoint(null);
    }
  }, [isPinpointsPanelOpen]);

  return (
    <div className="app-container">
      {/* Full-screen map */}
      <GoogleMapSimple
        center={currentLocation || DEFAULT_LOCATION}
        waterways={waterways}
        pinpoints={pinpoints}
        isLoading={loading}
        error={error}
        onWaterwayClick={handleWaterwayClick}
        onPinpointClick={handlePinpointClick}
        onMapClick={handleMapClick}
        isAddingPinpoint={isAddingPinpoint}
      />

      {/* Loading indicator */}
      {loading && <LoadingSpinner message="Finding waterways..." />}
      
      {/* Error indicator */}
      {error && <ErrorIndicator message={error} />}

      {/* Add Pinpoint Button */}
      <AddPinpointButton 
        isAddingMode={isAddingPinpoint}
        onToggleAddMode={() => setIsAddingPinpoint(!isAddingPinpoint)}
      />

      {/* Create Pinpoint Form */}
      {showCreateForm && createFormLocation && (
        <CreatePinpointForm
          latitude={createFormLocation.lat}
          longitude={createFormLocation.lng}
          onSubmit={handleCreatePinpoint}
          onCancel={handleCancelCreate}
        />
      )}

      {/* Instructions overlay - Mobile first */}
      {!loading && !error && waterways.length === 0 && pinpoints.length === 0 && (
        <div className="instructions-overlay">
          <div className="instructions-card">
            <div className="instructions-icon">🌊</div>
            <h3>Discover Waterways & Add Pinpoints</h3>
            <p>Tap anywhere on the map to find nearby rivers and streams</p>
            <p>Use the + button to add pinpoints with posts</p>
            <div className="location-info">📍 Charqueadas, RS, Brazil</div>
          </div>
        </div>
      )}

      {/* Google Maps style bottom sheet for pinpoints */}
      <BottomSheet
        pinpoints={pinpoints}
        selectedPinpoint={selectedPinpoint}
        isOpen={isPinpointsPanelOpen}
        onToggle={togglePinpointsPanel}
        onPinpointClick={handlePinpointClick}
        onClosePinpointDetails={() => setSelectedPinpoint(null)}
        onAddPost={addPostToPinpoint}
        onDeletePinpoint={deletePinpoint}
      />
    </div>
  );
}

export default App;

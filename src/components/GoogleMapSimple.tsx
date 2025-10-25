import { useEffect, useRef, useState } from 'react';
import type { 
  WaterwayData, 
  Location, 
  GoogleMapInstance, 
  GoogleMarkerInstance, 
  GooglePolylineInstance,
  GoogleMapMouseEvent 
} from '../types';
import { GOOGLE_MAPS_CONFIG, DEFAULT_LOCATION, DEFAULT_ZOOM } from '../constants';

interface GoogleMapProps {
  currentLocation: Location | null;
  onLocationChange: (lat: number, lng: number) => void;
  waterways?: WaterwayData[];
}

export const GoogleMap: React.FC<GoogleMapProps> = ({ 
  currentLocation, 
  onLocationChange,
  waterways = []
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<GoogleMapInstance | null>(null);
  const markersRef = useRef<GoogleMarkerInstance[]>([]);
  const polylinesRef = useRef<GooglePolylineInstance[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  const API_KEY = GOOGLE_MAPS_CONFIG.API_KEY;

  useEffect(() => {
    let isMounted = true;
    
    const initMap = () => {
      if (!window.google?.maps || !mapRef.current || !isMounted) {
        return;
      }

      // Ensure the map container element is properly attached to DOM
      if (!mapRef.current.isConnected) {
        setTimeout(() => {
          if (isMounted) initMap();
        }, 100);
        return;
      }

      try {
        const map = new window.google.maps.Map(mapRef.current, {
          center: DEFAULT_LOCATION,
          zoom: DEFAULT_ZOOM,
          styles: [
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{ color: '#71c5e8' }]
            },
            {
              featureType: 'water',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#515c6d' }]
            },
            {
              featureType: 'landscape',
              elementType: 'geometry',
              stylers: [{ color: '#f5f5f2' }]
            }
          ],
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControlOptions: {
            position: window.google.maps.ControlPosition.RIGHT_BOTTOM
          }
        });

        if (!isMounted) return;

        mapInstanceRef.current = map;

        map.addListener('click', (event: GoogleMapMouseEvent) => {
          if (event.latLng) {
            const lat = event.latLng.lat();
            const lng = event.latLng.lng();
            onLocationChange(lat, lng);
          }
        });

        if (isMounted) {
          setIsLoaded(true);
          setLoadingError(null);
        }
      } catch (error) {
        if (isMounted) {
          setLoadingError(`Failed to initialize Google Maps: ${error instanceof Error ? error.message : 'Unknown error'}`);
          setIsLoaded(false);
        }
      }
    };

    // Check if Google Maps is already available
    if (window.google?.maps) {
      // Add a small delay to ensure DOM is ready
      setTimeout(() => {
        if (isMounted) {
          initMap();
        }
      }, 50);
      return () => {
        isMounted = false;
      };
    }

    // Load Google Maps script
    if (API_KEY) {
      // Check if script already exists
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        // Wait for existing script to load
        const checkLoaded = () => {
          if (window.google?.maps) {
            initMap();
          } else if (isMounted) {
            setTimeout(checkLoaded, 100);
          }
        };
        checkLoaded();
      } else {
        // Remove any existing scripts to avoid conflicts
        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
        if (existingScript) {
          existingScript.remove();
        }

        // Create new script
        const script = document.createElement('script');
        script.src = `${GOOGLE_MAPS_CONFIG.SCRIPT_URL}?key=${API_KEY}`;
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
          if (isMounted) {
            initMap();
          }
        };
        
        script.onerror = () => {
          if (isMounted) {
            setLoadingError('Failed to load Google Maps API. This might be due to API key restrictions. Please check the console for more details.');
            setIsLoaded(false);
          }
        };
        
        // Listen for Google Maps API errors
        window.addEventListener('error', (event) => {
          if (event.message && event.message.includes('RefererNotAllowedMapError')) {
            if (isMounted) {
              const currentUrl = window.location.origin;
              setLoadingError(`Google Maps API key is restricted. Please add "${currentUrl}" to your API key's allowed referrers in the Google Cloud Console.`);
            }
          }
        });
        
        document.head.appendChild(script);
      }
    } else if (isMounted) {
      setLoadingError('Google Maps API key is missing');
    }

    return () => {
      isMounted = false;
      // Clear map instance to prevent memory leaks
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null;
      }
    };
  }, [API_KEY, onLocationChange]); // Now both dependencies are stable

  // Update map center when currentLocation changes
  useEffect(() => {
    if (mapInstanceRef.current && currentLocation) {
      mapInstanceRef.current.setCenter(currentLocation);
    }
  }, [currentLocation]);

  // Function to get waterway line color based on type
  const getWaterwayColor = (type: string): string => {
    switch (type) {
      case 'river': return '#FF0000'; // Red for rivers
      case 'stream': return '#00FF00'; // Green for streams  
      case 'canal': return '#0000FF'; // Blue for canals
      default: return '#0000FF'; // Default blue
    }
  };

  // Update markers when location or waterways change
  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded || !window.google?.maps) {
      return;
    }

    // Clear existing markers and polylines safely
    markersRef.current.forEach(marker => {
      try {
        marker.setMap(null);
      } catch {
        // Ignore errors when removing markers
      }
    });
    markersRef.current = [];

    polylinesRef.current.forEach(polyline => {
      try {
        polyline.setMap(null);
      } catch {
        // Ignore errors when removing polylines
      }
    });
    polylinesRef.current = [];

    // Add current location marker (red pin)
    if (currentLocation && window.google?.maps && mapInstanceRef.current) {
      const currentLocationMarker = new window.google.maps.Marker({
        position: currentLocation,
        map: mapInstanceRef.current,
        title: 'Current Location',
        zIndex: 1000 // Higher z-index to appear on top
      });

      markersRef.current.push(currentLocationMarker);
    }

    // Add waterway polylines (lines showing the flow of rivers/streams)
    if (waterways && waterways.length > 0 && window.google?.maps && mapInstanceRef.current) {
      waterways.forEach(waterway => {
        if (waterway.coordinates && waterway.coordinates.length > 1 && window.google?.maps && mapInstanceRef.current) {
          // Create a polyline to show the waterway path
          const waterwayPath = waterway.coordinates.map(coord => ({
            lat: coord.lat,
            lng: coord.lng
          }));

          const waterwayPolyline = new window.google.maps.Polyline({
            path: waterwayPath,
            geodesic: true,
            strokeColor: getWaterwayColor(waterway.type),
            strokeOpacity: 0.8,
            strokeWeight: waterway.type === 'river' ? 3 : 2, // Rivers are thicker
            map: mapInstanceRef.current,
            clickable: true
          });

          // Add click event to show waterway info
          waterwayPolyline.addListener('click', () => {
            // You can add an info window here if needed
            console.log(`Clicked on ${waterway.name} (${waterway.type})`);
          });

          polylinesRef.current.push(waterwayPolyline);
        }
      });
    }

    // Cleanup function for markers and polylines
    return () => {
      markersRef.current.forEach(marker => {
        try {
          marker.setMap(null);
        } catch {
          // Ignore cleanup errors
        }
      });
      polylinesRef.current.forEach(polyline => {
        try {
          polyline.setMap(null);
        } catch {
          // Ignore cleanup errors
        }
      });
    };
  }, [currentLocation, isLoaded, waterways]);

  // Remove the separate useEffect for map center since it's now handled above

  return (
    <div style={{
      width: '100%',
      height: '100%',
      position: 'relative'
    }}>
      <div 
        ref={mapRef} 
        id="google-map-container"
        className="google-map"
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          minHeight: '400px' // Ensure minimum height
        }}
      />
      {(!isLoaded || loadingError) && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '24px',
          borderRadius: '12px',
          fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
          zIndex: 1000,
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          maxWidth: '300px'
        }}>
          {loadingError ? (
            <div>
              <div style={{ fontSize: '32px', marginBottom: '16px' }}>⚠️</div>
              <h3 style={{ margin: '0 0 12px 0', color: '#ea4335', fontSize: '16px' }}>
                {loadingError}
              </h3>
              {loadingError.includes('restricted') && (
                <div>
                  <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#5f6368' }}>
                    To fix this error:
                  </p>
                  <ol style={{ 
                    textAlign: 'left', 
                    fontSize: '12px', 
                    color: '#5f6368',
                    paddingLeft: '16px',
                    margin: '8px 0'
                  }}>
                    <li>Go to <strong>console.cloud.google.com</strong></li>
                    <li>Select your project</li>
                    <li>Go to "APIs & Services" → "Credentials"</li>
                    <li>Click on your API key</li>
                    <li>Under "Website restrictions", add:</li>
                  </ol>
                  <code style={{ 
                    background: '#f1f3f4', 
                    padding: '8px 12px', 
                    borderRadius: '6px',
                    fontSize: '12px',
                    display: 'block',
                    margin: '8px 0'
                  }}>
                    {window.location.origin}/*
                  </code>
                  <p style={{ margin: '8px 0 0 0', fontSize: '11px', color: '#5f6368' }}>
                    Note: Add both localhost:5173 and localhost:5174 for development
                  </p>
                </div>
              )}
              {API_KEY === '' && (
                <div>
                  <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#5f6368' }}>
                    Add your Google Maps API key to the <code>.env</code> file:
                  </p>
                  <code style={{ 
                    background: '#f1f3f4', 
                    padding: '8px 12px', 
                    borderRadius: '6px',
                    fontSize: '12px',
                    display: 'block',
                    margin: '8px 0'
                  }}>
                    VITE_GOOGLE_MAPS_API_KEY=your_key_here
                  </code>
                  <p style={{ margin: '12px 0 0 0', fontSize: '12px', color: '#5f6368' }}>
                    Get a free key at: <br/>
                    <strong>console.cloud.google.com</strong>
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div style={{
                width: '24px',
                height: '24px',
                border: '2px solid #e8eaed',
                borderTop: '2px solid #4285f4',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px auto'
              }}></div>
              <p style={{ margin: 0, color: '#5f6368' }}>Loading Google Maps...</p>
            </div>
          )}
        </div>
      )}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};
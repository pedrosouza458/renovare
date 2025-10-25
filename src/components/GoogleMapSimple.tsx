import { useEffect, useRef, useState } from 'react';

interface GoogleMapProps {
  currentLocation: { lat: number; lng: number } | null;
  onLocationChange: (lat: number, lng: number) => void;
}

// Minimal Google Maps types
interface GoogleMapsAPI {
  maps: {
    Map: new (element: HTMLElement, options: unknown) => GoogleMap;
    Marker: new (options: unknown) => GoogleMarker;
    InfoWindow: new (options: unknown) => GoogleInfoWindow;
    Size: new (width: number, height: number) => unknown;
    Point: new (x: number, y: number) => unknown;
    SymbolPath: { CIRCLE: number };
    ControlPosition: { RIGHT_BOTTOM: number };
  };
}

interface GoogleMap {
  addListener: (event: string, callback: (e: GoogleMapMouseEvent) => void) => void;
  setCenter: (location: { lat: number; lng: number }) => void;
}

interface GoogleMarker {
  setMap: (map: GoogleMap | null) => void;
  addListener: (event: string, callback: () => void) => void;
}

interface GoogleInfoWindow {
  open: (map: GoogleMap, marker: GoogleMarker) => void;
}

interface GoogleMapMouseEvent {
  latLng: {
    lat: () => number;
    lng: () => number;
  };
}

declare global {
  interface Window {
    google?: GoogleMapsAPI;
    initMap?: () => void;
    googleMapsLoaded?: boolean;
  }
}

export const GoogleMap: React.FC<GoogleMapProps> = ({ 
  // waterbodies, 
  currentLocation, 
  onLocationChange 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<GoogleMap | null>(null);
  const markersRef = useRef<GoogleMarker[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  useEffect(() => {
    let isMounted = true;
    
    const initMap = () => {
      if (!window.google?.maps || !mapRef.current || !isMounted) {
        console.warn('Google Maps initialization skipped: missing requirements');
        return;
      }

      // Ensure the map container element is properly attached to DOM
      if (!mapRef.current.isConnected) {
        console.warn('Map container not connected to DOM, retrying...');
        setTimeout(() => {
          if (isMounted) initMap();
        }, 100);
        return;
      }

      try {
        console.log('Initializing Google Maps...');
        const map = new window.google.maps.Map(mapRef.current, {
          center: currentLocation || { lat: -29.9577, lng: -51.6253 }, // Charqueadas, RS, Brazil
          zoom: 12,
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
          if (event.latLng && isMounted) {
            const lat = event.latLng.lat();
            const lng = event.latLng.lng();
            console.log('Map clicked at:', { lat, lng });
            onLocationChange(lat, lng);
          }
        });

        if (isMounted) {
          console.log('Google Maps initialized successfully');
          setIsLoaded(true);
          setLoadingError(null);
        }
      } catch (error) {
        console.error('Error initializing Google Maps:', error);
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
          console.log('GoogleMapSimple: Existing Maps script found, removing');
          existingScript.remove();
        }

        // Create new script
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}`;
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
          if (isMounted) {
            initMap();
          }
        };
        
        script.onerror = (event) => {
          if (isMounted) {
            console.error('Google Maps API failed to load:', event);
            setLoadingError('Failed to load Google Maps API. This might be due to API key restrictions. Please check the console for more details.');
            setIsLoaded(false);
          }
        };
        
        // Listen for Google Maps API errors
        window.addEventListener('error', (event) => {
          if (event.message && event.message.includes('RefererNotAllowedMapError')) {
            console.error('Google Maps RefererNotAllowedMapError detected');
            if (isMounted) {
              setLoadingError(`Google Maps API key is restricted. Please add "http://localhost:5175" to your API key's allowed referrers in the Google Cloud Console.`);
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
  }, [API_KEY, currentLocation, onLocationChange]);

  // Update map center and callbacks when location changes
  useEffect(() => {
    if (mapInstanceRef.current && currentLocation) {
      mapInstanceRef.current.setCenter(currentLocation);
    }
  }, [currentLocation]);

  // Update markers when location changes
  useEffect(() => {
    console.log('Markers useEffect triggered:', { currentLocation, isLoaded, hasGoogle: !!window.google?.maps, hasMap: !!mapInstanceRef.current });
    
    if (!mapInstanceRef.current || !isLoaded || !window.google?.maps) {
      console.log('Skipping marker update - missing requirements');
      return;
    }

    // Clear existing markers safely
    markersRef.current.forEach(marker => {
      try {
        marker.setMap(null);
      } catch (error) {
        // Ignore errors when removing markers
        console.warn('Error removing marker:', error);
      }
    });
    markersRef.current = [];

    // Add current location marker
    if (currentLocation && window.google?.maps && mapInstanceRef.current) {
      console.log('Creating marker at:', currentLocation);
      const currentLocationMarker = new window.google.maps.Marker({
        position: currentLocation,
        map: mapInstanceRef.current,
        title: 'Current Location'
        // Using default red marker for better visibility
      });

      markersRef.current.push(currentLocationMarker);
      console.log('Marker created and added to map');
    } else {
      console.log('No current location to mark');
    }

    // Cleanup function for markers
    return () => {
      markersRef.current.forEach(marker => {
        try {
          marker.setMap(null);
        } catch (error) {
          // Ignore cleanup errors
          console.warn('Error during marker cleanup:', error);
        }
      });
    };
  }, [currentLocation, isLoaded]); // Removed waterbodies dependency temporarily

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
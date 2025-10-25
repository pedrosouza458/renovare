import { useEffect, useRef, useState } from 'react';

interface WaterwayData {
  id: string;
  name: string;
  type: string;
  coordinates: Array<{ lat: number; lng: number }>;
}

interface GoogleMapProps {
  currentLocation: { lat: number; lng: number } | null;
  onLocationChange: (lat: number, lng: number) => void;
  waterways?: WaterwayData[];
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
  addListener: (event: string, callback: (e: GoogleMapMouseEvent) => void) => unknown;
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
  currentLocation, 
  onLocationChange,
  waterways = []
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
          center: { lat: -29.9577, lng: -51.6253 }, // Default: Charqueadas, RS, Brazil
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
          if (event.latLng) {
            const lat = event.latLng.lat();
            const lng = event.latLng.lng();
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
  }, [API_KEY, onLocationChange]); // Now both dependencies are stable

  // Update map center when currentLocation changes
  useEffect(() => {
    if (mapInstanceRef.current && currentLocation) {
      mapInstanceRef.current.setCenter(currentLocation);
    }
  }, [currentLocation]);

  // Function to create custom waterway marker icons
  const createWaterwayIcon = (type: string) => {
    const color = type === 'river' ? '#1a73e8' : type === 'stream' ? '#34a853' : '#ea4335';
    const emoji = type === 'river' ? '🏞' : type === 'stream' ? '💧' : '🌊';
    
    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
        <svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.3)"/>
            </filter>
          </defs>
          <path d="M16 2C8.27 2 2 8.27 2 16c0 7.5 14 22 14 22s14-14.5 14-22C30 8.27 23.73 2 16 2z" 
                fill="${color}" filter="url(#shadow)"/>
          <circle cx="16" cy="16" r="10" fill="white"/>
          <text x="16" y="22" text-anchor="middle" font-size="14" fill="${color}">${emoji}</text>
        </svg>
      `)}`,
      scaledSize: new window.google!.maps.Size(26, 32),
      anchor: new window.google!.maps.Point(13, 32)
    };
  };

  // Update markers when location or waterways change
  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded || !window.google?.maps) {
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

    // Add waterway markers
    if (waterways && waterways.length > 0 && window.google?.maps && mapInstanceRef.current) {
      waterways.forEach(waterway => {
        if (waterway.coordinates && waterway.coordinates.length > 0 && window.google?.maps && mapInstanceRef.current) {
          // Use the first coordinate as the marker position
          const position = waterway.coordinates[0];
          
          const waterwayMarker = new window.google.maps.Marker({
            position: position,
            map: mapInstanceRef.current!,
            title: waterway.name,
            icon: createWaterwayIcon(waterway.type),
            zIndex: 100 // Lower than current location
          });

          markersRef.current.push(waterwayMarker);
        }
      });
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
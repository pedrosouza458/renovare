import { useEffect, useRef } from 'react';
import type { WaterwayData } from '../types/waterway';
import type { Pinpoint } from '../types/pinpoint';
import { GOOGLE_MAPS_CONFIG } from '../constants/api';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { ErrorIndicator } from './ui/ErrorIndicator';

interface GoogleMapSimpleProps {
  center: { lat: number; lng: number };
  waterways: WaterwayData[];
  pinpoints: Pinpoint[];
  isLoading: boolean;
  error: string | null;
  onWaterwayClick: (waterway: WaterwayData) => void;
  onPinpointClick: (pinpoint: Pinpoint) => void;
  onMapClick: (lat: number, lng: number) => void;
  isAddingPinpoint: boolean;
}

const containerStyle = {
  width: '100%',
  height: '100vh',
};

declare global {
  interface Window {
    googleMapInstance?: unknown;
    initMap?: () => void;
    google?: unknown;
  }
}

const GoogleMapSimple: React.FC<GoogleMapSimpleProps> = ({
  center,
  waterways,
  pinpoints,
  isLoading,
  error,
  onWaterwayClick,
  onPinpointClick,
  onMapClick,
  isAddingPinpoint,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Define the global initMap function
    window.initMap = () => {
      if (!mapRef.current) {
        console.error('Map container not found');
        return;
      }
      
      if (!window.google || !(window.google as { maps?: unknown }).maps) {
        console.error('Google Maps API not loaded');
        return;
      }

      try {
        const googleMaps = window.google as { maps: { 
          Map: new (element: HTMLElement, options: unknown) => unknown;
          Polyline: new (options: unknown) => { addListener: (event: string, callback: () => void) => void };
          Marker: new (options: unknown) => { addListener: (event: string, callback: () => void) => void };
          SymbolPath: { CIRCLE: unknown };
        }};

        const map = new googleMaps.maps.Map(mapRef.current, {
          zoom: 12,
          center: { lat: center.lat, lng: center.lng },
          mapTypeId: 'terrain',
          styles: [
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{ color: '#a2daf2' }]
            }
          ]
        });

      // Add waterway polylines
      waterways.forEach(waterway => {
        const path = waterway.coordinates.map(coord => ({ lat: coord.lat, lng: coord.lng }));
        const color = waterway.type === 'river' ? '#ff0000' : 
                    waterway.type === 'stream' ? '#00ff00' : '#0000ff';
        
        const polyline = new googleMaps.maps.Polyline({
          path: path,
          geodesic: true,
          strokeColor: color,
          strokeOpacity: 0.8,
          strokeWeight: 3,
          map: map
        });

        polyline.addListener('click', () => {
          onWaterwayClick(waterway);
        });
      });

      // Add pinpoint markers
      pinpoints.forEach(pinpoint => {
        const hasAlert = pinpoint.posts?.some(post => post.type === 'alert' || post.type === 'both');
        const hasCleaning = pinpoint.posts?.some(post => post.type === 'cleaning' || post.type === 'both');
        
        let color = '#808080';
        if (hasAlert && hasCleaning) color = '#800080';
        else if (hasAlert) color = '#ff0000';
        else if (hasCleaning) color = '#00ff00';

        const marker = new googleMaps.maps.Marker({
          position: { lat: pinpoint.latitude, lng: pinpoint.longitude },
          map: map,
          icon: {
            path: googleMaps.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: color,
            fillOpacity: 0.8,
            strokeWeight: 2,
            strokeColor: '#ffffff'
          },
          title: `Pinpoint: ${pinpoint.posts?.length || 0} posts`
        });

        marker.addListener('click', () => {
          onPinpointClick(pinpoint);
        });
      });

      // Add map click listener for adding pinpoints
      (map as { addListener: (event: string, callback: (event: { latLng: { lat: () => number; lng: () => number } }) => void) => void })
        .addListener('click', (event: { latLng: { lat: () => number; lng: () => number } }) => {
        if (isAddingPinpoint && event.latLng) {
          const lat = event.latLng.lat();
          const lng = event.latLng.lng();
          onMapClick(lat, lng);
        }
      });

      window.googleMapInstance = map;
      } catch (error) {
        console.error('Error initializing Google Maps:', error);
      }
    };

    // Load Google Maps script if not already loaded
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `${GOOGLE_MAPS_CONFIG.SCRIPT_URL}?key=${GOOGLE_MAPS_CONFIG.API_KEY}&callback=initMap`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    } else {
      // If Google Maps is already loaded, initialize the map
      if (window.initMap) {
        window.initMap();
      }
    }

    return () => {
      // Cleanup
      delete window.initMap;
    };
  }, [center, waterways, pinpoints, isAddingPinpoint, onWaterwayClick, onPinpointClick, onMapClick]);

  if (isLoading) {
    return (
      <div className="map-container">
        <LoadingSpinner />
        <div className="loading-text">Loading map...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="map-container">
        <ErrorIndicator message={error} />
      </div>
    );
  }

  return (
    <div className="map-container">
      <div ref={mapRef} style={containerStyle}></div>
    </div>
  );
};

export default GoogleMapSimple;
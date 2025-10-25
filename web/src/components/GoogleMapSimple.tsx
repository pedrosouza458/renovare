import { useEffect, useRef, useCallback } from 'react';
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
    google?: unknown;
    initMap?: () => void;
    googleMapsLoaded?: boolean;
    googleMapsScriptLoading?: boolean;
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
  const mapInstanceRef = useRef<unknown>(null);
  const clickListenerRef = useRef<unknown>(null);

  const initializeMap = useCallback(() => {
    if (!mapRef.current || !window.google) return;

    try {
      if (!mapInstanceRef.current) {
        const googleMaps = window.google as { maps: { 
          Map: new (element: HTMLElement, options: unknown) => unknown;
        }};

        const map = new googleMaps.maps.Map(mapRef.current, {
          zoom: 16,
          center: { lat: center.lat, lng: center.lng },
          mapTypeId: 'roadmap',
          disableDefaultUI: true,
          mapId: 'DEMO_MAP_ID',
        });

        mapInstanceRef.current = map;
      }

      const map = mapInstanceRef.current;
      const googleMaps = window.google as { maps: { 
        Polyline: new (options: unknown) => { addListener: (event: string, callback: () => void) => void };
        marker?: {
          AdvancedMarkerElement: new (options: unknown) => { addListener: (event: string, callback: () => void) => void };
          PinElement: new (options: unknown) => unknown;
        };
        event: { removeListener: (listener: unknown) => void };
      }};
      
      // Handle click listener
      if (clickListenerRef.current) {
        googleMaps.maps.event.removeListener(clickListenerRef.current);
      }

      const mapWithListener = map as { addListener: (event: string, callback: (event: { latLng: { lat: () => number; lng: () => number } }) => void) => unknown };
      clickListenerRef.current = mapWithListener.addListener('click', (event: { latLng: { lat: () => number; lng: () => number } }) => {
        if (event.latLng) {
          const lat = event.latLng.lat();
          const lng = event.latLng.lng();
          onMapClick(lat, lng);
        }
      });

      // Render waterways
      waterways.forEach(waterway => {
        const path = waterway.coordinates.map(coord => ({ lat: coord.lat, lng: coord.lng }));
        const color = waterway.type === 'river' ? '#ff0000' : 
                    waterway.type === 'stream' ? '#00ff00' : '#0000ff';
        
        const polyline = new googleMaps.maps.Polyline({
          path,
          geodesic: true,
          strokeColor: color,
          strokeOpacity: 0.8,
          strokeWeight: 3,
          map,
        });

        polyline.addListener('click', () => onWaterwayClick(waterway));
      });

      // Render pinpoints
      pinpoints.forEach(pinpoint => {
        const hasAlert = pinpoint.posts?.some(post => post.type === 'alert' || post.type === 'both');
        const hasCleaning = pinpoint.posts?.some(post => post.type === 'cleaning' || post.type === 'both');
        
        let color = '#808080';
        if (hasAlert && hasCleaning) color = '#1e40af';
        else if (hasAlert) color = '#ff0000';
        else if (hasCleaning) color = '#00ff00';

        if (googleMaps.maps.marker?.AdvancedMarkerElement && googleMaps.maps.marker?.PinElement) {
          const pinElement = new googleMaps.maps.marker.PinElement({
            background: color,
            borderColor: '#ffffff',
            glyphColor: '#ffffff',
            scale: 1.2,
          });

          const marker = new googleMaps.maps.marker.AdvancedMarkerElement({
            position: { lat: pinpoint.latitude, lng: pinpoint.longitude },
            map,
            content: pinElement,
            title: `Pinpoint: ${pinpoint.posts?.length || 0} posts`
          });

          marker.addListener('click', () => onPinpointClick(pinpoint));
        }
      });

      // Current location marker
      if (googleMaps.maps.marker?.AdvancedMarkerElement && googleMaps.maps.marker?.PinElement) {
        const bluePinElement = new googleMaps.maps.marker.PinElement({
          background: '#4285f4',
          borderColor: '#ffffff',
          glyphColor: '#ffffff',
          scale: 1.0,
        });

        new googleMaps.maps.marker.AdvancedMarkerElement({
          position: { lat: center.lat, lng: center.lng },
          map,
          content: bluePinElement,
          title: 'Current Location'
        });
      }

    } catch (error) {
      console.error('Error initializing Google Maps:', error);
    }
  }, [center, waterways, pinpoints, onWaterwayClick, onPinpointClick, onMapClick]);

  // Reset map when center changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current = null;
    }
  }, [center.lat, center.lng]);

  // Update click listener when adding pinpoint state changes
  useEffect(() => {
    if (mapInstanceRef.current && window.google) {
      const googleMaps = window.google as { maps: { event: { removeListener: (listener: unknown) => void } } };
      
      if (clickListenerRef.current) {
        googleMaps.maps.event.removeListener(clickListenerRef.current);
      }

      const mapWithListener = mapInstanceRef.current as { addListener: (event: string, callback: (event: { latLng: { lat: () => number; lng: () => number } }) => void) => unknown };
      clickListenerRef.current = mapWithListener.addListener('click', (event: { latLng: { lat: () => number; lng: () => number } }) => {
        if (event.latLng) {
          const lat = event.latLng.lat();
          const lng = event.latLng.lng();
          onMapClick(lat, lng);
        }
      });
    }
  }, [isAddingPinpoint, onMapClick]);

  // Initialize map
  useEffect(() => {
    if (window.google) {
      initializeMap();
      return;
    }

    window.initMap = () => {
      initializeMap();
    };

    if (!window.googleMapsScriptLoading && !document.querySelector('script[src*="maps.googleapis.com"]')) {
      window.googleMapsScriptLoading = true;
      const script = document.createElement('script');
      script.src = `${GOOGLE_MAPS_CONFIG.SCRIPT_URL}?key=${GOOGLE_MAPS_CONFIG.API_KEY}&loading=async&callback=initMap&libraries=marker`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        window.googleMapsLoaded = true;
        window.googleMapsScriptLoading = false;
      };
      script.onerror = () => {
        window.googleMapsScriptLoading = false;
      };
      document.head.appendChild(script);
    }

    return () => {
      if (clickListenerRef.current && window.google) {
        const googleMaps = window.google as { maps: { event: { removeListener: (listener: unknown) => void } } };
        googleMaps.maps.event.removeListener(clickListenerRef.current);
      }
      delete window.initMap;
    };
  }, [initializeMap]);

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
      <div ref={mapRef} style={containerStyle} />
    </div>
  );
};

export default GoogleMapSimple;

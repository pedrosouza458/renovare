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
    google?: {
      maps: {
        Map: new (element: HTMLElement, options: unknown) => unknown;
        Polyline: new (options: unknown) => unknown;
        marker?: {
          AdvancedMarkerElement: new (options: unknown) => unknown;
          PinElement: new (options: unknown) => unknown;
        };
        event: {
          removeListener: (listener: unknown) => void;
        };
      };
    };
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
    if (!mapRef.current || !window.google?.maps) {
      console.log('Google Maps not ready');
      return;
    }

    try {
      if (!mapInstanceRef.current) {
        const map = new window.google.maps.Map(mapRef.current, {
          zoom: 16,
          center: { lat: center.lat, lng: center.lng },
          mapTypeId: 'roadmap',
          disableDefaultUI: true,
          mapId: 'DEMO_MAP_ID',
        });

        mapInstanceRef.current = map;
      }

      const map = mapInstanceRef.current as unknown;
      
      // Handle click listener
      if (clickListenerRef.current) {
        window.google.maps.event.removeListener(clickListenerRef.current);
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
      if (window.google?.maps) {
        const google = window.google;
        waterways.forEach(waterway => {
          const path = waterway.coordinates.map(coord => ({ lat: coord.lat, lng: coord.lng }));
          const color = waterway.type === 'river' ? '#ff0000' : 
                      waterway.type === 'stream' ? '#00ff00' : '#0000ff';
          
          const polyline = new google.maps.Polyline({
            path,
            geodesic: true,
            strokeColor: color,
            strokeOpacity: 0.8,
            strokeWeight: 3,
            map,
          });

          const polylineWithListener = polyline as { addListener: (event: string, callback: () => void) => void };
          polylineWithListener.addListener('click', () => onWaterwayClick(waterway));
        });
      }

      // Render pinpoints
      if (window.google?.maps) {
        const google = window.google;
        pinpoints.forEach(pinpoint => {
          console.log('Pin:', { id: pinpoint.id.slice(-8), lastActionSummary: pinpoint.lastActionSummary });
          
          // Use lastActionSummary to determine pin color and appearance
          let color = '#808080'; // Default grey for pins with no action
          let glyph = undefined;

          // Green pin for CLEANING or BOTH actions (successful environmental actions)
          if (pinpoint.lastActionSummary === 'CLEANING' || pinpoint.lastActionSummary === 'BOTH') {
            color = '#22c55e'; // Green color
          } 
          // Yellow pin with warning symbol for ALERT actions (environmental problems)
          else if (pinpoint.lastActionSummary === 'ALERT') {
            color = '#fbbf24'; // Yellow color
            glyph = '⚠️'; // Warning symbol inside the pin
          }

          if (google.maps.marker?.AdvancedMarkerElement && google.maps.marker?.PinElement) {
            const pinElement = new google.maps.marker.PinElement({
              background: color,
              borderColor: '#ffffff',
              glyphColor: '#ffffff',
              glyph: glyph,
              scale: 1.2,
            });

            const marker = new google.maps.marker.AdvancedMarkerElement({
              position: { lat: pinpoint.latitude, lng: pinpoint.longitude },
              map,
              content: pinElement,
              title: `Pinpoint: ${pinpoint.posts?.length || 0} posts`
            });

            const markerWithListener = marker as { addListener: (event: string, callback: () => void) => void };
            markerWithListener.addListener('click', () => onPinpointClick(pinpoint));
          }
        });
      }

      // Current location marker
      if (window.google?.maps?.marker?.AdvancedMarkerElement && window.google?.maps?.marker?.PinElement) {
        const google = window.google;
        if (google.maps.marker) {
          const bluePinElement = new google.maps.marker.PinElement({
            background: '#4285f4',
            borderColor: '#ffffff',
            glyphColor: '#ffffff',
            scale: 1.0,
          });

          new google.maps.marker.AdvancedMarkerElement({
            position: { lat: center.lat, lng: center.lng },
            map,
            content: bluePinElement,
            title: 'Current Location'
          });
        }
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
    if (mapInstanceRef.current && window.google?.maps) {
      if (clickListenerRef.current) {
        window.google.maps.event.removeListener(clickListenerRef.current);
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
    if (window.google?.maps) {
      initializeMap();
      return;
    }

    // Set up the callback function
    const initMapCallback = () => {
      console.log('Google Maps loaded, initializing...');
      if (window.google?.maps) {
        initializeMap();
      } else {
        console.error('Google Maps failed to load properly');
      }
    };

    window.initMap = initMapCallback;

    if (!window.googleMapsScriptLoading && !document.querySelector('script[src*="maps.googleapis.com"]')) {
      console.log('Loading Google Maps script...');
      window.googleMapsScriptLoading = true;
      const script = document.createElement('script');
      script.src = `${GOOGLE_MAPS_CONFIG.SCRIPT_URL}?key=${GOOGLE_MAPS_CONFIG.API_KEY}&loading=async&callback=initMap&libraries=marker`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log('Google Maps script loaded');
        window.googleMapsLoaded = true;
        window.googleMapsScriptLoading = false;
      };
      script.onerror = (error) => {
        console.error('Failed to load Google Maps script:', error);
        window.googleMapsScriptLoading = false;
      };
      document.head.appendChild(script);
    }

    return () => {
      if (clickListenerRef.current && window.google?.maps) {
        window.google.maps.event.removeListener(clickListenerRef.current);
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

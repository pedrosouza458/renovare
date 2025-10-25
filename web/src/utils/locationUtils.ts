// Utility to find nearby pinpoints and suggest alternatives
import type { Pinpoint } from '../types';

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in meters
 */
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371000; // Earth radius in meters
  
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
};

/**
 * Find pinpoints within a specified radius of given coordinates
 */
export const findNearbyPinpoints = (
  targetLat: number,
  targetLng: number,
  pinpoints: Pinpoint[],
  radiusMeters: number = 100
): Array<Pinpoint & { distance: number }> => {
  return pinpoints
    .map(pinpoint => ({
      ...pinpoint,
      distance: calculateDistance(targetLat, targetLng, pinpoint.latitude, pinpoint.longitude)
    }))
    .filter(pinpoint => pinpoint.distance <= radiusMeters)
    .sort((a, b) => a.distance - b.distance);
};

/**
 * Format distance for display
 */
export const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
};
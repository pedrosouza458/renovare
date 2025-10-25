export const GOOGLE_MAPS_CONFIG = {
  API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  SCRIPT_URL: 'https://maps.googleapis.com/maps/api/js',
  TIMEOUT: 30000,
} as const;

export const OVERPASS_CONFIG = {
  BASE_URL: 'http://overpass-api.de/api/interpreter',
  TIMEOUT: 30000,
} as const;
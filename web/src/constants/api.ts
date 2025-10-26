export const GOOGLE_MAPS_CONFIG = {
  API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  SCRIPT_URL: 'https://maps.googleapis.com/maps/api/js',
  TIMEOUT: 30000,
} as const;

export const OVERPASS_CONFIG = {
  BASE_URL: 'http://overpass-api.de/api/interpreter',
  TIMEOUT: 30000,
} as const;

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  TIMEOUT: 30000,
  ENDPOINTS: {
    // Auth
    LOGIN: '/auth/login',
    PROFILE: '/auth/profile',
    
    // Users
    USERS: '/users',
    USER_BY_ID: (id: string) => `/users/${id}`,
    UPDATE_USER_SCORE: '/users/score',
    
    // Pins
    PINS: '/pins',
    PIN_BY_ID: (id: string) => `/pins/${id}`,
    
    // Posts
    POSTS: '/posts',
    POST_BY_ID: (id: string) => `/posts/${id}`,
  }
} as const;
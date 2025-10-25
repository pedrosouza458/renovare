export const DEFAULT_LOCATION = {
  lat: -29.9577, // Charqueadas, RS, Brazil - R. Gen. Balbão, 81 - Centro
  lng: -51.6253
} as const;

export const DEFAULT_ZOOM = 12;
export const DEFAULT_RADIUS = 3300; // 3.3km radius (reduced from 10km)
export const WATERWAY_TYPES = ['river', 'stream', 'canal'] as const;
export const BASE_SCORES = {
  alert: 10,
  cleaning: 50,
  both: 100,
} as const;

export const MAX_SCORES = {
  alert: 50,
  cleaning: 100,
  both: 200,
} as const;

export const MIN_DISTANCE_FOR_BONUS = 1000;

export const OVERPASS_CONFIG = {
  BASE_URL: "https://overpass-api.de/api/interpreter",
  TIMEOUT: 30000,
};

import { overpassApi } from '../services/overpassApi';
import type { PostType } from '../types/pinpoint';

// Base scores for each post type
const BASE_SCORES = {
  alert: 10,
  cleaning: 50,
  both: 100,
} as const;

// Maximum scores for each post type
const MAX_SCORES = {
  alert: 50,
  cleaning: 100,
  both: 200,
} as const;

// Minimum distance (1km) to get more than base value
const MIN_DISTANCE_FOR_BONUS = 1000; // meters

/**
 * Calculate distance between two geographic points using Haversine formula
 * @param lat1 - Latitude of first point
 * @param lng1 - Longitude of first point
 * @param lat2 - Latitude of second point
 * @param lng2 - Longitude of second point
 * @returns Distance in meters
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Find the nearest water body using OverPass API
 * @param latitude - Pin latitude
 * @param longitude - Pin longitude
 * @returns Distance to nearest water body in meters
 */
async function findNearestWaterBody(latitude: number, longitude: number): Promise<number> {
  try {
    // Search for water bodies within 10km radius
    const waterways = await overpassApi.getWaterways({
      lat: latitude,
      lng: longitude,
      radius: 10000, // 10km search radius
    });

    if (waterways.length === 0) {
      // If no water bodies found, return maximum distance (no bonus)
      return Infinity;
    }

    let minDistance = Infinity;

    // Calculate distance to each water body and find the minimum
    for (const waterway of waterways) {
      if (waterway.coordinates && waterway.coordinates.length > 0) {
        for (const coord of waterway.coordinates) {
          const distance = calculateDistance(
            latitude,
            longitude,
            coord.lat,
            coord.lng
          );
          minDistance = Math.min(minDistance, distance);
        }
      }
    }

    return minDistance;
  } catch (error) {
    console.error('Error finding nearest water body:', error);
    // Return maximum distance if API fails (fallback to base score)
    return Infinity;
  }
}

/**
 * Calculate score based on post type and proximity to water bodies
 * @param postType - Type of post (alert, cleaning, both)
 * @param latitude - Pin latitude
 * @param longitude - Pin longitude
 * @returns Calculated score
 */
export async function calculatePostScore(
  postType: PostType,
  latitude: number,
  longitude: number
): Promise<number> {
  const baseScore = BASE_SCORES[postType];
  const maxScore = MAX_SCORES[postType];

  try {
    const distanceToWater = await findNearestWaterBody(latitude, longitude);

    // If distance is greater than minimum (1km), user only gets base score
    if (distanceToWater >= MIN_DISTANCE_FOR_BONUS) {
      return baseScore;
    }

    // Calculate bonus based on proximity to water
    // Closer to water = higher score
    // At 0m from water = max score
    // At 1000m from water = base score
    const proximityRatio = 1 - (distanceToWater / MIN_DISTANCE_FOR_BONUS);
    const bonusPoints = (maxScore - baseScore) * proximityRatio;
    const finalScore = Math.round(baseScore + bonusPoints);

    console.log(`Score calculation for ${postType}:`, {
      distanceToWater: Math.round(distanceToWater),
      baseScore,
      maxScore,
      proximityRatio: proximityRatio.toFixed(2),
      bonusPoints: Math.round(bonusPoints),
      finalScore,
    });

    return finalScore;
  } catch (error) {
    console.error('Error calculating post score:', error);
    // Return base score if calculation fails
    return baseScore;
  }
}
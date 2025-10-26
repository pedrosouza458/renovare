import { useState, useCallback } from 'react';
import { overpassApi } from '../services/overpassApi';
import type { WaterwayData, Location, OverpassQueryParams } from '../types';
import { OverpassApiError } from '../types';
import { DEFAULT_RADIUS, WATERWAY_TYPES } from '../constants';

interface UseWaterwaysResult {
  waterways: WaterwayData[];
  loading: boolean;
  error: string | null;
  fetchWaterways: (location: Location) => Promise<void>;
}

export const useWaterways = (): UseWaterwaysResult => {
  const [waterways, setWaterways] = useState<WaterwayData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWaterways = useCallback(async (location: Location) => {
    setLoading(true);
    setError(null);

    try {
      const params: OverpassQueryParams = {
        lat: location.lat,
        lng: location.lng,
        radius: DEFAULT_RADIUS,
        waterTypes: WATERWAY_TYPES as unknown as string[]
      };

      const nearbyWaterways = await overpassApi.getWaterways(params);
      setWaterways(nearbyWaterways);
    } catch (err) {
      if (err instanceof OverpassApiError) {
        setError(`Overpass API Error: ${err.message}`);
      } else {
        setError('An unexpected error occurred while fetching waterway data');
      }
      setWaterways([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    waterways,
    loading,
    error,
    fetchWaterways
  };
};
import { useState, useEffect, useCallback } from 'react';
import { pinpointService } from '../services/pinpointService';
import type { Pinpoint, CreatePinpointData, PostType } from '../types';

interface UsePinpointsResult {
  pinpoints: Pinpoint[];
  loading: boolean;
  /** @deprecated Use createPinpointWithPost instead */
  createPinpoint: (data: CreatePinpointData) => Promise<Pinpoint>;
  createPinpointWithPost: (latitude: number, longitude: number, postData: { type: PostType; title: string; description: string }) => Pinpoint;
  /** @deprecated Use createPinpointWithPost instead */
  addPinpoint: (latitude: number, longitude: number) => Pinpoint;
  updatePinpoint: (pinpoint: Pinpoint) => void;
  deletePinpoint: (id: string) => Promise<boolean>;
  addPostToPinpoint: (pinpointId: string, postData: { type: PostType; title: string; description: string }) => Promise<boolean>;
  refreshPinpoints: () => void;
}

export const usePinpoints = (): UsePinpointsResult => {
  const [pinpoints, setPinpoints] = useState<Pinpoint[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPinpoints = useCallback(() => {
    setLoading(true);
    try {
      const allPinpoints = pinpointService.getAllPinpoints();
      setPinpoints(allPinpoints);
    } catch (error) {
      console.error('Error loading pinpoints:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const createPinpoint = useCallback(async (data: CreatePinpointData): Promise<Pinpoint> => {
    try {
      // This method is deprecated but we'll log the data for debugging
      console.warn('createPinpoint is deprecated. Data:', data);
      const newPinpoint = pinpointService.createPinpoint();
      loadPinpoints(); // Refresh the list
      return newPinpoint;
    } catch (error) {
      console.error('Error creating pinpoint:', error);
      throw error;
    }
  }, [loadPinpoints]);

  const createPinpointWithPost = useCallback((
    latitude: number, 
    longitude: number, 
    postData: { type: PostType; title: string; description: string }
  ): Pinpoint => {
    const newPinpoint = pinpointService.createPinpointWithPost(latitude, longitude, postData);
    loadPinpoints(); // Refresh the list
    return newPinpoint;
  }, [loadPinpoints]);

  const addPinpoint = useCallback((latitude: number, longitude: number): Pinpoint => {
    try {
      // This method is deprecated but we'll log the coordinates for debugging
      console.warn('addPinpoint is deprecated. Coordinates:', { latitude, longitude });
      const newPinpoint = pinpointService.createPinpoint();
      loadPinpoints(); // Refresh the list
      return newPinpoint;
    } catch (error) {
      console.error('Error adding pinpoint:', error);
      throw error;
    }
  }, [loadPinpoints]);

  const updatePinpoint = useCallback((pinpoint: Pinpoint): void => {
    pinpointService.updatePinpoint(pinpoint.id, pinpoint);
    loadPinpoints(); // Refresh the list
  }, [loadPinpoints]);

  const deletePinpoint = useCallback(async (id: string): Promise<boolean> => {
    const success = pinpointService.deletePinpoint(id);
    if (success) {
      loadPinpoints(); // Refresh the list
    }
    return success;
  }, [loadPinpoints]);

  const addPostToPinpoint = useCallback(async (
    pinpointId: string, 
    postData: { type: PostType; title: string; description: string }
  ): Promise<boolean> => {
    try {
      const post = pinpointService.addPostToPinpoint(pinpointId, postData);
      if (post) {
        loadPinpoints(); // Refresh the list
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding post to pinpoint:', error);
      // Re-throw the error so the UI can handle it
      throw error;
    }
  }, [loadPinpoints]);

  useEffect(() => {
    loadPinpoints();
  }, [loadPinpoints]);

  return {
    pinpoints,
    loading,
    createPinpoint,
    createPinpointWithPost,
    addPinpoint,
    updatePinpoint,
    deletePinpoint,
    addPostToPinpoint,
    refreshPinpoints: loadPinpoints
  };
};
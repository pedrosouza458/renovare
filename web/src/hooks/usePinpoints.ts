import { useState, useEffect, useCallback } from "react";
import type { Pinpoint, PostType } from "../types";
import { pinpointService } from "../services/pinpointService";

export const usePinpoints = () => {
  const [pinpoints, setPinpoints] = useState<Pinpoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPinpoints = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // console.log("Loading pinpoints...");
      const data = await pinpointService.getAllPinpoints();
      // console.log('Received pinpoints:', data.map(p => ({
      //   id: p.id.slice(-8),
      //   lastActionSummary: p.lastActionSummary,
      //   postsCount: p.posts?.length || 0
      // })));
      setPinpoints(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load pinpoints";
      setError(errorMessage);
      console.error("Error loading pinpoints:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load pinpoints on component mount
  useEffect(() => {
    loadPinpoints();
  }, [loadPinpoints]);

  const createPinpointWithPost = useCallback(
    async (
      latitude: number,
      longitude: number,
      postData: {
        type: PostType;
        text: string;
        photos?: Array<{ url: string }>;
      }
    ): Promise<Pinpoint> => {
      setLoading(true);
      setError(null);
      try {
        const newPinpoint = await pinpointService.createPinpointWithPost(
          latitude,
          longitude,
          postData
        );

        // Reload all pinpoints to get fresh data
        await loadPinpoints();

        return newPinpoint;
      } catch (err) {
        let errorMessage = "Failed to create pinpoint";

        if (err instanceof Error) {
          if (err.message.includes("409")) {
            errorMessage =
              "A pinpoint already exists nearby (within 50 meters). Please choose a different location or add a post to the existing pinpoint.";
          } else {
            errorMessage = err.message;
          }
        }

        setError(errorMessage);
        console.error("Error creating pinpoint:", err);
        throw err; // Re-throw so calling component can handle it
      } finally {
        setLoading(false);
      }
    },
    [loadPinpoints]
  );

  const addPostToPinpoint = useCallback(
    async (
      pinpointId: string,
      postData: {
        type: PostType;
        text: string;
        photos?: Array<{ url: string }>;
      }
    ): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        console.log(`Adding post to pinpoint ${pinpointId}:`, postData);
        await pinpointService.addPostToPinpoint(pinpointId, postData);

        console.log("Post created successfully, reloading pinpoints...");
        // Reload all pinpoints to get fresh data
        await loadPinpoints();
        console.log("Pinpoints reloaded");

        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to add post";
        setError(errorMessage);
        console.error("Error adding post:", err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [loadPinpoints]
  );

  const deletePinpoint = useCallback(
    async (pinpointId: string): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        await pinpointService.deletePinpoint(pinpointId);

        // Remove from local state
        setPinpoints((prev) => prev.filter((p) => p.id !== pinpointId));

        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete pinpoint";
        setError(errorMessage);
        console.error("Error deleting pinpoint:", err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    pinpoints,
    loading,
    error,
    loadPinpoints,
    createPinpointWithPost,
    addPostToPinpoint,
    deletePinpoint,
  };
};

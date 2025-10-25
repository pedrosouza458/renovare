import { pinService } from './pinService';
import { postService } from './postService';
import type { Pinpoint, PostType } from '../types';
import type { CreatePostData } from '../types/pinpoint';

// Map frontend PostType to backend PostType
const mapPostTypeToBackend = (type: PostType): string => {
  const mapping: Record<PostType, string> = {
    'alert': 'ALERT',
    'cleaning': 'CLEANING', 
    'both': 'BOTH'
  };
  return mapping[type];
};

// Map backend PostType to frontend PostType  
const mapPostTypeFromBackend = (type: string): PostType => {
  const mapping: Record<string, PostType> = {
    'ALERT': 'alert',
    'CLEANING': 'cleaning',
    'BOTH': 'both'
  };
  return mapping[type] || 'alert';
};

// Types for backend API responses
interface BackendPost {
  id: string;
  type: 'ALERT' | 'CLEANING' | 'BOTH';
  text?: string;
  reported: boolean;
  numberOfReports: number;
  userId: string;
  pinId: string;
  photos: Array<{ id?: string; url: string; isBefore?: boolean }>;
  createdAt: string;
}

interface BackendPinpoint {
  id: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;
  lastActionSummary?: string;
  posts?: BackendPost[];
}

// Convert backend Pinpoint to frontend Pinpoint
const mapPinpointFromBackend = (backendPinpoint: BackendPinpoint): Pinpoint => {
  return {
    ...backendPinpoint,
    posts: backendPinpoint.posts?.map((post: BackendPost) => ({
      ...post,
      type: mapPostTypeFromBackend(post.type)
    })) || []
  };
};

export const pinpointService = {
  async getAllPinpoints(): Promise<Pinpoint[]> {
    const backendPinpoints = await pinService.getAllPins() as BackendPinpoint[];
    return backendPinpoints.map(mapPinpointFromBackend);
  },

  async createPinpointWithPost(
    latitude: number, 
    longitude: number, 
    postData: { type: PostType; text: string }
  ): Promise<Pinpoint> {
    // First create the pinpoint
    const newPinpoint = await pinService.createPin({
      latitude,
      longitude,
      lastActionSummary: postData.text.substring(0, 100) // Use first 100 chars as summary
    });

    // Then create the post associated with the pinpoint
    const createPostPayload: CreatePostData = {
      type: mapPostTypeToBackend(postData.type) as 'ALERT' | 'CLEANING' | 'BOTH',
      text: postData.text,
      pinId: newPinpoint.id
    };

    const newPost = await postService.createPost(createPostPayload);

    // Return the pinpoint with the post included
    return mapPinpointFromBackend({
      ...(newPinpoint as BackendPinpoint),
      posts: [newPost as unknown as BackendPost]
    });
  },

  async addPostToPinpoint(
    pinpointId: string, 
    postData: { type: PostType; text: string; photos?: Array<{ url: string; isBefore?: boolean }> }
  ): Promise<Pinpoint> {
    // Create the post with the text directly
    const createPostPayload: CreatePostData = {
      type: mapPostTypeToBackend(postData.type) as 'ALERT' | 'CLEANING' | 'BOTH',
      text: postData.text,
      pinId: pinpointId,
      photos: postData.photos && postData.photos.length > 0 ? postData.photos : undefined
    };

    await postService.createPost(createPostPayload);

    // Get the updated pinpoint
    const updatedPinpoint = await pinService.getPinById(pinpointId) as BackendPinpoint;
    
    return mapPinpointFromBackend(updatedPinpoint);
  },

  async deletePinpoint(pinpointId: string): Promise<void> {
    await pinService.deletePin(pinpointId);
  }
};

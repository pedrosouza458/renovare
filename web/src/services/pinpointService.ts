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
    posts: backendPinpoint.posts?.map((post: BackendPost) => {
      // Parse title and description from text field
      const textParts = post.text?.split('\n\n') || [];
      const title = textParts[0] || '';
      const description = textParts.slice(1).join('\n\n') || '';
      
      return {
        ...post,
        type: mapPostTypeFromBackend(post.type),
        title,
        description
      };
    }) || []
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
    postData: { type: PostType; title: string; description: string }
  ): Promise<Pinpoint> {
    // First create the pinpoint
    const newPinpoint = await pinService.createPin({
      latitude,
      longitude,
      lastActionSummary: postData.title
    });

    // Then create the post associated with the pinpoint
    const createPostPayload: CreatePostData = {
      type: mapPostTypeToBackend(postData.type) as 'ALERT' | 'CLEANING' | 'BOTH',
      text: `${postData.title}\n\n${postData.description}`,
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
    postData: { type: PostType; title: string; description: string }
  ): Promise<Pinpoint> {
    // Create the post with combined title and description
    const createPostPayload: CreatePostData = {
      type: mapPostTypeToBackend(postData.type) as 'ALERT' | 'CLEANING' | 'BOTH',
      text: `${postData.title}\n\n${postData.description}`,
      pinId: pinpointId
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

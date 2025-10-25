export type PostType = 'alert' | 'cleaning' | 'both';

export interface Post {
  id: string;
  type: PostType;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Pinpoint {
  id: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;
  posts: Post[];
  photos: string[]; // Array of photo URLs
}

export interface CreatePinpointData {
  latitude: number;
  longitude: number;
}
export type PostType = 'alert' | 'cleaning' | 'both';

export interface PostPhoto {
  id?: string;
  url: string;
  isBefore?: boolean;
}

export interface Post {
  id: string;
  type: PostType;
  text?: string;
  title?: string;
  description?: string;
  reported: boolean;
  numberOfReports: number;
  userId: string;
  pinId: string;
  photos: PostPhoto[];
  createdAt: string;
}

export interface Pinpoint {
  id: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;
  lastActionSummary?: string;
  posts?: Post[];
}

export interface CreatePinpointData {
  latitude: number;
  longitude: number;
  lastActionSummary?: string;
}

export interface CreatePostData {
  type: 'ALERT' | 'CLEANING' | 'BOTH';
  text?: string;
  pinId: string;
  photos?: PostPhoto[];
}

export interface UpdatePostData {
  type?: PostType;
  text?: string;
  reported?: boolean;
  numberOfReports?: number;
}
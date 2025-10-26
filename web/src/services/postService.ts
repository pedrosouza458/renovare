import { apiClient } from './apiClient';
import { API_CONFIG } from '../constants/api';
import type { Post, CreatePostData, UpdatePostData } from '../types/pinpoint';

export class PostService {
  async getAllPosts(): Promise<Post[]> {
    return apiClient.get<Post[]>(API_CONFIG.ENDPOINTS.POSTS);
  }

  async getPostById(id: string): Promise<Post> {
    return apiClient.get<Post>(API_CONFIG.ENDPOINTS.POST_BY_ID(id));
  }

  async createPost(postData: CreatePostData): Promise<Post> {
    return apiClient.post<Post>(API_CONFIG.ENDPOINTS.POSTS, postData);
  }

  async updatePost(id: string, postData: UpdatePostData): Promise<Post> {
    return apiClient.patch<Post>(API_CONFIG.ENDPOINTS.POST_BY_ID(id), postData);
  }

  async deletePost(id: string): Promise<void> {
    return apiClient.delete<void>(API_CONFIG.ENDPOINTS.POST_BY_ID(id));
  }
}

export const postService = new PostService();
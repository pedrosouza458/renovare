import { apiClient } from './apiClient';
import { API_CONFIG } from '../constants/api';
import type { User, UpdateUserData, UpdateScoreData } from '../types/user';

export class UserService {
  async getAllUsers(): Promise<User[]> {
    return apiClient.get<User[]>(API_CONFIG.ENDPOINTS.USERS);
  }

  async getUserById(id: string): Promise<User> {
    return apiClient.get<User>(API_CONFIG.ENDPOINTS.USER_BY_ID(id));
  }

  async updateUser(userData: UpdateUserData): Promise<User> {
    return apiClient.put<User>(API_CONFIG.ENDPOINTS.USERS, userData);
  }

  async updateUserScore(scoreData: UpdateScoreData): Promise<User> {
    return apiClient.put<User>(API_CONFIG.ENDPOINTS.UPDATE_USER_SCORE, scoreData);
  }

  async deleteUser(): Promise<void> {
    return apiClient.delete<void>(API_CONFIG.ENDPOINTS.USERS);
  }
}

export const userService = new UserService();
import { apiClient } from './apiClient';
import { API_CONFIG } from '../constants/api';
import type { User, LoginData, LoginResponse, CreateUserData } from '../types/user';

export class AuthService {
  async login(credentials: LoginData): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(
      API_CONFIG.ENDPOINTS.LOGIN,
      credentials
    );
    
    // Store the token in the API client
    apiClient.setToken(response.token);
    
    return response;
  }

  async register(userData: CreateUserData): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(
      API_CONFIG.ENDPOINTS.USERS, 
      userData
    );
    
    // Store the token in the API client for automatic login
    apiClient.setToken(response.token);
    
    return response;
  }

  async getProfile(): Promise<User> {
    console.log('AuthService: Getting profile...');
    const response = await apiClient.get<{ user: User }>(API_CONFIG.ENDPOINTS.PROFILE);
    console.log('AuthService: Profile response:', response);
    console.log('AuthService: Returning user:', response.user);
    return response.user;
  }

  logout(): void {
    apiClient.setToken(null);
  }

  isAuthenticated(): boolean {
    return apiClient.getToken() !== null;
  }

  getToken(): string | null {
    return apiClient.getToken();
  }
}

export const authService = new AuthService();
import { apiClient } from './apiClient';
import { API_CONFIG } from '../constants/api';
import type { Pinpoint, CreatePinpointData } from '../types/pinpoint';

export class PinService {
  async getAllPins(): Promise<Pinpoint[]> {
    return apiClient.get<Pinpoint[]>(API_CONFIG.ENDPOINTS.PINS);
  }

  async getPinById(id: string): Promise<Pinpoint> {
    return apiClient.get<Pinpoint>(API_CONFIG.ENDPOINTS.PIN_BY_ID(id));
  }

  async createPin(pinData: CreatePinpointData): Promise<Pinpoint> {
    return apiClient.post<Pinpoint>(API_CONFIG.ENDPOINTS.PINS, pinData);
  }

  async updatePin(id: string, pinData: Partial<CreatePinpointData>): Promise<Pinpoint> {
    return apiClient.patch<Pinpoint>(API_CONFIG.ENDPOINTS.PIN_BY_ID(id), pinData);
  }

  async deletePin(id: string): Promise<void> {
    return apiClient.delete<void>(API_CONFIG.ENDPOINTS.PIN_BY_ID(id));
  }
}

export const pinService = new PinService();
import apiClient from './api';
import { User, UserCreate, UserUpdate } from '../types';

export class UserService {
  static async createUser(userData: UserCreate): Promise<User> {
    const response = await apiClient.post('/api/v1/users/', userData);
    return response.data;
  }

  static async getUser(telegramId: number): Promise<User> {
    const response = await apiClient.get(`/api/v1/users/${telegramId}`);
    return response.data;
  }

  static async updateUser(telegramId: number, userData: UserUpdate): Promise<User> {
    const response = await apiClient.put(`/api/v1/users/${telegramId}`, userData);
    return response.data;
  }

  static async checkUserExists(telegramId: number): Promise<boolean> {
    const response = await apiClient.get(`/api/v1/users/${telegramId}/exists`);
    return response.data.exists;
  }

  static async getOrCreateUser(telegramId: number, userData?: Partial<UserCreate>): Promise<User> {
    try {
      // Try to get existing user
      return await this.getUser(telegramId);
    } catch (error: any) {
      if (error.response?.status === 404) {
        // User doesn't exist, create new one
        const createData: UserCreate = {
          telegram_id: telegramId,
          ...userData,
        };
        return await this.createUser(createData);
      }
      throw error;
    }
  }
} 
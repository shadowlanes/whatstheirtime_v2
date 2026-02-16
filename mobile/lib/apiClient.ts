import axios, { AxiosInstance, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Config } from '@/constants/Config';
import type {
  Friend,
  CreateFriendInput,
  UpdateFriendInput,
  ReorderFriendsInput,
  UserLocation,
  SetUserLocationInput,
  WeatherData,
} from '@/shared/types';

/**
 * Get auth token from SecureStore
 */
async function getAuthToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync('auth_token');
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

/**
 * Create axios instance with auth interceptor
 */
function createAxiosInstance(): AxiosInstance {
  const instance = axios.create({
    baseURL: Config.API_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor to add auth token
  instance.interceptors.request.use(
    async (config) => {
      const token = await getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor for error handling
  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response) {
        // Server responded with error status
        console.error('API Error:', error.response.status, error.response.data);
      } else if (error.request) {
        // Request was made but no response received
        console.error('Network Error:', error.message);
      } else {
        // Something else happened
        console.error('Error:', error.message);
      }
      return Promise.reject(error);
    }
  );

  return instance;
}

const api = createAxiosInstance();

/**
 * Friends API
 */
export const friendsApi = {
  /**
   * Get all friends for the authenticated user
   */
  async getAll(): Promise<Friend[]> {
    const response = await api.get<Friend[]>('/api/friends');
    return response.data;
  },

  /**
   * Create a new friend
   */
  async create(friend: CreateFriendInput): Promise<Friend> {
    const response = await api.post<Friend>('/api/friends', friend);
    return response.data;
  },

  /**
   * Update an existing friend
   */
  async update(id: string, updates: UpdateFriendInput): Promise<Friend> {
    const response = await api.put<Friend>(`/api/friends/${id}`, updates);
    return response.data;
  },

  /**
   * Delete a friend
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/api/friends/${id}`);
  },

  /**
   * Reorder friends
   */
  async reorder(data: ReorderFriendsInput): Promise<void> {
    await api.put('/api/friends/reorder', data);
  },
};

/**
 * User API
 */
export const userApi = {
  /**
   * Get user's location
   */
  async getLocation(): Promise<UserLocation | null> {
    try {
      const response = await api.get<UserLocation>('/api/user/location');
      return response.data;
    } catch (error) {
      // Return null if location not set (404 error)
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Set or update user's location
   */
  async setLocation(location: SetUserLocationInput): Promise<UserLocation> {
    const response = await api.put<UserLocation>('/api/user/location', location);
    return response.data;
  },

  /**
   * Delete user's location
   */
  async deleteLocation(): Promise<void> {
    await api.delete('/api/user/location');
  },
};

/**
 * Weather API
 */
export const weatherApi = {
  /**
   * Get weather for a city
   */
  async getForCity(city: string): Promise<WeatherData> {
    const response = await api.get<WeatherData>(`/api/weather/${encodeURIComponent(city)}`);
    return response.data;
  },
};

/**
 * Auth API
 */
export const authApi = {
  /**
   * Save auth token to SecureStore
   */
  async saveToken(token: string): Promise<void> {
    await SecureStore.setItemAsync('auth_token', token);
  },

  /**
   * Remove auth token from SecureStore
   */
  async removeToken(): Promise<void> {
    await SecureStore.deleteItemAsync('auth_token');
  },

  /**
   * Get current auth token
   */
  async getToken(): Promise<string | null> {
    return await getAuthToken();
  },
};

export { api };

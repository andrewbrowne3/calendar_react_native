// Storage service - Like SharedPreferences but actually works!
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/config';
import { User, AuthTokens } from '../types';

class StorageService {
  // Generic storage methods - like C++ templates!
  private async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error(`Error storing ${key}:`, error);
      throw new Error(`Failed to store ${key}`);
    }
  }

  private async getItem<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error(`Error retrieving ${key}:`, error);
      return null;
    }
  }

  private async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
    }
  }

  // Authentication token methods
  async saveTokens(tokens: AuthTokens): Promise<void> {
    await this.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.access);
    await this.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refresh);
  }

  async getAccessToken(): Promise<string | null> {
    return await this.getItem<string>(STORAGE_KEYS.ACCESS_TOKEN);
  }

  async getRefreshToken(): Promise<string | null> {
    return await this.getItem<string>(STORAGE_KEYS.REFRESH_TOKEN);
  }

  async clearTokens(): Promise<void> {
    await this.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    await this.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  // User data methods
  async saveUser(user: User): Promise<void> {
    await this.setItem(STORAGE_KEYS.USER_DATA, user);
  }

  async getUser(): Promise<User | null> {
    return await this.getItem<User>(STORAGE_KEYS.USER_DATA);
  }

  async clearUser(): Promise<void> {
    await this.removeItem(STORAGE_KEYS.USER_DATA);
  }

  // Clear all data (logout)
  async clearAll(): Promise<void> {
    await Promise.all([
      this.clearTokens(),
      this.clearUser(),
    ]);
  }

  // Check if user is logged in (has valid tokens)
  async isLoggedIn(): Promise<boolean> {
    const accessToken = await this.getAccessToken();
    const refreshToken = await this.getRefreshToken();
    return !!(accessToken && refreshToken);
  }

  // Public methods for general data storage
  async saveItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error(`Error storing ${key}:`, error);
      throw new Error(`Failed to store ${key}`);
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error(`Error retrieving ${key}:`, error);
      return null;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
    }
  }
}

// Export a singleton instance (like a static class in C++)
export const storageService = new StorageService();
export default storageService;
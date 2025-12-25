import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Secure storage for sensitive data (tokens, credentials)
 * Uses iOS Keychain / Android Keystore
 */
export const secureStorage = {
  async get(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error(`SecureStore get error for key ${key}:`, error);
      return null;
    }
  },

  async set(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error(`SecureStore set error for key ${key}:`, error);
      throw error;
    }
  },

  async remove(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error(`SecureStore remove error for key ${key}:`, error);
    }
  },

  async getJSON<T>(key: string): Promise<T | null> {
    const value = await this.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  },

  async setJSON<T>(key: string, value: T): Promise<void> {
    await this.set(key, JSON.stringify(value));
  },
};

/**
 * Regular storage for non-sensitive data
 * Uses AsyncStorage
 */
export const storage = {
  async get(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error(`AsyncStorage get error for key ${key}:`, error);
      return null;
    }
  },

  async set(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error(`AsyncStorage set error for key ${key}:`, error);
      throw error;
    }
  },

  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`AsyncStorage remove error for key ${key}:`, error);
    }
  },

  async getJSON<T>(key: string): Promise<T | null> {
    const value = await this.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  },

  async setJSON<T>(key: string, value: T): Promise<void> {
    await this.set(key, JSON.stringify(value));
  },

  async multiGet(keys: string[]): Promise<Record<string, string | null>> {
    try {
      const pairs = await AsyncStorage.multiGet(keys);
      return Object.fromEntries(pairs);
    } catch (error) {
      console.error('AsyncStorage multiGet error:', error);
      return {};
    }
  },

  async multiSet(pairs: [string, string][]): Promise<void> {
    try {
      await AsyncStorage.multiSet(pairs);
    } catch (error) {
      console.error('AsyncStorage multiSet error:', error);
      throw error;
    }
  },

  async multiRemove(keys: string[]): Promise<void> {
    try {
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('AsyncStorage multiRemove error:', error);
    }
  },

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('AsyncStorage clear error:', error);
    }
  },

  async getAllKeys(): Promise<string[]> {
    try {
      return (await AsyncStorage.getAllKeys()) || [];
    } catch (error) {
      console.error('AsyncStorage getAllKeys error:', error);
      return [];
    }
  },
};

// Storage keys
export const STORAGE_KEYS = {
  // Secure storage keys
  AUTH_TOKENS: 'auth_tokens',
  BIOMETRIC_ENABLED: 'biometric_enabled',
  USER_CREDENTIALS: 'user_credentials',

  // Regular storage keys
  USER_PROFILE: 'user_profile',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  PUSH_TOKEN: 'push_token',
  THEME_MODE: 'theme_mode',
  LANGUAGE: 'language',
  LAST_SYNC: 'last_sync',
  OFFLINE_QUEUE: 'offline_queue',
  CACHED_APPOINTMENTS: 'cached_appointments',
  CACHED_MESSAGES: 'cached_messages',
  CACHED_RECORDS: 'cached_records',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

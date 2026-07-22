import { createMMKV } from 'react-native-mmkv';
import { Platform } from 'react-native';

// @ts-ignore
export const storage = Platform.OS !== 'web' ? createMMKV() : {
  getString: () => null,
  set: () => {},
  delete: () => {},
  clearAll: () => {}
} as any;

export const localCache = {
  get: (key: string): string | null => {
    try {
      const value = storage.getString(key);
      return value ?? null;
    } catch (error) {
      console.error('Error getting item from cache', error);
      return null;
    }
  },

  set: (key: string, value: string): void => {
    try {
      storage.set(key, value);
    } catch (error) {
      console.error('Error setting item in cache', error);
    }
  },

  remove: (key: string): void => {
    try {
      storage.delete(key);
    } catch (error) {
      console.error('Error removing item from cache', error);
    }
  },

  clear: (): void => {
    try {
      storage.clearAll();
    } catch (error) {
      console.error('Error clearing cache', error);
    }
  }
};

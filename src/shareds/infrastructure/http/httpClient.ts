import axios from 'axios';
import { localCache } from '../storage/localCache';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.copa2026.example.com';

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar o token
httpClient.interceptors.request.use(
  (config) => {
    const token = localCache.get('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de erro e possivel retry/refresh
httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // TODO: Implementar lógica de refresh token se 401
    return Promise.reject(error);
  }
);

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import NetInfo from '@react-native-community/netinfo';
import { secureStorage, storage, STORAGE_KEYS } from '@/services/storage';
import { ApiResponse, AuthTokens, ApiError } from '@/types';

// API Configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';
const REQUEST_TIMEOUT = 30000;

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Token management
class TokenManager {
  private tokens: AuthTokens | null = null;
  private refreshPromise: Promise<AuthTokens | null> | null = null;

  async getTokens(): Promise<AuthTokens | null> {
    if (this.tokens) return this.tokens;
    this.tokens = await secureStorage.getJSON<AuthTokens>(STORAGE_KEYS.AUTH_TOKENS);
    return this.tokens;
  }

  async setTokens(tokens: AuthTokens): Promise<void> {
    this.tokens = tokens;
    await secureStorage.setJSON(STORAGE_KEYS.AUTH_TOKENS, tokens);
  }

  async clearTokens(): Promise<void> {
    this.tokens = null;
    await secureStorage.remove(STORAGE_KEYS.AUTH_TOKENS);
  }

  async refreshTokens(): Promise<AuthTokens | null> {
    // Prevent multiple simultaneous refresh attempts
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this._doRefresh();
    const result = await this.refreshPromise;
    this.refreshPromise = null;
    return result;
  }

  private async _doRefresh(): Promise<AuthTokens | null> {
    const tokens = await this.getTokens();
    if (!tokens?.refreshToken) return null;

    try {
      const response = await axios.post<{ tokens: AuthTokens }>(
        `${API_BASE_URL}/auth/refresh`,
        { refreshToken: tokens.refreshToken },
        { timeout: REQUEST_TIMEOUT }
      );

      const newTokens = response.data.tokens;
      await this.setTokens(newTokens);
      return newTokens;
    } catch (error) {
      await this.clearTokens();
      return null;
    }
  }

  isTokenExpired(tokens: AuthTokens): boolean {
    // Add 60 second buffer
    return Date.now() >= tokens.expiresAt - 60000;
  }
}

export const tokenManager = new TokenManager();

// Offline queue for requests
interface QueuedRequest {
  id: string;
  method: string;
  url: string;
  data?: unknown;
  timestamp: number;
}

class OfflineQueue {
  private queue: QueuedRequest[] = [];

  async load(): Promise<void> {
    const saved = await storage.getJSON<QueuedRequest[]>(STORAGE_KEYS.OFFLINE_QUEUE);
    this.queue = saved || [];
  }

  async save(): Promise<void> {
    await storage.setJSON(STORAGE_KEYS.OFFLINE_QUEUE, this.queue);
  }

  add(request: Omit<QueuedRequest, 'id' | 'timestamp'>): string {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    this.queue.push({
      ...request,
      id,
      timestamp: Date.now(),
    });
    this.save();
    return id;
  }

  remove(id: string): void {
    this.queue = this.queue.filter((r) => r.id !== id);
    this.save();
  }

  getAll(): QueuedRequest[] {
    return [...this.queue];
  }

  clear(): void {
    this.queue = [];
    this.save();
  }
}

export const offlineQueue = new OfflineQueue();

// Network status
let isOnline = true;
NetInfo.addEventListener((state) => {
  isOnline = state.isConnected ?? false;
});

export const isNetworkAvailable = (): boolean => isOnline;

// Request interceptor
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Check network
    if (!isOnline) {
      return Promise.reject(new Error('No network connection'));
    }

    // Add auth token
    const tokens = await tokenManager.getTokens();
    if (tokens?.accessToken) {
      // Check if token needs refresh
      if (tokenManager.isTokenExpired(tokens)) {
        const newTokens = await tokenManager.refreshTokens();
        if (newTokens) {
          config.headers.Authorization = `Bearer ${newTokens.accessToken}`;
        }
      } else {
        config.headers.Authorization = `Bearer ${tokens.accessToken}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const newTokens = await tokenManager.refreshTokens();
      if (newTokens) {
        originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
        return apiClient(originalRequest);
      }

      // Token refresh failed, clear tokens and reject
      await tokenManager.clearTokens();
    }

    return Promise.reject(error);
  }
);

// API helper functions
function handleError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; error?: string; code?: string }>;
    return {
      code: axiosError.response?.data?.code || 'UNKNOWN_ERROR',
      message:
        axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        axiosError.message ||
        'An unexpected error occurred',
    };
  }

  if (error instanceof Error) {
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message,
    };
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred',
  };
}

export async function get<T>(
  url: string,
  params?: Record<string, unknown>
): Promise<ApiResponse<T>> {
  try {
    const response = await apiClient.get<T>(url, { params });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: handleError(error) };
  }
}

export async function post<T>(
  url: string,
  data?: unknown,
  options?: { offlineQueue?: boolean }
): Promise<ApiResponse<T>> {
  try {
    const response = await apiClient.post<T>(url, data);
    return { success: true, data: response.data };
  } catch (error) {
    // Queue for offline if enabled and network error
    if (options?.offlineQueue && !isOnline) {
      offlineQueue.add({ method: 'POST', url, data });
      return {
        success: false,
        error: {
          code: 'OFFLINE_QUEUED',
          message: 'Request queued for when network is available',
        },
      };
    }
    return { success: false, error: handleError(error) };
  }
}

export async function put<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
  try {
    const response = await apiClient.put<T>(url, data);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: handleError(error) };
  }
}

export async function patch<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
  try {
    const response = await apiClient.patch<T>(url, data);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: handleError(error) };
  }
}

export async function del<T>(url: string): Promise<ApiResponse<T>> {
  try {
    const response = await apiClient.delete<T>(url);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: handleError(error) };
  }
}

// Process offline queue when back online
export async function processOfflineQueue(): Promise<void> {
  if (!isOnline) return;

  const requests = offlineQueue.getAll();
  for (const request of requests) {
    try {
      switch (request.method) {
        case 'POST':
          await apiClient.post(request.url, request.data);
          break;
        case 'PUT':
          await apiClient.put(request.url, request.data);
          break;
        case 'PATCH':
          await apiClient.patch(request.url, request.data);
          break;
        case 'DELETE':
          await apiClient.delete(request.url);
          break;
      }
      offlineQueue.remove(request.id);
    } catch (error) {
      console.error('Failed to process offline request:', request.id, error);
    }
  }
}

// Listen for network restoration
NetInfo.addEventListener((state) => {
  if (state.isConnected) {
    processOfflineQueue();
  }
});

export default apiClient;

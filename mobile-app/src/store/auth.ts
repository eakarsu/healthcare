import { create } from 'zustand';
import * as LocalAuthentication from 'expo-local-authentication';
import { User, LoginRequest, RegisterRequest, TwoFactorRequest, AuthTokens } from '@/types';
import { post, get, tokenManager } from '@/api/client';
import { secureStorage, storage, STORAGE_KEYS } from '@/services/storage';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  requiresTwoFactor: boolean;
  twoFactorToken: string | null;
  biometricEnabled: boolean;
  biometricAvailable: boolean;
}

interface AuthActions {
  initialize: () => Promise<void>;
  login: (credentials: LoginRequest) => Promise<boolean>;
  verifyTwoFactor: (request: TwoFactorRequest) => Promise<boolean>;
  register: (data: RegisterRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  checkBiometricAvailability: () => Promise<void>;
  authenticateWithBiometric: () => Promise<boolean>;
  enableBiometric: (enable: boolean) => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User) => void;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,
  requiresTwoFactor: false,
  twoFactorToken: null,
  biometricEnabled: false,
  biometricAvailable: false,
};

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
  ...initialState,

  initialize: async () => {
    set({ isLoading: true });

    try {
      // Check biometric availability
      await get().checkBiometricAvailability();

      // Check for existing tokens
      const tokens = await tokenManager.getTokens();
      if (tokens && !tokenManager.isTokenExpired(tokens)) {
        // Fetch user profile
        const response = await get().refreshUser();
      } else {
        await tokenManager.clearTokens();
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    }

    set({ isLoading: false, isInitialized: true });
  },

  login: async (credentials: LoginRequest) => {
    set({ isLoading: true, error: null });

    const response = await post<{
      user: User;
      tokens: AuthTokens;
      requiresTwoFactor?: boolean;
      twoFactorToken?: string;
    }>('/auth/login', credentials);

    if (!response.success) {
      set({
        isLoading: false,
        error: response.error?.message || 'Login failed',
      });
      return false;
    }

    const data = response.data!;

    if (data.requiresTwoFactor) {
      set({
        isLoading: false,
        requiresTwoFactor: true,
        twoFactorToken: data.twoFactorToken || null,
      });
      return true;
    }

    await tokenManager.setTokens(data.tokens);
    await storage.setJSON(STORAGE_KEYS.USER_PROFILE, data.user);

    set({
      user: data.user,
      isAuthenticated: true,
      isLoading: false,
      requiresTwoFactor: false,
      twoFactorToken: null,
    });

    return true;
  },

  verifyTwoFactor: async (request: TwoFactorRequest) => {
    const { twoFactorToken } = get();
    if (!twoFactorToken) {
      set({ error: 'No two-factor token available' });
      return false;
    }

    set({ isLoading: true, error: null });

    const response = await post<{ user: User; tokens: AuthTokens }>(
      '/auth/verify-2fa',
      { ...request, twoFactorToken }
    );

    if (!response.success) {
      set({
        isLoading: false,
        error: response.error?.message || 'Verification failed',
      });
      return false;
    }

    const data = response.data!;
    await tokenManager.setTokens(data.tokens);
    await storage.setJSON(STORAGE_KEYS.USER_PROFILE, data.user);

    set({
      user: data.user,
      isAuthenticated: true,
      isLoading: false,
      requiresTwoFactor: false,
      twoFactorToken: null,
    });

    return true;
  },

  register: async (data: RegisterRequest) => {
    set({ isLoading: true, error: null });

    const response = await post<{ user: User; tokens: AuthTokens }>(
      '/auth/register',
      data
    );

    if (!response.success) {
      set({
        isLoading: false,
        error: response.error?.message || 'Registration failed',
      });
      return false;
    }

    const result = response.data!;
    await tokenManager.setTokens(result.tokens);
    await storage.setJSON(STORAGE_KEYS.USER_PROFILE, result.user);

    set({
      user: result.user,
      isAuthenticated: true,
      isLoading: false,
    });

    return true;
  },

  logout: async () => {
    set({ isLoading: true });

    try {
      await post('/auth/logout');
    } catch {
      // Ignore errors
    }

    await tokenManager.clearTokens();
    await storage.remove(STORAGE_KEYS.USER_PROFILE);

    set({
      ...initialState,
      isInitialized: true,
      biometricAvailable: get().biometricAvailable,
    });
  },

  checkBiometricAvailability: async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      const biometricEnabled = await secureStorage.get(STORAGE_KEYS.BIOMETRIC_ENABLED) === 'true';

      set({
        biometricAvailable: compatible && enrolled,
        biometricEnabled: biometricEnabled && compatible && enrolled,
      });
    } catch {
      set({ biometricAvailable: false, biometricEnabled: false });
    }
  },

  authenticateWithBiometric: async () => {
    const { biometricEnabled, biometricAvailable } = get();
    if (!biometricEnabled || !biometricAvailable) return false;

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access PracticeFlux',
        fallbackLabel: 'Use password',
        cancelLabel: 'Cancel',
      });

      if (result.success) {
        // Get stored credentials and login
        const credentials = await secureStorage.getJSON<LoginRequest>(
          STORAGE_KEYS.USER_CREDENTIALS
        );
        if (credentials) {
          return await get().login(credentials);
        }
      }

      return false;
    } catch {
      return false;
    }
  },

  enableBiometric: async (enable: boolean) => {
    await secureStorage.set(STORAGE_KEYS.BIOMETRIC_ENABLED, String(enable));
    set({ biometricEnabled: enable });
  },

  refreshUser: async () => {
    const response = await get<User>('/auth/me');

    if (response.success && response.data) {
      await storage.setJSON(STORAGE_KEYS.USER_PROFILE, response.data);
      set({
        user: response.data,
        isAuthenticated: true,
      });
    } else {
      await tokenManager.clearTokens();
      set({
        user: null,
        isAuthenticated: false,
      });
    }
  },

  clearError: () => set({ error: null }),

  setUser: (user: User) => set({ user }),
}));

export default useAuthStore;

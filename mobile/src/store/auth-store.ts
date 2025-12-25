import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { User, LoginCredentials, RegisterData, TwoFactorVerification } from '@/types';
import { authApi } from '@/api';
import { tokenManager } from '@/lib/api-client';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  twoFactorToken: string | null;
  requiresTwoFactor: boolean;
}

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  verifyTwoFactor: (verification: TwoFactorVerification) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User) => void;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  twoFactorToken: null,
  requiresTwoFactor: false,
};

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
  ...initialState,

  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });

    const response = await authApi.login(credentials);

    if (!response.success) {
      set({ isLoading: false, error: response.error || 'Login failed' });
      return false;
    }

    if (response.data?.requiresTwoFactor) {
      set({
        isLoading: false,
        requiresTwoFactor: true,
        twoFactorToken: response.data.twoFactorToken || null,
      });
      return true;
    }

    if (response.data?.user) {
      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
        requiresTwoFactor: false,
        twoFactorToken: null,
      });
      return true;
    }

    set({ isLoading: false, error: 'Unexpected error' });
    return false;
  },

  verifyTwoFactor: async (verification: TwoFactorVerification) => {
    const { twoFactorToken } = get();
    if (!twoFactorToken) {
      set({ error: 'No two-factor token available' });
      return false;
    }

    set({ isLoading: true, error: null });

    const response = await authApi.verifyTwoFactor(twoFactorToken, verification);

    if (!response.success) {
      set({ isLoading: false, error: response.error || 'Verification failed' });
      return false;
    }

    if (response.data?.user) {
      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
        requiresTwoFactor: false,
        twoFactorToken: null,
      });
      return true;
    }

    set({ isLoading: false, error: 'Unexpected error' });
    return false;
  },

  register: async (data: RegisterData) => {
    set({ isLoading: true, error: null });

    const response = await authApi.register(data);

    if (!response.success) {
      set({ isLoading: false, error: response.error || 'Registration failed' });
      return false;
    }

    if (response.data?.user) {
      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    }

    set({ isLoading: false, error: 'Unexpected error' });
    return false;
  },

  logout: async () => {
    set({ isLoading: true });
    await authApi.logout();
    set({ ...initialState, isLoading: false });
  },

  checkAuth: async () => {
    set({ isLoading: true });

    const token = await tokenManager.getToken();
    if (!token) {
      set({ ...initialState, isLoading: false });
      return;
    }

    const response = await authApi.getCurrentUser();

    if (response.success && response.data) {
      set({
        user: response.data,
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      await tokenManager.clearTokens();
      set({ ...initialState, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),

  setUser: (user: User) => set({ user }),
}));

export default useAuthStore;

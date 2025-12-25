import { post, get } from '@/lib/api-client';
import { tokenManager } from '@/lib/api-client';
import {
  User,
  LoginCredentials,
  RegisterData,
  TwoFactorVerification,
  ApiResponse,
} from '@/types';

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  requiresTwoFactor?: boolean;
  twoFactorToken?: string;
}

interface TwoFactorResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    const response = await post<AuthResponse>('/auth/login', credentials);

    if (response.success && response.data && !response.data.requiresTwoFactor) {
      await tokenManager.setToken(response.data.accessToken);
      await tokenManager.setRefreshToken(response.data.refreshToken);
    }

    return response;
  },

  /**
   * Verify 2FA code
   */
  async verifyTwoFactor(
    twoFactorToken: string,
    verification: TwoFactorVerification
  ): Promise<ApiResponse<TwoFactorResponse>> {
    const response = await post<TwoFactorResponse>('/auth/verify-2fa', {
      twoFactorToken,
      ...verification,
    });

    if (response.success && response.data) {
      await tokenManager.setToken(response.data.accessToken);
      await tokenManager.setRefreshToken(response.data.refreshToken);
    }

    return response;
  },

  /**
   * Register a new patient account
   */
  async register(data: RegisterData): Promise<ApiResponse<AuthResponse>> {
    const response = await post<AuthResponse>('/auth/register', data);

    if (response.success && response.data) {
      await tokenManager.setToken(response.data.accessToken);
      await tokenManager.setRefreshToken(response.data.refreshToken);
    }

    return response;
  },

  /**
   * Logout - clear tokens
   */
  async logout(): Promise<void> {
    try {
      await post('/auth/logout');
    } finally {
      await tokenManager.clearTokens();
    }
  },

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return get<User>('/auth/me');
  },

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<ApiResponse<{ message: string }>> {
    return post<{ message: string }>('/auth/forgot-password', { email });
  },

  /**
   * Reset password with token
   */
  async resetPassword(
    token: string,
    newPassword: string
  ): Promise<ApiResponse<{ message: string }>> {
    return post<{ message: string }>('/auth/reset-password', {
      token,
      newPassword,
    });
  },

  /**
   * Change password (authenticated)
   */
  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<ApiResponse<{ message: string }>> {
    return post<{ message: string }>('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  },

  /**
   * Enable 2FA - get QR code
   */
  async enableTwoFactor(): Promise<
    ApiResponse<{ qrCode: string; secret: string }>
  > {
    return post<{ qrCode: string; secret: string }>('/auth/enable-2fa');
  },

  /**
   * Confirm 2FA setup with verification code
   */
  async confirmTwoFactor(code: string): Promise<ApiResponse<{ backupCodes: string[] }>> {
    return post<{ backupCodes: string[] }>('/auth/confirm-2fa', { code });
  },

  /**
   * Disable 2FA
   */
  async disableTwoFactor(password: string): Promise<ApiResponse<{ message: string }>> {
    return post<{ message: string }>('/auth/disable-2fa', { password });
  },

  /**
   * Check if user is authenticated (has valid token)
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await tokenManager.getToken();
    if (!token) return false;

    const response = await this.getCurrentUser();
    return response.success;
  },
};

export default authApi;

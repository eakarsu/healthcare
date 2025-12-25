import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:local_auth/local_auth.dart';

import '../../../core/api/api_client.dart';
import '../../../core/models/user.dart';
import '../../../core/storage/storage_service.dart';

// Auth state
class AuthState {
  final User? user;
  final bool isLoading;
  final bool isAuthenticated;
  final String? error;
  final BiometricType? biometricType;
  final bool isBiometricEnabled;

  const AuthState({
    this.user,
    this.isLoading = false,
    this.isAuthenticated = false,
    this.error,
    this.biometricType,
    this.isBiometricEnabled = false,
  });

  AuthState copyWith({
    User? user,
    bool? isLoading,
    bool? isAuthenticated,
    String? error,
    BiometricType? biometricType,
    bool? isBiometricEnabled,
  }) {
    return AuthState(
      user: user ?? this.user,
      isLoading: isLoading ?? this.isLoading,
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      error: error,
      biometricType: biometricType ?? this.biometricType,
      isBiometricEnabled: isBiometricEnabled ?? this.isBiometricEnabled,
    );
  }
}

enum BiometricType { none, fingerprint, face, iris }

// Auth notifier
class AuthNotifier extends StateNotifier<AuthState> {
  final ApiClient _apiClient;
  final LocalAuthentication _localAuth = LocalAuthentication();

  AuthNotifier(this._apiClient) : super(const AuthState()) {
    _initialize();
  }

  Future<void> _initialize() async {
    state = state.copyWith(isLoading: true);

    try {
      // Check biometric availability
      final biometricType = await _getBiometricType();
      final isBiometricEnabled = StorageService.instance.isBiometricEnabled();

      // Check for existing session
      final hasToken = await StorageService.instance.hasValidToken();
      if (hasToken) {
        final user = StorageService.instance.getUser();
        if (user != null) {
          state = state.copyWith(
            user: user,
            isAuthenticated: true,
            isLoading: false,
            biometricType: biometricType,
            isBiometricEnabled: isBiometricEnabled,
          );

          // Refresh user data in background
          _refreshUser();
          return;
        }
      }

      state = state.copyWith(
        isLoading: false,
        biometricType: biometricType,
        isBiometricEnabled: isBiometricEnabled,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  Future<BiometricType> _getBiometricType() async {
    try {
      final canCheck = await _localAuth.canCheckBiometrics;
      if (!canCheck) return BiometricType.none;

      final availableBiometrics = await _localAuth.getAvailableBiometrics();
      if (availableBiometrics.contains(BiometricType.face)) {
        return BiometricType.face;
      } else if (availableBiometrics.contains(BiometricType.fingerprint)) {
        return BiometricType.fingerprint;
      } else if (availableBiometrics.contains(BiometricType.iris)) {
        return BiometricType.iris;
      }
      return BiometricType.none;
    } catch (e) {
      return BiometricType.none;
    }
  }

  Future<void> login(String email, String password) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final response = await _apiClient.login(email, password);
      final authResponse = AuthResponse.fromJson(response);

      await StorageService.instance.saveTokens(
        authResponse.accessToken,
        authResponse.refreshToken,
      );
      await StorageService.instance.saveUser(authResponse.user);

      state = state.copyWith(
        user: authResponse.user,
        isAuthenticated: true,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: _parseError(e),
      );
      rethrow;
    }
  }

  Future<void> loginWithBiometric() async {
    if (!state.isBiometricEnabled) {
      throw Exception('Biometric authentication is not enabled');
    }

    state = state.copyWith(isLoading: true, error: null);

    try {
      final authenticated = await _localAuth.authenticate(
        localizedReason: 'Sign in to PracticeFlux',
        options: const AuthenticationOptions(
          stickyAuth: true,
          biometricOnly: true,
        ),
      );

      if (authenticated) {
        final hasToken = await StorageService.instance.hasValidToken();
        if (hasToken) {
          final user = StorageService.instance.getUser();
          if (user != null) {
            state = state.copyWith(
              user: user,
              isAuthenticated: true,
              isLoading: false,
            );
            return;
          }
        }
        throw Exception('No stored credentials found');
      } else {
        throw Exception('Biometric authentication failed');
      }
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: _parseError(e),
      );
      rethrow;
    }
  }

  Future<void> enableBiometric() async {
    if (state.biometricType == BiometricType.none) {
      throw Exception('Biometric authentication is not available');
    }

    final authenticated = await _localAuth.authenticate(
      localizedReason: 'Enable biometric login',
      options: const AuthenticationOptions(
        stickyAuth: true,
        biometricOnly: true,
      ),
    );

    if (authenticated) {
      await StorageService.instance.setBiometricEnabled(true);
      state = state.copyWith(isBiometricEnabled: true);
    }
  }

  Future<void> disableBiometric() async {
    await StorageService.instance.setBiometricEnabled(false);
    state = state.copyWith(isBiometricEnabled: false);
  }

  Future<void> logout() async {
    state = state.copyWith(isLoading: true);

    try {
      await _apiClient.logout();
    } catch (e) {
      debugPrint('Logout error: $e');
    }

    await StorageService.instance.clearAll();

    state = const AuthState();
  }

  Future<void> _refreshUser() async {
    try {
      final response = await _apiClient.getCurrentUser();
      final user = User.fromJson(response);
      await StorageService.instance.saveUser(user);
      state = state.copyWith(user: user);
    } catch (e) {
      if (e.toString().contains('401')) {
        await logout();
      }
    }
  }

  Future<void> updateProfile(User user) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final response = await _apiClient.updateProfile(user.toJson());
      final updatedUser = User.fromJson(response);
      await StorageService.instance.saveUser(updatedUser);
      state = state.copyWith(user: updatedUser, isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: _parseError(e));
      rethrow;
    }
  }

  Future<void> changePassword(String currentPassword, String newPassword) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      await _apiClient.changePassword(currentPassword, newPassword);
      state = state.copyWith(isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: _parseError(e));
      rethrow;
    }
  }

  String _parseError(dynamic error) {
    if (error.toString().contains('401')) {
      return 'Invalid email or password';
    }
    return error.toString();
  }
}

// Provider
final authStateProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(ref.watch(apiClientProvider));
});

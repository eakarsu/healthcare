import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/auth';
import { Text, Button, Input, Card } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { spacing, borderRadius } from '@/theme';

export default function LoginScreen() {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const {
    login,
    authenticateWithBiometric,
    isLoading,
    error,
    clearError,
    requiresTwoFactor,
    biometricEnabled,
    biometricAvailable,
  } = useAuthStore();

  const handleLogin = async () => {
    clearError();
    if (!email || !password) return;

    const success = await login({ email, password, rememberMe });
    if (success) {
      if (requiresTwoFactor) {
        router.push('/(auth)/verify-2fa');
      } else {
        router.replace('/(tabs)/home');
      }
    }
  };

  const handleBiometricLogin = async () => {
    const success = await authenticateWithBiometric();
    if (success) {
      router.replace('/(tabs)/home');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo & Header */}
          <View style={styles.header}>
            <View style={[styles.logoContainer, { backgroundColor: theme.colors.primaryLight }]}>
              <Ionicons name="medical" size={48} color={theme.colors.primary} />
            </View>
            <Text variant="h2" align="center" style={styles.title}>
              Welcome Back
            </Text>
            <Text variant="body" color={theme.colors.textSecondary} align="center">
              Sign in to access your health portal
            </Text>
          </View>

          {/* Error Message */}
          {error && (
            <Card variant="filled" style={styles.errorCard}>
              <View style={styles.errorContent}>
                <Ionicons name="alert-circle" size={20} color={theme.colors.error} />
                <Text variant="bodySmall" color={theme.colors.error} style={styles.errorText}>
                  {error}
                </Text>
              </View>
            </Card>
          )}

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              leftIcon="mail-outline"
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
              leftIcon="lock-closed-outline"
            />

            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={styles.rememberMe}
                onPress={() => setRememberMe(!rememberMe)}
              >
                <View
                  style={[
                    styles.checkbox,
                    rememberMe && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
                  ]}
                >
                  {rememberMe && <Ionicons name="checkmark" size={14} color={theme.colors.onPrimary} />}
                </View>
                <Text variant="bodySmall" color={theme.colors.textSecondary}>
                  Remember me
                </Text>
              </TouchableOpacity>

              <Link href="/(auth)/forgot-password" asChild>
                <TouchableOpacity>
                  <Text variant="bodySmall" color={theme.colors.primary} weight="500">
                    Forgot password?
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={isLoading}
              fullWidth
              size="lg"
            />

            {/* Biometric Login */}
            {biometricAvailable && biometricEnabled && (
              <TouchableOpacity style={styles.biometricButton} onPress={handleBiometricLogin}>
                <Ionicons name="finger-print" size={28} color={theme.colors.primary} />
                <Text variant="body" color={theme.colors.primary} weight="500">
                  Use Biometrics
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text variant="body" color={theme.colors.textSecondary}>
              Don't have an account?{' '}
            </Text>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity>
                <Text variant="body" color={theme.colors.primary} weight="600">
                  Create Account
                </Text>
              </TouchableOpacity>
            </Link>
          </View>

          {/* Security Badge */}
          <View style={styles.securityBadge}>
            <Ionicons name="shield-checkmark" size={16} color={theme.colors.success} />
            <Text variant="caption" color={theme.colors.textTertiary}>
              HIPAA-compliant secure connection
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing[6],
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing[8],
    marginTop: spacing[4],
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: borderRadius['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[6],
  },
  title: {
    marginBottom: spacing[2],
  },
  errorCard: {
    marginBottom: spacing[4],
    padding: spacing[4],
  },
  errorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  errorText: {
    flex: 1,
  },
  form: {
    flex: 1,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  rememberMe: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    marginTop: spacing[4],
    padding: spacing[4],
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing[8],
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[1],
    marginTop: spacing[6],
  },
});

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store';
import { Button } from '@/components/ui';
import { colors, spacing, typography, borderRadius } from '@/theme';

const CODE_LENGTH = 6;

export default function Verify2FAScreen() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [trustDevice, setTrustDevice] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const { verifyTwoFactor, isLoading, error, clearError } = useAuthStore();

  const handleCodeChange = (value: string, index: number) => {
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when complete
    if (index === CODE_LENGTH - 1 && value) {
      const fullCode = newCode.join('');
      if (fullCode.length === CODE_LENGTH) {
        handleVerify(fullCode);
      }
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (codeValue?: string) => {
    clearError();
    const fullCode = codeValue || code.join('');

    if (fullCode.length !== CODE_LENGTH) return;

    const success = await verifyTwoFactor({ code: fullCode, trustDevice });

    if (success) {
      router.replace('/(tabs)/appointments');
    }
  };

  const handleResendCode = () => {
    // TODO: Implement resend logic
    setCode(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={colors.gray[900]} />
            </TouchableOpacity>

            <View style={styles.iconContainer}>
              <Ionicons name="shield-checkmark" size={40} color={colors.primary[600]} />
            </View>

            <Text style={styles.title}>Two-Factor Authentication</Text>
            <Text style={styles.subtitle}>
              Enter the 6-digit code from your authenticator app
            </Text>
          </View>

          {/* Error */}
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color={colors.error[600]} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Code Input */}
          <View style={styles.codeContainer}>
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                style={[
                  styles.codeInput,
                  digit && styles.codeInputFilled,
                  error && styles.codeInputError,
                ]}
                value={digit}
                onChangeText={(value) => handleCodeChange(value.slice(-1), index)}
                onKeyPress={({ nativeEvent: { key } }) => handleKeyPress(key, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
              />
            ))}
          </View>

          {/* Trust Device */}
          <TouchableOpacity
            style={styles.trustContainer}
            onPress={() => setTrustDevice(!trustDevice)}
          >
            <View style={[styles.checkbox, trustDevice && styles.checkboxChecked]}>
              {trustDevice && (
                <Ionicons name="checkmark" size={14} color={colors.white} />
              )}
            </View>
            <Text style={styles.trustText}>
              Trust this device for 30 days
            </Text>
          </TouchableOpacity>

          {/* Verify Button */}
          <Button
            title="Verify"
            onPress={() => handleVerify()}
            loading={isLoading}
            fullWidth
            size="lg"
            disabled={code.join('').length !== CODE_LENGTH}
          />

          {/* Resend */}
          <TouchableOpacity style={styles.resendButton} onPress={handleResendCode}>
            <Text style={styles.resendText}>
              Didn't receive a code?{' '}
              <Text style={styles.resendLink}>Resend</Text>
            </Text>
          </TouchableOpacity>

          {/* Help */}
          <View style={styles.helpContainer}>
            <Ionicons name="help-circle-outline" size={20} color={colors.gray[400]} />
            <Text style={styles.helpText}>
              Having trouble? Contact support for assistance.
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing[6],
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: spacing[6],
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[6],
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[900],
    marginBottom: spacing[2],
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.gray[500],
    textAlign: 'center',
    lineHeight: 22,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error[50],
    padding: spacing[4],
    borderRadius: borderRadius.lg,
    marginBottom: spacing[4],
    gap: spacing[2],
  },
  errorText: {
    flex: 1,
    color: colors.error[700],
    fontSize: typography.fontSize.sm,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing[2],
    marginBottom: spacing[6],
  },
  codeInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: colors.gray[200],
    borderRadius: borderRadius.lg,
    textAlign: 'center',
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[900],
  },
  codeInputFilled: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  codeInputError: {
    borderColor: colors.error[500],
    backgroundColor: colors.error[50],
  },
  trustContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[6],
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.gray[300],
    marginRight: spacing[2],
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  trustText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
  },
  resendButton: {
    alignItems: 'center',
    marginTop: spacing[6],
  },
  resendText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
  },
  resendLink: {
    color: colors.primary[600],
    fontWeight: typography.fontWeight.medium,
  },
  helpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing[8],
    gap: spacing[1],
  },
  helpText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[400],
  },
});

import React, { forwardRef, useState, useCallback } from 'react';
import {
  View,
  TextInput,
  TextInputProps,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Text } from './Text';
import { spacing, borderRadius, fontSize as themeFontSize } from '@/theme';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  disabled?: boolean;
  required?: boolean;
  containerStyle?: ViewStyle;
  inputContainerStyle?: ViewStyle;
  size?: 'sm' | 'md' | 'lg';
}

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      onRightIconPress,
      disabled = false,
      required = false,
      containerStyle,
      inputContainerStyle,
      size = 'md',
      secureTextEntry,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const theme = useTheme();
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const focusAnim = useState(new Animated.Value(0))[0];

    const isPassword = secureTextEntry !== undefined;
    const showPassword = isPassword && isPasswordVisible;

    const handleFocus = useCallback(
      (e: any) => {
        setIsFocused(true);
        Animated.timing(focusAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: false,
        }).start();
        onFocus?.(e);
      },
      [focusAnim, onFocus]
    );

    const handleBlur = useCallback(
      (e: any) => {
        setIsFocused(false);
        Animated.timing(focusAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: false,
        }).start();
        onBlur?.(e);
      },
      [focusAnim, onBlur]
    );

    const togglePasswordVisibility = () => {
      setIsPasswordVisible(!isPasswordVisible);
    };

    const getSizeStyles = () => {
      switch (size) {
        case 'sm':
          return { height: 40, fontSize: themeFontSize.sm, iconSize: 18 };
        case 'md':
          return { height: 48, fontSize: themeFontSize.base, iconSize: 20 };
        case 'lg':
          return { height: 56, fontSize: themeFontSize.lg, iconSize: 22 };
        default:
          return { height: 48, fontSize: themeFontSize.base, iconSize: 20 };
      }
    };

    const sizeStyles = getSizeStyles();

    const borderColor = error
      ? theme.colors.error
      : isFocused
      ? theme.colors.inputBorderFocus
      : theme.colors.inputBorder;

    const containerBgColor = disabled
      ? theme.colors.disabled
      : theme.colors.inputBackground;

    return (
      <View style={[styles.container, containerStyle]}>
        {label && (
          <View style={styles.labelContainer}>
            <Text variant="label" color={theme.colors.textSecondary}>
              {label}
            </Text>
            {required && (
              <Text variant="label" color={theme.colors.error}>
                {' *'}
              </Text>
            )}
          </View>
        )}

        <View
          style={[
            styles.inputContainer,
            {
              height: sizeStyles.height,
              borderColor,
              backgroundColor: containerBgColor,
            },
            inputContainerStyle,
          ]}
        >
          {leftIcon && (
            <Ionicons
              name={leftIcon}
              size={sizeStyles.iconSize}
              color={error ? theme.colors.error : theme.colors.textTertiary}
              style={styles.leftIcon}
            />
          )}

          <TextInput
            ref={ref}
            style={[
              styles.input,
              {
                fontSize: sizeStyles.fontSize,
                color: theme.colors.text,
              },
              leftIcon && styles.inputWithLeftIcon,
              (rightIcon || isPassword) && styles.inputWithRightIcon,
            ]}
            placeholderTextColor={theme.colors.placeholder}
            editable={!disabled}
            secureTextEntry={isPassword && !showPassword}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />

          {isPassword && (
            <TouchableOpacity
              onPress={togglePasswordVisibility}
              style={styles.rightIconButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={sizeStyles.iconSize}
                color={theme.colors.textTertiary}
              />
            </TouchableOpacity>
          )}

          {rightIcon && !isPassword && (
            <TouchableOpacity
              onPress={onRightIconPress}
              style={styles.rightIconButton}
              disabled={!onRightIconPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={rightIcon}
                size={sizeStyles.iconSize}
                color={error ? theme.colors.error : theme.colors.textTertiary}
              />
            </TouchableOpacity>
          )}
        </View>

        {error && (
          <View style={styles.messageContainer}>
            <Ionicons
              name="alert-circle"
              size={14}
              color={theme.colors.error}
              style={styles.messageIcon}
            />
            <Text variant="caption" color={theme.colors.error}>
              {error}
            </Text>
          </View>
        )}

        {hint && !error && (
          <Text
            variant="caption"
            color={theme.colors.textTertiary}
            style={styles.hint}
          >
            {hint}
          </Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing[4],
  },
  labelContainer: {
    flexDirection: 'row',
    marginBottom: spacing[1.5],
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    paddingHorizontal: spacing[4],
    paddingVertical: 0,
  },
  inputWithLeftIcon: {
    paddingLeft: 0,
  },
  inputWithRightIcon: {
    paddingRight: 0,
  },
  leftIcon: {
    marginLeft: spacing[4],
  },
  rightIconButton: {
    padding: spacing[3],
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[1],
  },
  messageIcon: {
    marginRight: spacing[1],
  },
  hint: {
    marginTop: spacing[1],
  },
});

export default Input;

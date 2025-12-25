import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { Text } from './Text';
import { spacing, borderRadius, getShadow } from '@/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'success';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  haptic?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  haptic = true,
  style,
  textStyle,
  onPress,
  ...props
}) => {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const handlePress = async (event: any) => {
    if (haptic) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.(event);
  };

  const getVariantStyles = (): { container: ViewStyle; text: TextStyle; loader: string } => {
    const colors = theme.colors;

    switch (variant) {
      case 'primary':
        return {
          container: {
            backgroundColor: colors.primary,
            ...getShadow('sm'),
          },
          text: { color: colors.onPrimary },
          loader: colors.onPrimary,
        };
      case 'secondary':
        return {
          container: {
            backgroundColor: colors.secondaryLight,
          },
          text: { color: colors.text },
          loader: colors.text,
        };
      case 'outline':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderColor: colors.border,
          },
          text: { color: colors.text },
          loader: colors.text,
        };
      case 'ghost':
        return {
          container: {
            backgroundColor: 'transparent',
          },
          text: { color: colors.primary },
          loader: colors.primary,
        };
      case 'destructive':
        return {
          container: {
            backgroundColor: colors.error,
            ...getShadow('sm'),
          },
          text: { color: colors.onError },
          loader: colors.onError,
        };
      case 'success':
        return {
          container: {
            backgroundColor: colors.success,
            ...getShadow('sm'),
          },
          text: { color: colors.onSuccess },
          loader: colors.onSuccess,
        };
      default:
        return {
          container: { backgroundColor: colors.primary },
          text: { color: colors.onPrimary },
          loader: colors.onPrimary,
        };
    }
  };

  const getSizeStyles = (): { container: ViewStyle; text: TextStyle; iconSize: number } => {
    switch (size) {
      case 'xs':
        return {
          container: { height: 28, paddingHorizontal: spacing[2], gap: spacing[1] },
          text: { fontSize: 12 },
          iconSize: 14,
        };
      case 'sm':
        return {
          container: { height: 36, paddingHorizontal: spacing[3], gap: spacing[1.5] },
          text: { fontSize: 14 },
          iconSize: 16,
        };
      case 'md':
        return {
          container: { height: 44, paddingHorizontal: spacing[4], gap: spacing[2] },
          text: { fontSize: 16 },
          iconSize: 20,
        };
      case 'lg':
        return {
          container: { height: 52, paddingHorizontal: spacing[5], gap: spacing[2] },
          text: { fontSize: 18 },
          iconSize: 22,
        };
      case 'xl':
        return {
          container: { height: 60, paddingHorizontal: spacing[6], gap: spacing[2.5] },
          text: { fontSize: 20 },
          iconSize: 24,
        };
      default:
        return {
          container: { height: 44, paddingHorizontal: spacing[4], gap: spacing[2] },
          text: { fontSize: 16 },
          iconSize: 20,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  const containerStyle: ViewStyle = {
    ...styles.base,
    ...variantStyles.container,
    ...sizeStyles.container,
    ...(fullWidth && styles.fullWidth),
    ...(isDisabled && styles.disabled),
    ...style,
  };

  const labelStyle: TextStyle = {
    ...styles.text,
    ...variantStyles.text,
    ...sizeStyles.text,
    ...textStyle,
  };

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variantStyles.loader} />
      ) : (
        <>
          {leftIcon && <View style={styles.iconWrapper}>{leftIcon}</View>}
          <Text style={labelStyle} variant="button">
            {title}
          </Text>
          {rightIcon && <View style={styles.iconWrapper}>{rightIcon}</View>}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.lg,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '600',
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Button;

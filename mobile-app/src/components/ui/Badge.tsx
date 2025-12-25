import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Text } from './Text';
import { spacing, borderRadius } from '@/theme';

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  text: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: ViewStyle;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  text,
  variant = 'default',
  size = 'md',
  style,
  dot = false,
}) => {
  const theme = useTheme();

  const getVariantStyles = () => {
    const colors = theme.colors;
    switch (variant) {
      case 'primary':
        return { bg: colors.primaryLight, text: colors.primary };
      case 'success':
        return { bg: colors.successLight, text: colors.success };
      case 'warning':
        return { bg: colors.warningLight, text: colors.warning };
      case 'error':
        return { bg: colors.errorLight, text: colors.error };
      case 'info':
        return { bg: colors.infoLight, text: colors.info };
      default:
        return { bg: colors.backgroundTertiary, text: colors.textSecondary };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { px: spacing[1.5], py: spacing[0.5], fontSize: 10 };
      case 'md':
        return { px: spacing[2], py: spacing[0.5], fontSize: 12 };
      case 'lg':
        return { px: spacing[2.5], py: spacing[1], fontSize: 14 };
      default:
        return { px: spacing[2], py: spacing[0.5], fontSize: 12 };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: variantStyles.bg,
          paddingHorizontal: sizeStyles.px,
          paddingVertical: sizeStyles.py,
        },
        style,
      ]}
    >
      {dot && (
        <View
          style={[
            styles.dot,
            { backgroundColor: variantStyles.text },
          ]}
        />
      )}
      <Text
        style={{
          fontSize: sizeStyles.fontSize,
          fontWeight: '500',
          color: variantStyles.text,
        }}
      >
        {text}
      </Text>
    </View>
  );
};

// Specialized badges for common use cases
export const AppointmentStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getVariant = (): BadgeVariant => {
    switch (status?.toUpperCase()) {
      case 'SCHEDULED':
        return 'info';
      case 'CONFIRMED':
        return 'primary';
      case 'CHECKED_IN':
      case 'IN_PROGRESS':
        return 'warning';
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
      case 'NO_SHOW':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatStatus = (s: string) =>
    s?.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) || '';

  return <Badge text={formatStatus(status)} variant={getVariant()} size="sm" />;
};

export const PaymentStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getVariant = (): BadgeVariant => {
    switch (status?.toUpperCase()) {
      case 'PAID':
      case 'COMPLETED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'FAILED':
      case 'DECLINED':
        return 'error';
      case 'REFUNDED':
        return 'info';
      default:
        return 'default';
    }
  };

  return <Badge text={status} variant={getVariant()} size="sm" />;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
    gap: spacing[1],
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});

export default Badge;

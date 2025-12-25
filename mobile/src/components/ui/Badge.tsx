import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, spacing, borderRadius, typography } from '@/theme';

type BadgeVariant =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  text: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Badge({
  text,
  variant = 'default',
  size = 'md',
  style,
  textStyle,
}: BadgeProps) {
  const badgeStyles = [
    styles.badge,
    styles[`${variant}Badge`],
    styles[`${size}Badge`],
    style,
  ];

  const labelStyles = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    textStyle,
  ];

  return (
    <View style={badgeStyles}>
      <Text style={labelStyles}>{text}</Text>
    </View>
  );
}

// Appointment status badge helper
export function AppointmentStatusBadge({
  status,
}: {
  status: string;
}) {
  const getVariant = (): BadgeVariant => {
    switch (status) {
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
      case 'RESCHEDULED':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatStatus = (s: string) => {
    return s.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return <Badge text={formatStatus(status)} variant={getVariant()} size="sm" />;
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
  },
  text: {
    fontWeight: typography.fontWeight.medium,
  },

  // Variants
  defaultBadge: {
    backgroundColor: colors.gray[100],
  },
  primaryBadge: {
    backgroundColor: colors.primary[100],
  },
  successBadge: {
    backgroundColor: colors.success[100],
  },
  warningBadge: {
    backgroundColor: colors.warning[100],
  },
  errorBadge: {
    backgroundColor: colors.error[100],
  },
  infoBadge: {
    backgroundColor: colors.info[100],
  },

  defaultText: {
    color: colors.gray[700],
  },
  primaryText: {
    color: colors.primary[700],
  },
  successText: {
    color: colors.success[700],
  },
  warningText: {
    color: colors.warning[700],
  },
  errorText: {
    color: colors.error[700],
  },
  infoText: {
    color: colors.info[700],
  },

  // Sizes
  smBadge: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[0.5],
  },
  mdBadge: {
    paddingHorizontal: spacing[2.5],
    paddingVertical: spacing[1],
  },
  lgBadge: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1.5],
  },

  smText: {
    fontSize: typography.fontSize.xs,
  },
  mdText: {
    fontSize: typography.fontSize.sm,
  },
  lgText: {
    fontSize: typography.fontSize.base,
  },
});

export default Badge;

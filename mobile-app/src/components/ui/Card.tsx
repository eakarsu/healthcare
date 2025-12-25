import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  ViewProps,
  TouchableOpacityProps,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { Text } from './Text';
import { spacing, borderRadius, getShadow } from '@/theme';

export type CardVariant = 'elevated' | 'outlined' | 'filled';

export interface CardProps extends ViewProps {
  variant?: CardVariant;
  onPress?: () => void;
  disabled?: boolean;
  padding?: keyof typeof spacing | number;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'elevated',
  onPress,
  disabled = false,
  padding = 4,
  children,
  style,
  ...props
}) => {
  const theme = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: theme.colors.card,
          ...getShadow('md'),
        };
      case 'outlined':
        return {
          backgroundColor: theme.colors.card,
          borderWidth: 1,
          borderColor: theme.colors.cardBorder,
        };
      case 'filled':
        return {
          backgroundColor: theme.colors.backgroundSecondary,
        };
      default:
        return {
          backgroundColor: theme.colors.card,
          ...getShadow('md'),
        };
    }
  };

  const paddingValue = typeof padding === 'number' ? spacing[padding as keyof typeof spacing] || padding : spacing[padding];

  const containerStyle: ViewStyle = {
    ...styles.base,
    ...getVariantStyles(),
    padding: paddingValue,
    ...(disabled && styles.disabled),
    ...(style as ViewStyle),
  };

  const handlePressIn = () => {
    if (onPress) {
      scale.value = withSpring(0.98);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  if (onPress) {
    return (
      <Animated.View style={animatedStyle}>
        <TouchableOpacity
          style={containerStyle}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
          disabled={disabled}
          {...(props as TouchableOpacityProps)}
        >
          {children}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <View style={containerStyle} {...props}>
      {children}
    </View>
  );
};

export interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  style?: ViewStyle;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  action,
  style,
}) => {
  const theme = useTheme();

  return (
    <View style={[styles.header, style]}>
      <View style={styles.headerContent}>
        <Text variant="h5" color={theme.colors.text}>
          {title}
        </Text>
        {subtitle && (
          <Text
            variant="bodySmall"
            color={theme.colors.textSecondary}
            style={styles.subtitle}
          >
            {subtitle}
          </Text>
        )}
      </View>
      {action && <View style={styles.headerAction}>{action}</View>}
    </View>
  );
};

export interface CardContentProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const CardContent: React.FC<CardContentProps> = ({ children, style }) => (
  <View style={[styles.content, style]}>{children}</View>
);

export interface CardFooterProps {
  children: React.ReactNode;
  style?: ViewStyle;
  divider?: boolean;
}

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  style,
  divider = true,
}) => {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.footer,
        divider && { borderTopWidth: 1, borderTopColor: theme.colors.divider },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  disabled: {
    opacity: 0.6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing[3],
  },
  headerContent: {
    flex: 1,
  },
  subtitle: {
    marginTop: spacing[0.5],
  },
  headerAction: {
    marginLeft: spacing[3],
  },
  content: {},
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing[3],
    marginTop: spacing[3],
    gap: spacing[2],
  },
});

export default Card;

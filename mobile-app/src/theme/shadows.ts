import { Platform, ViewStyle } from 'react-native';
import { palette } from './colors';

/**
 * Shadow definitions for both iOS and Android
 */

interface Shadow {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

const createShadow = (
  offsetY: number,
  shadowRadius: number,
  shadowOpacity: number,
  elevation: number
): Shadow => ({
  shadowColor: palette.black,
  shadowOffset: { width: 0, height: offsetY },
  shadowOpacity,
  shadowRadius,
  elevation,
});

export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  } as Shadow,

  xs: createShadow(1, 1, 0.05, 1),
  sm: createShadow(1, 2, 0.06, 2),
  md: createShadow(2, 4, 0.08, 4),
  lg: createShadow(4, 8, 0.1, 8),
  xl: createShadow(8, 16, 0.12, 12),
  '2xl': createShadow(12, 24, 0.15, 16),

  // Inner shadow (simulated)
  inner: {
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 0,
  } as Shadow,
} as const;

/**
 * Get shadow style for a component
 */
export const getShadow = (size: keyof typeof shadows): ViewStyle => {
  const shadow = shadows[size];
  return Platform.select({
    ios: {
      shadowColor: shadow.shadowColor,
      shadowOffset: shadow.shadowOffset,
      shadowOpacity: shadow.shadowOpacity,
      shadowRadius: shadow.shadowRadius,
    },
    android: {
      elevation: shadow.elevation,
    },
    default: {},
  }) as ViewStyle;
};

export type ShadowSize = keyof typeof shadows;

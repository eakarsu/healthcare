import { Platform } from 'react-native';

// Color palette matching the web application
export const colors = {
  // Primary colors (cyan/teal - matching web)
  primary: {
    50: '#ecfeff',
    100: '#cffafe',
    200: '#a5f3fc',
    300: '#67e8f9',
    400: '#22d3ee',
    500: '#06b6d4',
    600: '#0891b2',
    700: '#0e7490',
    800: '#155e75',
    900: '#164e63',
    950: '#083344',
  },
  // Neutral grays
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },
  // Semantic colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
  },
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
  },
  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
  },
  // Pure colors
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
};

// Light theme
export const lightTheme = {
  colors: {
    // Backgrounds
    background: colors.white,
    backgroundSecondary: colors.gray[50],
    backgroundTertiary: colors.gray[100],
    card: colors.white,
    cardElevated: colors.white,

    // Text
    text: colors.gray[900],
    textSecondary: colors.gray[600],
    textTertiary: colors.gray[400],
    textInverse: colors.white,

    // Borders
    border: colors.gray[200],
    borderFocus: colors.primary[500],

    // Primary
    primary: colors.primary[600],
    primaryLight: colors.primary[100],
    primaryDark: colors.primary[700],

    // Status
    success: colors.success[600],
    successLight: colors.success[50],
    warning: colors.warning[600],
    warningLight: colors.warning[50],
    error: colors.error[600],
    errorLight: colors.error[50],
    info: colors.info[600],
    infoLight: colors.info[50],

    // Interactive
    link: colors.primary[600],
    disabled: colors.gray[300],
    placeholder: colors.gray[400],

    // Overlay
    overlay: 'rgba(0, 0, 0, 0.5)',

    // Tab bar
    tabBar: colors.white,
    tabBarBorder: colors.gray[200],
    tabBarActive: colors.primary[600],
    tabBarInactive: colors.gray[400],
  },
  shadows: {
    sm: {
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
    },
  },
};

// Dark theme
export const darkTheme = {
  colors: {
    // Backgrounds
    background: colors.gray[900],
    backgroundSecondary: colors.gray[800],
    backgroundTertiary: colors.gray[700],
    card: colors.gray[800],
    cardElevated: colors.gray[700],

    // Text
    text: colors.gray[50],
    textSecondary: colors.gray[300],
    textTertiary: colors.gray[500],
    textInverse: colors.gray[900],

    // Borders
    border: colors.gray[700],
    borderFocus: colors.primary[400],

    // Primary
    primary: colors.primary[400],
    primaryLight: colors.primary[900],
    primaryDark: colors.primary[300],

    // Status
    success: colors.success[500],
    successLight: 'rgba(34, 197, 94, 0.1)',
    warning: colors.warning[500],
    warningLight: 'rgba(245, 158, 11, 0.1)',
    error: colors.error[500],
    errorLight: 'rgba(239, 68, 68, 0.1)',
    info: colors.info[500],
    infoLight: 'rgba(59, 130, 246, 0.1)',

    // Interactive
    link: colors.primary[400],
    disabled: colors.gray[600],
    placeholder: colors.gray[500],

    // Overlay
    overlay: 'rgba(0, 0, 0, 0.7)',

    // Tab bar
    tabBar: colors.gray[900],
    tabBarBorder: colors.gray[800],
    tabBarActive: colors.primary[400],
    tabBarInactive: colors.gray[500],
  },
  shadows: {
    sm: {
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
  },
};

// Typography
export const typography = {
  fontFamily: {
    regular: Platform.select({
      ios: 'System',
      android: 'Roboto',
      default: 'System',
    }),
    medium: Platform.select({
      ios: 'System',
      android: 'Roboto-Medium',
      default: 'System',
    }),
    semibold: Platform.select({
      ios: 'System',
      android: 'Roboto-Medium',
      default: 'System',
    }),
    bold: Platform.select({
      ios: 'System',
      android: 'Roboto-Bold',
      default: 'System',
    }),
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

// Spacing
export const spacing = {
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
  28: 112,
  32: 128,
};

// Border radius
export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
};

// Animation durations
export const animation = {
  fast: 150,
  normal: 300,
  slow: 500,
};

// Export theme type
export type Theme = typeof lightTheme;
export type ThemeColors = Theme['colors'];

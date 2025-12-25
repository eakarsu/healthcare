import { palette } from './colors';
import { spacing, layout } from './spacing';
import { fontFamily, fontSize, lineHeight, fontWeight, letterSpacing, textVariants } from './typography';
import { shadows, getShadow } from './shadows';
import { borderRadius, borderWidth } from './borderRadius';

/**
 * Light theme colors
 */
export const lightColors = {
  // Backgrounds
  background: palette.white,
  backgroundSecondary: palette.gray[50],
  backgroundTertiary: palette.gray[100],
  surface: palette.white,
  surfaceElevated: palette.white,

  // Text
  text: palette.gray[900],
  textSecondary: palette.gray[600],
  textTertiary: palette.gray[400],
  textInverse: palette.white,
  textDisabled: palette.gray[300],

  // Borders
  border: palette.gray[200],
  borderSecondary: palette.gray[100],
  borderFocus: palette.primary[500],
  divider: palette.gray[100],

  // Primary
  primary: palette.primary[600],
  primaryLight: palette.primary[100],
  primaryDark: palette.primary[700],
  onPrimary: palette.white,

  // Secondary
  secondary: palette.gray[600],
  secondaryLight: palette.gray[100],
  onSecondary: palette.white,

  // Status colors
  success: palette.success[600],
  successLight: palette.success[50],
  onSuccess: palette.white,

  warning: palette.warning[600],
  warningLight: palette.warning[50],
  onWarning: palette.white,

  error: palette.error[600],
  errorLight: palette.error[50],
  onError: palette.white,

  info: palette.info[600],
  infoLight: palette.info[50],
  onInfo: palette.white,

  // Interactive states
  link: palette.primary[600],
  linkPressed: palette.primary[700],
  disabled: palette.gray[200],
  placeholder: palette.gray[400],
  skeleton: palette.gray[200],

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  scrim: 'rgba(0, 0, 0, 0.4)',

  // Tab bar
  tabBar: palette.white,
  tabBarBorder: palette.gray[200],
  tabBarActive: palette.primary[600],
  tabBarInactive: palette.gray[400],

  // Card
  card: palette.white,
  cardBorder: palette.gray[200],

  // Input
  inputBackground: palette.white,
  inputBorder: palette.gray[300],
  inputBorderFocus: palette.primary[500],
  inputPlaceholder: palette.gray[400],
};

/**
 * Dark theme colors
 */
export const darkColors = {
  // Backgrounds
  background: palette.gray[900],
  backgroundSecondary: palette.gray[800],
  backgroundTertiary: palette.gray[700],
  surface: palette.gray[800],
  surfaceElevated: palette.gray[700],

  // Text
  text: palette.gray[50],
  textSecondary: palette.gray[300],
  textTertiary: palette.gray[500],
  textInverse: palette.gray[900],
  textDisabled: palette.gray[600],

  // Borders
  border: palette.gray[700],
  borderSecondary: palette.gray[800],
  borderFocus: palette.primary[400],
  divider: palette.gray[800],

  // Primary
  primary: palette.primary[400],
  primaryLight: palette.primary[900],
  primaryDark: palette.primary[300],
  onPrimary: palette.gray[900],

  // Secondary
  secondary: palette.gray[400],
  secondaryLight: palette.gray[800],
  onSecondary: palette.gray[900],

  // Status colors
  success: palette.success[500],
  successLight: 'rgba(34, 197, 94, 0.15)',
  onSuccess: palette.gray[900],

  warning: palette.warning[500],
  warningLight: 'rgba(245, 158, 11, 0.15)',
  onWarning: palette.gray[900],

  error: palette.error[500],
  errorLight: 'rgba(239, 68, 68, 0.15)',
  onError: palette.white,

  info: palette.info[500],
  infoLight: 'rgba(59, 130, 246, 0.15)',
  onInfo: palette.white,

  // Interactive states
  link: palette.primary[400],
  linkPressed: palette.primary[300],
  disabled: palette.gray[700],
  placeholder: palette.gray[500],
  skeleton: palette.gray[700],

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',
  scrim: 'rgba(0, 0, 0, 0.6)',

  // Tab bar
  tabBar: palette.gray[900],
  tabBarBorder: palette.gray[800],
  tabBarActive: palette.primary[400],
  tabBarInactive: palette.gray[500],

  // Card
  card: palette.gray[800],
  cardBorder: palette.gray[700],

  // Input
  inputBackground: palette.gray[800],
  inputBorder: palette.gray[600],
  inputBorderFocus: palette.primary[400],
  inputPlaceholder: palette.gray[500],
};

export type ThemeColors = typeof lightColors;

/**
 * Animation durations
 */
export const animation = {
  fast: 150,
  normal: 250,
  slow: 400,
  verySlow: 600,
} as const;

/**
 * Z-index scale
 */
export const zIndex = {
  hide: -1,
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
  toast: 1700,
} as const;

/**
 * Create a theme object
 */
export const createTheme = (mode: 'light' | 'dark') => ({
  mode,
  colors: mode === 'light' ? lightColors : darkColors,
  palette,
  spacing,
  layout,
  typography: {
    fontFamily,
    fontSize,
    lineHeight,
    fontWeight,
    letterSpacing,
  },
  textVariants,
  shadows,
  getShadow,
  borderRadius,
  borderWidth,
  animation,
  zIndex,
});

export const lightTheme = createTheme('light');
export const darkTheme = createTheme('dark');

export type Theme = ReturnType<typeof createTheme>;

// Re-export everything
export { palette } from './colors';
export { spacing, layout } from './spacing';
export { fontFamily, fontSize, lineHeight, fontWeight, letterSpacing, textVariants } from './typography';
export { shadows, getShadow } from './shadows';
export { borderRadius, borderWidth } from './borderRadius';

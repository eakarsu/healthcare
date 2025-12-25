/**
 * Border radius scale
 */

export const borderRadius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
} as const;

export type BorderRadiusKey = keyof typeof borderRadius;
export type BorderRadiusValue = (typeof borderRadius)[BorderRadiusKey];

/**
 * Border widths
 */
export const borderWidth = {
  0: 0,
  1: 1,
  2: 2,
  4: 4,
  8: 8,
} as const;

export type BorderWidthKey = keyof typeof borderWidth;

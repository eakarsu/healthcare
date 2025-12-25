/**
 * Spacing scale based on 4px grid system
 */

export const spacing = {
  0: 0,
  px: 1,
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
  36: 144,
  40: 160,
  44: 176,
  48: 192,
  52: 208,
  56: 224,
  60: 240,
  64: 256,
  72: 288,
  80: 320,
  96: 384,
} as const;

export type SpacingKey = keyof typeof spacing;
export type SpacingValue = (typeof spacing)[SpacingKey];

/**
 * Helper to get spacing value
 */
export const getSpacing = (key: SpacingKey): number => spacing[key];

/**
 * Layout spacing constants
 */
export const layout = {
  screenPaddingHorizontal: spacing[4],
  screenPaddingVertical: spacing[4],
  cardPadding: spacing[4],
  sectionGap: spacing[6],
  itemGap: spacing[3],
  inputHeight: 48,
  buttonHeight: 48,
  iconSize: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 48,
  },
  avatar: {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64,
    xxl: 96,
  },
} as const;

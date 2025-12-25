import { useColorScheme } from 'react-native';
import { useMemo } from 'react';
import { lightTheme, darkTheme, Theme } from '@/theme';

/**
 * Hook to get the current theme based on system preference
 */
export const useTheme = (): Theme => {
  const colorScheme = useColorScheme();

  const theme = useMemo(() => {
    return colorScheme === 'dark' ? darkTheme : lightTheme;
  }, [colorScheme]);

  return theme;
};

/**
 * Hook to get theme colors only
 */
export const useColors = () => {
  const theme = useTheme();
  return theme.colors;
};

/**
 * Hook to check if dark mode is enabled
 */
export const useIsDarkMode = (): boolean => {
  const colorScheme = useColorScheme();
  return colorScheme === 'dark';
};

export default useTheme;

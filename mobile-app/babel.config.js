module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@': './src',
            '@/api': './src/api',
            '@/components': './src/components',
            '@/config': './src/config',
            '@/constants': './src/constants',
            '@/hooks': './src/hooks',
            '@/lib': './src/lib',
            '@/navigation': './src/navigation',
            '@/screens': './src/screens',
            '@/services': './src/services',
            '@/store': './src/store',
            '@/theme': './src/theme',
            '@/types': './src/types',
            '@/utils': './src/utils',
            '@/assets': './assets',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};

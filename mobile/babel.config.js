module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
            '@/components': './src/components',
            '@/lib': './src/lib',
            '@/hooks': './src/hooks',
            '@/store': './src/store',
            '@/types': './src/types',
            '@/api': './src/api',
            '@/theme': './src/theme',
          },
        },
      ],
    ],
  };
};

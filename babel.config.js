module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        alias: {
          '@react-native-community/slider': './js/Slider.js',
          'scheduler/tracing': 'scheduler/tracing-profiling'
        },
        cwd: 'babelrc',
      },
    ],
  ],
};

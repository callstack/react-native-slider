const path = require('path');
const pak = require('../package/package.json');

module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        extensions: ['.tsx', '.ts', '.js', '.json'],
        alias: {
          [pak.name]: path.join(__dirname, '..', 'package', 'dist/Slider.js'),
        },
      },
    ],
  ],
};

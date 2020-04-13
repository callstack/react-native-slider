/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

const blacklist = require('metro-config/src/defaults/blacklist');
const path = require('path');

module.exports = {
  resolver: {
    blacklistRE: blacklist([
      path.resolve(__dirname, 'src', 'android'),
      path.resolve(__dirname, 'example', 'android'),
    ])
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
};

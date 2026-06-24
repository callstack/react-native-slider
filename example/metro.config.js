const path = require('path');
const exclusionListModule = require('metro-config/private/defaults/exclusionList');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const packageRoot = path.resolve(__dirname, '../package');
const exampleNodeModules = path.resolve(__dirname, 'node_modules');
const packageNodeModules = path.resolve(packageRoot, 'node_modules');
const exclusionList = exclusionListModule.default ?? exclusionListModule;

const escapePath = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  watchFolders: [packageRoot],
  resolver: {
    blockList: exclusionList([
      new RegExp(`${escapePath(packageNodeModules)}\\/.*`),
    ]),
    extraNodeModules: {
      '@react-native-community/slider': packageRoot,
      react: path.resolve(exampleNodeModules, 'react'),
      'react-native': path.resolve(exampleNodeModules, 'react-native'),
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);

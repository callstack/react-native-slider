const path = require('path');
const babelInclude = require('@dealmore/craco-plugin-babel-include');
const webpack = require('webpack');

const LIB_PATH = `../package/dist/Slider.js`;

module.exports = {
  webpack: {
    alias: {
      'react-native$': 'react-native-web',
      '@react-native-community/slider': path.resolve(__dirname, LIB_PATH),
      // make sure we don't include multiple versions of react
      'react': path.resolve(__dirname, './node_modules/react'),
    },
    babel: {
      presets: [
        '@babel/preset-react',
        '@babel/preset-typescript',
      ],
      plugins: [
        '@babel/plugin-proposal-private-methods',
        '@babel/plugin-proposal-class-properties',
        '@babel/plugin-proposal-private-property-in-object',
      ],
    },
  },

  plugins: [
    {
      plugin: babelInclude,
      options: {
        include: [
          path.resolve(__dirname, LIB_PATH),
        ],
      },
    },
  ],
};

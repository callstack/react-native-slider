const path = require('path');
const babelInclude = require('@dealmore/craco-plugin-babel-include');
const webpack = require('webpack');

const LIB_PATH = `../package/src`;

module.exports = {
  webpack: {
    alias: {
      'react-native$': 'react-native-web',
      '@react-native-community/slider': path.resolve(__dirname, LIB_PATH),
      // make sure we don't include multiple versions of react
      'react': path.resolve(__dirname, './node_modules/react'),
    },
    configure: webpackConfig => {
      webpackConfig.resolve.extensions = [
        '.web.tsx',
        '.web.ts',
        '.web.js',
        ...webpackConfig.resolve.extensions.filter(
          extension =>
            !['.web.tsx', '.web.ts', '.web.js'].includes(extension),
        ),
      ];

      return webpackConfig;
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

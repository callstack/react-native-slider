const reactNativeConfig = require("@react-native/eslint-config/flat");
const prettierRecommended = require("eslint-plugin-prettier/recommended");

module.exports = [
  {
    ignores: ["dist/", "node_modules/"],
  },
  ...reactNativeConfig,
  prettierRecommended,
  {
    languageOptions: {
      globals: {
        element: "writable",
        by: "writable",
        device: "writable",
        jasmine: "writable",
      },
    },
  },
];

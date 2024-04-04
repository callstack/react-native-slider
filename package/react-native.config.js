let supportsCodegenConfig = false;
try {
  const rnCliAndroidVersion = require.main.require(
    '@react-native-community/cli-platform-android/package.json',
  ).version;
  const [major] = rnCliAndroidVersion.split('.');
  supportsCodegenConfig = major >= 9;
} catch (e) {
  // ignore
}

module.exports = {
  dependency: {
    platforms: {
      android: supportsCodegenConfig
        ? {
            libraryName: 'RNCSlider',
            componentDescriptors: ["RNCSliderComponentDescriptor"],
            cmakeListsPath: 'src/main/jni/CMakeLists.txt',
          }
        : {},
    },
  },
};

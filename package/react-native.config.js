module.exports = {
  dependency: {
    platforms: {
      android: {
        libraryName: 'RNCSlider',
        componentDescriptors: ['RNCSliderComponentDescriptor'],
        cmakeListsPath: 'src/main/jni/CMakeLists.txt',
      },
    },
  },
};

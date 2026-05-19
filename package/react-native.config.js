module.exports = {
  dependency: {
    platforms: {
      android: {
        libraryName: 'Slider',
        componentDescriptors: ['SliderViewComponentDescriptor'],
        cmakeListsPath: 'src/main/jni/CMakeLists.txt',
      },
    },
  },
};

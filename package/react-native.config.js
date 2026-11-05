module.exports = {
  dependency: {
    platforms: {
      android: {
        libraryName: "CallstackSlider",
        componentDescriptors: ["CallstackSliderComponentDescriptor"],
        cmakeListsPath: "src/main/jni/CMakeLists.txt",
      },
    },
  },
};

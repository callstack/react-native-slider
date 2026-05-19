cmake_minimum_required(VERSION 3.13)
set(CMAKE_VERBOSE_MAKEFILE on)

include(${REACT_ANDROID_DIR}/../ReactCommon/cmake-utils/react-native-flags.cmake)

set(LIB_LITERAL Slider)
set(LIB_TARGET_NAME react_codegen_${LIB_LITERAL})

set(LIB_ANDROID_DIR ${CMAKE_CURRENT_SOURCE_DIR}/../../..)
set(LIB_GENERATED_DIR ${LIB_ANDROID_DIR}/build/generated/source/codegen/jni)
set(LIB_COMPONENTS_DIR ${LIB_GENERATED_DIR}/react/renderer/components/${LIB_LITERAL})

file(GLOB LIB_CODEGEN_SRCS CONFIGURE_DEPENDS ${LIB_GENERATED_DIR}/*.cpp ${LIB_COMPONENTS_DIR}/*.cpp)

add_library(
  ${LIB_TARGET_NAME}
  OBJECT
  ${LIB_CODEGEN_SRCS}
)

target_include_directories(
  ${LIB_TARGET_NAME}
  PUBLIC
  ${CMAKE_CURRENT_SOURCE_DIR}
  ${LIB_GENERATED_DIR}
  ${LIB_COMPONENTS_DIR}
)

target_include_directories(
  ${CMAKE_PROJECT_NAME}
  PUBLIC
  ${CMAKE_CURRENT_SOURCE_DIR}
  ${LIB_GENERATED_DIR}
  ${LIB_COMPONENTS_DIR}
)

target_link_libraries(
  ${LIB_TARGET_NAME}
  fbjni
  jsi
  reactnative
)

target_compile_reactnative_options(${LIB_TARGET_NAME} PRIVATE)

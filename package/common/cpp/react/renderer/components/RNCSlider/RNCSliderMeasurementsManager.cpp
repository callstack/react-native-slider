#ifdef ANDROID
#include "RNCSliderMeasurementsManager.h"

#include <fbjni/fbjni.h>
#include <react/jni/ReadableNativeMap.h>
#include <react/renderer/core/conversions.h>

using namespace facebook::jni;

namespace facebook::react {

Size RNCSliderMeasurementsManager::measure(
    SurfaceId surfaceId,
    LayoutConstraints layoutConstraints,
    bool drawsStepMarkers) const {
  auto &cached = drawsStepMarkers ? cachedStepMarkedMeasurement_ : cachedMeasurement_;
  {
    std::scoped_lock lock(mutex_);
    if (cached) {
      return *cached;
    }
  }

  const jni::global_ref<jobject>& fabricUIManager =
      contextContainer_->at<jni::global_ref<jobject>>("FabricUIManager");

  static auto measure =
      jni::findClassStatic("com/facebook/react/fabric/FabricUIManager")
          ->getMethod<jlong(
              jint,
              jstring,
              ReadableMap::javaobject,
              ReadableMap::javaobject,
              ReadableMap::javaobject,
              jfloat,
              jfloat,
              jfloat,
              jfloat)>("measure");

  auto minimumSize = layoutConstraints.minimumSize;
  auto maximumSize = layoutConstraints.maximumSize;

  local_ref<JString> componentName = make_jstring("RNCSlider");

  // The view manager is only told what bears on the size: whether the slider
  // draws step markers, which `RNCSliderViewManager.measure` makes room for.
  local_ref<ReadableMap::javaobject> props;
  if (drawsStepMarkers) {
    auto propsRNM = ReadableNativeMap::newObjectCxxArgs(
        folly::dynamic::object("stepMarkers", "native"));
    props = make_local(reinterpret_cast<ReadableMap::javaobject>(propsRNM.get()));
  }

  auto measurement = yogaMeassureToSize(measure(
      fabricUIManager,
      surfaceId,
      componentName.get(),
      nullptr,
      props.get(),
      nullptr,
      minimumSize.width,
      maximumSize.width,
      minimumSize.height,
      maximumSize.height));

  std::scoped_lock lock(mutex_);
  cached = measurement;
  return measurement;
}

}
#endif

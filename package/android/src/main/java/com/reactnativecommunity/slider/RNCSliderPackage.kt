package callstack.slider

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class RNCSliderPackage : ReactPackage {

  // This package ships no native modules, so the deprecated eager API is still the
  // cheapest way to satisfy ReactPackage across the supported React Native range.
  @Suppress("OVERRIDE_DEPRECATION")
  override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> =
    emptyList()

  override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> =
    listOf(RNCSliderViewManager())
}

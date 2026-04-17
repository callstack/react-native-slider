package com.reactnativecommunity.slider

import android.content.Context
import android.view.View
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.PixelUtil
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.RNCSliderManagerDelegate
import com.facebook.react.viewmanagers.RNCSliderManagerInterface
import com.facebook.yoga.YogaMeasureMode
import com.facebook.yoga.YogaMeasureOutput

/** Manages instances of [ReactSlider]. */
@ReactModule(name = ReactSliderManagerImpl.REACT_CLASS)
class ReactSliderManager : SimpleViewManager<ReactSlider>(), RNCSliderManagerInterface<ReactSlider> {

  private val delegate: ViewManagerDelegate<ReactSlider> = RNCSliderManagerDelegate(this)

  override fun getDelegate(): ViewManagerDelegate<ReactSlider>? = delegate

  override fun getName(): String = ReactSliderManagerImpl.REACT_CLASS

  override fun createViewInstance(context: ThemedReactContext): ReactSlider =
    ReactSliderManagerImpl.createViewInstance(context)

  @ReactProp(name = "disabled", defaultBoolean = false)
  override fun setDisabled(view: ReactSlider, disabled: Boolean) {
    ReactSliderManagerImpl.setDisabled(view, disabled)
  }

  @ReactProp(name = "value", defaultFloat = 0f)
  override fun setValue(view: ReactSlider, value: Float) {
    ReactSliderManagerImpl.setValue(view, value.toDouble())
  }

  @ReactProp(name = "minimumValue", defaultFloat = 0f)
  override fun setMinimumValue(view: ReactSlider, value: Double) {
    ReactSliderManagerImpl.setMinimumValue(view, value)
  }

  @ReactProp(name = "maximumValue", defaultFloat = 0f)
  override fun setMaximumValue(view: ReactSlider, value: Double) {
    ReactSliderManagerImpl.setMaximumValue(view, value)
  }

  @ReactProp(name = "step", defaultFloat = 0f)
  override fun setStep(view: ReactSlider, value: Double) {
    ReactSliderManagerImpl.setStep(view, value)
  }

  @ReactProp(name = "thumbTintColor", customType = "Color")
  override fun setThumbTintColor(view: ReactSlider, color: Int?) {
    ReactSliderManagerImpl.setThumbTintColor(view, color)
  }

  @ReactProp(name = "thumbSize", defaultFloat = 0f)
  override fun setThumbSize(view: ReactSlider, size: Float) {
    ReactSliderManagerImpl.setThumbSize(view, size)
  }

  @ReactProp(name = "minimumTrackTintColor", customType = "Color")
  override fun setMinimumTrackTintColor(view: ReactSlider, color: Int?) {
    ReactSliderManagerImpl.setMinimumTrackTintColor(view, color)
  }

  @ReactProp(name = "maximumTrackTintColor", customType = "Color")
  override fun setMaximumTrackTintColor(view: ReactSlider, color: Int?) {
    ReactSliderManagerImpl.setMaximumTrackTintColor(view, color)
  }

  @ReactProp(name = "inverted", defaultBoolean = false)
  override fun setInverted(view: ReactSlider, inverted: Boolean) {
    ReactSliderManagerImpl.setInverted(view, inverted)
  }

  @ReactProp(name = "accessibilityUnits")
  override fun setAccessibilityUnits(view: ReactSlider, accessibilityUnits: String?) {
    ReactSliderManagerImpl.setAccessibilityUnits(view, accessibilityUnits)
  }

  @ReactProp(name = "accessibilityIncrements")
  override fun setAccessibilityIncrements(view: ReactSlider, accessibilityIncrements: ReadableArray?) {
    ReactSliderManagerImpl.setAccessibilityIncrements(view, accessibilityIncrements)
  }

  @ReactProp(name = "lowerLimit")
  override fun setLowerLimit(view: ReactSlider, value: Float) {
    ReactSliderManagerImpl.setLowerLimit(view, value.toDouble())
  }

  @ReactProp(name = "upperLimit")
  override fun setUpperLimit(view: ReactSlider, value: Float) {
    ReactSliderManagerImpl.setUpperLimit(view, value.toDouble())
  }

  @ReactProp(name = "thumbImage")
  override fun setThumbImage(view: ReactSlider, source: ReadableMap?) {
    ReactSliderManagerImpl.setThumbImage(view, source)
  }

  override fun setTestID(view: ReactSlider, value: String?) {
    super.setTestId(view, value)
  }

  override fun addEventEmitters(reactContext: ThemedReactContext, view: ReactSlider) {
    view.setEventListener(
      object : ReactSliderEventListener {
        override fun onSliderValueChange(value: Double, fromUser: Boolean) {
          if (!fromUser) return
          val reactTag = view.id
          UIManagerHelper.getEventDispatcherForReactTag(reactContext, reactTag)
            ?.dispatchEvent(ReactSliderEvent(reactTag, value, true))
        }

        override fun onSlidingStart(value: Double) {
          val reactTag = view.id
          UIManagerHelper.getEventDispatcherForReactTag(reactContext, reactTag)
            ?.dispatchEvent(ReactSlidingStartEvent(reactTag, value))
        }

        override fun onSlidingComplete(value: Double) {
          val reactTag = view.id
          UIManagerHelper.getEventDispatcherForReactTag(reactContext, reactTag)
            ?.dispatchEvent(ReactSlidingCompleteEvent(reactTag, value))
        }
      },
    )
  }

  // these props are not available on Android, however we must override their setters
  override fun setMinimumTrackImage(view: ReactSlider, readableMap: ReadableMap?) {}

  override fun setMaximumTrackImage(view: ReactSlider, readableMap: ReadableMap?) {}

  override fun setTrackImage(view: ReactSlider, value: ReadableMap?) {}

  override fun setTapToSeek(view: ReactSlider, value: Boolean) {}

  override fun setVertical(view: ReactSlider, value: Boolean) {}

  override fun measure(
    context: Context,
    localData: ReadableMap?,
    props: ReadableMap?,
    state: ReadableMap?,
    width: Float,
    widthMode: YogaMeasureMode,
    height: Float,
    heightMode: YogaMeasureMode,
    attachmentsPositions: FloatArray?,
  ): Long {
    val view = ReactSlider(context, null)
    val measureSpec = View.MeasureSpec.makeMeasureSpec(0, View.MeasureSpec.UNSPECIFIED)
    view.measure(measureSpec, measureSpec)
    return YogaMeasureOutput.make(
      PixelUtil.toDIPFromPixel(view.measuredWidth.toFloat()),
      PixelUtil.toDIPFromPixel(view.measuredHeight.toFloat()),
    )
  }

  override fun getExportedCustomBubblingEventTypeConstants(): Map<String, Any>? =
    ReactSliderManagerImpl.getExportedCustomBubblingEventTypeConstants()

  override fun getExportedCustomDirectEventTypeConstants(): Map<String, Any>? =
    ReactSliderManagerImpl.getExportedCustomDirectEventTypeConstants()

}

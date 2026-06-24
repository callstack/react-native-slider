package com.callstack.slider

import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.viewmanagers.SliderViewManagerDelegate
import com.facebook.react.viewmanagers.SliderViewManagerInterface

@ReactModule(name = SliderViewManager.NAME)
internal class SliderViewManager :
  SimpleViewManager<SliderView>(),
  SliderViewManagerInterface<SliderView> {

  private val delegate: ViewManagerDelegate<SliderView> =
    SliderViewManagerDelegate(this)

  override fun getName(): String = NAME

  override fun createViewInstance(context: ThemedReactContext): SliderView = SliderView(context)

  override fun getDelegate(): ViewManagerDelegate<SliderView> = delegate

  override fun onDropViewInstance(view: SliderView) {
    super.onDropViewInstance(view)
    view.onDropInstance()
  }

  override fun setStep(view: SliderView, value: Double) {
    view.setStep(value)
  }

  override fun setMinValue(view: SliderView, value: Double) {
    view.setMinValue(value.toFloat())
  }

  override fun setMaxValue(view: SliderView, value: Double) {
    view.setMaxValue(value.toFloat())
  }

  override fun setValue(view: SliderView, value: Float) {
    view.setValue(value)
  }

  override fun setLowerLimit(view: SliderView, value: Float) {
    view.setLowerLimit(value)
  }

  override fun setUpperLimit(view: SliderView, value: Float) {
    view.setUpperLimit(value)
  }

  override fun setDisabled(view: SliderView, value: Boolean) {
    view.setDisabled(value)
  }

  override fun setInverted(view: SliderView, value: Boolean) {
    view.setInverted(value)
  }

  override fun setTapToSeek(view: SliderView, value: Boolean) = Unit

  override fun setMinimumTrackTintColor(view: SliderView, value: Int?) {
    view.setMinimumTrackTintColor(value)
  }

  override fun setMaximumTrackTintColor(view: SliderView, value: Int?) {
    view.setMaximumTrackTintColor(value)
  }

  override fun setThumbTintColor(view: SliderView, value: Int?) {
    view.setThumbTintColor(value)
  }

  override fun setThumbSize(view: SliderView, value: Float) {
    view.setThumbSize(value)
  }

  override fun setVertical(view: SliderView, value: Boolean) = Unit

  override fun setAccessibilityUnits(view: SliderView, value: String?) = Unit

  override fun setAccessibilityIncrements(view: SliderView, value: ReadableArray?) = Unit

  override fun setMaximumTrackImage(view: SliderView, value: ReadableMap?) = Unit

  override fun setMinimumTrackImage(view: SliderView, value: ReadableMap?) = Unit

  override fun setThumbImage(view: SliderView, value: ReadableMap?) = Unit

  override fun setTrackImage(view: SliderView, value: ReadableMap?) = Unit

  override fun addEventEmitters(reactContext: ThemedReactContext, view: SliderView) {
    view.eventDispatcher = UIManagerHelper.getEventDispatcherForReactTag(reactContext, view.id)
  }

  companion object {
    const val NAME = "SliderView"
  }
}

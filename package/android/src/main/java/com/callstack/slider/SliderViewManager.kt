package com.callstack.slider

import com.facebook.react.bridge.ReadableArray
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

  override fun setStep(view: SliderView, value: Int) {
    view.setStep(value)
  }

  override fun setMinValue(view: SliderView, value: Float) {
    view.setMinValue(value)
  }

  override fun setMaxValue(view: SliderView, value: Float) {
    view.setMaxValue(value)
  }

  override fun addEventEmitters(reactContext: ThemedReactContext, view: SliderView) {
    view.eventDispatcher = UIManagerHelper.getEventDispatcherForReactTag(reactContext, view.id)
  }

  companion object {
    const val NAME = "SliderView"
  }
}

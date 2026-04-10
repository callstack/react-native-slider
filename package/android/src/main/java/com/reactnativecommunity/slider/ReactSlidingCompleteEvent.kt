package com.reactnativecommunity.slider

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.events.Event

/** Event emitted when the user finishes dragging the slider. */
class ReactSlidingCompleteEvent(
  viewId: Int,
  private val value: Double,
) : Event<ReactSlidingCompleteEvent>(viewId) {

  override fun getEventName(): String = EVENT_NAME

  override fun getCoalescingKey(): Short = 0

  override fun canCoalesce(): Boolean = false

  override fun getEventData(): WritableMap? = serializeEventData()

  private fun serializeEventData(): WritableMap {
    val eventData = Arguments.createMap()
    eventData.putInt("target", viewTag)
    eventData.putDouble("value", value)
    return eventData
  }

  companion object {
    const val EVENT_NAME = "onRNCSliderSlidingComplete"
  }
}

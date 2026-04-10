package com.reactnativecommunity.slider

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.events.Event

/** Event emitted by a ReactSliderManager when user changes slider position. */
class ReactSliderEvent(
  viewId: Int,
  private val value: Double,
  private val fromUser: Boolean,
) : Event<ReactSliderEvent>(viewId) {

  override fun getEventName(): String = EVENT_NAME

  override fun getCoalescingKey(): Short = 0

  override fun getEventData(): WritableMap? = serializeEventData()

  private fun serializeEventData(): WritableMap {
    val eventData = Arguments.createMap()
    eventData.putInt("target", viewTag)
    eventData.putDouble("value", value)
    eventData.putBoolean("fromUser", fromUser)
    return eventData
  }

  companion object {
    const val EVENT_NAME = "topChange"
  }
}

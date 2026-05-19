package com.callstack.slider

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.events.Event

class ValueChangedEvent(surfaceId: Int, viewId: Int, private val value: Float) :
  Event<ValueChangedEvent>(surfaceId, viewId) {

  override fun getEventName(): String = EVENT_NAME

  override fun getEventData(): WritableMap =
    Arguments.createMap().apply {
      putDouble("value", value.toDouble())
    }

  companion object {
    const val EVENT_NAME = "topValueChange"
  }
}

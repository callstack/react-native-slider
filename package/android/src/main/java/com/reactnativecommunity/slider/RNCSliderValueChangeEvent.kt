package callstack.slider

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.events.Event

/** Emitted while the user drags the thumb of a [RNCSliderView]. */
class RNCSliderValueChangeEvent(
  surfaceId: Int,
  viewId: Int,
  private val value: Double,
) : Event<RNCSliderValueChangeEvent>(surfaceId, viewId) {

  override fun getEventName(): String = EVENT_NAME

  override fun getCoalescingKey(): Short = 0

  override fun getEventData(): WritableMap =
    Arguments.createMap().apply {
      putInt("target", viewTag)
      putDouble("value", value)
    }

  companion object {
    const val EVENT_NAME = "topValueChange"
    const val REGISTRATION_NAME = "onValueChange"
  }
}

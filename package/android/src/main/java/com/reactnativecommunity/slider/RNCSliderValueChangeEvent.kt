package callstack.slider

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.events.Event

/** Emitted while the user drags the thumb of a [RNCSliderView]. */
class RNCSliderValueChangeEvent(
  surfaceId: Int,
  viewId: Int,
  private val thumb: Thumb,
  private val value: Double,
) : Event<RNCSliderValueChangeEvent>(surfaceId, viewId) {

  override fun getEventName(): String = thumb.eventName

  override fun getCoalescingKey(): Short = 0

  override fun getEventData(): WritableMap =
    Arguments.createMap().apply {
      putInt("target", viewTag)
      putDouble("value", value)
    }

  /** Which thumb moved, and the event JS hears about it through. */
  enum class Thumb(val eventName: String, val registrationName: String) {
    /** The only thumb of a plain slider. */
    SINGLE("topValueChange", "onValueChange"),

    /** The thumb bounding a ranged slider's selected span from below. */
    LEFT("topLeftValueChange", "onLeftValueChange"),

    /** The thumb bounding a ranged slider's selected span from above. */
    RIGHT("topRightValueChange", "onRightValueChange"),
  }
}

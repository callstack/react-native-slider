package callstack.slider

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.events.Event

/**
 * Emitted when the user takes hold of a thumb of a [RNCSliderView], and again
 * when they let go of it.
 *
 * It carries no value: it says that a drag began or ended, not where the thumb
 * stands - which is what [RNCSliderValueChangeEvent] is for.
 */
class RNCSliderSlidingEvent(
  surfaceId: Int,
  viewId: Int,
  private val phase: Phase,
) : Event<RNCSliderSlidingEvent>(surfaceId, viewId) {

  override fun getEventName(): String = phase.eventName

  /**
   * Each of these marks a moment rather than a position, so none of them may be
   * dropped in favour of a later one the way a value change may.
   */
  override fun canCoalesce(): Boolean = false

  override fun getEventData(): WritableMap =
    Arguments.createMap().apply { putInt("target", viewTag) }

  /** Which end of a drag happened, and the event JS hears about it through. */
  enum class Phase(val eventName: String, val registrationName: String) {
    /** The user has grabbed a thumb, which has not moved yet. */
    START("topSlidingStart", "onSlidingStart"),

    /** The user has let go of the thumb they were dragging. */
    COMPLETE("topSlidingComplete", "onSlidingComplete"),
  }
}

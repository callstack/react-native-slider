package callstack.slider

import android.content.Context
import android.view.View
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.RNCSliderManagerDelegate
import com.facebook.react.viewmanagers.RNCSliderManagerInterface
import com.facebook.yoga.YogaMeasureMode
import com.facebook.yoga.YogaMeasureOutput

/**
 * Manages instances of [RNCSliderView].
 *
 * The only children a slider has are the custom track, thumbs and step markers JS
 * renders in place of the built-in ones, which the view keeps apart from the slider
 * it hosts - so its children are those, and not the views it happens to hold.
 */
@ReactModule(name = RNCSliderViewManager.REACT_CLASS)
class RNCSliderViewManager :
  ViewGroupManager<RNCSliderView>(), RNCSliderManagerInterface<RNCSliderView> {

  private val delegate: ViewManagerDelegate<RNCSliderView> = RNCSliderManagerDelegate(this)

  override fun getDelegate(): ViewManagerDelegate<RNCSliderView> = delegate

  override fun getName(): String = REACT_CLASS

  override fun createViewInstance(reactContext: ThemedReactContext): RNCSliderView =
    RNCSliderView(reactContext)

  @ReactProp(name = "minimumValue", defaultDouble = 0.0)
  override fun setMinimumValue(view: RNCSliderView, value: Double) {
    view.setMinimumValue(value)
  }

  @ReactProp(name = "maximumValue", defaultDouble = 1.0)
  override fun setMaximumValue(view: RNCSliderView, value: Double) {
    view.setMaximumValue(value)
  }

  @ReactProp(name = "value", defaultDouble = 0.0)
  override fun setValue(view: RNCSliderView, value: Double) {
    view.setValue(value)
  }

  @ReactProp(name = "ranged", defaultBoolean = false)
  override fun setRanged(view: RNCSliderView, value: Boolean) {
    view.setRanged(value)
  }

  @ReactProp(name = "valueLeft", defaultDouble = 0.0)
  override fun setValueLeft(view: RNCSliderView, value: Double) {
    view.setValueLeft(value)
  }

  @ReactProp(name = "valueRight", defaultDouble = 1.0)
  override fun setValueRight(view: RNCSliderView, value: Double) {
    view.setValueRight(value)
  }

  @ReactProp(name = "step", defaultDouble = 0.0)
  override fun setStep(view: RNCSliderView, value: Double) {
    view.setStep(value)
  }

  @ReactProp(name = "lowerLimit", defaultDouble = 0.0)
  override fun setLowerLimit(view: RNCSliderView, value: Double) {
    view.setLowerLimit(value)
  }

  @ReactProp(name = "upperLimit", defaultDouble = 1.0)
  override fun setUpperLimit(view: RNCSliderView, value: Double) {
    view.setUpperLimit(value)
  }

  @ReactProp(name = "orientation")
  override fun setOrientation(view: RNCSliderView, value: String?) {
    view.setOrientation(value)
  }

  @ReactProp(name = "minimumTrackColor", customType = "Color")
  override fun setMinimumTrackColor(view: RNCSliderView, value: Int?) {
    view.setMinimumTrackColor(value)
  }

  @ReactProp(name = "middleRangeTrackColor", customType = "Color")
  override fun setMiddleRangeTrackColor(view: RNCSliderView, value: Int?) {
    view.setMiddleRangeTrackColor(value)
  }

  @ReactProp(name = "maximumTrackColor", customType = "Color")
  override fun setMaximumTrackColor(view: RNCSliderView, value: Int?) {
    view.setMaximumTrackColor(value)
  }

  @ReactProp(name = "customTrack", defaultBoolean = false)
  override fun setCustomTrack(view: RNCSliderView, value: Boolean) {
    view.setCustomTrack(value)
  }

  @ReactProp(name = "customThumb", defaultBoolean = false)
  override fun setCustomThumb(view: RNCSliderView, value: Boolean) {
    view.setCustomThumb(value)
  }

  @ReactProp(name = "stepMarkers")
  override fun setStepMarkers(view: RNCSliderView, value: String?) {
    view.setStepMarkers(value)
  }

  override fun addView(parent: RNCSliderView, child: View, index: Int) {
    parent.addChildView(child, index)
  }

  override fun getChildCount(parent: RNCSliderView): Int = parent.getChildViewCount()

  override fun getChildAt(parent: RNCSliderView, index: Int): View? = parent.getChildViewAt(index)

  override fun removeViewAt(parent: RNCSliderView, index: Int) {
    parent.removeChildViewAt(index)
  }

  override fun addEventEmitters(reactContext: ThemedReactContext, view: RNCSliderView) {
    @Suppress("DEPRECATION")
    val eventDispatcher = UIManagerHelper.getEventDispatcherForReactTag(reactContext, view.id)

    // The tag and the surface are read at dispatch time, so a recycled view keeps
    // reporting under the identity it currently has.
    fun emit(thumb: RNCSliderValueChangeEvent.Thumb): (Double) -> Unit = { value ->
      eventDispatcher?.dispatchEvent(
        RNCSliderValueChangeEvent(UIManagerHelper.getSurfaceId(view), view.id, thumb, value)
      )
    }

    fun emitSliding(phase: RNCSliderSlidingEvent.Phase): () -> Unit = {
      eventDispatcher?.dispatchEvent(
        RNCSliderSlidingEvent(UIManagerHelper.getSurfaceId(view), view.id, phase)
      )
    }

    view.onValueChange = emit(RNCSliderValueChangeEvent.Thumb.SINGLE)
    view.onLeftValueChange = emit(RNCSliderValueChangeEvent.Thumb.LEFT)
    view.onRightValueChange = emit(RNCSliderValueChangeEvent.Thumb.RIGHT)
    view.onSlidingStart = emitSliding(RNCSliderSlidingEvent.Phase.START)
    view.onSlidingComplete = emitSliding(RNCSliderSlidingEvent.Phase.COMPLETE)
  }

  override fun onDropViewInstance(view: RNCSliderView) {
    view.onValueChange = null
    view.onLeftValueChange = null
    view.onRightValueChange = null
    view.onSlidingStart = null
    view.onSlidingComplete = null
    super.onDropViewInstance(view)
  }

  override fun getExportedCustomDirectEventTypeConstants(): Map<String, Any> =
    RNCSliderValueChangeEvent.Thumb.entries.associate { thumb ->
      thumb.eventName to registrationOf(thumb.registrationName)
    } +
      RNCSliderSlidingEvent.Phase.entries.associate { phase ->
        phase.eventName to registrationOf(phase.registrationName)
      }

  private fun registrationOf(registrationName: String): Map<String, Any> =
    mapOf("registrationName" to registrationName)

  /**
   * Fabric asks for the intrinsic size once per surface and reuses the answer for
   * every slider on it, so it must not depend on the incoming constraints. The
   * width is only a hint - flexbox is what actually stretches the slider.
   *
   * The answer describes a horizontal slider, which is the only shape measured
   * here: a vertical one is the same control on its side, and its shadow node
   * turns this size round to match - see `RNCSliderShadowNode::measureContent`.
   *
   * The one prop that bears on the size is whether the slider draws step markers
   * of its own, which hang below the thumb and need it to be thick enough across to
   * hold them - see [STEP_MARKED_HEIGHT_DIP]. The shadow node asks for that size
   * apart from the other, and grows a slider measured any thinner to it.
   */
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
  ): Long =
    YogaMeasureOutput.make(
      INTRINSIC_WIDTH_DIP,
      if (props?.getString("stepMarkers") == "native") STEP_MARKED_HEIGHT_DIP else INTRINSIC_HEIGHT_DIP,
    )

  companion object {
    const val REACT_CLASS = "RNCSlider"

    /** Matches the height Material 3 reserves for a slider's touch target. */
    private const val INTRINSIC_HEIGHT_DIP = 48f

    private const val INTRINSIC_WIDTH_DIP = 200f

    /**
     * The height of the thumb Material 3 draws - its handle. The view reads the
     * thumb's actual thickness to hang the step markers below it, but a slider is
     * measured before anything is composed, so the size it is measured at has to
     * take the handle at its word.
     */
    private const val MATERIAL_THUMB_HEIGHT_DIP = 44f

    /**
     * How tall a slider drawing its own step markers has to be for them to fit
     * inside it: a full thumb, with a marker and its gap on either side of it, as the
     * track stays in the middle of the slider.
     */
    private const val STEP_MARKED_HEIGHT_DIP =
      MATERIAL_THUMB_HEIGHT_DIP +
        (RNCSliderView.STEP_MARKER_GAP_DP + RNCSliderView.STEP_MARKER_SIZE_DP) * 2
  }
}

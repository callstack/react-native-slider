package callstack.slider

import android.content.Context
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.RNCSliderManagerDelegate
import com.facebook.react.viewmanagers.RNCSliderManagerInterface
import com.facebook.yoga.YogaMeasureMode
import com.facebook.yoga.YogaMeasureOutput

/** Manages instances of [RNCSliderView]. */
@ReactModule(name = RNCSliderViewManager.REACT_CLASS)
class RNCSliderViewManager :
  SimpleViewManager<RNCSliderView>(), RNCSliderManagerInterface<RNCSliderView> {

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

    view.onValueChange = emit(RNCSliderValueChangeEvent.Thumb.SINGLE)
    view.onLeftValueChange = emit(RNCSliderValueChangeEvent.Thumb.LEFT)
    view.onRightValueChange = emit(RNCSliderValueChangeEvent.Thumb.RIGHT)
  }

  override fun onDropViewInstance(view: RNCSliderView) {
    view.onValueChange = null
    view.onLeftValueChange = null
    view.onRightValueChange = null
    super.onDropViewInstance(view)
  }

  override fun getExportedCustomDirectEventTypeConstants(): Map<String, Any> =
    RNCSliderValueChangeEvent.Thumb.entries.associate { thumb ->
      thumb.eventName to mapOf("registrationName" to thumb.registrationName)
    }

  /**
   * Fabric asks for the intrinsic size once per surface and reuses the answer for
   * every slider on it, so it must not depend on the incoming constraints. The
   * width is only a hint - flexbox is what actually stretches the slider.
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
  ): Long = YogaMeasureOutput.make(INTRINSIC_WIDTH_DIP, INTRINSIC_HEIGHT_DIP)

  companion object {
    const val REACT_CLASS = "RNCSlider"

    /** Matches the height Material 3 reserves for a slider's touch target. */
    private const val INTRINSIC_HEIGHT_DIP = 48f

    private const val INTRINSIC_WIDTH_DIP = 200f
  }
}

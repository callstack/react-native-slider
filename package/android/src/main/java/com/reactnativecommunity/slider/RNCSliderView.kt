package callstack.slider

import android.content.Context
import android.widget.FrameLayout
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.Slider
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.ComposeView
import androidx.compose.ui.platform.ViewCompositionStrategy

/**
 * Hosts the Jetpack Compose slider. Every prop coming from JS is kept in Compose
 * state, so a prop update recomposes just the slider instead of touching the view
 * hierarchy.
 *
 * The Compose content lives in a child [ComposeView] rather than in an
 * `AbstractComposeView` subclass: Fabric measures a view as soon as it mounts it,
 * which happens before the surface is attached to a window, and Compose can only
 * find a recomposer once it is attached. Measuring the child is therefore deferred
 * until this view has a window - see [onMeasure] and [onAttachedToWindow].
 */
class RNCSliderView(context: Context) : FrameLayout(context) {

  private var minimumValue by mutableFloatStateOf(DEFAULT_MINIMUM_VALUE)
  private var maximumValue by mutableFloatStateOf(DEFAULT_MAXIMUM_VALUE)
  private var sliderValue by mutableFloatStateOf(DEFAULT_VALUE)

  /**
   * While the user drags, the thumb position is owned by this view. Value updates
   * coming from JS in the meantime would fight the gesture, so they are ignored -
   * the slider is uncontrolled during a drag.
   */
  private var isSliding = false

  /** Invoked continuously while the user drags the thumb. */
  var onValueChange: ((Double) -> Unit)? = null

  private val composeView =
    ComposeView(context).apply {
      // Compose is only created once attached, so this is safe to call up front.
      setViewCompositionStrategy(
        ViewCompositionStrategy.DisposeOnDetachedFromWindowOrReleasedFromPool
      )
      setContent { SliderContent() }
    }

  init {
    addView(composeView, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT))
  }

  fun setMinimumValue(value: Double) {
    minimumValue = value.toFloat()
  }

  fun setMaximumValue(value: Double) {
    maximumValue = value.toFloat()
  }

  fun setValue(value: Double) {
    if (!isSliding) {
      sliderValue = value.toFloat()
    }
  }

  override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
    if (!isAttachedToWindow) {
      // Measuring the child here would make Compose look for a window recomposer
      // that does not exist yet. Take the size Fabric asked for and stop there.
      setMeasuredDimension(
        getDefaultSize(suggestedMinimumWidth, widthMeasureSpec),
        getDefaultSize(suggestedMinimumHeight, heightMeasureSpec),
      )
      return
    }

    super.onMeasure(widthMeasureSpec, heightMeasureSpec)
  }

  override fun onAttachedToWindow() {
    super.onAttachedToWindow()

    // Fabric already measured and laid this view out while it was detached, at which
    // point the child was skipped. Redo that pass now that Compose can compose.
    post {
      if (width > 0 && height > 0) {
        measure(
          MeasureSpec.makeMeasureSpec(width, MeasureSpec.EXACTLY),
          MeasureSpec.makeMeasureSpec(height, MeasureSpec.EXACTLY),
        )
        layout(left, top, right, bottom)
      }
    }
  }

  /**
   * Compose requires a non-empty, ascending range. Props arrive one at a time, so a
   * momentarily inverted range is expected rather than exceptional.
   */
  private fun valueRange(): ClosedFloatingPointRange<Float> =
    if (maximumValue > minimumValue) {
      minimumValue..maximumValue
    } else {
      minimumValue..minimumValue + 1f
    }

  @Composable
  private fun SliderContent() {
    val range = valueRange()

    Slider(
      value = sliderValue.coerceIn(range.start, range.endInclusive),
      valueRange = range,
      onValueChange = { value ->
        isSliding = true
        sliderValue = value
        onValueChange?.invoke(value.toDouble())
      },
      onValueChangeFinished = { isSliding = false },
      modifier = Modifier.fillMaxWidth(),
    )
  }

  companion object {
    const val DEFAULT_MINIMUM_VALUE = 0f
    const val DEFAULT_MAXIMUM_VALUE = 1f
    const val DEFAULT_VALUE = 0f
  }
}

package callstack.slider

import android.content.Context
import android.widget.FrameLayout
import androidx.compose.foundation.gestures.awaitEachGesture
import androidx.compose.foundation.gestures.awaitFirstDown
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.RangeSlider
import androidx.compose.material3.Slider
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableDoubleStateOf
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.TransformOrigin
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.pointer.PointerEventPass
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.layout
import androidx.compose.ui.platform.ComposeView
import androidx.compose.ui.platform.ViewCompositionStrategy
import androidx.compose.ui.unit.Constraints
import kotlin.math.abs
import kotlin.math.floor
import kotlin.math.pow
import kotlin.math.round

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
   * Whether the slider selects a span of its range with two thumbs, rather than a
   * single value with one. [sliderValue] and [valueLeft]/[valueRight] belong to the
   * two shapes respectively, and the unused ones are simply not read.
   */
  private var selectsRange by mutableStateOf(DEFAULT_RANGED)
  private var valueLeft by mutableFloatStateOf(DEFAULT_VALUE_LEFT)
  private var valueRight by mutableFloatStateOf(DEFAULT_VALUE_RIGHT)

  /**
   * Granularity of the values the slider reports: every one of them is a multiple
   * of this. Zero means no granularity.
   *
   * Kept as a [Double] where the rest of the state is a [Float], because it is
   * the reported values that are snapped to it rather than the thumb position -
   * see [snapped]. Named the way [sliderValue] is, because a property called
   * `step` would come with a `setStep` of its own for [setStep] to clash with.
   */
  private var stepValue by mutableDoubleStateOf(DEFAULT_STEP)

  /**
   * Bounds the thumbs can be dragged between. The track is drawn across the whole
   * range regardless: a limit takes away the values a thumb can reach, not the
   * ones the slider shows.
   *
   * Named the way [stepValue] is, and for the same reason.
   */
  private var lowerLimitValue by mutableFloatStateOf(DEFAULT_LOWER_LIMIT)
  private var upperLimitValue by mutableFloatStateOf(DEFAULT_UPPER_LIMIT)

  /**
   * Whether the slider is laid out along the view's height rather than its width,
   * with the larger values at the top - see [sliderAxis].
   *
   * Kept as the one thing the orientation actually decides, rather than as the
   * string it arrives as, so that anything other than "vertical" reads as the
   * horizontal slider it defaults to.
   */
  private var isVertical by mutableStateOf(DEFAULT_VERTICAL)

  /**
   * Whether the user has hold of the slider. It lasts from the touch going down
   * to the last finger coming off, so it covers a drag that never moved a thumb
   * as well as one that did - see [slidingGestures].
   *
   * While the user drags, the thumb position is owned by this view. Value updates
   * coming from JS in the meantime would fight the gesture, so they are ignored -
   * the slider is uncontrolled during a drag.
   *
   * A ranged slider stops listening for both of its values at once, even though
   * only one thumb can be under the finger: Compose's `RangeSlider` is driven by
   * the span as a whole, so a value pushed for the thumb standing still would
   * disturb the one being dragged just the same.
   */
  private var isSliding = false

  /** Invoked continuously while the user drags the thumb. */
  var onValueChange: ((Double) -> Unit)? = null

  var onLeftValueChange: ((Double) -> Unit)? = null
  var onRightValueChange: ((Double) -> Unit)? = null

  /**
   * Invoked once the user takes hold of a thumb, and again once they let go of
   * it - whether or not the drag in between moved it anywhere.
   *
   * The two always come in pairs: [isSliding] is what a drag is recognised by,
   * so a thumb grabbed while another is already being dragged does not begin a
   * second drag, and neither does a value pushed from JS end the one in
   * progress.
   */
  var onSlidingStart: (() -> Unit)? = null
  var onSlidingComplete: (() -> Unit)? = null

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

  fun setRanged(value: Boolean) {
    selectsRange = value
  }

  fun setValueLeft(value: Double) {
    if (!isSliding) {
      valueLeft = value.toFloat()
    }
  }

  fun setValueRight(value: Double) {
    if (!isSliding) {
      valueRight = value.toFloat()
    }
  }

  /**
   * A value pushed from JS is taken as it comes, so only the values the slider
   * arrives at itself are snapped to the step.
   */
  fun setStep(value: Double) {
    stepValue = value
  }

  /**
   * A value pushed from JS is taken as it comes here too, so only the values the
   * slider arrives at itself are held to the limits.
   */
  fun setLowerLimit(value: Double) {
    lowerLimitValue = value.toFloat()
  }

  fun setUpperLimit(value: Double) {
    upperLimitValue = value.toFloat()
  }

  fun setOrientation(value: String?) {
    isVertical = value == ORIENTATION_VERTICAL
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

  /**
   * The range narrowed down to the part of it the thumbs can be dragged across.
   *
   * A limit that cannot be honoured is dropped: limits that have crossed leave the
   * slider unlimited, and one reaching out of the range limits only as far as the
   * range itself goes.
   */
  private fun limits(
    range: ClosedFloatingPointRange<Float>
  ): ClosedFloatingPointRange<Float> {
    if (lowerLimitValue > upperLimitValue) {
      return range
    }

    return lowerLimitValue.coerceIn(range)..upperLimitValue.coerceIn(range)
  }

  private fun selectedRange(
    range: ClosedFloatingPointRange<Float>
  ): ClosedFloatingPointRange<Float> {
    val left = valueLeft.coerceIn(range.start, range.endInclusive)
    val right = valueRight.coerceIn(range.start, range.endInclusive)

    return minOf(left, right)..maxOf(left, right)
  }

  @Composable
  private fun SliderContent() {
    // The slider is only ever as thick as the control itself, and a vertical one
    // is far narrower than the view is wide, so it sits in the middle of whatever
    // room JS has given it rather than against one edge.
    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
      if (selectsRange) {
        RangedSliderContent()
      } else {
        SingleSliderContent()
      }
    }
  }

  /**
   * Lays the slider out along the axis the orientation asks for, stretched across
   * the view.
   *
   * Material 3 has no vertical slider, so a vertical one here is its horizontal
   * slider turned a quarter turn anticlockwise, which puts the larger values at
   * the top. Everything the rotation encloses is the same control as ever - the
   * range and the step, both thumbs of a ranged slider, the gestures [slidingGestures]
   * listens to and the accessibility the platform's own slider comes with - it is
   * only measured and drawn the other way round.
   */
  private fun Modifier.sliderAxis(): Modifier =
    if (!isVertical) {
      fillMaxWidth()
    } else {
      graphicsLayer {
          rotationZ = -90f
          // Turned about the top left corner, so that the slider ends up in the
          // box the layout below reports rather than somewhere off the side of it.
          transformOrigin = TransformOrigin(0f, 0f)
        }
        .layout { measurable, constraints ->
          // Inside the rotation the slider is still a horizontal control, so it is
          // offered the height it has to span as its width, and the other way round.
          val placeable =
            measurable.measure(
              Constraints(
                minWidth = constraints.minHeight,
                maxWidth = constraints.maxHeight,
                minHeight = constraints.minWidth,
                maxHeight = constraints.maxWidth,
              )
            )

          // Turning anticlockwise about the corner carries the slider straight up
          // out of the view, so it is laid out one width to the left of it to come
          // back down into place - taking up a box with its two sides swapped.
          layout(placeable.height, placeable.width) { placeable.place(-placeable.width, 0) }
        }
        .fillMaxWidth()
    }

  @Composable
  private fun SingleSliderContent() {
    val range = valueRange()
    val limits = limits(range)

    Slider(
      value = sliderValue.coerceIn(range.start, range.endInclusive),
      valueRange = range,
      onValueChange = { moved -> onSliderValueChange(moved, limits) },
      modifier = Modifier.sliderAxis().slidingGestures(),
    )
  }

  /**
   * Reports the beginning and the end of a drag, which JS is promised to hear
   * about whether or not the drag moved a thumb anywhere.
   *
   * Neither Compose slider offers that: `onValueChangeFinished` does fire for a
   * press that moved nothing, but there is no callback for the press itself, and
   * the drag interactions the slider publishes only begin once the finger has
   * travelled past the touch slop - by which point the thumb has already moved.
   * So the touches are watched here instead, on the initial pass, where they can
   * be heard before the slider claims them rather than taken away from it.
   */
  private fun Modifier.slidingGestures(): Modifier =
    pointerInput(Unit) {
      awaitEachGesture {
        awaitFirstDown(requireUnconsumed = false, pass = PointerEventPass.Initial)
        beginSliding()

        try {
          // The gesture is over once the last finger comes off: a second finger
          // landing on the other thumb of a ranged slider joins the drag already
          // in progress rather than starting one of its own.
          do {
            val event = awaitPointerEvent(PointerEventPass.Initial)
          } while (event.changes.any { it.pressed })
        } finally {
          // Also reached when the gesture is cancelled out from under us, which
          // would otherwise leave the slider deaf to values pushed from JS.
          finishSliding()
        }
      }
    }

  private fun beginSliding() {
    if (isSliding) {
      return
    }

    isSliding = true
    onSlidingStart?.invoke()
  }

  private fun finishSliding() {
    if (!isSliding) {
      return
    }

    isSliding = false
    onSlidingComplete?.invoke()
  }

  /**
   * Takes the value a drag has moved the thumb to and reports it snapped to the
   * step and held to the limits. A stepped or limited slider hears from Compose far
   * more often than it moves, so a value that came back as the one already showing
   * is dropped rather than reported to JS again - which is also how a drag carrying
   * on beyond a limit stays unheard of.
   */
  private fun onSliderValueChange(value: Float, limits: ClosedFloatingPointRange<Float>) {
    val stepped = snapped(value.toDouble(), limits)
    if (stepped.toFloat() == sliderValue) {
      return
    }

    sliderValue = stepped.toFloat()
    onValueChange?.invoke(stepped)
  }

  /**
   * Material 3 has a two-thumb slider of its own, so a ranged slider is that rather
   * than a pair of thumbs assembled here - it comes with the thumbs that cannot swap
   * places, the tinted span between them and the per-thumb accessibility that the
   * platform's own control has.
   *
   * What it does not come with is any notion of the two thumbs being separate: a drag
   * reports the whole span at once. Splitting that back into a thumb apiece is left
   * to [onSelectedRangeChange].
   */
  @Composable
  private fun RangedSliderContent() {
    val range = valueRange()
    val selected = selectedRange(range)
    val limits = limits(range)

    RangeSlider(
      value = selected,
      valueRange = range,
      onValueChange = { moved -> onSelectedRangeChange(from = selected, to = moved, limits = limits) },
      modifier = Modifier.sliderAxis().slidingGestures(),
    )
  }

  /**
   * Takes the span a drag has moved the thumbs to and reports the ends that actually
   * moved, snapped to the step, so that JS hears about the thumb under the finger
   * and not about the one standing still.
   */
  private fun onSelectedRangeChange(
    from: ClosedFloatingPointRange<Float>,
    to: ClosedFloatingPointRange<Float>,
    limits: ClosedFloatingPointRange<Float>,
  ) {
    val left = snapped(to.start.toDouble(), limits)
    if (left.toFloat() != from.start) {
      valueLeft = left.toFloat()
      onLeftValueChange?.invoke(left)
    }

    val right = snapped(to.endInclusive.toDouble(), limits)
    if (right.toFloat() != from.endInclusive) {
      valueRight = right.toFloat()
      onRightValueChange?.invoke(right)
    }
  }

  /**
   * Rounds a value to the nearest multiple of the step and back into the part of
   * the range the thumbs are limited to, which is the granularity JS is promised.
   * A step of zero leaves the value where it is.
   *
   * Compose has a step of its own, but it counts ticks spread evenly across the
   * range and lands the value a whole number of steps away from `minimumValue`
   * rather than on a multiple of the step, and it needs the step to divide the
   * range evenly to do even that. Snapping here answers for both, and answers
   * the same way iOS does.
   */
  private fun snapped(value: Double, limits: ClosedFloatingPointRange<Float>): Double {
    val stepped = if (stepValue > 0) value.roundedToMultipleOf(stepValue) else value

    return stepped.coerceIn(limits.start.toDouble(), limits.endInclusive.toDouble())
  }

  companion object {
    const val DEFAULT_MINIMUM_VALUE = 0f
    const val DEFAULT_MAXIMUM_VALUE = 1f
    const val DEFAULT_VALUE = 0f
    const val DEFAULT_RANGED = false
    const val DEFAULT_VALUE_LEFT = 0f
    const val DEFAULT_VALUE_RIGHT = 1f
    const val DEFAULT_STEP = 0.0
    const val DEFAULT_LOWER_LIMIT = 0f
    const val DEFAULT_UPPER_LIMIT = 1f
    const val DEFAULT_VERTICAL = false

    /** The one orientation that is not the default. */
    private const val ORIENTATION_VERTICAL = "vertical"
  }
}

/**
 * Rounds this value to the nearest multiple of [step].
 *
 * Multiplying the step back out misses the mark by a fraction whenever the step is
 * one that binary floating point cannot hold - three tenths arriving as
 * 0.30000000000000004 - so the product is rounded to the decimals the step itself
 * is written with, and reaches JS reading the way the step was written.
 */
private fun Double.roundedToMultipleOf(step: Double): Double =
  (round(this / step) * step).roundedTo(step.decimals())

/**
 * How many decimals it takes to write this value out, capped at the digits a
 * [Double] can be trusted with.
 */
private fun Double.decimals(): Int {
  var decimals = 0
  var scaled = abs(this)

  while (decimals < MAXIMUM_DECIMALS && scaled != floor(scaled)) {
    scaled *= 10
    decimals++
  }

  return decimals
}

private fun Double.roundedTo(decimals: Int): Double {
  val scale = 10.0.pow(decimals)

  return round(this * scale) / scale
}

/** The decimals a [Double] can be trusted with. */
private const val MAXIMUM_DECIMALS = 15

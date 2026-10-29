package callstack.slider

import android.content.Context
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import androidx.compose.foundation.gestures.awaitEachGesture
import androidx.compose.foundation.gestures.awaitFirstDown
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.RangeSlider
import androidx.compose.material3.RangeSliderState
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderColors
import androidx.compose.material3.SliderDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableDoubleStateOf
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.draw.drawWithContent
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.TransformOrigin
import androidx.compose.ui.graphics.drawscope.clipRect
import androidx.compose.ui.input.pointer.PointerEventPass
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.LayoutCoordinates
import androidx.compose.ui.layout.layout
import androidx.compose.ui.layout.onGloballyPositioned
import androidx.compose.ui.layout.onSizeChanged
import androidx.compose.ui.platform.ComposeView
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.platform.ViewCompositionStrategy
import androidx.compose.ui.unit.Constraints
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import kotlin.math.abs
import kotlin.math.floor
import kotlin.math.max
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
   * The range exactly as JS gave it, for the steps to be worked out from - see
   * [stepMarkerValues]. JS works out the same steps from the same doubles, and a
   * range rounded to a [Float] could come to a different number of them.
   */
  private var exactMinimumValue by mutableDoubleStateOf(DEFAULT_MINIMUM_VALUE.toDouble())
  private var exactMaximumValue by mutableDoubleStateOf(DEFAULT_MAXIMUM_VALUE.toDouble())

  private var selectsRange by mutableStateOf(DEFAULT_RANGED)
  private var valueLeft by mutableFloatStateOf(DEFAULT_VALUE_LEFT)
  private var valueRight by mutableFloatStateOf(DEFAULT_VALUE_RIGHT)

  /**
   * Granularity of the values the slider reports: every one of them is a multiple of
   * this. Zero means no granularity.
   *
   * Kept as a [Double] where the rest of the state is a [Float], because it is the
   * reported values that are snapped to it rather than the thumb position - see
   * [snapped]. Named the way [sliderValue] is, because a property called `step` would
   * come with a `setStep` of its own for [setStep] to clash with.
   */
  private var stepValue by mutableDoubleStateOf(DEFAULT_STEP)

  /**
   * Bounds the thumbs can be dragged between. The track is drawn across the whole range
   * regardless: a limit takes away the values a thumb can reach, not the ones the slider
   * shows.
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
   * Tints of the three parts the thumbs cut the track into: below the thumb (or the
   * left thumb), between the two thumbs of a ranged slider, and above the thumb (or
   * the right thumb). [Color.Unspecified] leaves a part the colour Material 3 gives
   * it - see [trackColors].
   */
  private var minimumTrackColor by mutableStateOf(Color.Unspecified)
  private var middleRangeTrackColor by mutableStateOf(Color.Unspecified)
  private var maximumTrackColor by mutableStateOf(Color.Unspecified)

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

  /**
   * How many of the thumbs JS has replaced with views of its own, counted from the
   * left one - which the single thumb counts as. A replaced thumb is still there to
   * be dragged, it is just no longer drawn; the view JS gave is laid over it
   * instead - see [thumbContainers].
   */
  private var customThumbCount by mutableIntStateOf(0)

  /**
   * Whether JS has replaced the track with a view of its own. The slider then draws
   * no track at all, whatever its tints - the view JS gave lies underneath it
   * instead, see [trackContainer].
   */
  private var hasCustomTrack by mutableStateOf(DEFAULT_CUSTOM_TRACK)

  /**
   * Whether JS has replaced the thumbs with views of its own, which is what tells
   * the thumbs apart from the step markers that follow them - see [childViews].
   */
  private var hasCustomThumb = DEFAULT_CUSTOM_THUMB

  private var showsStepMarkers by mutableStateOf(false)

  /**
   * Whether JS has replaced the step markers with views of its own, one for each of
   * [stepMarkerValues]. The slider then draws none of its own - the views JS gave
   * hang below the steps instead, see [stepMarkerContainers].
   */
  private var hasCustomStepMarkers by mutableStateOf(false)

  /**
   * How thick the thumb Material 3 draws is across the track, which the step
   * markers keep clear of. Read off the thumb itself rather than written down here,
   * as the thumb is a different shape from one version of Material 3 to the next.
   */
  private var thumbThickness by mutableIntStateOf(0)

  /**
   * Where the track lies, and which way round, as last laid out - which is where
   * the custom step markers are hung from, see [placeStepMarkerContainers].
   */
  private var stepMarkerTrack: LayoutCoordinates? = null
  private var stepMarkerLayoutDirection = LayoutDirection.Ltr

  /**
   * The views JS rendered as the slider's children, in the order it rendered them:
   * the track, when [hasCustomTrack] says JS replaced it, then the single thumb, or
   * the left and then the right one, when [hasCustomThumb] says JS replaced them,
   * and then a step marker for each step, when [hasCustomStepMarkers] says JS
   * replaced those.
   */
  private val childViews = mutableListOf<View>()

  /**
   * One for each thumb there can be, holding the view that replaces it. Each is
   * moved so that its origin stays on the centre of its thumb: the shadow node
   * centres the view it holds on that origin, so the view ends up centred on the
   * thumb too.
   *
   * They handle no touches, and neither does a view JS renders as a thumb, so every
   * touch falls through them to the slider underneath.
   */
  private val thumbContainers = List(MAXIMUM_THUMB_COUNT) { ChildContainer(context) }

  /**
   * Holds the view that replaces the track, the way [thumbContainers] hold the
   * thumbs: its origin stays on the middle of the slider, and it is turned a quarter
   * turn anticlockwise about it on a vertical slider, which carries the start of the
   * track down to the bottom, where the minimum is - see [placeTrackContainer].
   *
   * It lies underneath the slider rather than over it, so that the thumbs the slider
   * draws stay on top of the track.
   */
  private val trackContainer =
    ChildContainer(context).apply {
      pivotX = 0f
      pivotY = 0f
    }

  /**
   * One for each step JS renders a marker for, holding that marker the way
   * [thumbContainers] hold the thumbs - except that the origin of each is kept at the
   * point its marker hangs from, see [placeStepMarkerContainers].
   *
   * There are as many of them as there are markers, so they are made as the markers
   * come, and lie between the slider and the thumbs.
   */
  private val stepMarkerContainers = mutableListOf<ChildContainer>()

  /** Invoked continuously while the user drags the thumb. */
  var onValueChange: ((Double) -> Unit)? = null

  var onLeftValueChange: ((Double) -> Unit)? = null
  var onRightValueChange: ((Double) -> Unit)? = null

  /**
   * Invoked once the user takes hold of a thumb, and again once they let go of it -
   * whether or not the drag in between moved it anywhere.
   *
   * The two always come in pairs: [isSliding] is what a drag is recognised by, so a
   * thumb grabbed while another is already being dragged does not begin a second drag,
   * and neither does a value pushed from JS end the one in progress.
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
      // The step markers hang below the thumbs, which takes them past the bottom of
      // a slider laid out at its own height.
      clipChildren = false
    }

  init {
    addView(composeView, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT))

    // A custom thumb is centred on the origin of its container, and so hangs off it
    // - and off the slider too, at either end of the track. So does the custom track,
    // which is centred the same way.
    clipChildren = false
    addView(trackContainer, 0, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT))
    thumbContainers.forEach {
      addView(it, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT))
    }
  }

  /**
   * Takes a view JS rendered in place of the built-in track or of a built-in thumb -
   * see [childViews].
   */
  fun addChildView(view: View, index: Int) {
    childViews.add(index.coerceIn(0, childViews.size), view)
    onChildViewsChanged()
  }

  fun removeChildViewAt(index: Int) {
    val view = childViews.removeAt(index)
    (view.parent as? ViewGroup)?.removeView(view)
    onChildViewsChanged()
  }

  fun getChildViewCount(): Int = childViews.size

  fun getChildViewAt(index: Int): View? = childViews.getOrNull(index)

  /**
   * Hands every child to the container it belongs in. Which one that is depends on
   * whether there is a track ahead of the thumbs, which can change before or after
   * the children it concerns are added - so it is worked out afresh whenever either
   * does.
   */
  private fun onChildViewsChanged() {
    val trackView = if (hasCustomTrack) childViews.firstOrNull() else null
    val remainingViews = if (trackView != null) childViews.drop(1) else childViews
    val thumbCount = if (hasCustomThumb) (if (selectsRange) MAXIMUM_THUMB_COUNT else 1) else 0
    val thumbViews = remainingViews.take(thumbCount)
    val stepMarkerViews = if (hasCustomStepMarkers) remainingViews.drop(thumbCount) else emptyList()

    setStepMarkerContainerCount(stepMarkerViews.size)

    val placements =
      thumbViews.zip(thumbContainers) +
        stepMarkerViews.zip(stepMarkerContainers) +
        listOfNotNull(trackView?.let { it to trackContainer })

    // A view inserted ahead of another moves that one onto the next container, and
    // one left without a container is not shown anywhere.
    childViews
      .filter { view -> placements.none { (placed, _) -> placed === view } }
      .forEach { view -> (view.parent as? ViewGroup)?.removeView(view) }
    placements.forEach { (view, container) ->
      if (view.parent !== container) {
        (view.parent as? ViewGroup)?.removeView(view)
        container.addView(view)
      }
    }

    customThumbCount = minOf(thumbViews.size, MAXIMUM_THUMB_COUNT)
    placeStepMarkerContainers()
  }

  /**
   * Makes or drops step marker containers until there is one for each of the given
   * number of markers. A dropped container takes the marker it held with it, which
   * [onChildViewsChanged] then hands to another one.
   */
  private fun setStepMarkerContainerCount(count: Int) {
    while (stepMarkerContainers.size > count) {
      removeView(stepMarkerContainers.removeAt(stepMarkerContainers.lastIndex))
    }
    while (stepMarkerContainers.size < count) {
      val container = ChildContainer(context)
      addView(
        container,
        indexOfChild(thumbContainers.first()),
        LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT),
      )
      stepMarkerContainers.add(container)
    }
  }

  /**
   * Moves the origin of every step marker container onto the point its marker hangs
   * from: right under where the thumb stands on that step and clear of it, so that
   * the marker of the step a thumb is on stays in sight.
   *
   * The point is found along the track as Material 3 lays it out, and turned with it
   * on a vertical slider - which puts the markers to the right of the track. The
   * markers themselves are not turned, which keeps whatever they read the right way
   * up.
   *
   * A marker JS renders for a step the slider does not have - the two being
   * momentarily out of step while props and children arrive - is left hidden rather
   * than piled up somewhere.
   */
  private fun placeStepMarkerContainers() {
    val track = stepMarkerTrack?.takeIf { it.isAttached } ?: return
    val values = stepMarkerValues()
    val below = stepMarkerOffset(track.size.height.toFloat(), resources.displayMetrics.density)

    stepMarkerContainers.forEachIndexed { index, container ->
      val value = values.getOrNull(index)
      container.visibility = if (value == null) INVISIBLE else VISIBLE
      if (value != null) {
        val anchor =
          track.localToRoot(
            Offset(alongTrack(value, track.size.width.toFloat(), stepMarkerLayoutDirection), below)
          )
        container.translationX = anchor.x
        container.translationY = anchor.y
      }
    }
  }

  fun setCustomThumb(value: Boolean) {
    if (value == hasCustomThumb) {
      return
    }

    hasCustomThumb = value
    onChildViewsChanged()
  }

  /**
   * How the steps are marked: not at all, by markers drawn here, or by the views JS
   * adds last.
   */
  fun setStepMarkers(value: String?) {
    showsStepMarkers = value == STEP_MARKERS_NATIVE || value == STEP_MARKERS_CUSTOM
    hasCustomStepMarkers = value == STEP_MARKERS_CUSTOM
    onChildViewsChanged()
  }

  fun setCustomTrack(value: Boolean) {
    if (value == hasCustomTrack) {
      return
    }

    hasCustomTrack = value
    onChildViewsChanged()
  }

  fun setMinimumValue(value: Double) {
    minimumValue = value.toFloat()
    exactMinimumValue = value
    placeStepMarkerContainers()
  }

  fun setMaximumValue(value: Double) {
    maximumValue = value.toFloat()
    exactMaximumValue = value
    placeStepMarkerContainers()
  }

  fun setValue(value: Double) {
    if (!isSliding) {
      sliderValue = value.toFloat()
    }
  }

  fun setRanged(value: Boolean) {
    selectsRange = value
    // Which of the children are thumbs depends on how many thumbs there are.
    onChildViewsChanged()
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
    placeStepMarkerContainers()
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
    placeTrackContainer()
  }

  fun setMinimumTrackColor(value: Int?) {
    minimumTrackColor = value.toTrackColor()
  }

  fun setMiddleRangeTrackColor(value: Int?) {
    middleRangeTrackColor = value.toTrackColor()
  }

  fun setMaximumTrackColor(value: Int?) {
    maximumTrackColor = value.toTrackColor()
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

  override fun onLayout(changed: Boolean, left: Int, top: Int, right: Int, bottom: Int) {
    super.onLayout(changed, left, top, right, bottom)
    placeTrackContainer()
  }

  /**
   * Moves the origin of [trackContainer] onto the middle of the slider, where the
   * shadow node centres the track on - laid out along the slider's length, which is
   * its height on a vertical one.
   */
  private fun placeTrackContainer() {
    trackContainer.translationX = width / 2f
    trackContainer.translationY = height / 2f
    trackContainer.rotation = if (isVertical) -90f else 0f
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
  private fun limits(range: ClosedFloatingPointRange<Float>): ClosedFloatingPointRange<Float> =
    if (lowerLimitValue > upperLimitValue) {
      range
    } else {
      lowerLimitValue.coerceIn(range)..upperLimitValue.coerceIn(range)
    }

  private fun selectedRange(range: ClosedFloatingPointRange<Float>): ClosedFloatingPointRange<Float> {
    val left = valueLeft.coerceIn(range)
    val right = valueRight.coerceIn(range)

    return minOf(left, right)..maxOf(left, right)
  }

  /**
   * The values the steps stand at: every step from the minimum, and the maximum
   * itself when the step does not divide the range, which is how a thumb can still
   * reach it. A slider with no step has no steps to mark.
   *
   * JS works out the very same values to render its own step markers by, and has to
   * come to as many of them as this does - so the two are worked out the same way,
   * down to the tolerance.
   */
  private fun stepMarkerValues(): List<Double> {
    val span = exactMaximumValue - exactMinimumValue
    if (stepValue <= 0 || span <= 0) {
      return emptyList()
    }

    val wholeSteps = floor(span / stepValue + STEP_TOLERANCE).toInt()
    val values = List(wholeSteps + 1) { exactMinimumValue + it * stepValue }

    return if (span - wholeSteps * stepValue > stepValue * STEP_TOLERANCE) {
      values + exactMaximumValue
    } else {
      values
    }
  }

  /**
   * Whether a thumb stands on the step at the given value - which is what `marked`
   * tells a step marker JS renders, too. The thumbs are held as a [Float], so a
   * thumb is let off by as much as that rounds it by.
   */
  private fun isMarked(value: Double): Boolean {
    val thumbValues = if (selectsRange) listOf(valueLeft, valueRight) else listOf(sliderValue)

    return thumbValues.any { thumbValue ->
      val tolerance = max(stepValue * STEP_TOLERANCE, Math.ulp(thumbValue).toDouble())
      abs(thumbValue - value) <= tolerance
    }
  }

  /**
   * Takes the value a drag has moved the thumb to and reports it snapped to the step
   * and held to the limits. A stepped or limited slider hears from Compose far more
   * often than it moves, so a value that came back as the one already showing is
   * dropped rather than reported to JS again - which is also how a drag carrying on
   * beyond a limit stays unheard of.
   */
  private fun onSliderValueChange(value: Float, limits: ClosedFloatingPointRange<Float>) {
    val stepped = snapped(value, limits)

    if (stepped.toFloat() == sliderValue) {
      return
    }

    sliderValue = stepped.toFloat()
    onValueChange?.invoke(stepped)
  }

  /**
   * Takes the span a drag has moved the thumbs to and reports the ends that actually
   * moved, snapped to the step, so that JS hears about the thumb under the finger and
   * not about the one standing still.
   */
  private fun onSelectedRangeChange(
    from: ClosedFloatingPointRange<Float>,
    to: ClosedFloatingPointRange<Float>,
    limits: ClosedFloatingPointRange<Float>,
  ) {
    val left = snapped(to.start, limits)
    if (left.toFloat() != from.start) {
      valueLeft = left.toFloat()
      onLeftValueChange?.invoke(left)
    }

    val right = snapped(to.endInclusive, limits)
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
   * Compose has a step of its own, but it counts ticks spread evenly across the range
   * and lands the value a whole number of steps away from `minimumValue` rather than
   * on a multiple of the step, and it needs the step to divide the range evenly to do
   * even that. Snapping here answers for both, and answers the same way iOS does.
   */
  private fun snapped(value: Float, limits: ClosedFloatingPointRange<Float>): Double {
    val stepped =
      if (stepValue > 0) value.toDouble().roundedToMultipleOf(stepValue) else value.toDouble()

    return stepped.coerceIn(limits.start.toDouble(), limits.endInclusive.toDouble())
  }

  /**
   * How far along a track of the given width the step at the given value is,
   * counted from its left edge - which the minimum value is at the other end of in a
   * right-to-left layout.
   */
  private fun alongTrack(value: Double, width: Float, layoutDirection: LayoutDirection): Float {
    val span = exactMaximumValue - exactMinimumValue
    val fraction = if (span > 0) ((value - exactMinimumValue) / span).coerceIn(0.0, 1.0).toFloat() else 0f

    return width * if (layoutDirection == LayoutDirection.Rtl) 1f - fraction else fraction
  }

  /**
   * How far below the top of a track of the given height a step marker begins: past
   * the thumb, which is centred on the track, and a gap after it.
   */
  private fun stepMarkerOffset(trackHeight: Float, density: Float): Float =
    trackHeight / 2f + thumbThickness / 2f + STEP_MARKER_GAP_DP * density

  @Composable
  private fun SliderContent() {
    // The slider is only ever as thick as the control itself, and a vertical one is
    // far narrower than the view is wide, so it sits in the middle of whatever room
    // JS has given it rather than against one edge.
    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
      if (selectsRange) {
        RangedSliderContent()
      } else {
        SingleSliderContent()
      }
    }
  }

  /**
   * Lays the slider out along the axis the orientation asks for, stretched across the
   * view.
   *
   * Material 3 has no vertical slider, so a vertical one here is its horizontal
   * slider turned a quarter turn anticlockwise, which puts the larger values at the
   * top. Everything the rotation encloses is the same control as ever - the range and
   * the step, both thumbs of a ranged slider, the gestures [slidingGestures] listens
   * to and the accessibility the platform's own slider comes with - it is only
   * measured and drawn the other way round.
   */
  private fun Modifier.sliderAxis(): Modifier =
    if (!isVertical) {
      fillMaxWidth()
    } else {
      layout { measurable, constraints ->
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

          // Turning anticlockwise about its top left corner carries the slider
          // straight up out of the view, so it is placed one width further down to
          // come back into place - filling a box with its two sides swapped.
          //
          // The rotation is applied here, on the slider inside the box, rather than
          // on the box itself: touches are hit-tested against the bounds of every node
          // on their way in, with each one's rotation undone. Rotating the box would
          // leave the slider laid out off to the side of it, outside the bounds the
          // touch is checked against, and all but a sliver at the very edge of the box
          // would miss the slider altogether.
          layout(placeable.height, placeable.width) {
            placeable.placeWithLayer(0, placeable.width) {
              rotationZ = -90f
              transformOrigin = TransformOrigin(0f, 0f)
            }
          }
        }
        .fillMaxWidth()
    }

  @OptIn(ExperimentalMaterial3Api::class)
  @Composable
  private fun SingleSliderContent() {
    val range = valueRange()
    val limits = limits(range)
    val interactionSource = remember { MutableInteractionSource() }

    Slider(
      value = sliderValue.coerceIn(range.start, range.endInclusive),
      valueRange = range,
      onValueChange = { moved -> onSliderValueChange(moved, limits) },
      modifier = Modifier.sliderAxis().slidingGestures(),
      interactionSource = interactionSource,
      thumb = { Thumb(interactionSource, index = 0) },
      track = { state ->
        val colors = trackColors(active = minimumTrackColor, inactive = maximumTrackColor)
        StepMarkedTrack(colors) {
          if (customThumbCount > 0) {
            SliderDefaults.Track(
              sliderState = state,
              modifier = Modifier.trackVisibility(),
              colors = colors,
              thumbTrackGapSize = 0.dp,
            )
          } else {
            SliderDefaults.Track(sliderState = state, modifier = Modifier.trackVisibility(), colors = colors)
          }
        }
      },
    )
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
  @OptIn(ExperimentalMaterial3Api::class)
  @Composable
  private fun RangedSliderContent() {
    val range = valueRange()
    val selected = selectedRange(range)
    val limits = limits(range)
    val startInteractionSource = remember { MutableInteractionSource() }
    val endInteractionSource = remember { MutableInteractionSource() }

    RangeSlider(
      value = selected,
      valueRange = range,
      onValueChange = { moved -> onSelectedRangeChange(from = selected, to = moved, limits = limits) },
      modifier = Modifier.sliderAxis().slidingGestures(),
      startInteractionSource = startInteractionSource,
      endInteractionSource = endInteractionSource,
      startThumb = { Thumb(startInteractionSource, index = 0) },
      endThumb = { Thumb(endInteractionSource, index = 1) },
      track = { state -> RangedTrack(state) },
    )
  }

  /**
   * The slider's own colours, with the parts of the track JS has tinted swapped for
   * the tints it gave. Material 3 fills in whatever is left [Color.Unspecified].
   */
  @Composable
  private fun trackColors(active: Color, inactive: Color): SliderColors =
    SliderDefaults.colors(activeTrackColor = active, inactiveTrackColor = inactive)

  /**
   * The built-in thumb, or - once JS has replaced it - the same thumb left undrawn, so
   * that it keeps its place in the slider's geometry and the view that replaces it has
   * a centre to follow.
   *
   * The centre is read off the thumb itself rather than worked out from the value,
   * which leaves the geometry to Material 3 and takes the rotation of a vertical
   * slider along with it.
   */
  @Composable
  private fun Thumb(interactionSource: MutableInteractionSource, index: Int) {
    val measured =
      Modifier.onSizeChanged { size ->
        thumbThickness = size.height
        placeStepMarkerContainers()
      }

    if (index >= customThumbCount) {
      SliderDefaults.Thumb(interactionSource = interactionSource, modifier = measured)
      return
    }

    SliderDefaults.Thumb(
      interactionSource = interactionSource,
      modifier =
        measured.alpha(0f).onGloballyPositioned { coordinates ->
          // The slider is hosted across the whole of this view, so the root of its
          // composition is this view's own coordinate space.
          val center =
            coordinates.localToRoot(
              Offset(coordinates.size.width / 2f, coordinates.size.height / 2f)
            )
          thumbContainers[index].translationX = center.x
          thumbContainers[index].translationY = center.y
        },
    )
  }

  /**
   * Leaves the built-in track undrawn once JS has replaced it, the way a replaced
   * thumb is - so that it keeps its place in the slider's geometry, and the thumbs
   * travel along the custom track exactly as far as they would along this one.
   */
  private fun Modifier.trackVisibility(): Modifier = if (hasCustomTrack) alpha(0f) else this

  /**
   * Reports the beginning and the end of a drag, which JS is promised to hear about
   * whether or not the drag moved a thumb anywhere.
   *
   * Neither Compose slider offers that: `onValueChangeFinished` does fire for a press
   * that moved nothing, but there is no callback for the press itself, and the drag
   * interactions the slider publishes only begin once the finger has travelled past
   * the touch slop - by which point the thumb has already moved. So the touches are
   * watched here instead, on the initial pass, where they can be heard before the
   * slider claims them rather than taken away from it.
   */
  private fun Modifier.slidingGestures(): Modifier =
    pointerInput(Unit) {
      awaitEachGesture {
        awaitFirstDown(requireUnconsumed = false, pass = PointerEventPass.Initial)
        if (isVertical) {
          claimGesture()
        }
        beginSliding()

        try {
          // The gesture is over once the last finger comes off: a second finger
          // landing on the other thumb of a ranged slider joins the drag already in
          // progress rather than starting one of its own.
          do {
            val event = awaitPointerEvent(PointerEventPass.Initial)
          } while (event.changes.any { it.pressed })
        } finally {
          // Also reached when the gesture is cancelled out from under us, which would
          // otherwise leave the slider deaf to values pushed from JS.
          finishSliding()
        }
      }
    }

  /**
   * Keeps the views this slider sits in from taking the gesture away from it.
   *
   * A vertical slider is dragged along the same axis a vertical scroll view scrolls
   * along, and the scroll view gets to intercept every move before the slider sees it.
   * Both wait for the finger to travel past the touch slop, so the scroll view would
   * win that race and cancel the drag - and a ranged slider, which only picks the
   * thumb to drag once the slop is crossed, would hardly ever get hold of one. So the
   * gesture is claimed as soon as it lands on the slider instead.
   *
   * A horizontal slider is left to share its touches: it moves across the way a page
   * scrolls, so the two tell each other apart on their own, and claiming the press
   * would stop the page scrolling from any touch that happens to start on it.
   *
   * The claim lasts until the finger comes off, when Android lets it go by itself.
   */
  private fun claimGesture() {
    parent?.requestDisallowInterceptTouchEvent(true)
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
   * The track of a ranged slider, tinted in three parts - see [minimumTrackColor].
   *
   * Material 3 draws both parts outside the span in the one inactive colour, so the
   * track is drawn twice over, once in the colours of each end, and each copy is cut
   * down to its own side of the left thumb. The cut runs through the centre of that
   * thumb, where the track is hidden under it or under the gap it leaves around it, so
   * the two copies meet unseen.
   */
  @OptIn(ExperimentalMaterial3Api::class)
  @Composable
  private fun RangedTrack(state: RangeSliderState) {
    val span = state.valueRange.endInclusive - state.valueRange.start
    val cut = if (span > 0f) ((state.activeRangeStart - state.valueRange.start) / span).coerceIn(0f, 1f) else 0f

    val upperColors = trackColors(active = middleRangeTrackColor, inactive = maximumTrackColor)

    StepMarkedTrack(upperColors) {
      Box(modifier = Modifier.trackVisibility()) {
        RangedTrackPart(
          state,
          trackColors(active = middleRangeTrackColor, inactive = minimumTrackColor),
          Modifier.clipAlongTrack(from = 0f, to = cut),
        )
        RangedTrackPart(state, upperColors, Modifier.clipAlongTrack(from = cut, to = 1f))
      }
    }
  }

  @OptIn(ExperimentalMaterial3Api::class)
  @Composable
  private fun RangedTrackPart(state: RangeSliderState, colors: SliderColors, modifier: Modifier) {
    if (customThumbCount > 0) {
      SliderDefaults.Track(
        rangeSliderState = state,
        modifier = modifier,
        colors = colors,
        thumbTrackGapSize = 0.dp,
      )
    } else {
      SliderDefaults.Track(rangeSliderState = state, modifier = modifier, colors = colors)
    }
  }

  /**
   * The track, with the markers of the steps drawn below it as dots hanging clear of
   * the thumbs - in the colour of the selected part of the track for a step a thumb is
   * on, and in that of the rest of it otherwise.
   *
   * The markers are drawn around the track rather than over the slider, as the track
   * spans exactly the distance between the centres of the thumbs at either end of the
   * range - so a fraction of its width is exactly where a thumb at that fraction of
   * the range is centred, see [alongTrack]. They are drawn here even when the track is
   * replaced, which is only ever left undrawn.
   *
   * The track is where custom step markers are hung from too, once it is laid out.
   */
  @Composable
  private fun StepMarkedTrack(colors: SliderColors, track: @Composable () -> Unit) {
    val layoutDirection = LocalLayoutDirection.current

    Box(
      modifier =
        Modifier.onGloballyPositioned { coordinates ->
            stepMarkerTrack = coordinates
            stepMarkerLayoutDirection = layoutDirection
            placeStepMarkerContainers()
          }
          .drawBehind {
            if (!showsStepMarkers || hasCustomStepMarkers) {
              return@drawBehind
            }

            val radius = STEP_MARKER_SIZE_DP * density / 2f
            val below = stepMarkerOffset(size.height, density) + radius
            stepMarkerValues().forEach { value ->
              drawCircle(
                color = if (isMarked(value)) colors.activeTrackColor else colors.inactiveTrackColor,
                radius = radius,
                center = Offset(alongTrack(value, size.width, layoutDirection), below),
              )
            }
          }
    ) {
      track()
    }
  }

  /**
   * Draws only the stretch of the track between the two given fractions of it,
   * counted from the end its minimum value is at - which is the right-hand one in a
   * right-to-left layout, the way Material 3 lays the track out too.
   *
   * The track spans the distance between the centres of the two thumbs at either
   * end of the range, so a fraction of its width is exactly where a thumb at that
   * fraction of the range is centred.
   */
  private fun Modifier.clipAlongTrack(from: Float, to: Float): Modifier = drawWithContent {
    val (left, right) =
      if (layoutDirection == LayoutDirection.Rtl) (1f - to) to (1f - from) else from to to
    clipRect(left = left * size.width, right = right * size.width) {
      this@drawWithContent.drawContent()
    }
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
    const val DEFAULT_CUSTOM_TRACK = false
    const val DEFAULT_CUSTOM_THUMB = false

    /** The one orientation that is not the default. */
    private const val ORIENTATION_VERTICAL = "vertical"

    /** The two thumbs of a ranged slider. */
    private const val MAXIMUM_THUMB_COUNT = 2

    /** The ways of marking the steps that mark them at all. */
    private const val STEP_MARKERS_NATIVE = "native"
    private const val STEP_MARKERS_CUSTOM = "custom"

    /** Leeway, as a fraction of a step, for a value to count as landing on one. */
    private const val STEP_TOLERANCE = 1e-9

    /** The diameter of a built-in step marker. */
    const val STEP_MARKER_SIZE_DP = 4f

    /** How far a step marker keeps from the thumb. */
    const val STEP_MARKER_GAP_DP = 4f
  }
}

/**
 * Holds the view JS renders in place of a thumb or of the track - see
 * `RNCSliderView.thumbContainers` and `RNCSliderView.trackContainer`.
 *
 * Fabric lays that view out itself, so this lays out nothing, and leaves the view
 * drawn wherever it hangs off it.
 */
private class ChildContainer(context: Context) : ViewGroup(context) {
  init {
    clipChildren = false
  }

  override fun onLayout(changed: Boolean, l: Int, t: Int, r: Int, b: Int) = Unit
}

/** A colour coming from JS, where `null` means JS gave none. */
private fun Int?.toTrackColor(): Color = this?.let { Color(it) } ?: Color.Unspecified

/**
 * Rounds this value to the nearest multiple of [step].
 *
 * Multiplying the step back out misses the mark by a fraction whenever the step is one
 * that binary floating point cannot hold - three tenths arriving as
 * 0.30000000000000004 - so the product is rounded to the decimals the step itself is
 * written with, and reaches JS reading the way the step was written.
 */
private fun Double.roundedToMultipleOf(step: Double): Double =
  (round(this / step) * step).roundedTo(step.decimals())

/**
 * How many decimals it takes to write this value out, capped at the digits a [Double]
 * can be trusted with.
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

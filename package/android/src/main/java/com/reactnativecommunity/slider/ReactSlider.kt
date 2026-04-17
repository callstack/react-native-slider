@file:OptIn(androidx.compose.material3.ExperimentalMaterial3Api::class)

package com.reactnativecommunity.slider

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.os.Build
import android.util.AttributeSet
import android.util.Log
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityManager
import androidx.compose.foundation.Image
import androidx.compose.foundation.interaction.DragInteraction
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.size
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.SliderState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.Recomposer
import androidx.compose.runtime.SideEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.AbstractComposeView
import androidx.compose.ui.platform.AndroidUiDispatcher
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.platform.ViewCompositionStrategy
import androidx.compose.ui.unit.DpSize
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import com.facebook.react.modules.i18nmanager.I18nUtil
import java.net.URL
import java.util.Timer
import java.util.TimerTask
import kotlin.math.ceil
import kotlin.math.max
import kotlin.math.min
import kotlin.math.round
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

/**
 * Slider that behaves more like the iOS one, for consistency.
 *
 * On iOS, the value is 0..1. Android SeekBar only supports integer values. For consistency, we
 * pretend in JS that the value is 0..1 but use discrete steps internally.
 *
 * Note that the slider is _not_ a controlled component (setValue isn't called during dragging).
 *
 * UI is implemented with Jetpack Compose (Material 3 [Slider]) inside an [AbstractComposeView].
 */
class ReactSlider @JvmOverloads constructor(
  context: Context,
  attrs: AttributeSet? = null,
) : AbstractComposeView(context, attrs) {

  private val defaultTotalSteps = 128

  private var minValue = 0.0
  private var maxValue = 0.0
  private var value = 0.0
  private var step = 0.0
  private var stepCalculated = 0.0
  private var accessibilityUnits: String? = null
  private var accessibilityIncrements: List<String>? = null

  private var realLowerLimit = Long.MIN_VALUE.toDouble()
  internal var lowerLimit = 0
    private set
  private var realUpperLimit = Long.MAX_VALUE.toDouble()
  internal var upperLimit = 0
    private set

  private var thumbSizePx = 0
  private var thumbImageUri: String? = null
  private var thumbTintColor: Int? = null
  private var minimumTrackTintColor: Int? = null
  private var maximumTrackTintColor: Int? = null
  private var inverted = false

  private val propsVersion = mutableIntStateOf(0)
  private val isUserDragging = mutableStateOf(false)

  internal val isSliding: Boolean
    get() = isUserDragging.value

  private var eventListener: ReactSliderEventListener? = null

  /** Latest value shown on the slider; used for sliding-start events and accessibility. */
  private var latestDisplayedValue = 0.0

  /**
   * React Native can measure and update this view before it is attached to a window. The default
   * Compose path looks up a [androidx.compose.ui.platform.WindowRecomposer] from the view root, which
   * throws if the view has no window. A dedicated [Recomposer] avoids that lookup.
   * Use [AndroidUiDispatcher.Main] so [Recomposer.runRecomposeAndApplyChanges] has a
   * [androidx.compose.runtime.MonotonicFrameClock].
   */
  private val recomposer = Recomposer(AndroidUiDispatcher.Main)
  private val recomposerScope = CoroutineScope(SupervisorJob() + AndroidUiDispatcher.Main)
  private var recomposerRunJob: Job? = null

  init {
    setParentCompositionContext(recomposer)
    setViewCompositionStrategy(ViewCompositionStrategy.DisposeOnDetachedFromWindow)
    startRecomposerIfNeeded()
  }

  private fun startRecomposerIfNeeded() {
    if (recomposerRunJob?.isActive == true) return
    recomposerRunJob =
      recomposerScope.launch {
        recomposer.runRecomposeAndApplyChanges()
      }
  }

  override fun onAttachedToWindow() {
    super.onAttachedToWindow()
    startRecomposerIfNeeded()
  }

  override fun onDetachedFromWindow() {
    recomposerRunJob?.cancel()
    recomposerRunJob = null
    super.onDetachedFromWindow()
  }

  internal fun setEventListener(listener: ReactSliderEventListener?) {
    eventListener = listener
  }

  private fun bumpProps() {
    propsVersion.intValue++
  }

  internal fun setMaxValue(max: Double) {
    maxValue = max
    updateAll()
  }

  internal fun setMinValue(min: Double) {
    minValue = min
    updateAll()
  }

  internal fun getValidProgressValue(progress: Int): Int {
    return when {
      progress < lowerLimit -> lowerLimit
      progress > upperLimit -> upperLimit
      else -> progress
    }
  }

  internal fun setValue(value: Double) {
    this.value = value
    if (!isSliding) {
      bumpProps()
    }
  }

  internal fun setStep(step: Double) {
    this.step = step
    updateAll()
  }

  internal fun setLowerLimit(value: Double) {
    realLowerLimit = value
    updateLowerLimit()
    bumpProps()
  }

  internal fun setUpperLimit(value: Double) {
    realUpperLimit = value
    updateUpperLimit()
    bumpProps()
  }

  internal fun setAccessibilityUnits(accessibilityUnits: String?) {
    this.accessibilityUnits = accessibilityUnits
  }

  internal fun setAccessibilityIncrements(accessibilityIncrements: List<String>?) {
    this.accessibilityIncrements = accessibilityIncrements
  }

  internal fun setThumbImageUri(uri: String?) {
    thumbImageUri = uri
    bumpProps()
  }

  internal fun setThumbSize(sizeDp: Float) {
    val density = resources.displayMetrics.density
    thumbSizePx = if (sizeDp > 0) round(sizeDp * density).toInt() else 0
    bumpProps()
  }

  internal fun setThumbTintColor(color: Int?) {
    thumbTintColor = color
    bumpProps()
  }

  internal fun setMinimumTrackTintColor(color: Int?) {
    minimumTrackTintColor = color
    bumpProps()
  }

  internal fun setMaximumTrackTintColor(color: Int?) {
    maximumTrackTintColor = color
    bumpProps()
  }

  internal fun applyDisabledProp(disabled: Boolean) {
    isEnabled = !disabled
    bumpProps()
  }

  internal fun setInverted(inverted: Boolean) {
    this.inverted = inverted
    bumpProps()
  }

  fun toRealProgress(seekBarProgress: Int): Double {
    return if (seekBarProgress == totalSteps) {
      maxValue
    } else {
      seekBarProgress * getStepValue() + minValue
    }
  }

  private fun updateAll() {
    if (step == 0.0) {
      stepCalculated = (maxValue - minValue) / defaultTotalSteps.toDouble()
    }
    updateLowerLimit()
    updateUpperLimit()
    bumpProps()
  }

  private fun updateLowerLimit() {
    if (maxValue <= minValue) return
    val limit = maxOf(realLowerLimit, minValue)
    val lower = round((limit - minValue) / (maxValue - minValue) * totalSteps).toInt()
    if (lower > upperLimit) {
      Log.d("Invalid configuration", "upperLimit < lowerLimit; lowerLimit not set")
    } else {
      lowerLimit = minOf(lower, upperLimit)
    }
  }

  private fun updateUpperLimit() {
    if (maxValue <= minValue) return
    val limit = minOf(realUpperLimit, maxValue)
    val upper = round((limit - minValue) / (maxValue - minValue) * totalSteps).toInt()
    if (lowerLimit > upper) {
      Log.d("Invalid configuration", "upperLimit < lowerLimit; upperLimit not set")
    } else {
      upperLimit = upper
    }
  }

  private val totalSteps: Int
    get() {
      if (maxValue <= minValue) return 0
      return ceil((maxValue - minValue) / getStepValue()).toInt()
    }

  private fun getStepValue(): Double = if (step > 0) step else stepCalculated

  private fun progressForReal(real: Double): Int {
    if (maxValue <= minValue || totalSteps <= 0) return 0
    return round((real - minValue) / (maxValue - minValue) * totalSteps).toInt()
  }

  private fun clampedRealToFloat(real: Double): Float {
    val p = getValidProgressValue(progressForReal(real))
    return toRealProgress(p).toFloat()
  }

  override fun onPopulateAccessibilityEvent(event: AccessibilityEvent) {
    super.onPopulateAccessibilityEvent(event)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
      if (event.eventType == AccessibilityEvent.TYPE_VIEW_ACCESSIBILITY_FOCUSED ||
        (event.eventType == AccessibilityEvent.TYPE_VIEW_SELECTED && isAccessibilityFocused)
      ) {
        setupAccessibility(latestDisplayedValue.toInt())
      }
    }
  }

  override fun announceForAccessibility(text: CharSequence?) {
    val ctx = context
    val manager = ctx.getSystemService(Context.ACCESSIBILITY_SERVICE) as AccessibilityManager
    if (manager.isEnabled && text != null) {
      val e = AccessibilityEvent.obtain()
      e.eventType = AccessibilityEvent.TYPE_ANNOUNCEMENT
      e.className = javaClass.name
      e.packageName = ctx.packageName
      e.text.add(text)
      val task =
        object : TimerTask() {
          override fun run() {
            manager.sendAccessibilityEvent(e)
          }
        }
      Timer().schedule(task, 1000)
    }
  }

  fun setupAccessibility(index: Int) {
    val units = accessibilityUnits
    val increments = accessibilityIncrements
    if (units != null && increments != null && increments.size - 1 == maxValue.toInt()) {
      val sliderValue = increments[index]
      val stringLength = units.length
      var spokenUnits = units
      if (sliderValue.toInt() == 1) {
        spokenUnits = spokenUnits.substring(0, stringLength - 1)
      }
      announceForAccessibility(String.format("%s %s", sliderValue, spokenUnits))
    }
  }

  private fun loadBitmap(uri: String): Bitmap? {
    return try {
      if (uri.startsWith("http://") || uri.startsWith("https://") ||
        uri.startsWith("file://") || uri.startsWith("asset://") || uri.startsWith("data:")
      ) {
        BitmapFactory.decodeStream(URL(uri).openStream())
      } else {
        val drawableId = resources.getIdentifier(uri, "drawable", context.packageName)
        BitmapFactory.decodeResource(resources, drawableId)
      }
    } catch (e: Exception) {
      e.printStackTrace()
      null
    }
  }

  @Composable
  override fun Content() {
    val _propsTick = propsVersion.intValue
    @Suppress("DEPRECATION")
    val isRtl = I18nUtil.getInstance().isRTL(context)
    val layoutDirection = if (isRtl) LayoutDirection.Rtl else LayoutDirection.Ltr

    val minV = minValue.toFloat()
    val maxV = maxValue.toFloat()
    val rangeEmptyOrInvalid = maxV <= minV
    val valueRange = minV..maxV
    val materialSteps = if (rangeEmptyOrInvalid) 0 else maxOf(totalSteps - 1, 0)

    val interactionSource = remember { MutableInteractionSource() }

    var localValue by remember(minV, maxV, _propsTick) {
      mutableFloatStateOf(clampedRealToFloat(value))
    }

    val dragging = isUserDragging.value
    LaunchedEffect(value, _propsTick, dragging) {
      if (!dragging) {
        localValue = clampedRealToFloat(value)
      }
    }

    val valueAtGesture = remember { mutableFloatStateOf(0f) }

    LaunchedEffect(interactionSource) {
      interactionSource.interactions.collect { interaction ->
        when (interaction) {
          is DragInteraction.Start -> {
            isUserDragging.value = true
            eventListener?.onSlidingStart(valueAtGesture.floatValue.toDouble())
          }
          is DragInteraction.Stop, is DragInteraction.Cancel -> {
            isUserDragging.value = false
          }
        }
      }
    }

    val thumbUri = thumbImageUri
    var thumbBitmap by remember(thumbUri, _propsTick) { mutableStateOf<Bitmap?>(null) }
    LaunchedEffect(thumbUri, _propsTick) {
      if (thumbUri == null) {
        thumbBitmap = null
        return@LaunchedEffect
      }
      val bmp = withContext(Dispatchers.IO) { loadBitmap(thumbUri) }
      thumbBitmap = bmp
    }

    val density = LocalDensity.current
    val thumbDp =
      if (thumbSizePx > 0) {
        with(density) { thumbSizePx.toDp() }
      } else {
        0.dp
      }
    val thumbSizeDp = if (thumbSizePx > 0) DpSize(thumbDp, thumbDp) else DpSize(20.dp, 20.dp)

    val baseColors = SliderDefaults.colors()
    val sliderColors =
      SliderDefaults.colors(
        thumbColor = thumbTintColor?.let { Color(it) } ?: baseColors.thumbColor,
        activeTrackColor = minimumTrackTintColor?.let { Color(it) } ?: baseColors.activeTrackColor,
        inactiveTrackColor = maximumTrackTintColor?.let { Color(it) } ?: baseColors.inactiveTrackColor,
      )

    SideEffect {
      valueAtGesture.floatValue = localValue
      latestDisplayedValue = localValue.toDouble()
    }

    androidx.compose.runtime.CompositionLocalProvider(LocalLayoutDirection provides layoutDirection) {
      Box(
        modifier =
          Modifier
            .fillMaxWidth()
            .height(48.dp)
            .then(if (inverted) Modifier.scale(scaleX = -1f, scaleY = 1f) else Modifier),
        contentAlignment = Alignment.Center,
      ) {
        if (!rangeEmptyOrInvalid) {
          Slider(
            value = localValue,
            onValueChange = { newVal ->
              val clamped = clampedRealToFloat(newVal.toDouble())
              if (clamped != localValue) {
                localValue = clamped
              }
              eventListener?.onSliderValueChange(clamped.toDouble(), true)
            },
            modifier = Modifier.fillMaxWidth(),
            enabled = isEnabled,
            onValueChangeFinished = {
              eventListener?.onSlidingComplete(localValue.toDouble())
              isUserDragging.value = false
            },
            colors = sliderColors,
            interactionSource = interactionSource,
            steps = materialSteps,
            thumb = { _: SliderState ->
              val bmp = thumbBitmap
              if (bmp != null) {
                val sizeForImage =
                  if (thumbSizePx > 0) Modifier.size(thumbDp) else Modifier.size(ThumbImageFallbackDp)
                Image(
                  bitmap = bmp.asImageBitmap(),
                  contentDescription = null,
                  modifier = sizeForImage,
                  contentScale = ContentScale.Fit,
                )
              } else if (thumbSizePx > 0) {
                SliderDefaults.Thumb(
                  interactionSource = interactionSource,
                  colors = sliderColors,
                  enabled = isEnabled,
                  thumbSize = thumbSizeDp,
                )
              } else {
                SliderDefaults.Thumb(
                  interactionSource = interactionSource,
                  colors = sliderColors,
                  enabled = isEnabled,
                )
              }
            },
            valueRange = valueRange,
          )
        }
      }
    }
  }

  companion object {
    private val ThumbImageFallbackDp = 24.dp
  }
}

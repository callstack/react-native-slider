package com.callstack.slider

import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.unit.DpSize
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import com.facebook.react.uimanager.ThemedReactContext
import kotlin.math.max
import kotlin.math.min

@OptIn(ExperimentalMaterial3Api::class)
internal class SliderView(reactContext: ThemedReactContext) :
  RNCustomRenderComposeView(reactContext) {

  private val minValue = mutableStateOf<Float>(0f)
  private val maxValue = mutableStateOf<Float>(1f)
  private val steps = mutableStateOf<Int>(0)
  private val sliderValue = mutableStateOf<Float>(0f)
  private val lowerLimit = mutableStateOf<Float>(Float.NEGATIVE_INFINITY)
  private val upperLimit = mutableStateOf<Float>(Float.POSITIVE_INFINITY)
  private val disabled = mutableStateOf<Boolean>(false)
  private val inverted = mutableStateOf<Boolean>(false)
  private val minimumTrackTintColor = mutableStateOf<Int?>(null)
  private val maximumTrackTintColor = mutableStateOf<Int?>(null)
  private val thumbTintColor = mutableStateOf<Int?>(null)
  private val thumbSize = mutableStateOf<Float>(0f)
  private var isSliding = false

  fun setMinValue(value: Float) {
    minValue.value = value
    normalizeRange()
    clampSliderValue()
  }

  fun setMaxValue(value: Float) {
    maxValue.value = value
    normalizeRange()
    clampSliderValue()
  }

  fun setStep(value: Double) {
    steps.value = max(value.toInt(), 0)
  }

  fun setValue(value: Float) {
    sliderValue.value = clampedValue(value)
  }

  fun setLowerLimit(value: Float) {
    lowerLimit.value = value
    clampSliderValue()
  }

  fun setUpperLimit(value: Float) {
    upperLimit.value = value
    clampSliderValue()
  }

  fun setDisabled(value: Boolean) {
    disabled.value = value
  }

  fun setInverted(value: Boolean) {
    inverted.value = value
  }

  fun setMinimumTrackTintColor(value: Int?) {
    minimumTrackTintColor.value = value
  }

  fun setMaximumTrackTintColor(value: Int?) {
    maximumTrackTintColor.value = value
  }

  fun setThumbTintColor(value: Int?) {
    thumbTintColor.value = value
  }

  fun setThumbSize(value: Float) {
    thumbSize.value = max(value, 0f)
  }

  @Composable
  override fun ComposeContent() {
    val interactionSource: MutableInteractionSource = remember { MutableInteractionSource() }
    val layoutDirection =
      if (inverted.value) {
        LayoutDirection.Rtl
      } else {
        LayoutDirection.Ltr
      }
    val sliderColors = SliderDefaults.colors(
      thumbColor = thumbTintColor.value?.let { Color(it) } ?: Color.Unspecified,
      activeTrackColor = minimumTrackTintColor.value?.let { Color(it) } ?: Color.Unspecified,
      inactiveTrackColor = maximumTrackTintColor.value?.let { Color(it) } ?: Color.Unspecified,
    )

    CompositionLocalProvider(LocalLayoutDirection provides layoutDirection) {
      Slider(
        value = sliderValue.value,
        onValueChange = {
          if (!isSliding) {
            isSliding = true
            dispatchEvent(SlidingStartEvent(getSurfaceId(), id, sliderValue.value))
          }

          val nextValue = clampedValue(it)
          sliderValue.value = nextValue
          dispatchEvent(ValueChangedEvent(getSurfaceId(), id, nextValue))
        },
        onValueChangeFinished = {
          if (isSliding) {
            isSliding = false
            dispatchEvent(SlidingCompleteEvent(getSurfaceId(), id, sliderValue.value))
          }
        },
        steps = steps.value,
        valueRange = minValue.value..maxValue.value,
        enabled = !disabled.value,
        interactionSource = interactionSource,
        colors = sliderColors,
        thumb = {
          if (thumbSize.value > 0f) {
            SliderDefaults.Thumb(
              interactionSource = interactionSource,
              colors = sliderColors,
              enabled = !disabled.value,
              thumbSize = DpSize(thumbSize.value.dp, thumbSize.value.dp),
            )
          } else {
            SliderDefaults.Thumb(
              interactionSource = interactionSource,
              colors = sliderColors,
              enabled = !disabled.value,
            )
          }
        },
      )
    }
  }

  private fun normalizeRange() {
    if (maxValue.value < minValue.value) {
      maxValue.value = minValue.value
    }
  }

  private fun clampSliderValue() {
    sliderValue.value = clampedValue(sliderValue.value)
  }

  private fun clampedValue(value: Float): Float {
    val lower = max(minValue.value, lowerLimit.value)
    val upper = min(maxValue.value, upperLimit.value)
    return min(max(value, lower), max(lower, upper))
  }
}

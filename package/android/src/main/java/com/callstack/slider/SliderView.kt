package com.callstack.slider

import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Slider
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue
import com.facebook.react.uimanager.ThemedReactContext
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.sizeIn
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.wrapContentWidth
import androidx.compose.foundation.layout.Box
import androidx.compose.runtime.remember

@OptIn(ExperimentalMaterial3Api::class)
internal class SliderView(reactContext: ThemedReactContext) :
  RNCustomRenderComposeView(reactContext) {

  private val minValue = mutableStateOf<Float>(0f)
  private val maxValue = mutableStateOf<Float>(1f)
  private val steps = mutableStateOf<Int>(0)

  fun setMinValue(value: Float) {
    minValue.value = value
  }

  fun setMaxValue(value: Float) {
    maxValue.value = value
  }

  fun setStep(value: Int) {
    steps.value = value
  }

  @Composable
  override fun ComposeContent() {
    var sliderPosition by rememberSaveable { mutableStateOf(0f) }
    val interactionSource: MutableInteractionSource = remember { MutableInteractionSource() }

    Slider(
      value = sliderPosition,
      onValueChange = {
        sliderPosition = it
        dispatchEvent(ValueChangedEvent(getSurfaceId(), id, it))
      },
      steps = steps.value,
      valueRange = minValue.value..maxValue.value,
      interactionSource = interactionSource,
    )
  }
}

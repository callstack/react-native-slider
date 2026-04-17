package com.reactnativecommunity.slider

internal interface ReactSliderEventListener {
  fun onSliderValueChange(value: Double, fromUser: Boolean)

  fun onSlidingStart(value: Double)

  fun onSlidingComplete(value: Double)
}

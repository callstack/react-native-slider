package com.reactnativecommunity.slider;

import android.view.View;

public interface ReactSliderContainer {
  View getViewByType(@ReactSliderDrawableHelper.SliderDrawable int type);
  boolean isInverted();
  void runOnSlider(ReactSliderContainerImpl.SliderRunnable runnable);

  interface SliderRunnable {
    void run(ReactSlider slider);
  }
}

package com.reactnativecommunity.slider;

import android.content.Context;
import android.graphics.Rect;

import com.facebook.react.views.view.ReactViewGroup;

public abstract class ReactSliderContainer extends ReactViewGroup {

  public ReactSliderContainer(Context context) {
    super(context);
  }

  abstract boolean isInverted();
  abstract void runOnSlider(SliderRunnable runnable);
  abstract void setBounds(Rect bounds);
  abstract void setThumbBounds(Rect bounds);
  abstract void setLevel(int level);
  abstract Rect getSliderBounds();

  interface SliderRunnable {
    void run(ReactSlider slider);
  }
}

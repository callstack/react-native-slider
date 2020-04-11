package com.reactnativecommunity.slider;

import android.view.View;

public interface SliderContainer {
  View getViewByType(@ReactSliderDrawableHelper.SliderDrawable int type);
  ReactSlider getSlider();
  boolean isInverted();
}

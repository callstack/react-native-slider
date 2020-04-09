package com.reactnativecommunity.slider;

import android.view.View;

public interface ViewDrawableContainer {
  View getViewByType(@ReactSliderDrawableHelper.SliderDrawable int type);
  ReactSlider getSlider();
}

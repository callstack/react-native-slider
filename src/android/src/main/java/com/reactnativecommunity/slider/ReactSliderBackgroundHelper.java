package com.reactnativecommunity.slider;

import android.graphics.Rect;
import android.view.View;

import com.reactnativecommunity.slider.ReactSliderDrawableHelper.SliderDrawable;

class ReactSliderBackgroundHelper extends ReactSliderViewDrawableHelper {
  ReactSliderBackgroundHelper(ReactSliderContainer sliderContainer) {
    super(sliderContainer, SliderDrawable.BACKGROUND);
  }

  private View getTrack() {
    return getFirstGrandChild(getWrapperView());
  }

  @Override
  void onLevelChanged(int level) {
    if (!isStateful()) return;
    View wrapper = getWrapperView();
    Rect bounds = getBounds();
    Rect viewRect = new Rect();
    getTrack().getDrawingRect(viewRect);
    wrapper.setTranslationY(bounds.centerY() - viewRect.centerY());
    wrapper.setScaleX(bounds.width() * 1f / wrapper.getWidth());
  }
}

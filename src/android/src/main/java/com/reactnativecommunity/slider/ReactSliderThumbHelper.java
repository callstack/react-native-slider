package com.reactnativecommunity.slider;

import android.graphics.PointF;
import android.graphics.Rect;
import android.view.View;

import com.reactnativecommunity.slider.ReactSliderDrawableHelper.SliderDrawable;

import static com.reactnativecommunity.slider.ReactSliderDrawableHelper.MAX_LEVEL;

class ReactSliderThumbHelper extends ReactSliderViewDrawableHelper {

  private final Rect mThumbBounds = new Rect();

  ReactSliderThumbHelper(ReactSliderContainer sliderContainer) {
    super(sliderContainer, SliderDrawable.THUMB);
  }

  @Override
  boolean attach(int index, View view) {
    boolean attached = super.attach(index, view);
    if (attached) {
      getWrapperView().setAlpha(0);
    }
    return attached;
  }

  void setThumbBounds(Rect bounds) {
    mThumbBounds.set(bounds);
  }

  @Override
  void onLevelChanged(int level) {
    if (!isStateful()) return;
    else if (getWrapperView().getAlpha() == 0) getWrapperView().setAlpha(1);
    View wrapper = getWrapperView();
    PointF thumbSize = getThumbSize();
    Rect sliderBounds = getContainer().getSliderBounds();
    float scale = level * 1f / MAX_LEVEL;
    if (getContainer().isInverted()) scale = 1 - scale;
    float initialDelta = (sliderBounds.width() - getBounds().width()) / 2f;
    float translateX = getBounds().width() * scale;
    float centerX = thumbSize.x / 2;
    float centerY = (-thumbSize.y + sliderBounds.height()) / 2;
    wrapper.setTranslationX(initialDelta + translateX - centerX);
    wrapper.setTranslationY(centerY);
  }

  private PointF getThumbSize() {
    View thumb = getView();
    if (thumb != null) {
      return new PointF(thumb.getWidth(), thumb.getHeight());
    }
    return new PointF(mThumbBounds.width(), mThumbBounds.height());
  }

}

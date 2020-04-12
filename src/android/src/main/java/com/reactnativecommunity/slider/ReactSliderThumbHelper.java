package com.reactnativecommunity.slider;

import android.graphics.PointF;
import android.graphics.Rect;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;

import com.reactnativecommunity.slider.ReactSliderDrawableHelper.SliderDrawable;

import static com.reactnativecommunity.slider.ReactSliderDrawableHelper.MAX_LEVEL;

class ReactSliderThumbHelper extends DrawableHelper {
  private final Rect mThumbBounds = new Rect();
  ReactSliderThumbHelper(ReactSliderContainer sliderContainer) {
    super(sliderContainer, SliderDrawable.THUMB);
  }

  void setThumbBounds(Rect bounds) {
    mThumbBounds.set(bounds);
  }

  @Override
  void setLevel(int level) {
    if (!isStateful()) return;
    View thumb = getView();
    PointF thumbSize = getThumbSize();
    Rect sliderBounds = getContainer().getSliderBounds();
    float scale = level * 1f / MAX_LEVEL;
    if (getContainer().isInverted()) scale = 1 - scale;
    float initialDelta = (sliderBounds.width() - getBounds().width()) / 2f;
    float translateX = getBounds().width() * scale;
    float centerX = thumbSize.x / 2;
    float centerY = (-thumbSize.y + sliderBounds.height()) / 2;
    thumb.setTranslationX(initialDelta + translateX - centerX);
    thumb.setTranslationY(centerY);
  }

  private PointF getThumbSize() {
    View thumb = getView();
    if (thumb instanceof ViewGroup) {
      View inner = ((ViewGroup) thumb).getChildAt(0);
      if (inner != null) {
        return new PointF(inner.getWidth(), inner.getHeight());
      }
    }
    return new PointF(mThumbBounds.width(), mThumbBounds.height());
  }

}

package com.reactnativecommunity.slider;

import android.graphics.Rect;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.StringDef;

import com.reactnativecommunity.slider.ReactSliderDrawableHelper.SliderDrawable;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

import static com.reactnativecommunity.slider.ReactSliderDrawableHelper.MAX_LEVEL;

class ReactSliderProgressHelper extends ReactSliderViewDrawableHelper {

  @StringDef({
      ResizeMode.NONE,
      ResizeMode.SCALE
  })
  @Retention(RetentionPolicy.SOURCE)
  public @interface ResizeMode {
    String NONE = "none";
    String SCALE = "scale";
  }

  private final boolean mPrimary;
  private @ResizeMode String mResizeMode = ResizeMode.NONE;

  ReactSliderProgressHelper(ReactSliderContainer drawableContainer, @SliderDrawable int type) {
    super(drawableContainer, type);
    mPrimary = type == SliderDrawable.MINIMUM_TRACK;
  }

  void setResizeMode(@ResizeMode String resizeMode) {
    mResizeMode = resizeMode;
  }

  private boolean shouldScaleChildren() {
    return mResizeMode.equals(ResizeMode.SCALE);
  }

  void onLevelChanged(int level) {
    if (!isStateful()) return;
    View wrapper = getWrapperView();
    Rect bounds = getBounds();
    int inversion = getContainer().isInverted() ? -1 : 1;
    Rect viewRect = new Rect();
    getView().getDrawingRect(viewRect);
    float scale = level * 1f / MAX_LEVEL;
    if (!mPrimary) scale = 1 - scale;
    float delta = bounds.width() * (1 - scale) / 2;
    wrapper.setTranslationX((mPrimary ? -delta : delta) * inversion);
    wrapper.setTranslationY(bounds.centerY() - viewRect.centerY());
    wrapper.setScaleX(scale * bounds.width() * 1f / wrapper.getWidth());
    if (!shouldScaleChildren() && wrapper instanceof ViewGroup) {
      ViewGroup group = (ViewGroup) wrapper;
      View child;
      for (int i = 0; i < group.getChildCount(); i++) {
        child = group.getChildAt(i);
        scale = scale == 0 ? 0 : 1 / scale;
        delta = child.getWidth() * (1 - scale) / 2;
        child.setTranslationX((mPrimary ? -delta : delta) * inversion);
        child.setScaleX(scale);
      }
    }
  }

}

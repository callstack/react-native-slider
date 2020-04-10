package com.reactnativecommunity.slider;

import android.graphics.Matrix;
import android.graphics.Rect;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;

import com.reactnativecommunity.slider.ReactSliderDrawableHelper.SliderDrawable;

import static com.reactnativecommunity.slider.ReactSliderDrawableHelper.MAX_LEVEL;

public class RaectSliderProgressHelper extends DrawableHelper {

  private final boolean mPrimary;
  private boolean mShouldScaleChildren = false;
  private final Rect mThumbBounds = new Rect();

  RaectSliderProgressHelper(ViewDrawableContainer drawableContainer, boolean isPrimary) {
    super(drawableContainer);
    mPrimary = isPrimary;
  }

  void tryAttach(int index, View view) {
    if ((index == SliderDrawable.MAXIMUM_TRACK && !mPrimary) || (index == SliderDrawable.MINIMUM_TRACK && mPrimary)) {
      attach(view);
    }
  }

  void setShouldScaleChildren(boolean shouldScaleChildren) {
    mShouldScaleChildren = shouldScaleChildren;
  }

  void setThumbBounds(Rect bounds) {
    mThumbBounds.set(bounds);
  }

  void setLevel(int level) {
    View track = getView();
    Rect bounds = getBounds();
    //int thumbOffset = mDrawableContainer.getSlider().getThumbOffset();
    //int actualWidth = bounds.width() - thumbOffset * 2;
    //float actualHeight = Math.max(Math.min(mBounds.height(), track.getHeight()), getIntrinsicTrackSize().y);
    Rect viewRect = new Rect();
    track.getDrawingRect(viewRect);
    float scale = level * 1f / MAX_LEVEL;
    if (!mPrimary) scale = 1 - scale;
    float delta = bounds.width() * (1 - scale) / 2;
    track.setTranslationX(mPrimary ? -delta : delta);
    track.setTranslationY(bounds.centerY() - viewRect.centerY());
    track.setScaleX(scale * bounds.width() * 1f / track.getWidth());
    if (!mShouldScaleChildren && track instanceof ViewGroup) {
      ViewGroup group = (ViewGroup) track;
      View child;
      for (int i = 0; i < group.getChildCount(); i++) {
        child = group.getChildAt(i);
        scale = 1 / scale;
        delta = child.getWidth() * (1 - scale) / 2;
        child.setTranslationX(mPrimary ? -delta : delta);
        child.setScaleX(scale);
      }
    }
  }

}

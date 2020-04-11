package com.reactnativecommunity.slider;

import android.graphics.Rect;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;

import com.reactnativecommunity.slider.ReactSliderDrawableHelper.SliderDrawable;

import static com.reactnativecommunity.slider.ReactSliderDrawableHelper.MAX_LEVEL;

public class ReactSliderProgressHelper extends DrawableHelper {

  private final boolean mPrimary;
  private boolean mShouldScaleChildren = true;
  private final Rect mThumbBounds = new Rect();

  ReactSliderProgressHelper(SliderContainer drawableContainer, boolean isPrimary) {
    super(drawableContainer);
    mPrimary = isPrimary;
  }

  void tryAttach(int index, View view) {
    if ((index == SliderDrawable.MAXIMUM_TRACK && !mPrimary) || (index == SliderDrawable.MINIMUM_TRACK && mPrimary)) {
      attach(view);
    }
  }

  private static View maybeGetFirstChild(View view) {
    if (view instanceof ViewGroup) {
      return  ((ViewGroup) view).getChildAt(0);
    } else {
      return view;
    }
  }

  View getTrack() {
    return maybeGetFirstChild(maybeGetFirstChild(getView()));
  }

  void setShouldScaleChildren(boolean shouldScaleChildren) {
    mShouldScaleChildren = shouldScaleChildren;
  }

  void setThumbBounds(Rect bounds) {
    mThumbBounds.set(bounds);
  }

  void setLevel(int level) {
    View wrapper = getView();
    Rect bounds = getBounds();
    int inversion = getContainer().isInverted() ? -1 : 1;
    //int thumbOffset = mDrawableContainer.getSlider().getThumbOffset();
    //int actualWidth = bounds.width() - thumbOffset * 2;
    //float actualHeight = Math.max(Math.min(mBounds.height(), view.getHeight()), getIntrinsicTrackSize().y);
    Rect viewRect = new Rect();
    getTrack().getDrawingRect(viewRect);
    float scale = level * 1f / MAX_LEVEL;
    if (!mPrimary) scale = 1 - scale;
    float delta = bounds.width() * (1 - scale) / 2;
    wrapper.setTranslationX((mPrimary ? -delta : delta) * inversion);
    wrapper.setTranslationY(bounds.centerY() - viewRect.centerY());
    if(!mPrimary) Log.d("Sliderr", "setLevel: " + bounds.centerY() + " "+ viewRect.centerY());
    wrapper.setScaleX(scale * bounds.width() * 1f / wrapper.getWidth());
    if (!mShouldScaleChildren && wrapper instanceof ViewGroup) {
      ViewGroup group = (ViewGroup) wrapper;
      View child;
      for (int i = 0; i < group.getChildCount(); i++) {
        child = group.getChildAt(i);
        scale = 1 / scale;
        delta = child.getWidth() * (1 - scale) / 2;
        child.setTranslationX((mPrimary ? -delta : delta) * inversion);
        child.setScaleX(scale);
      }
    }
  }

}

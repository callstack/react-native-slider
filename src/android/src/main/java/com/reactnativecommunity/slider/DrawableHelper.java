package com.reactnativecommunity.slider;

import android.graphics.Rect;
import android.view.View;

import com.reactnativecommunity.slider.ReactSliderDrawableHelper.SliderDrawable;

abstract class DrawableHelper {
  private View mView;
  private final ReactSliderContainer mContainer;
  private final Rect mBounds = new Rect();
  private boolean mState = false;
  private final @SliderDrawable int mType;

  DrawableHelper(ReactSliderContainer sliderContainer, @SliderDrawable int type) {
    mContainer = sliderContainer;
    mType = type;
  }

  final void attach(int index, View view) {
    if (index == mType) mView = view;
  }

  final View getView () {
    return mView;
  }

  ReactSliderContainer getContainer() {
    return mContainer;
  }

  Rect getBounds() {
    return mBounds;
  }

  void setBounds(Rect bounds) {
    mBounds.set(bounds);
  }

  abstract void setLevel(int level);

  final boolean isStateful() {
    return mState;
  }

  final void setState(boolean state) {
    mState = state;
    mContainer.runOnSlider(new ReactSliderContainer.SliderRunnable() {
      @Override
      public void run(ReactSlider slider) {
        slider.drawableHelper.setVisible(mType, !mState);
      }
    });
  }
}

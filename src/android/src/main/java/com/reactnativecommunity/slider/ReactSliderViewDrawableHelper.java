package com.reactnativecommunity.slider;

import android.graphics.Rect;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewTreeObserver;

import com.reactnativecommunity.slider.ReactSliderDrawableHelper.SliderDrawable;

abstract class ReactSliderViewDrawableHelper implements View.OnLayoutChangeListener {
  private View mView;
  private final ReactSliderContainer mContainer;
  private final Rect mBounds = new Rect();
  private boolean mState = false;
  private final @SliderDrawable int mType;
  private int mLevel = 0;

  ReactSliderViewDrawableHelper(ReactSliderContainer sliderContainer, @SliderDrawable int type) {
    mContainer = sliderContainer;
    mType = type;
  }

  boolean attach(int index, View view) {
    if (index == mType) {
      mView = view;
      cleanup();
      setListener();
      onLevelChanged(mLevel);
      return true;
    }
    return false;
  }

  final void detach(int index) {
    if (index == mType) {
      cleanup();
      mView = null;
    }
  }

  private void setListener() {
    if (getView() == null) {
      mView.postDelayed(new Runnable() {
        @Override
        public void run() {
          setListener();
        }
      }, 5);
    } else {
      getView().addOnLayoutChangeListener(this);
    }
  }

  void cleanup() {
    View view = getView();
    if (view != null) view.removeOnLayoutChangeListener(this);
  }

  @Override
  public void onLayoutChange(View v, int left, int top, int right, int bottom, int oldLeft, int oldTop, int oldRight, int oldBottom) {
    onLevelChanged(mLevel);
  }

  final View getWrapperView() {
    return mView;
  }

  final View getView() {
    return getFirstGrandChild(mView);
  }

  final @SliderDrawable int getType() {
    return mType;
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

  final void setLevel(int level) {
    mLevel = level;
    onLevelChanged(level);
  }

  abstract void onLevelChanged(int level);

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

  static View getFirstGrandChild(View view) {
    if (view instanceof ViewGroup && ((ViewGroup) view).getChildAt(0) instanceof ViewGroup) {
      return ((ViewGroup) ((ViewGroup) view).getChildAt(0)).getChildAt(0);
    }
    return null;
  }
}

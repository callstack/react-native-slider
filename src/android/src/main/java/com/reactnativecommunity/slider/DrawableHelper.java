package com.reactnativecommunity.slider;

import android.graphics.Rect;
import android.view.View;

public abstract class DrawableHelper {
  private View mView;
  private final SliderContainer mDrawableContainer;
  private final Rect mBounds = new Rect();

  DrawableHelper(SliderContainer drawableContainer) {
    mDrawableContainer = drawableContainer;
  }

  abstract void tryAttach(int index, View view);

  final void attach(View view) {
    mView = view;
  }

  final View getView () {
    return mView;
  }

  SliderContainer getContainer() {
    return mDrawableContainer;
  }

  Rect getBounds() {
    return mBounds;
  }

  void setBounds(Rect bounds) {
    mBounds.set(bounds);
  }
}

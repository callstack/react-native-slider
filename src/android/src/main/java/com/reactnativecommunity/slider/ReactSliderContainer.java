package com.reactnativecommunity.slider;

import android.content.Context;
import android.graphics.Point;
import android.graphics.PointF;
import android.graphics.Rect;
import android.graphics.drawable.Drawable;
import android.view.View;
import android.view.ViewGroup;

import com.facebook.react.views.view.ReactViewGroup;
import com.reactnativecommunity.slider.ReactSliderDrawableHelper.SliderDrawable;

public class ReactSliderContainer extends ReactViewGroup implements SliderContainer {

  private boolean mIsInverted = false;
  private Rect mBounds;
  private final ReactSliderProgressHelper mMinimumTrackHandler;
  private final ReactSliderProgressHelper mMaximumTrackHandler;
  //private final ReactSliderProgressHelper mBackgroundTrackHandler;

  public ReactSliderContainer(Context context) {
    super(context);
    //mBackgroundTrackHandler = new ReactSliderProgressHelper(this,false);
    mMaximumTrackHandler = new ReactSliderProgressHelper(this,false);
    mMinimumTrackHandler = new ReactSliderProgressHelper(this,true);
  }

  @Override
  public void onViewAdded(View child) {
    super.onViewAdded(child);
    int index = indexOfChild(child);
    mMaximumTrackHandler.tryAttach(index, child);
    mMinimumTrackHandler.tryAttach(index, child);
  }

  @Override
  public boolean isInverted() {
    return mIsInverted;
  }

  public void setInverted(boolean inverted) {
    mIsInverted = inverted;
    //setScaleX(getScaleX());
    invalidate();
  }
/*
  @Override
  public void setScaleX(float scaleX) {
    super.setScaleX(scaleX * (mIsInverted ? -1 : 1));
  }


 */
  @Override
  public ReactSlider getSlider() {
    return (ReactSlider) getChildAt(SliderDrawable.SLIDER);
  }

  @Override
  public View getViewByType(@SliderDrawable int type) {
    return getChildAt(type);
  }

  private PointF getThumbSize() {
    View thumb = getViewByType(SliderDrawable.THUMB);
    if (thumb instanceof ViewGroup) {
      View inner = ((ViewGroup) thumb).getChildAt(0);
      if (inner != null) {
        int size = Math.min(inner.getWidth(), inner.getHeight());
        getSlider().setThumbOffset(size / 2);
        return new PointF(size, size);
      }
    }
    Rect bounds = getSlider().getThumb().getBounds();
    return new PointF(bounds.width(), bounds.height());
  }

  private Point getIntrinsicThumbSize() {
    Drawable drawable = getSlider().getThumb();
    return new Point(drawable.getIntrinsicWidth(), drawable.getIntrinsicHeight());
  }

  public void setLevel(int level) {
    mMaximumTrackHandler.setLevel(level);
    mMinimumTrackHandler.setLevel(level);
    setThumbLevel(level);
  }

  private void setThumbLevel(int level) {
    //getSlider().getThumbOffset()
    View thumb = getViewByType(SliderDrawable.THUMB);
    PointF thumbSize = getThumbSize();
    float scale = level * 1f / 10000;
    float translateX = mBounds.width() * scale - (getIntrinsicThumbSize().x) / 2;
    thumb.setTranslationX(translateX);
    thumb.setTranslationY((-thumbSize.y + mBounds.height()) / 2);
  }

  public void setBounds(Rect bounds) {
    mBounds = bounds;
    mMaximumTrackHandler.setBounds(bounds);
    mMinimumTrackHandler.setBounds(bounds);
    refresh();
  }

  private void refresh() {
    ReactSlider slider = getSlider();
    slider.setProgress(slider.getProgress());
  }


  @Override
  protected void onLayout(boolean changed, int left, int top, int right, int bottom) {
    super.onLayout(changed, left, top, right, bottom);
    refresh();
  }

  @Override
  protected void onSizeChanged(int w, int h, int oldw, int oldh) {
    super.onSizeChanged(w, h, oldw, oldh);
    refresh();
  }

}

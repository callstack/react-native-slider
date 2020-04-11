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
import com.reactnativecommunity.slider.ReactSliderProgressHelper.ResizeMode;

import java.util.ArrayList;

public class ReactSliderContainerImpl extends ReactViewGroup implements SliderContainer {

  private boolean mIsInverted = false;
  private Rect mBounds;
  private final ReactSliderProgressHelper mMinimumTrackHelper;
  private final ReactSliderProgressHelper mMaximumTrackHelper;
  private final ReactSliderProgressHelper mBackgroundTrackHelper;
  private final ReactSliderThumbHelper mThumbHelper;
  private final ArrayList<SliderRunnable> mPendingOperations = new ArrayList<>();

  @Override
  public void runOnSlider(SliderRunnable runnable) {
    if (getSlider() == null) {
      mPendingOperations.add(runnable);
    } else {
      runnable.run(getSlider());
    }
  }

  private void attach(ReactSlider slider) {
    for (SliderRunnable runnable : mPendingOperations) {
      runnable.run(slider);
    }
    mPendingOperations.clear();
  }

  public ReactSliderContainerImpl(Context context) {
    super(context);
    mBackgroundTrackHelper = new ReactSliderProgressHelper(this,SliderDrawable.BACKGROUND);
    mMaximumTrackHelper = new ReactSliderProgressHelper(this, SliderDrawable.MAXIMUM_TRACK);
    mMinimumTrackHelper = new ReactSliderProgressHelper(this, SliderDrawable.MINIMUM_TRACK);
    mThumbHelper = new ReactSliderThumbHelper(this);
  }

  @Override
  public void onViewAdded(View child) {
    super.onViewAdded(child);
    if (child instanceof ReactSlider) {
      attach((ReactSlider) child);
    }
    int index = indexOfChild(child);
    mMaximumTrackHelper.attach(index, child);
    mMinimumTrackHelper.attach(index, child);
  }

  @Override
  public boolean isInverted() {
    return mIsInverted;
  }

  public void setInverted(boolean inverted) {
    mIsInverted = inverted;
    invalidate();
  }

  void setResizeMode(@SliderDrawable int type, @ResizeMode String resizeMode) {
    ReactSliderProgressHelper helper;
    if (type == SliderDrawable.MAXIMUM_TRACK) {
      helper = mMaximumTrackHelper;
    } else if (type == SliderDrawable.MINIMUM_TRACK) {
      helper = mMinimumTrackHelper;
    } else {
      return;
    }
    helper.setResizeMode(resizeMode);
    invalidate();
  }

  void setState(@SliderDrawable int type, boolean state) {
    DrawableHelper helper;
    if (type == SliderDrawable.MAXIMUM_TRACK) {
      helper = mMaximumTrackHelper;
    } else if (type == SliderDrawable.MINIMUM_TRACK) {
      helper = mMinimumTrackHelper;
    } else if (type == SliderDrawable.THUMB) {
      helper = mThumbHelper;
    } else {
      return;
    }
    helper.setState(state);
    invalidate();
  }

  private ReactSlider getSlider() {
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
    mMaximumTrackHelper.setLevel(level);
    mMinimumTrackHelper.setLevel(level);
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
    mMaximumTrackHelper.setBounds(bounds);
    mMinimumTrackHelper.setBounds(bounds);
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

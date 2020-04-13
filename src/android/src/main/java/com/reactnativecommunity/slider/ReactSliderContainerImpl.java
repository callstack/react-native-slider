package com.reactnativecommunity.slider;

import android.content.Context;
import android.graphics.Rect;
import android.view.View;

import com.facebook.react.bridge.ReactContext;
import com.facebook.react.uimanager.NativeViewHierarchyManager;
import com.facebook.react.uimanager.UIBlock;
import com.facebook.react.uimanager.UIManagerModule;
import com.reactnativecommunity.slider.ReactSliderDrawableHelper.SliderDrawable;
import com.reactnativecommunity.slider.ReactSliderProgressHelper.ResizeMode;

import java.util.ArrayList;

public class ReactSliderContainerImpl extends ReactSliderContainer {

  private boolean mIsInverted = false;
  private final ReactSliderProgressHelper mMinimumTrackHelper;
  private final ReactSliderProgressHelper mMaximumTrackHelper;
  private final ReactSliderBackgroundHelper mBackgroundTrackHelper;
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

  private void attach(final ReactSlider slider) {
    ((ReactContext) getContext())
        .getNativeModule(UIManagerModule.class)
        .prependUIBlock(new UIBlock() {
          @Override
          public void execute(NativeViewHierarchyManager nativeViewHierarchyManager) {
            for (SliderRunnable runnable : mPendingOperations) {
              runnable.run(slider);
            }
            mPendingOperations.clear();
          }
        });
  }

  public ReactSliderContainerImpl(Context context) {
    super(context);
    mBackgroundTrackHelper = new ReactSliderBackgroundHelper(this);
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
    mBackgroundTrackHelper.attach(index, child);
    mMaximumTrackHelper.attach(index, child);
    mMinimumTrackHelper.attach(index, child);
    mThumbHelper.attach(index, child);
  }

  @Override
  public void onViewRemoved(View child) {
    super.onViewRemoved(child);
    int index = indexOfChild(child);
    mBackgroundTrackHelper.detach(index);
    mMaximumTrackHelper.detach(index);
    mMinimumTrackHelper.detach(index);
    mThumbHelper.detach(index);
  }

  void tearDown() {
    mBackgroundTrackHelper.cleanup();
    mMaximumTrackHelper.cleanup();
    mMinimumTrackHelper.cleanup();
    mThumbHelper.cleanup();
  }

  private ReactSlider getSlider() {
    return (ReactSlider) getChildAt(SliderDrawable.SLIDER);
  }

  @Override
  public boolean isInverted() {
    return mIsInverted;
  }

  public void setInverted(boolean inverted) {
    mIsInverted = inverted;
    invalidate();
    refresh();
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

  void setState(@SliderDrawable int type, final boolean state) {
    final ReactSliderViewDrawableHelper helper;
    if (type == SliderDrawable.BACKGROUND) {
      helper = mBackgroundTrackHelper;
    } else if (type == SliderDrawable.MAXIMUM_TRACK) {
      helper = mMaximumTrackHelper;
    } else if (type == SliderDrawable.MINIMUM_TRACK) {
      helper = mMinimumTrackHelper;
    } else if (type == SliderDrawable.THUMB) {
      helper = mThumbHelper;
      if (helper.getWrapperView() != null && state) {
        helper.getWrapperView().setAlpha(0);
      }
    } else {
      return;
    }
    ((ReactContext) getContext())
        .getNativeModule(UIManagerModule.class)
        .addUIBlock(new UIBlock() {
          @Override
          public void execute(NativeViewHierarchyManager nativeViewHierarchyManager) {
            helper.setState(state);
            invalidate();
            refresh();
          }
        });
  }

  @Override
  public void setLevel(int level) {
    mBackgroundTrackHelper.setLevel(level);
    mMaximumTrackHelper.setLevel(level);
    mMinimumTrackHelper.setLevel(level);
    mThumbHelper.setLevel(level);
  }

  @Override
  Rect getSliderBounds() {
    Rect bounds = new Rect();
    ReactSlider slider = getSlider();
    if (slider != null) {
      bounds.set(0,0, slider.getWidth(), slider.getHeight());
    }
    return bounds;
  }

  @Override
  public void setBounds(Rect bounds) {
    mBackgroundTrackHelper.setBounds(bounds);
    mMaximumTrackHelper.setBounds(bounds);
    mMinimumTrackHelper.setBounds(bounds);
    mThumbHelper.setBounds(bounds);
    refresh();
  }

  @Override
  public void setThumbBounds(Rect bounds) {
    mThumbHelper.setThumbBounds(bounds);
  }

  private void refresh() {
    runOnSlider(new SliderRunnable() {
      @Override
      public void run(ReactSlider slider) {
        setLevel(slider.drawableHelper.getLevel());
      }
    });
  }

  @Override
  protected void onSizeChanged(int w, int h, int oldw, int oldh) {
    super.onSizeChanged(w, h, oldw, oldh);
    refresh();
  }

}

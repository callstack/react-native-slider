package com.reactnativecommunity.slider.ReactSliderDrawable;

import android.content.res.Resources;
import android.graphics.Bitmap;
import android.graphics.drawable.Drawable;
import android.graphics.drawable.LayerDrawable;
import android.view.MotionEvent;
import android.view.View;

import androidx.annotation.IntDef;

import com.facebook.react.uimanager.ReactStylesDiffMap;
import com.reactnativecommunity.slider.ReactSlider;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

public class ReactSliderDrawableHelper {

  static final int MAX_LEVEL = 10000;

  @IntDef({
      SliderDrawable.MAXIMUM_TRACK,
      SliderDrawable.MINIMUM_TRACK,
      SliderDrawable.THUMB
  })
  @Retention(RetentionPolicy.SOURCE)
  public @interface SliderDrawable {
    int MAXIMUM_TRACK = 0;
    int MINIMUM_TRACK = 1;
    int THUMB = 2;
  }

  private final ForegroundDrawableHandler mProgressDrawableHandler;
  private final BackgroundDrawableHandler mBackgroundDrawableHandler;
  private final ThumbDrawableHandler mThumbDrawableHandler;

  public ReactSliderDrawableHelper(ReactSlider slider) {
    mProgressDrawableHandler = new ForegroundDrawableHandler(slider);
    mBackgroundDrawableHandler = new BackgroundDrawableHandler(slider);
    mThumbDrawableHandler = new ThumbDrawableHandler(slider);
  }

  public DrawableHandler getDrawableHandler(@SliderDrawable int type) {
    switch (type) {
      case SliderDrawable.MAXIMUM_TRACK:
        return mBackgroundDrawableHandler;
      case SliderDrawable.MINIMUM_TRACK:
        return mProgressDrawableHandler;
      case SliderDrawable.THUMB:
        return mThumbDrawableHandler;
      default:
        throw new Error("bad drawable type");
    }
  }

  public void onTouchEvent(MotionEvent event) {
    mThumbDrawableHandler.onTouchEvent(event);
  }

  public void receiveFromInformant(int informantID, int recruiterID, ReactStylesDiffMap context) {
    DrawableHandler[] handlers = new DrawableHandler[]{mBackgroundDrawableHandler, mProgressDrawableHandler, mThumbDrawableHandler};
    for (DrawableHandler handler: handlers) {
      int id = handler.getView() != null ? handler.getView().getId() : View.NO_ID;
      if (id != View.NO_ID) {
        if (id == informantID) {
          handler.updateFromProps(context);
          break;
        }
        if (id == recruiterID) {
          //handler.dispatchDraw();
          break;
        }
      }
    }
  }

  public void tearDown() {
    mProgressDrawableHandler.tearDown();
    mBackgroundDrawableHandler.tearDown();
    mThumbDrawableHandler.tearDown();
  }

  public static class ForegroundDrawableHandler extends ProgressDrawableHandler {
    public ForegroundDrawableHandler(ReactSlider slider) {
      super(slider, android.R.id.progress);
    }

    @Override
    Drawable createDrawable(Resources res, Bitmap bitmap) {
      return createDrawable(new ProgressBitmapDrawable(res, bitmap) {
        @Override
        protected boolean onLevelChange(int level) {
          LayerDrawable outDrawable = (LayerDrawable) mSlider.getProgressDrawable().getCurrent();
          Drawable drawable = outDrawable.findDrawableByLayerId(android.R.id.custom);
          if (drawable != null) drawable.setLevel(level);
          return super.onLevelChange(level);
        }
      });
    }
  }

  public static class ProgressXDrawableHandler extends ProgressDrawableHandler {
    public ProgressXDrawableHandler(ReactSlider slider) {
      super(slider, android.R.id.custom);
      LayerDrawable outDrawable = (LayerDrawable) mSlider.getProgressDrawable().getCurrent();
      outDrawable.setDrawableByLayerId(android.R.id.custom, get());
    }

    @Override
    public Drawable get() {
      return getDrawable(mSlider, android.R.id.progress);
    }

    @Override
    Drawable createDrawable(Resources res, Bitmap bitmap) {
      return createDrawable(new ProgressBitmapDrawable(res, bitmap, true));
    }
  }

  public static class BackgroundDrawableHandler extends ProgressDrawableHandler {
    public BackgroundDrawableHandler(ReactSlider slider) {
      super(slider, android.R.id.background);
    }
  }
}

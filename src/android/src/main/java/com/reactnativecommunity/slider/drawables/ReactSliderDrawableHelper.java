package com.reactnativecommunity.slider.drawables;

import android.content.res.ColorStateList;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
import android.graphics.drawable.Drawable;
import android.graphics.drawable.LayerDrawable;
import android.graphics.drawable.RippleDrawable;
import android.os.Build;
import android.view.MotionEvent;
import android.view.View;

import androidx.annotation.IntDef;

import com.facebook.react.uimanager.ReactStylesDiffMap;
import com.reactnativecommunity.slider.ReactSlider;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.net.URL;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

public class ReactSliderDrawableHelper {

  static final int MAX_LEVEL = 10000;

  @IntDef({
      SliderDrawable.BACKGROUND,
      SliderDrawable.MAXIMUM_TRACK,
      SliderDrawable.MINIMUM_TRACK,
      SliderDrawable.THUMB
  })
  @Retention(RetentionPolicy.SOURCE)
  public @interface SliderDrawable {
    int BACKGROUND = -1;
    int MAXIMUM_TRACK = 0;
    int MINIMUM_TRACK = 1;
    int THUMB = 2;
  }

  private final ReactSlider mSlider;
  private final ProgressDrawableHandler.ForegroundDrawableHandler mMinimumTrackDrawableHandler;
  private final ProgressDrawableHandler.ForegroundDrawableHandler mMaximumTrackDrawableHandler;
  private final ProgressDrawableHandler.BackgroundDrawableHandler mBackgroundDrawableHandler;
  private final ThumbDrawableHandler mThumbDrawableHandler;

  public ReactSliderDrawableHelper(ReactSlider slider) {
    mSlider = slider;
    setViewBackgroundDrawable();
    ProgressDrawableHandler.init(slider);
    mMinimumTrackDrawableHandler = new ProgressDrawableHandler.MinimumTrackHandler(mSlider);
    mMaximumTrackDrawableHandler = new ProgressDrawableHandler.MaximumTrackHandler(mSlider);
    mBackgroundDrawableHandler = new ProgressDrawableHandler.BackgroundDrawableHandler(mSlider);
    mThumbDrawableHandler = new ThumbDrawableHandler(mSlider);
  }

  /**
   * this fixes the thumb's ripple drawable and preserves it even when a background color is applied
   * when used with {@link #handleSetBackgroundColor(int)}
   */
  public void setViewBackgroundDrawable() {
    int color = Color.TRANSPARENT;
    if (mSlider.getBackground() instanceof ColorDrawable) {
      color = ((ColorDrawable) mSlider.getBackground()).getColor();
    }
    if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.LOLLIPOP) {
      RippleDrawable rippleDrawable = new RippleDrawable(ColorStateList.valueOf(Color.LTGRAY), null, null);
      LayerDrawable layerDrawable = new LayerDrawable(new Drawable[]{new ColorDrawable(color), rippleDrawable});
      mSlider.setBackground(layerDrawable);
    }
  }

  /**
   * {@link #setViewBackgroundDrawable()}
   * @param color
   */
  public void handleSetBackgroundColor(int color) {
    ((ColorDrawable) ((LayerDrawable) mSlider.getBackground()).getDrawable(0)).setColor(color);
  }

  public void setInverted(boolean inverted) {
    mThumbDrawableHandler.setInverted(inverted);
  }

  public void setThumbImage(final String uri) {
    if (uri != null) {
      Drawable bitmapDrawable = new ThumbDrawableHandler.ThumbDrawable(mSlider, getBitmap(mSlider, uri));
      mSlider.setThumb(bitmapDrawable);
      // Enable alpha channel for the thumbImage
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
        mSlider.setSplitTrack(false);
      }
    } else {
      mSlider.setThumb(mSlider.getThumb());
    }
  }

  public DrawableHandler getDrawableHandler(@SliderDrawable int type) {
    switch (type) {
      case SliderDrawable.BACKGROUND:
        return mBackgroundDrawableHandler;
      case SliderDrawable.MAXIMUM_TRACK:
        return mMaximumTrackDrawableHandler;
      case SliderDrawable.MINIMUM_TRACK:
        return mMinimumTrackDrawableHandler;
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
    DrawableHandler[] handlers = new DrawableHandler[]{
        mBackgroundDrawableHandler,
        mMinimumTrackDrawableHandler,
        mMaximumTrackDrawableHandler,
        mThumbDrawableHandler};
    for (DrawableHandler handler: handlers) {
      int id = handler.getView() != null ? handler.getView().getId() : View.NO_ID;
      if (id != View.NO_ID) {
        if (id == informantID) {
          handler.updateFromProps(0, context);
          //break;
        }
        if (id == recruiterID) {
          handler.updateFromProps(informantID, context);
          //handler.dispatchDraw();
          break;
        }
      }
    }
  }

  public void tearDown() {
    mMinimumTrackDrawableHandler.tearDown();
    mMaximumTrackDrawableHandler.tearDown();
    mBackgroundDrawableHandler.tearDown();
    mThumbDrawableHandler.tearDown();
  }

  private static Bitmap getBitmap(final View view, final String uri) {
    Bitmap bitmap = null;
    ExecutorService executorService = Executors.newSingleThreadExecutor();
    Future<Bitmap> future = executorService.submit(new Callable<Bitmap>() {
      @Override
      public Bitmap call() {
        Bitmap bitmap = null;
        try {
          if (uri.startsWith("http://") || uri.startsWith("https://") ||
              uri.startsWith("file://") || uri.startsWith("asset://") || uri.startsWith("data:")) {
            bitmap = BitmapFactory.decodeStream(new URL(uri).openStream());
          } else {
            int drawableId = view.getResources()
                .getIdentifier(uri, "drawable", view.getContext()
                    .getPackageName());
            bitmap = BitmapFactory.decodeResource(view.getResources(), drawableId);
          }
        } catch (Exception e) {
          e.printStackTrace();
        }
        return bitmap;
      }
    });
    try {
      bitmap = future.get();
    } catch (Exception e) {
      e.printStackTrace();
    }
    return bitmap;
  }

}

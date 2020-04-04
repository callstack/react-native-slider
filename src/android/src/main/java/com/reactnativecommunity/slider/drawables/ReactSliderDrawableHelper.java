package com.reactnativecommunity.slider.drawables;

import android.content.res.ColorStateList;
import android.content.res.Resources;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.graphics.drawable.BitmapDrawable;
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

  private final ReactSlider mSlider;
  private final ForegroundDrawableHandler mProgressDrawableHandler;
  private final BackgroundDrawableHandler mBackgroundDrawableHandler;
  private final ThumbDrawableHandler mThumbDrawableHandler;

  public ReactSliderDrawableHelper(ReactSlider slider) {
    mSlider = slider;
    setViewBackgroundDrawable();
    mProgressDrawableHandler = new ForegroundDrawableHandler(mSlider);
    mBackgroundDrawableHandler = new BackgroundDrawableHandler(mSlider);
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

  public void setThumbImage(final String uri) {
    if (uri != null) {
      mSlider.setThumb(new ReactDrawable(getBitmapDrawable(mSlider, uri)));
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
          //break;
        }
        if (id == recruiterID) {
          handler.dispatchDraw();
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

  private static BitmapDrawable getBitmapDrawable(final View view, final String uri) {
    BitmapDrawable bitmapDrawable = null;
    ExecutorService executorService = Executors.newSingleThreadExecutor();
    Future<BitmapDrawable> future = executorService.submit(new Callable<BitmapDrawable>() {
      @Override
      public BitmapDrawable call() {
        BitmapDrawable bitmapDrawable = null;
        try {
          Bitmap bitmap = null;
          if (uri.startsWith("http://") || uri.startsWith("https://") ||
              uri.startsWith("file://") || uri.startsWith("asset://") || uri.startsWith("data:")) {
            bitmap = BitmapFactory.decodeStream(new URL(uri).openStream());
          } else {
            int drawableId = view.getResources()
                .getIdentifier(uri, "drawable", view.getContext()
                    .getPackageName());
            bitmap = BitmapFactory.decodeResource(view.getResources(), drawableId);
          }

          bitmapDrawable = new ThumbDrawableHandler.ThumbDrawable(view.getResources(), bitmap);
        } catch (Exception e) {
          e.printStackTrace();
        }
        return bitmapDrawable;
      }
    });
    try {
      bitmapDrawable = future.get();
    } catch (Exception e) {
      e.printStackTrace();
    }
    return bitmapDrawable;
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

  public static class ForegroundMirrorDrawableHandler extends ProgressDrawableHandler {
    public ForegroundMirrorDrawableHandler(ReactSlider slider) {
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

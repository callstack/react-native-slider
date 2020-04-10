package com.reactnativecommunity.slider;

import android.content.res.ColorStateList;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.PorterDuff;
import android.graphics.Rect;
import android.graphics.drawable.BitmapDrawable;
import android.graphics.drawable.ColorDrawable;
import android.graphics.drawable.Drawable;
import android.graphics.drawable.LayerDrawable;
import android.graphics.drawable.RippleDrawable;
import android.os.Build;
import android.util.Log;
import android.view.MotionEvent;
import android.view.View;

import androidx.annotation.IntDef;

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
      SliderDrawable.SLIDER,
      SliderDrawable.BACKGROUND,
      SliderDrawable.MAXIMUM_TRACK,
      SliderDrawable.MINIMUM_TRACK,
      SliderDrawable.THUMB
  })
  @Retention(RetentionPolicy.SOURCE)
  public @interface SliderDrawable {
    int SLIDER = 0;
    int BACKGROUND = 1;
    int MAXIMUM_TRACK = 2;
    int MINIMUM_TRACK = 3;
    int THUMB = 4;
  }

  private final ReactSlider mSlider;
  private final Drawable mOriginalThumb;
  private boolean mIsInverted = false;

  public ReactSliderDrawableHelper(ReactSlider slider) {
    mSlider = slider;
    mOriginalThumb = slider.getThumb().mutate();
    setViewBackgroundDrawable();
    LayerDrawable outDrawable = (LayerDrawable) slider.getProgressDrawable().getCurrent().mutate();
    Drawable progress = outDrawable.findDrawableByLayerId(android.R.id.progress).mutate();
    Drawable background = outDrawable.findDrawableByLayerId(android.R.id.background).mutate();

    outDrawable.setDrawableByLayerId(android.R.id.progress, new LayerDrawable(new Drawable[]{progress}) {
      @Override
      protected boolean onLevelChange(int level) {
        if (mSlider.getParent() instanceof ReactSliderContainer) {
          ((ReactSliderContainer) mSlider.getParent()).setLevel(level);
        }
        return super.onLevelChange(level);
      }

      @Override
      protected void onBoundsChange(Rect bounds) {
        super.onBoundsChange(bounds);
        if (mSlider.getParent() instanceof ReactSliderContainer) {
          ((ReactSliderContainer) mSlider.getParent()).setBounds(bounds);
        }
      }
    });
    outDrawable.setDrawableByLayerId(android.R.id.background, background);
    slider.setProgressDrawable(outDrawable);
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

  Drawable getDrawable(@SliderDrawable int type) {
    switch (type) {
      case SliderDrawable.BACKGROUND:
      case SliderDrawable.MAXIMUM_TRACK:
        return ((LayerDrawable) mSlider.getProgressDrawable()).findDrawableByLayerId(android.R.id.background);
      case SliderDrawable.MINIMUM_TRACK:
        return ((LayerDrawable) mSlider.getProgressDrawable()).findDrawableByLayerId(android.R.id.progress);
      case SliderDrawable.THUMB:
        return mSlider.getThumb();
      default:
        throw new Error("ReactSlider: bad id");
    }
  }

  public void setTintColor(@SliderDrawable int type, Integer color) {
    Drawable drawable = getDrawable(type);
    if (color == null) {
      drawable.clearColorFilter();
    } else {
      drawable.setColorFilter(color, PorterDuff.Mode.SRC_IN);
    }
    /*
    if (color == null) {
      mPaint.setColor(Color.TRANSPARENT);
    } else {
      mPaint.setColor(color);
    }

     */
  }

  void setThumbImage(final String uri) {
    if (uri != null) {
      BitmapDrawable drawable = new BitmapDrawable(mSlider.getResources(), getBitmap(mSlider, uri)) {
        @Override
        public void draw(Canvas canvas) {
          if (mIsInverted) canvas.scale(-1, 1);
          super.draw(canvas);
        }
      };
      mSlider.setThumb(drawable);
      // Enable alpha channel for the thumbImage
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
        mSlider.setSplitTrack(false);
      }
    } else {
      mSlider.setThumb(mOriginalThumb);
    }
  }

  public void setInverted(boolean inverted) {
    mIsInverted = inverted;
    mSlider.getThumb().invalidateSelf();
  }


  public void onTouchEvent(MotionEvent event) {
   // mThumbDrawableHandler.onTouchEvent(event);
  }

  public void tearDown() {
    /*
    mMinimumTrackDrawableHandler.tearDown();
    mMaximumTrackDrawableHandler.tearDown();
    mBackgroundDrawableHandler.tearDown();
    mThumbDrawableHandler.tearDown();

     */
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

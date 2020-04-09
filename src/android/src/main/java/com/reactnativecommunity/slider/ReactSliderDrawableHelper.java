package com.reactnativecommunity.slider;

import android.content.res.ColorStateList;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.graphics.Rect;
import android.graphics.drawable.ColorDrawable;
import android.graphics.drawable.Drawable;
import android.graphics.drawable.LayerDrawable;
import android.graphics.drawable.RippleDrawable;
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

  public ReactSliderDrawableHelper(ReactSlider slider) {
    mSlider = slider;
    setViewBackgroundDrawable();
    LayerDrawable outDrawable = (LayerDrawable) slider.getProgressDrawable().getCurrent().mutate();

    outDrawable.setDrawableByLayerId(android.R.id.progress, new ColorDrawable(Color.TRANSPARENT) {
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
    outDrawable.setDrawableByLayerId(android.R.id.background, new ColorDrawable(Color.TRANSPARENT));
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

  public void setInverted(boolean inverted) {
    /*
    DrawableHandler[] handlers = new DrawableHandler[]{
        mBackgroundDrawableHandler,
        mMinimumTrackDrawableHandler,
        mMaximumTrackDrawableHandler,
        mThumbDrawableHandler};
    for (DrawableHandler handler: handlers) {
      handler.setInverted(inverted);
    }

     */
  }

  public void setThumbImage(final String uri) {
    //mThumbDrawableHandler.setThumbImage(uri);
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

  static Bitmap getBitmap(final View view, final String uri) {
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

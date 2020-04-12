package com.reactnativecommunity.slider;

import android.animation.AnimatorSet;
import android.animation.ObjectAnimator;
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
import android.util.Property;
import android.view.MotionEvent;
import android.view.View;
import android.view.animation.AccelerateDecelerateInterpolator;

import androidx.annotation.IntDef;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.net.URL;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

class ReactSliderDrawableHelper {

  static final int MAX_LEVEL = 10000;
  private static long ANIM_DURATION = 400;
  private static long ANIM_DELAY = 250;
  private static float ANIM_MAX_SCALE = 1.2f;

  @IntDef({
      SliderDrawable.SLIDER,
      SliderDrawable.BACKGROUND,
      SliderDrawable.MAXIMUM_TRACK,
      SliderDrawable.MINIMUM_TRACK,
      SliderDrawable.THUMB
  })
  @Retention(RetentionPolicy.SOURCE)
  public @interface SliderDrawable {
    int SLIDER = 3;
    int BACKGROUND = 0;
    int MAXIMUM_TRACK = 1;
    int MINIMUM_TRACK = 2;
    int THUMB = 4;
  }

  private final ReactSlider mSlider;
  private boolean mIsInverted = false;
  private final Drawable mOriginalThumb;
  private boolean mIsCustomThumb = false;
  private final ThumbDrawableHelper mThumbDrawableHelper;

  ReactSliderDrawableHelper(ReactSlider slider) {
    mSlider = slider;
    mOriginalThumb = slider.getThumb().mutate();
    mThumbDrawableHelper = new ThumbDrawableHelper();
    setViewBackgroundDrawable();

    slider.setThumb(new LayerDrawable(new Drawable[]{mOriginalThumb}) {
      @Override
      protected void onBoundsChange(Rect bounds) {
        super.onBoundsChange(bounds);
        if (mSlider.getParent() instanceof ReactSliderContainer) {
          ((ReactSliderContainer) mSlider.getParent()).setThumbBounds(bounds);
        }
      }
    });


    LayerDrawable outDrawable = (LayerDrawable) slider.getProgressDrawable().getCurrent().mutate();
    Drawable progress = outDrawable.findDrawableByLayerId(android.R.id.progress).mutate();
    Drawable background = outDrawable.findDrawableByLayerId(android.R.id.background).mutate();

    LayerDrawable progressWrapper = new LayerDrawable(new Drawable[]{progress}) {
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
    };

    outDrawable.setDrawableByLayerId(android.R.id.progress, progressWrapper);
    outDrawable.setDrawableByLayerId(android.R.id.background, background);
    slider.setProgressDrawable(outDrawable);
  }

  /**
   * this fixes the thumb's ripple drawable and preserves it even when a background color is applied
   * when used with {@link #handleSetBackgroundColor(int)}
   */
  void setViewBackgroundDrawable() {
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
  void handleSetBackgroundColor(int color) {
    ((ColorDrawable) ((LayerDrawable) mSlider.getBackground()).getDrawable(0)).setColor(color);
  }

  private Drawable getDrawable(@SliderDrawable int type) {
    return getDrawable(mSlider, type);
  }

  int getProgress() {
    return ((LayerDrawable) mSlider.getProgressDrawable())
        .findDrawableByLayerId(android.R.id.progress)
        .getLevel();
  }

  void setTintColor(@SliderDrawable int type, Integer color) {
    Drawable drawable = getDrawable(type);
    if (color == null) {
      drawable.clearColorFilter();
    } else {
      drawable.setColorFilter(color, PorterDuff.Mode.SRC_IN);
    }
  }

  void setThumbImage(final String uri) {
    if (uri != null) {
      BitmapDrawable drawable = new BitmapDrawable(mSlider.getResources(), getBitmap(mSlider, uri)) {
        @Override
        public void draw(Canvas canvas) {
          mThumbDrawableHelper.onPreDraw(canvas);
          super.draw(canvas);
        }
      };
      mSlider.setThumb(drawable);
      // Enable alpha channel for the thumbImage
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
        mSlider.setSplitTrack(false);
      }
      mIsCustomThumb = true;
    } else {
      mSlider.setThumb(mOriginalThumb);
      mIsCustomThumb = false;
    }
  }

  void setInverted(boolean inverted) {
    mIsInverted = inverted;
    mSlider.getThumb().invalidateSelf();
  }

  void setVisible(@SliderDrawable int type, boolean visible) {
    Drawable drawable = getDrawable(type);
    drawable.setAlpha(visible ? 255 : 0);
  }

  void onTouchEvent(MotionEvent event) {
    mThumbDrawableHelper.onTouchEvent(event);
  }

  @SuppressWarnings("unused")
  class ThumbDrawableHelper {

    private float mScale = 1;
    private final AnimatorSet mScaleAnimator;

    ThumbDrawableHelper() {
      mScaleAnimator = new AnimatorSet();
      mScaleAnimator.setInterpolator(new AccelerateDecelerateInterpolator());
      mScaleAnimator.setDuration(ANIM_DURATION);
      mScaleAnimator.setStartDelay(ANIM_DELAY);
    }

    private Drawable get() {
      return mSlider.getThumb();
    };

    private void animate(float scale) {
      if (mScaleAnimator.isRunning()) {
        mScaleAnimator.cancel();
      }
      if (mIsCustomThumb) {
        ObjectAnimator scaleAnim = ObjectAnimator.ofFloat(
            this,
            Property.of(ThumbDrawableHelper.class, Float.class, "scale"),
            scale);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR2) {
          scaleAnim.setAutoCancel(true);
        }
        mScaleAnimator.play(scaleAnim);
        mScaleAnimator.start();
      }
    }

    /**
     * used by {@link #mScaleAnimator}
     */
    public float getScale() {
      return mScale;
    }

    /**
     * used by {@link #mScaleAnimator}
     */
    public void setScale(float scale) {
      mScale = scale;
      get().invalidateSelf();
    }

    void onTouchEvent(MotionEvent event) {
      int action = event.getActionMasked();
      if (action == MotionEvent.ACTION_DOWN) {
        animate(ANIM_MAX_SCALE);
      } else if (action == MotionEvent.ACTION_UP || action == MotionEvent.ACTION_CANCEL) {
        animate(1);
      }
    }

    void onPreDraw(Canvas canvas) {
      Rect bounds = get().getBounds();
      canvas.scale(mScale * (mIsInverted ? -1 : 1), mScale, bounds.centerX(), bounds.centerY());
    }
  }

  private static Drawable getDrawable(ReactSlider slider, @SliderDrawable int type) {
    switch (type) {
      case SliderDrawable.BACKGROUND:
      case SliderDrawable.MAXIMUM_TRACK:
        return ((LayerDrawable) slider.getProgressDrawable()).findDrawableByLayerId(android.R.id.background);
      case SliderDrawable.MINIMUM_TRACK:
        return ((LayerDrawable) slider.getProgressDrawable()).findDrawableByLayerId(android.R.id.progress);
      case SliderDrawable.THUMB:
        return slider.getThumb();
      case SliderDrawable.SLIDER:
      default:
        throw new Error("ReactSlider: bad id");
    }
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

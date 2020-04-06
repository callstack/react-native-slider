package com.reactnativecommunity.slider.drawables;

import android.animation.AnimatorSet;
import android.animation.ObjectAnimator;
import android.content.res.Resources;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Path;
import android.graphics.PointF;
import android.graphics.Rect;
import android.graphics.RectF;
import android.graphics.drawable.BitmapDrawable;
import android.graphics.drawable.Drawable;
import android.os.Build;
import android.util.Property;
import android.view.MotionEvent;
import android.view.View;
import android.view.animation.AccelerateDecelerateInterpolator;

import androidx.annotation.Nullable;

import com.facebook.react.bridge.ReactContext;
import com.reactnativecommunity.slider.ReactSlider;
import com.reactnativecommunity.slider.ReactSliderManager;

import static com.reactnativecommunity.slider.drawables.ReactSliderDrawableHelper.getBitmap;

public class ThumbDrawableHandler extends DrawableHandler {

  private static final long ANIM_DURATION = 400;
  private static final long ANIM_DELAY = 200;
  private static final float MAX_SCALE = 1.2f;

  private ReactSlider mSlider;
  private Paint mPaint = new Paint();
  private final ReactDrawable.ReactDrawableHelper mHelper;
  private final ThumbDrawableHelper mDrawableHelper;

  ThumbDrawableHandler(ReactSlider slider) {
    super((ReactContext) slider.getContext(), slider.getThumb());
    mSlider = slider;
    mHelper = new ReactDrawable.ReactDrawableHelper(this);
    mDrawableHelper = new ThumbDrawableHelper(mSlider.isInverted()) {
      @Override
      Drawable get() {
        return ThumbDrawableHandler.this.get();
      }
    };

  }

  @Override
  Drawable createDrawable(Resources res, Bitmap bitmap) {
    return mHelper.createDrawable(createFromBitmap(bitmap));
/*
    ReactDrawableGroup.Builder builder = new ReactDrawableGroup.Builder(this);
    return new ReactDrawableGroup.ReactRootDrawableGroup(builder) {
      @Override
      public PointF getCenter() {
        Rect bounds = ThumbDrawableHandler.this.getBounds();
        return new PointF(bounds.centerX(), bounds.centerY());
      }

      @Override
      public void transformBounds(Rect bounds) {
        //bounds.set(0, 0, bounds.width(), ForegroundDrawableHandler.this.getBarHeight(bounds));
      }

      @Override
      void onPreDraw(Canvas canvas) {
        ThumbDrawableHandler.this.onPreDraw(canvas);
        super.onPreDraw(canvas);
        //ThumbDrawableHandler.this.mDrawableHelper.onPreDraw(canvas);
      }
    };


 */
  }

  @Override
  public Drawable get() {
    return mSlider.getThumb();
  }

  @Nullable
  @Override
  ReactDrawable getReactDrawable() {
    if (get() instanceof ReactDrawable) {
      return ((ReactDrawable) get());
    } else {
      return null;
    }
  }

  @Override
  public void set(Drawable drawable) {
    mSlider.setThumb(drawable);
    mSlider.setProgress(mSlider.getProgress());
    get().jumpToCurrentState();
  }

  void setThumbImage(final String uri) {
    if (uri != null) {
      BitmapDrawable drawable = createFromBitmap(getBitmap(mSlider, uri));
      mSystemDrawable = false;
      set(drawable);
      // Enable alpha channel for the thumbImage
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
        mSlider.setSplitTrack(false);
      }
    } else {
      restoreToLast();
    }
    // adjust ripple immediately in case a touch is in progress, fixes system default behaviour
    mSlider.getBackground().setBounds(get().copyBounds());
  }

  @Override
  public void setTintColor(Integer color) {
    super.setTintColor(color);
    if (color == null) {
      mPaint.setColor(Color.TRANSPARENT);
    } else {
      mPaint.setColor(color);
    }
  }

  @Override
  Rect getBounds() {
    if (getView() != null) {
      Rect out = new Rect(0, 0, (int) (getView().getWidth()), (int) (getView().getHeight()));
      out.offset(0, super.getBounds().centerY() - out.centerY());
      return out;
    } else {
      return super.getBounds();
    }
  }

  void onPreDraw(Canvas canvas) {
    RectF bounds = new RectF(getBounds());
    View view = getView();
    RectF src = new RectF(0, 0, view.getWidth(), view.getHeight());
    PointF scale = new PointF(bounds.width() / src.width(),bounds.height() / src.height());
    float scaleOut = Math.min(scale.x, scale.y);
    PointF scaler = new PointF(scaleOut, scaleOut);
    // clip circle
    Path clipper = new Path();
    clipper.addCircle(
        canvas.getWidth() / 2,
        canvas.getHeight() / 2,
        Math.min(canvas.getWidth(), canvas.getHeight()) / 2,
        Path.Direction.CW);
    canvas.clipPath(clipper);
    // transform
    canvas.translate(
        (bounds.width() - src.width() * scaler.x) / 2,
        (bounds.height() - src.height() * scaler.y) / 2);
    canvas.scale(scaler.x, scaler.y);
    // draw
    canvas.drawPaint(mPaint);
  }

  @Override
  void draw(Canvas canvas, View view) {
    onPreDraw(canvas);
    view.draw(canvas);
  }

  void setInverted(boolean inverted) {
    mDrawableHelper.setInverted(inverted);
  }

  void onTouchEvent(MotionEvent event) {
    int action = event.getActionMasked();
    if (action == MotionEvent.ACTION_DOWN) {
      mDrawableHelper.animate(MAX_SCALE);
    } else if (action == MotionEvent.ACTION_UP || action == MotionEvent.ACTION_CANCEL) {
      mDrawableHelper.animate(1);
    }
  }

  BitmapDrawable createFromBitmap(Bitmap bitmap) {
    return new BitmapDrawable(mSlider.getResources(), bitmap) {
      @Override
      public void draw(Canvas canvas) {
        mDrawableHelper.onPreDraw(canvas);
        super.draw(canvas);
      }
    };
  }

  @SuppressWarnings("unused")
  static abstract class ThumbDrawableHelper {
    private float mScale = 1;
    private boolean mInverted;
    private final AnimatorSet mScaleAnimator;

    ThumbDrawableHelper(boolean inverted) {
      mInverted = inverted;
      mScaleAnimator = new AnimatorSet();
      mScaleAnimator.setInterpolator(new AccelerateDecelerateInterpolator());
      mScaleAnimator.setDuration(ANIM_DURATION);
      mScaleAnimator.setStartDelay(ANIM_DELAY);
    }

    void setInverted(boolean inverted) {
      if (mInverted != inverted) {
        mInverted = inverted;
        get().invalidateSelf();
      }
    }

    abstract Drawable get();

    private void animate(float scale) {
      if (mScaleAnimator.isRunning()) {
        mScaleAnimator.cancel();
      }
      if (get() != null) {
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

    public float getScale() {
      return mScale;
    }

    public void setScale(float scale) {
      mScale = scale;
      get().invalidateSelf();
    }

    /**
     * reverse scaleX due to {@link ReactSliderManager#setInverted(ReactSlider, boolean)}
     * so that the thumb remains the same
     * @param canvas
     */
    public void onPreDraw(Canvas canvas) {
      Rect bounds = get().getBounds();
      canvas.scale(mScale * (mInverted ? -1 : 1), mScale, bounds.centerX(), bounds.centerY());
    }
  }

}

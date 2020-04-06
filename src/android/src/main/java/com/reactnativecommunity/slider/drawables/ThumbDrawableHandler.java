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
import android.graphics.drawable.LayerDrawable;
import android.os.Build;
import android.util.Property;
import android.view.MotionEvent;
import android.view.View;
import android.view.animation.AccelerateDecelerateInterpolator;

import androidx.annotation.Nullable;

import com.facebook.react.bridge.ReactContext;
import com.reactnativecommunity.slider.ReactSlider;
import com.reactnativecommunity.slider.ReactSliderManager;

public class ThumbDrawableHandler extends DrawableHandler {

  private static final long ANIM_DURATION = 400;
  private static final long ANIM_DELAY = 200;
  private static final float MAX_SCALE = 1.2f;

  private ReactSlider mSlider;
  private final AnimatorSet mScaleAnimator;
  private Paint mPaint = new Paint();
  private final ReactDrawable.ReactDrawableHelper mHelper = new ReactDrawable.ReactDrawableHelper();

  ThumbDrawableHandler(ReactSlider slider) {
    super((ReactContext) slider.getContext(), slider.getThumb());
    mSlider = slider;
    mScaleAnimator = new AnimatorSet();
    mScaleAnimator.setInterpolator(new AccelerateDecelerateInterpolator());
    mScaleAnimator.setDuration(ANIM_DURATION);
    mScaleAnimator.setStartDelay(ANIM_DELAY);
  }

  @Override
  Drawable createDrawable(Resources res, Bitmap bitmap) {
    return mHelper.createDrawable(new ThumbDrawable(mSlider, bitmap), getView());
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

  @Override
  void draw(Canvas canvas, View view) {
    RectF bounds = new RectF(getBounds());
    RectF src = new RectF(0, 0, view.getWidth(), view.getHeight());
    PointF scale = new PointF(bounds.width() / src.width(), bounds.height() / src.height());
    float scaleOut = Math.min(scale.x, scale.y);
    PointF scaler = new PointF(scaleOut, scaleOut);
    // clip circle
    Path clipper = new Path();
    clipper.addCircle(canvas.getWidth() / 2, canvas.getHeight() / 2,
        Math.min(canvas.getWidth(), canvas.getHeight()) / 2, Path.Direction.CW);
    canvas.clipPath(clipper);
    // transform
    canvas.translate((bounds.width() - src.width() * scaler.x) / 2, (bounds.height() - src.height() * scaler.y) / 2);
    canvas.scale(scaler.x, scaler.y);
    // draw
    canvas.drawPaint(mPaint);
    view.draw(canvas);
  }

  @Nullable
  private ThumbDrawable getThumbDrawable() {
    if (get() instanceof LayerDrawable && ((LayerDrawable) get()).getDrawable(0) instanceof ThumbDrawable) {
      return ((ThumbDrawable) ((LayerDrawable) get()).getDrawable(0));
    } else if (get() instanceof ThumbDrawable) {
      return (ThumbDrawable) get();
    } else {
      return null;
    }
  }

  void setInverted(boolean inverted) {
    ThumbDrawable drawable = getThumbDrawable();
    if (drawable != null) {
      drawable.setInverted(inverted);
    }
  }

  private void animate(float scale) {
    if (mScaleAnimator.isRunning()) {
      mScaleAnimator.cancel();
    }
    ThumbDrawable drawable = getThumbDrawable();
    if (drawable != null) {
      ObjectAnimator scaleAnim = ObjectAnimator.ofFloat(drawable,
          Property.of(ThumbDrawable.class, Float.class, "scale"), scale);
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR2) {
        scaleAnim.setAutoCancel(true);
      }
      mScaleAnimator.play(scaleAnim);
      mScaleAnimator.start();
    }
  }

  void onTouchEvent(MotionEvent event) {
    int action = event.getActionMasked();
    if (action == MotionEvent.ACTION_DOWN) {
      animate(MAX_SCALE);
    } else if (action == MotionEvent.ACTION_UP || action == MotionEvent.ACTION_CANCEL) {
      animate(1);
    }
  }

  @SuppressWarnings("unused")
  static class ThumbDrawable extends BitmapDrawable implements ReactDrawable.DrawableChild {

    private float mScale = 1;
    private boolean mInverted;

    ThumbDrawable(ReactSlider slider, Bitmap bitmap) {
      this(slider.getResources(), bitmap, slider.isInverted());
    }

    ThumbDrawable(Resources res, Bitmap bitmap) {
      this(res, bitmap, false);
    }

    ThumbDrawable(Resources res, Bitmap bitmap, boolean inverted) {
      super(res, bitmap);
      mInverted = inverted;
    }
    
    void setInverted(boolean inverted) {
      if (mInverted != inverted) {
        mInverted = inverted;
        invalidateSelf();
      }
    }

    /**
     * used by {@link ThumbDrawableHandler#mScaleAnimator}
     * 
     * @return scale
     */
    public float getScale() {
      return mScale;
    }

    /**
     * used by {@link ThumbDrawableHandler#mScaleAnimator}
     * 
     * @param scale
     */
    public void setScale(float scale) {
      mScale = scale;
      invalidateSelf();
    }

    /**
     * reverse scaleX due to
     * {@link ReactSliderManager#setInverted(ReactSlider, boolean)} so that the
     * thumb remains the same
     * 
     * @param canvas
     */
    @Override
    public void draw(Canvas canvas) {
      Rect bounds = copyBounds();
      canvas.scale(mScale * (mInverted ? -1 : 1), mScale, bounds.centerX(), bounds.centerY());
      super.draw(canvas);
    }

    @Override
    public PointF getCenter() {
      Rect bounds = copyBounds();
      return new PointF(bounds.centerX(), bounds.centerY());
    }
  }
}

package com.reactnativecommunity.slider.ReactSliderDrawable;

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
import android.graphics.drawable.ScaleDrawable;
import android.os.Build;
import android.util.Property;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.view.animation.LinearInterpolator;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.ReactContext;
import com.reactnativecommunity.slider.ReactSlider;

public class ThumbDrawableHandler extends DrawableHandler {
  private ReactSlider mSlider;
  private final AnimatorSet mScaleAnimator;
  private float mScale = 1;
  private Paint mPaint = new Paint();
  private static final long ANIM_DURATION = 500;
  private static final long ANIM_DELAY = 200;
  private ReactDrawable mDrawableWrapper;

  public ThumbDrawableHandler(ReactSlider slider) {
    super((ReactContext) slider.getContext(), slider.getThumb());
    mSlider = slider;
    mScaleAnimator = new AnimatorSet();
    mScaleAnimator.setInterpolator(new LinearInterpolator());
    mScaleAnimator.setDuration(ANIM_DURATION);
    mScaleAnimator.setStartDelay(ANIM_DELAY);
  }

  @Override
  Drawable createDrawable(Resources res, Bitmap bitmap) {
    if (mDrawableWrapper == null) {
      mDrawableWrapper = new ReactDrawable(res, bitmap);
      mDrawableWrapper.setBounds(getBounds());
    } else {
      mDrawableWrapper = new ReactDrawable(res, bitmap) {
        @Override
        public void draw(@NonNull Canvas canvas) {
          //canvas.drawPaint(mPaint);
          canvas.translate(canvas.getWidth() / 2, canvas.getHeight() / 2);
          super.draw(canvas);
        }


      };
      mDrawableWrapper.setBounds(getBounds());
    }
    return mDrawableWrapper;
  }

  @Override
  public Drawable get() {
    return mSlider.getThumb();
  }

  @Override
  public void set(Drawable drawable) {
    mSlider.setThumb(drawable);
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
      return new Rect(0, 0, (int) (getView().getWidth() * mScale), (int) (getView().getHeight() * mScale));
    } else {
      return super.getBounds();
    }
  }

  @Override
  void draw(Canvas canvas, View view) {
    RectF bounds = new RectF(getBounds());
    RectF src = new RectF(0, 0, view.getWidth(), view.getHeight());
    PointF scale = new PointF(bounds.width() / src.width(),bounds.height() / src.height());
    float scaleOut = Math.min(scale.x, scale.y);

    /*
      reverse scaleX due to {@link ReactSliderManager#setInverted(ReactSlider, boolean)}
     */
    PointF scaler = new PointF(scaleOut * (mSlider.isInverted() ? -1 : 1), scaleOut);
    // clip circle
    Path clipper = new Path();
    clipper.addCircle(
        canvas.getWidth() / 2,
        canvas.getHeight() / 2,
        Math.min(canvas.getWidth(), canvas.getHeight()) / 2,
        Path.Direction.CW);
    canvas.clipPath(clipper);
    // transform
    canvas.scale(mScale, mScale, canvas.getWidth() / 2, canvas.getHeight() / 2);
    canvas.translate(
        (bounds.width() - src.width() * scaler.x) / 2,
        (bounds.height() - src.height() * scaler.y) / 2);
    canvas.scale(scaler.x, scaler.y);
    // draw
    canvas.drawPaint(mPaint);
    view.draw(canvas);
  }

  class ThumbDrawable extends ReactDrawable {

    public ThumbDrawable(Resources res, Bitmap bitmap) {
      super(res, bitmap);
    }

    @Override
    public void draw(@NonNull Canvas canvas) {
      RectF bounds = new RectF(getBounds());
      RectF src = new RectF(0, 0, getView().getWidth(), getView().getHeight());
      PointF scale = new PointF(bounds.width() / src.width(),bounds.height() / src.height());
      float scaleOut = Math.min(scale.x, scale.y);

    /*
      reverse scaleX due to {@link ReactSliderManager#setInverted(ReactSlider, boolean)}
     */
      PointF scaler = new PointF(scaleOut * (mSlider.isInverted() ? -1 : 1), scaleOut);
      // clip circle
      Path clipper = new Path();
      clipper.addCircle(
          bounds.width() / 2,
          bounds.height() / 2,
          Math.min(bounds.width(), bounds.height()) / 2,
          Path.Direction.CW);
      canvas.clipPath(clipper);
      // transform
      canvas.scale(mScale, mScale, bounds.width() / 2, bounds.height() / 2);
      canvas.translate(
          (bounds.width() - src.width() * scaler.x) / 2,
          (bounds.height() - src.height() * scaler.y) / 2);
      canvas.scale(scaler.x, scaler.y);
      // draw
      canvas.drawPaint(mPaint);
      super.draw(canvas);
    }
  }

  /**
   * used by {@link ThumbDrawableHandler#mScaleAnimator}
   * @return
   */
  @SuppressWarnings("unused")
  public float getScale() {
    return mScale;
  }

  /**
   * used by {@link ThumbDrawableHandler#mScaleAnimator}
   * @param scale
   */
  @SuppressWarnings("unused")
  public void setScale(float scale) {
    mScale = scale;
    dispatchDraw();
  }

  void start() {
    if (isCustomDrawable()) {
      animate(1.2f);
    }
  }

  void end() {
    if (isCustomDrawable()) {
      animate(1);
    }
  }

  private void animate(float scaler) {
    if (mScaleAnimator.isRunning()) {
      mScaleAnimator.cancel();
    }
    if (get() instanceof ReactDrawable) {
      ReactDrawable drawable = (ReactDrawable) get();
      ObjectAnimator scaleXAnim = ObjectAnimator.ofFloat(
          drawable,
          Property.of(ReactDrawable.class, Float.class, "scaleX"),
          scaler);
      ObjectAnimator scaleYAnim = ObjectAnimator.ofFloat(
          drawable,
          Property.of(ReactDrawable.class, Float.class, "scaleY"),
          scaler);
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR2) {
        scaleXAnim.setAutoCancel(true);
        scaleYAnim.setAutoCancel(true);
      }
      mScaleAnimator.playTogether(scaleXAnim, scaleYAnim);
      mScaleAnimator.start();
    }
  }

  public void onTouchEvent(MotionEvent event) {
    int action = event.getActionMasked();
    if (isCustomDrawable()) {
      if (action == MotionEvent.ACTION_DOWN) {
        start();
      } else if (action == MotionEvent.ACTION_UP || action == MotionEvent.ACTION_CANCEL) {
        end();
      }
    }
  }
}

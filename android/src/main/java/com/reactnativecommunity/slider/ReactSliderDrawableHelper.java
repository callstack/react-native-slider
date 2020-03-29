package com.reactnativecommunity.slider;

import android.animation.AnimatorSet;
import android.animation.ObjectAnimator;
import android.content.res.Resources;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Path;
import android.graphics.PointF;
import android.graphics.PorterDuff;
import android.graphics.Rect;
import android.graphics.RectF;
import android.graphics.drawable.BitmapDrawable;
import android.graphics.drawable.Drawable;
import android.graphics.drawable.LayerDrawable;
import android.os.Build;
import android.util.Property;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewTreeObserver;
import android.view.animation.LinearInterpolator;

import com.facebook.react.bridge.ReactContext;
import com.facebook.react.uimanager.NativeViewHierarchyManager;
import com.facebook.react.uimanager.UIBlock;
import com.facebook.react.uimanager.UIManagerModule;

import javax.annotation.Nullable;

public class ReactSliderDrawableHelper {

  private abstract static class DrawableHandler implements ViewTreeObserver.OnDrawListener {
    private final ReactContext mContext;
    private final Drawable mOriginal;
    private View mView;
    private boolean mIsDrawing = false;
    private float mAlpha = 1;

    DrawableHandler(ReactContext context, Drawable original) {
      mContext = context;
      mOriginal = original;
    }

    Drawable createDrawable(Resources res, Bitmap bitmap) {
      return new BitmapDrawable(res, bitmap);
    }

    abstract Drawable get();
    abstract void set(Drawable drawable);
    abstract void draw(Canvas canvas, View view);

    boolean isCustomDrawable() {
      return mView != null;
    }

    @Override
    public void onDraw() {
      if (mView != null && !mIsDrawing && mView.isDirty()) {
        draw();
      }
    }

    final void setView(final int tag) {
      if (tag == View.NO_ID) {
        setView(null);
      } else {
        UIManagerModule uiManagerModule = mContext.getNativeModule(UIManagerModule.class);
        uiManagerModule.addUIBlock(new UIBlock() {
          @Override
          public void execute(NativeViewHierarchyManager nativeViewHierarchyManager) {
            View view = nativeViewHierarchyManager.resolveView(tag);
            setView(view);
          }
        });
      }
    }

    final void setView(@Nullable View view) {
      if (mView != view) {
        if (mView != null) {
          DrawListenerRegistry.unregisterListener(mView, this);
        }
        if (view != null) {
          DrawListenerRegistry.registerListener(view, this);
        }
      }
      mView = view;
      if (mView != null) {
        mAlpha = mView.getAlpha();
        draw();
      } else {
        mAlpha = 1;
        restore();
      }
    }

    final void tearDown() {
      if (mView != null) {
        DrawListenerRegistry.unregisterListener(mView, this);
      }
    }

    synchronized void draw() {
      mIsDrawing = true;
      Rect bounds = get().copyBounds();
      Bitmap bitmap = Bitmap.createBitmap(bounds.width(), bounds.height(), Bitmap.Config.ARGB_8888);
      Canvas canvas = new Canvas(bitmap);
      draw(canvas, mView);
      Drawable outDrawable = createDrawable(mContext.getResources(), bitmap);
      outDrawable.setAlpha((int) (mAlpha * 255));
      set(outDrawable);
      invalidate();
      mIsDrawing = false;
    }

    final void restore() {
      set(mOriginal);
      invalidate();
    }

    private void invalidate() {
      get().invalidateSelf();
    }

    void setTintColor(Integer color) {
      if (color == null) {
        get().clearColorFilter();
      } else {
        get().setColorFilter(color, PorterDuff.Mode.SRC_IN);
      }
    }
  }

  private static class DrawListenerRegistry {
    static void registerListener(final View view, final ViewTreeObserver.OnDrawListener listener) {
      ViewTreeObserver treeObserver = view.getViewTreeObserver();
      try {
        treeObserver.addOnDrawListener(listener);
      } catch (Throwable throwable) {
        view.post(new Runnable() {
          @Override
          public void run() {
            registerListener(view, listener);
          }
        });
      }
    }

    static void unregisterListener(final View view, final ViewTreeObserver.OnDrawListener listener) {
      ViewTreeObserver treeObserver = view.getViewTreeObserver();
      try {
        treeObserver.removeOnDrawListener(listener);
      } catch (Throwable throwable) {
        view.post(new Runnable() {
          @Override
          public void run() {
            unregisterListener(view, listener);
          }
        });
      }
    }
  }

  static class ThumbDrawableHandler extends DrawableHandler {
    private ReactSlider mSlider;
    private final AnimatorSet mScaleAnimator;
    private float mScale = 1;
    private Paint mPaint = new Paint();
    private static final long ANIM_DURATION = 500;
    private static final long ANIM_DELAY = 200;

    public ThumbDrawableHandler(ReactSlider slider) {
      super((ReactContext) slider.getContext(), slider.getThumb());
      mSlider = slider;
      mScaleAnimator = new AnimatorSet();
      mScaleAnimator.setInterpolator(new LinearInterpolator());
      mScaleAnimator.setDuration(ANIM_DURATION);
      mScaleAnimator.setStartDelay(ANIM_DELAY);
    }

    @Override
    public Drawable get() {
      return mSlider.getThumb();
    }

    @Override
    public void set(Drawable drawable) {
      mSlider.setThumb(drawable);
    }

    @Override
    void setTintColor(Integer color) {
      super.setTintColor(color);
      if (color == null) {
        mPaint.setColor(Color.TRANSPARENT);
      } else {
        mPaint.setColor(color);
      }
    }

    @Override
    public void draw(Canvas canvas, View view) {
      RectF bounds = new RectF(get().copyBounds());
      RectF src = new RectF(0, 0, view.getWidth(), view.getHeight());
      PointF scale = new PointF(bounds.width() / src.width(),bounds.height() / src.height());
      float scaleOut = Math.min(scale.x, scale.y);
      // clip circle
      Path clipper = new Path();
      clipper.addCircle(canvas.getWidth() / 2, canvas.getHeight() / 2,canvas.getWidth() / 2, Path.Direction.CW);
      canvas.clipPath(clipper);
      // transform
      canvas.scale(mScale, mScale, canvas.getWidth() / 2, canvas.getHeight() / 2);
      canvas.translate(
              (bounds.width() - src.width() * scaleOut) / 2,
              (bounds.height() - src.height() * scaleOut) / 2);
      canvas.scale(scaleOut, scaleOut);
      // draw
      canvas.drawPaint(mPaint);
      view.draw(canvas);
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
      if (isCustomDrawable()) {
        draw();
      }
    }

    void start() {
      if (isCustomDrawable()) {
        animate(2);
      }
    }

    void end() {
      if (isCustomDrawable()) {
        animate(1);
      }
    }

    private void animate(float scale) {
      if (mScaleAnimator.isRunning()) {
        mScaleAnimator.cancel();
      }
      final ObjectAnimator scaleAnim = ObjectAnimator.ofFloat(
              this,
              Property.of(ThumbDrawableHandler.class, Float.class, "scale"),
              scale);
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR2) {
        scaleAnim.setAutoCancel(true);
      }
      mScaleAnimator.play(scaleAnim);
      mScaleAnimator.start();
    }

    void onTouchEvent(MotionEvent event) {
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

 private static class ProgressDrawableHandler extends DrawableHandler {
    final ReactSlider mSlider;
    private final int mLayerID;
    private Integer mColor;

    public ProgressDrawableHandler(ReactSlider slider, int layerID) {
      super((ReactContext) slider.getContext(), slider.getProgressDrawable());
      mSlider = slider;
      mLayerID = layerID;
    }

    @Override
    public Drawable get() {
      LayerDrawable drawable = (LayerDrawable) mSlider.getProgressDrawable().getCurrent();
      return drawable.findDrawableByLayerId(mLayerID);
    }

    @Override
    public void set(Drawable drawable) {
      LayerDrawable outDrawable = (LayerDrawable) mSlider.getProgressDrawable().getCurrent();
      outDrawable.setDrawableByLayerId(mLayerID, drawable);
    }

    @Override
    public void draw(Canvas canvas, View view) {
      RectF bounds = new RectF(get().copyBounds());
      RectF src = new RectF(0, 0, view.getWidth(), view.getHeight());
      int barHeight = mSlider.getIndeterminateDrawable().getIntrinsicHeight();
      PointF scale = new PointF(bounds.width() / src.width(),barHeight / src.height());
      canvas.translate(0, (bounds.height() - barHeight) / 2);
      canvas.scale(scale.x, scale.y);
      view.draw(canvas);
    }
  }

  static class ForegroundDrawableHandler extends ProgressDrawableHandler {
    ForegroundDrawableHandler(ReactSlider slider) {
      super(slider, android.R.id.progress);
    }

    @Override
    Drawable createDrawable(Resources res, Bitmap bitmap) {
      return new UpdatingBitmapDrawable(res, bitmap, get().getLevel());
    }

    private class UpdatingBitmapDrawable extends BitmapDrawable {
      UpdatingBitmapDrawable(Resources res, Bitmap bitmap, int level) {
        super(res, bitmap);
        setLevel(level);
      }

      @Override
      protected boolean onLevelChange(int level) {
        return true;
      }

      @Override
      public void draw(Canvas canvas) {
        float levelScale = getLevel() * 1.f / 10000 * 1.f;
        canvas.save();
        //// TODO: 29/03/2020 configure inverted 
        boolean inverted = false;
        if (inverted) {
          Rect bounds = getBounds();
          canvas.translate(bounds.width() * (1 - levelScale), 0);
        }
        canvas.scale(levelScale, 1);
        super.draw(canvas);
        canvas.restore();
      }
    }
  }

  static class BackgroundDrawableHandler extends ProgressDrawableHandler {
    BackgroundDrawableHandler(ReactSlider slider) {
      super(slider, android.R.id.background);
    }
  }

}

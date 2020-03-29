package com.reactnativecommunity.slider;

import android.animation.AnimatorSet;
import android.animation.ObjectAnimator;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Path;
import android.graphics.PointF;
import android.graphics.Rect;
import android.graphics.RectF;
import android.graphics.drawable.BitmapDrawable;
import android.graphics.drawable.Drawable;
import android.os.Build;
import android.util.Property;
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

      DrawableHandler(ReactContext context, Drawable original) {
        mContext = context;
        mOriginal = original;
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
          draw();
        } else {
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
        Drawable outDrawable = new BitmapDrawable(mContext.getResources(), bitmap);
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

      public ThumbDrawableHandler(ReactSlider slider) {
        super((ReactContext) slider.getContext(), slider.getThumb());
        mSlider = slider;
        mScaleAnimator = new AnimatorSet();
        mScaleAnimator.setInterpolator(new LinearInterpolator());
        mScaleAnimator.setDuration(500);
        mScaleAnimator.setStartDelay(200);
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
    }

    static class ProgressDrawableHandler extends DrawableHandler {
      private ReactSlider mSlider;

      public ProgressDrawableHandler(ReactSlider slider) {
        super((ReactContext) slider.getContext(), slider.getProgressDrawable());
        mSlider = slider;
      }

      @Override
      public Drawable get() {
        return mSlider.getProgressDrawable();
      }

      @Override
      public void set(Drawable drawable) {
        mSlider.setProgressDrawable(drawable);
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

}

package com.reactnativecommunity.slider.drawables;

import android.content.res.Resources;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.PointF;
import android.graphics.Rect;
import android.graphics.RectF;
import android.graphics.drawable.BitmapDrawable;
import android.graphics.drawable.ColorDrawable;
import android.graphics.drawable.Drawable;
import android.graphics.drawable.LayerDrawable;
import android.view.View;

import androidx.annotation.Nullable;

import com.facebook.react.bridge.ReactContext;
import com.reactnativecommunity.slider.R;
import com.reactnativecommunity.slider.ReactSlider;

abstract class ProgressDrawableHandler extends DrawableHandler {

  /**
   * IMPORTANT
   * This method prepares the slider's drawables for usage by this class
   * Call this method before using this class
   * @param slider
   */
  static void init(ReactSlider slider) {
    LayerDrawable outDrawable = (LayerDrawable) slider.getProgressDrawable().getCurrent().mutate();
    LayerDrawable progressDrawable = ((LayerDrawable) slider.getResources().getDrawable(R.drawable.progress_layer).mutate());
    progressDrawable.setDrawableByLayerId(ForegroundDrawableHandler.DRAWABLE_ID1, outDrawable.findDrawableByLayerId(ForegroundDrawableHandler.DRAWABLE_ID).mutate());
    progressDrawable.setDrawableByLayerId(ForegroundDrawableHandler.DRAWABLE_ID2, outDrawable.findDrawableByLayerId(BackgroundDrawableHandler.DRAWABLE_ID).mutate());
    outDrawable.setDrawableByLayerId(ForegroundDrawableHandler.DRAWABLE_ID, progressDrawable);
    outDrawable.setDrawableByLayerId(BackgroundDrawableHandler.DRAWABLE_ID, new ColorDrawable(Color.TRANSPARENT));
    slider.setProgressDrawable(outDrawable);
  }

  final ReactSlider mSlider;
  final ReactDrawable.ReactDrawableHelper mHelper;

  static Drawable getDrawableByID(ReactSlider slider, int layerID) {
    LayerDrawable drawable = (LayerDrawable) slider.getProgressDrawable().getCurrent();
    return drawable.findDrawableByLayerId(layerID);
  }

  static Drawable getDrawableByIndex(ReactSlider slider, int index) {
    LayerDrawable drawable = (LayerDrawable) slider.getProgressDrawable().getCurrent();
    if (index >= 0 && index < drawable.getNumberOfLayers()) {
      return drawable.getDrawable(index);
    } else {
      return null;
    }
  }

  ProgressDrawableHandler(ReactSlider slider, Drawable original) {
    super((ReactContext) slider.getContext(), original);
    mSlider = slider;
    mHelper = new ReactDrawable.ReactDrawableHelper(this);
  }

  @Override
  Drawable createDrawable(Resources res, Bitmap bitmap) {
    return mHelper.createDrawable(new BitmapDrawable(res, bitmap));
  }

  private static void refresh(Drawable drawable) {
    drawable.setState(new int[]{});
    drawable.jumpToCurrentState();
    drawable.setState(new int[]{android.R.attr.state_enabled});
    drawable.jumpToCurrentState();
  }

  private int getIntrinsicBarHeight() {
    return mSlider.getIndeterminateDrawable().getIntrinsicHeight();
  }

  int getBarHeight(Rect bounds) {
    View view = getView();
    RectF src = new RectF(0, 0, view.getWidth(), view.getHeight());
    return (int) Math.max(Math.min(bounds.height(), src.height()), getIntrinsicBarHeight());
  }

  @Override
  Rect getBounds() {
    return new Rect(0, 0, mSlider.getWidth(), mSlider.getHeight());
  }

  void onPreDraw(Canvas canvas) {
    View view = getView();
    RectF bounds = new RectF(getBounds());
    RectF src = new RectF(0, 0, view.getWidth(), view.getHeight());
    float barHeight = Math.max(Math.min(bounds.height(), src.height()), getIntrinsicBarHeight());
    PointF scale = new PointF(bounds.width() / src.width(),barHeight / src.height());
    canvas.translate(0, (bounds.height() - barHeight) / 2);
    canvas.scale(scale.x, scale.y);
  }

  @Override
  public void draw(Canvas canvas, View view) {
    onPreDraw(canvas);
    view.draw(canvas);
  }

  static abstract class ProgressDrawableHelper implements DrawableHelper {
    private final boolean mIsSecondary;

    ProgressDrawableHelper(boolean isSecondary) {
      mIsSecondary = isSecondary;
    }

    private float getScale() {
      float mLevelScale = get().getLevel() * 1.f / ReactSliderDrawableHelper.MAX_LEVEL * 1.f;
      if (mIsSecondary) mLevelScale = 1 - mLevelScale;
      return mLevelScale;
    }

    @Override
    public PointF getCenter() {
      Rect bounds = get().getBounds();
      float x = bounds.centerX() * getScale();
      if (mIsSecondary) x = bounds.width() - x;
      return new PointF(x, bounds.centerY());
    }

    @Override
    public void onPreDraw(Canvas canvas) {
      float scale = getScale();
      if (mIsSecondary) {
        Rect bounds = get().getBounds();
        canvas.translate(bounds.width() * (1 - scale), 0);
      }
      canvas.scale(scale, 1);
    }
  }

  static class ProgressBitmapDrawable extends LayerDrawable implements ReactDrawable.DrawableCenter {

    private final ProgressDrawableHelper mHelper;

    ProgressBitmapDrawable(Resources res, Bitmap bitmap) {
      this(res, bitmap, false);
    }

    ProgressBitmapDrawable(Resources res, Bitmap bitmap, boolean inverted) {
      this(new BitmapDrawable(res, bitmap), inverted);
    }

    ProgressBitmapDrawable(Drawable drawable, boolean inverted) {
      this(new Drawable[]{drawable}, inverted);
    }

    ProgressBitmapDrawable(Drawable[] layers, boolean inverted) {
      super(layers);
      mHelper = new ProgressDrawableHelper(inverted) {
        @Override
        public Drawable get() {
          return ProgressBitmapDrawable.this;
        }
      };
    }

    @Override
    public PointF getCenter() {
      return mHelper.getCenter();
    }

    public void draw(Canvas canvas) {
      canvas.save();
      mHelper.onPreDraw(canvas);
      super.draw(canvas);
      canvas.restore();
    }
  }

  static class ForegroundDrawableHandler extends ProgressDrawableHandler {

    static int DRAWABLE_ID = android.R.id.progress;
    static int DRAWABLE_ID1 = android.R.id.progress;
    static int DRAWABLE_ID2 = android.R.id.secondaryProgress;

    private final int mLayerID;
    private final ProgressDrawableHelper mDrawableHelper;

    ForegroundDrawableHandler(ReactSlider slider, int layerID) {
      super(slider, ((LayerDrawable) getDrawableByID(slider, DRAWABLE_ID)).findDrawableByLayerId(layerID));
      mLayerID = layerID;
      mDrawableHelper = new ProgressDrawableHelper(mLayerID == DRAWABLE_ID2) {
        @Override
        public Drawable get() {
          return ForegroundDrawableHandler.this.get();
        }
      };
    }

    @Override
    public Drawable get() {
      LayerDrawable progressDrawable = (LayerDrawable) getDrawableByID(mSlider, DRAWABLE_ID);
      return progressDrawable.findDrawableByLayerId(mLayerID);
    }

    @Nullable
    @Override
    ReactDrawable getReactDrawable() {
      return (ReactDrawable) get();
      //return (ReactDrawable) ((LayerDrawable) get()).getDrawable(0);
    }

    @Override
    public void set(Drawable drawable) {
      LayerDrawable outDrawable = (LayerDrawable) mSlider.getProgressDrawable().getCurrent();
      LayerDrawable progress = ((LayerDrawable) getDrawableByID(mSlider, DRAWABLE_ID));
      progress.setDrawableByLayerId(mLayerID, drawable);
      refresh(progress);
      refresh(outDrawable);
    }

    @Override
    Drawable createDrawable(Resources res, Bitmap bitmap) {
      //return mHelper.createDrawable(new ProgressBitmapDrawable(new BitmapDrawable(res, bitmap), mLayerID == DRAWABLE_ID2));

      ReactDrawableGroup.Builder builder = new ReactDrawableGroup.Builder(this);
      return new ReactDrawableGroup.ReactRootDrawableGroup(builder) {
        @Override
        public PointF getCenter() {
          return ForegroundDrawableHandler.this.mDrawableHelper.getCenter();
        }

        @Override
        public void transformBounds(Rect bounds) {
          bounds.set(0, 0, bounds.width(), ForegroundDrawableHandler.this.getBarHeight(bounds));
        }

        @Override
        void onPreDraw(Canvas canvas) {
          ForegroundDrawableHandler.this.onPreDraw(canvas);
          super.onPreDraw(canvas);
          ForegroundDrawableHandler.this.mDrawableHelper.onPreDraw(canvas);
        }
      };

    }
  }

  static class MinimumTrackHandler extends ForegroundDrawableHandler {
    MinimumTrackHandler(ReactSlider slider) {
      super(slider, DRAWABLE_ID1);
    }
  }

  static class MaximumTrackHandler extends ForegroundDrawableHandler {
    MaximumTrackHandler(ReactSlider slider) {
      super(slider, DRAWABLE_ID2);
    }
  }

  static class BackgroundDrawableHandler extends ProgressDrawableHandler {
    static int DRAWABLE_ID = android.R.id.background;
    BackgroundDrawableHandler(ReactSlider slider) {
      super(slider, getDrawableByID(slider, DRAWABLE_ID));
    }

    @Override
    public Drawable get() {
      return getDrawableByID(mSlider, DRAWABLE_ID);
    }

    @Override
    public void set(Drawable drawable) {
      LayerDrawable outDrawable = (LayerDrawable) mSlider.getProgressDrawable().getCurrent();
      outDrawable.setDrawableByLayerId(DRAWABLE_ID, drawable);
      refresh(outDrawable);
    }
  }
}

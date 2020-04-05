package com.reactnativecommunity.slider.drawables;

import android.content.res.Resources;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.PorterDuff;
import android.graphics.Rect;
import android.graphics.drawable.Drawable;
import android.view.View;
import android.view.ViewTreeObserver;

import androidx.annotation.Nullable;

import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.UiThreadUtil;
import com.facebook.react.uimanager.ReactStylesDiffMap;
import com.facebook.react.uimanager.UIManagerModule;

public abstract class DrawableHandler implements ViewTreeObserver.OnDrawListener, PropsUpdater {
  private final ReactContext mContext;
  private final Drawable mOriginal;
  private View mView;
  private boolean mIsDrawing = false;

  DrawableHandler(ReactContext context, Drawable original) {
    mContext = context;
    mOriginal = original;
  }

  Drawable createDrawable(Resources res, Bitmap bitmap) {
    return new ReactDrawable(res, bitmap, getView());
  }

  abstract Drawable get();
  abstract void set(Drawable drawable);
  abstract void draw(Canvas canvas, View view);

  @Nullable
  ReactDrawable getReactDrawable() {
    return null;
  }

  public final View getView() {
    return mView;
  }

  @Override
  public void onDraw() {
    if (mView != null && !mIsDrawing && mView.isDirty()) {
      draw();
    }
  }

  public final void setView(final int tag) {
    if (tag == View.NO_ID) {
      setView(null);
    } else {
      UiThreadUtil.runOnUiThread(new Runnable() {
        @Override
        public void run() {
          UIManagerModule uiManagerModule = mContext.getNativeModule(UIManagerModule.class);
          View view = uiManagerModule.resolveView(tag);
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

  public final void tearDown() {
    if (mView != null) {
      DrawListenerRegistry.unregisterListener(mView, this);
    }
  }

  Rect getBounds() {
    return get().copyBounds();
  }

  final void dispatchDraw() {
    if (mView != null) draw();
  }

  private synchronized void draw() {
    mIsDrawing = true;
    Rect bounds = getBounds();
    Bitmap bitmap = Bitmap.createBitmap(bounds.width(), bounds.height(), Bitmap.Config.ARGB_8888);
    Canvas canvas = new Canvas(bitmap);
    draw(canvas, mView);
    Drawable outDrawable = createDrawable(mContext.getResources(), bitmap);
    outDrawable.setState(get().getState());
    outDrawable.setLevel(get().getLevel());
    set(outDrawable);
    invalidate();
    mIsDrawing = false;
  }

  private void restore() {
    mOriginal.setLevel(get().getLevel());
    set(mOriginal);
    invalidate();
  }

  private void invalidate() {
    get().invalidateSelf();
  }

  public void setTintColor(Integer color) {
    if (color == null) {
      get().clearColorFilter();
    } else {
      get().setColorFilter(color, PorterDuff.Mode.SRC_IN);
    }
  }

  @Override
  public void updateFromProps(int tag, ReactStylesDiffMap props) {
    if (props == null) return;
    ReactDrawable drawable = getReactDrawable();
    if (drawable == null) return;
    if (drawable instanceof ReactDrawableGroup.ReactRootDrawableGroup) {
      ((ReactDrawableGroup.ReactRootDrawableGroup) drawable).updateFromProps(tag, props);
    } else if (tag == getView().getId()) {
      drawable.updateFromProps(props);
    }
  }
}

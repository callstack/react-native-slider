package com.reactnativecommunity.slider;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Rect;
import android.view.ViewGroup;

import androidx.annotation.NonNull;

import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewGroupManager;
import com.facebook.react.views.view.ReactViewGroup;

public class ReactSliderProgressClippingViewManager extends ViewGroupManager<ReactSliderProgressClippingViewManager.ProgressClippingView> {

  private static final String REACT_CLASS = "RNCSliderProgressClippingView";

  @NonNull
  @Override
  public String getName() {
    return REACT_CLASS;
  }

  @NonNull
  @Override
  protected ProgressClippingView createViewInstance(@NonNull ThemedReactContext reactContext) {
    return new ProgressClippingView(reactContext);
  }

  static class ProgressClippingView extends ReactViewGroup {
    private Rect mRect = new Rect();
    public ProgressClippingView(Context context) {
      super(context);
    }

    @Override
    protected void dispatchDraw(Canvas canvas) {
      mRect.set(0, 0, 0, 0);
      ViewGroup root = (ViewGroup) getRootView();
      root.offsetDescendantRectToMyCoords(this, mRect);
      canvas.clipRect(0, mRect.top, getWidth(), getRootView().getHeight() - mRect.top);
      super.dispatchDraw(canvas);
    }
  }
}

package com.reactnativecommunity.slider;

import android.util.Log;
import android.view.View;
import android.widget.SeekBar;

import androidx.annotation.NonNull;
import androidx.annotation.StringDef;

import com.facebook.react.uimanager.LayoutShadowNode;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewGroupManager;
import com.facebook.react.uimanager.ViewProps;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.facebook.yoga.YogaMeasureFunction;
import com.facebook.yoga.YogaMeasureMode;
import com.facebook.yoga.YogaMeasureOutput;
import com.facebook.yoga.YogaNode;

public class ReactSliderContainerManager extends ViewGroupManager<ReactSliderContainer> {
  private final static String REACT_CLASS = "RNCSliderContainer";

  @StringDef

  @NonNull
  @Override
  public String getName() {
    return REACT_CLASS;
  }

  @NonNull
  @Override
  protected ReactSliderContainer createViewInstance(@NonNull ThemedReactContext reactContext) {
    return new ReactSliderContainer(reactContext);
  }

  @ReactProp(name = "inverted", defaultBoolean = false)
  public void setInverted(ReactSliderContainer view, boolean inverted) {
    view.setInverted(inverted);
  }

  @ReactProp(name = ViewProps.RESIZE_MODE, defaultBoolean = false)
  public void setResizeMode(ReactSliderContainer view, boolean inverted) {
    view.setInverted(inverted);
  }
}

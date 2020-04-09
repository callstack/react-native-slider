package com.reactnativecommunity.slider;

import androidx.annotation.NonNull;

import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewGroupManager;
import com.facebook.react.uimanager.annotations.ReactProp;

public class ReactSliderContainerManager extends ViewGroupManager<ReactSliderContainer> {
  private final static String REACT_CLASS = "RNCSliderContainer";

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

}

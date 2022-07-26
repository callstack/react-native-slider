/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

package com.reactnativecommunity.slider;

import android.view.View;
import android.widget.SeekBar;
import androidx.annotation.NonNull;

import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.LayoutShadowNode;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.UIManagerHelper;
import com.facebook.react.uimanager.ViewManagerDelegate;
import com.facebook.react.uimanager.ViewProps;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.facebook.react.uimanager.events.EventDispatcher;
import com.facebook.yoga.YogaMeasureFunction;
import com.facebook.yoga.YogaMeasureMode;
import com.facebook.yoga.YogaMeasureOutput;
import com.facebook.yoga.YogaNode;
import java.util.Map;
import javax.annotation.Nullable;
import com.facebook.react.viewmanagers.RNCSliderManagerInterface;
import com.facebook.react.viewmanagers.RNCSliderManagerDelegate;
import com.facebook.react.module.annotations.ReactModule;

/**
 * Manages instances of {@code ReactSlider}.
 */
@ReactModule(name = ReactSliderManagerImpl.REACT_CLASS)
public class ReactSliderManager extends SimpleViewManager<ReactSlider> implements RNCSliderManagerInterface<ReactSlider> {

  private final ViewManagerDelegate<ReactSlider> mDelegate;

  public ReactSliderManager() {
    mDelegate = new RNCSliderManagerDelegate<>(this);
  }

  @Nullable
  @Override
  protected ViewManagerDelegate<ReactSlider> getDelegate() {
    return mDelegate;
  }

  static class ReactSliderShadowNode extends LayoutShadowNode implements
      YogaMeasureFunction {

    private int mWidth;
    private int mHeight;
    private boolean mMeasured;

    private ReactSliderShadowNode() {
      initMeasureFunction();
    }

    private void initMeasureFunction() {
      setMeasureFunction(this);
    }

    @Override
    public long measure(
        YogaNode node,
        float width,
        YogaMeasureMode widthMode,
        float height,
        YogaMeasureMode heightMode) {
      if (!mMeasured) {
        SeekBar reactSlider = new ReactSlider(getThemedContext(), null);
        final int spec = View.MeasureSpec.makeMeasureSpec(0, View.MeasureSpec.UNSPECIFIED);
        reactSlider.measure(spec, spec);
        mWidth = reactSlider.getMeasuredWidth();
        mHeight = reactSlider.getMeasuredHeight();
        mMeasured = true;
      }

      return YogaMeasureOutput.make(mWidth, mHeight);
    }
  }

  private static final SeekBar.OnSeekBarChangeListener ON_CHANGE_LISTENER =
      new SeekBar.OnSeekBarChangeListener() {
        @Override
        public void onProgressChanged(SeekBar seekbar, int progress, boolean fromUser) {
          ReactContext reactContext = (ReactContext) seekbar.getContext();
          int reactTag = seekbar.getId();
          UIManagerHelper.getEventDispatcherForReactTag(reactContext, reactTag)
                  .dispatchEvent(new ReactSliderEvent(reactTag, ((ReactSlider)seekbar).toRealProgress(progress), fromUser));
        }

        @Override
        public void onStartTrackingTouch(SeekBar seekbar) {
          ReactContext reactContext = (ReactContext) seekbar.getContext();
          int reactTag = seekbar.getId();
          ((ReactSlider)seekbar).isSliding(true);
          UIManagerHelper.getEventDispatcherForReactTag(reactContext, reactTag)
                  .dispatchEvent(new ReactSlidingStartEvent(
                  reactTag,
                  ((ReactSlider)seekbar).toRealProgress(seekbar.getProgress())));
        }

        @Override
        public void onStopTrackingTouch(SeekBar seekbar) {
          ReactContext reactContext = (ReactContext) seekbar.getContext();
          ((ReactSlider)seekbar).isSliding(false);
          int reactTag = seekbar.getId();

          EventDispatcher eventDispatcher = UIManagerHelper.getEventDispatcherForReactTag(reactContext, reactTag);

          eventDispatcher.dispatchEvent(
                  new ReactSlidingCompleteEvent(
                          reactTag,
                          ((ReactSlider)seekbar).toRealProgress(seekbar.getProgress()))
          );
          eventDispatcher.dispatchEvent(
                  new ReactSliderEvent(
                          reactTag,
                          ((ReactSlider)seekbar).toRealProgress(seekbar.getProgress()),
                          !((ReactSlider)seekbar).isSliding()));
        }
      };

  @Override
  public String getName() {
    return ReactSliderManagerImpl.REACT_CLASS;
  }

  @Override
  public LayoutShadowNode createShadowNodeInstance() {
    return new ReactSliderShadowNode();
  }

  @Override
  public Class getShadowNodeClass() {
    return ReactSliderShadowNode.class;
  }

  @Override
  protected ReactSlider createViewInstance(ThemedReactContext context) {
    return ReactSliderManagerImpl.createViewInstance(context);
  }

  @Override
  @ReactProp(name = ViewProps.ENABLED, defaultBoolean = true)
  public void setEnabled(ReactSlider view, boolean enabled) {
    ReactSliderManagerImpl.setEnabled(view, enabled);
  }

  @Override
  @ReactProp(name = "value", defaultFloat = 0f)
  public void setValue(ReactSlider view, float value) {
    ReactSliderManagerImpl.setValue(view, value);
  }

  @Override
  @ReactProp(name = "minimumValue", defaultFloat = 0f)
  public void setMinimumValue(ReactSlider view, float value) {
    ReactSliderManagerImpl.setMinimumValue(view, value);
  }

  @Override
  @ReactProp(name = "maximumValue", defaultFloat = 0f)
  public void setMaximumValue(ReactSlider view, float value) {
    ReactSliderManagerImpl.setMaximumValue(view, value);
  }

  @Override
  @ReactProp(name = "step", defaultFloat = 0f)
  public void setStep(ReactSlider view, float value) {
    ReactSliderManagerImpl.setStep(view, value);
  }

  @Override
  @ReactProp(name = "thumbTintColor", customType = "Color")
  public void setThumbTintColor(ReactSlider view, Integer color) {
    ReactSliderManagerImpl.setThumbTintColor(view, color);
  }

  @Override
  @ReactProp(name = "minimumTrackTintColor", customType = "Color")
  public void setMinimumTrackTintColor(ReactSlider view, Integer color) {
    ReactSliderManagerImpl.setMinimumTrackTintColor(view, color);
  }

  @Override
  @ReactProp(name = "maximumTrackTintColor", customType = "Color")
  public void setMaximumTrackTintColor(ReactSlider view, Integer color) {
    ReactSliderManagerImpl.setMaximumTrackTintColor(view, color);
  }

  @Override
  @ReactProp(name = "inverted", defaultBoolean = false)
  public void setInverted(ReactSlider view, boolean inverted) {
    ReactSliderManagerImpl.setInverted(view, inverted);
  }

  @Override
  @ReactProp(name = "accessibilityUnits")
  public void setAccessibilityUnits(ReactSlider view, String accessibilityUnits) {
    ReactSliderManagerImpl.setAccessibilityUnits(view, accessibilityUnits);
  }

  @Override
  @ReactProp(name = "accessibilityIncrements")
  public void setAccessibilityIncrements(ReactSlider view, ReadableArray accessibilityIncrements) {
    ReactSliderManagerImpl.setAccessibilityIncrements(view, accessibilityIncrements);
  }

  @Override
  @ReactProp(name = "thumbImage")
  public void setThumbImage(ReactSlider reactSlider, @androidx.annotation.Nullable ReadableMap source) {
    ReactSliderManagerImpl.setThumbImage(reactSlider, source);
  }

  @Override
  @ReactProp(name = "disabled")
  public void setDisabled(ReactSlider reactSlider, boolean b) {
    reactSlider.setEnabled(!b);
  }

  @Override
  protected void addEventEmitters(final ThemedReactContext reactContext, final ReactSlider view) {
    view.setOnSeekBarChangeListener(ON_CHANGE_LISTENER);
  }

  @Override
  public Map getExportedCustomDirectEventTypeConstants() {
    return MapBuilder.of(ReactSlidingCompleteEvent.EVENT_NAME, MapBuilder.of("registrationName", "onRNCSliderSlidingComplete"),
        ReactSlidingStartEvent.EVENT_NAME, MapBuilder.of("registrationName", "onRNCSliderSlidingStart"));
  }

  // these props are not available on Android, however we must override their setters
  @Override
  public void setTestID(ReactSlider reactSlider, @androidx.annotation.Nullable String s) {}

  @Override
  public void setMinimumTrackImage(ReactSlider reactSlider, @androidx.annotation.Nullable ReadableMap readableMap) {}

  @Override
  public void setMaximumTrackImage(ReactSlider reactSlider, @androidx.annotation.Nullable ReadableMap readableMap) {}

  @Override
  public void setTrackImage(ReactSlider view, @androidx.annotation.Nullable ReadableMap value) {}

  @Override
  public void setTapToSeek(ReactSlider view, boolean value) {}

  @Override
  public void setVertical(ReactSlider view, boolean value) {}
}

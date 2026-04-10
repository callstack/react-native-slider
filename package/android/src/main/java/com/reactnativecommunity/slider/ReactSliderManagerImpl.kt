package com.reactnativecommunity.slider

import android.graphics.PorterDuff
import android.graphics.PorterDuffColorFilter
import android.graphics.drawable.LayerDrawable
import android.os.Build
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.ThemedReactContext

object ReactSliderManagerImpl {
  const val REACT_CLASS = "RNCSlider"

  @JvmStatic
  fun createViewInstance(context: ThemedReactContext): ReactSlider {
    val slider = ReactSlider(context, null)
    if (Build.VERSION.SDK_INT >= 21) {
      /**
       * The "splitTrack" parameter should have "false" value, otherwise the SeekBar progress line
       * doesn't appear when it is rotated.
       */
      slider.splitTrack = false
    }
    return slider
  }

  @JvmStatic
  fun setValue(view: ReactSlider, value: Double) {
    if (!view.isSliding) {
      view.setValue(value)
      if (view.isAccessibilityFocused && Build.VERSION.SDK_INT > Build.VERSION_CODES.Q) {
        view.setupAccessibility(value.toInt())
      }
    }
  }

  @JvmStatic
  fun setMinimumValue(view: ReactSlider, value: Double) {
    view.setMinValue(value)
  }

  @JvmStatic
  fun setMaximumValue(view: ReactSlider, value: Double) {
    view.setMaxValue(value)
  }

  @JvmStatic
  fun setLowerLimit(view: ReactSlider, value: Double) {
    view.setLowerLimit(value)
  }

  @JvmStatic
  fun setUpperLimit(view: ReactSlider, value: Double) {
    view.setUpperLimit(value)
  }

  @JvmStatic
  fun setStep(view: ReactSlider, value: Double) {
    view.setStep(value)
  }

  @JvmStatic
  fun setDisabled(view: ReactSlider, disabled: Boolean) {
    view.isEnabled = !disabled
  }

  @JvmStatic
  fun setThumbTintColor(view: ReactSlider, color: Int?) {
    view.setThumbTintColor(color)
  }

  @JvmStatic
  fun setMinimumTrackTintColor(view: ReactSlider, color: Int?) {
    val drawable = view.progressDrawable.current as LayerDrawable
    val progress = drawable.findDrawableByLayerId(android.R.id.progress)
    if (color == null) {
      progress.clearColorFilter()
    } else {
      if (Build.VERSION.SDK_INT > Build.VERSION_CODES.P) {
        progress.colorFilter = PorterDuffColorFilter(color, PorterDuff.Mode.SRC_IN)
      } else {
        @Suppress("DEPRECATION")
        progress.setColorFilter(color, PorterDuff.Mode.SRC_IN)
      }
    }
  }

  @JvmStatic
  fun setThumbImage(view: ReactSlider, source: ReadableMap?) {
    val uri = source?.getString("uri")
    view.setThumbImage(uri)
  }

  @JvmStatic
  fun setThumbSize(view: ReactSlider, size: Float) {
    view.setThumbSize(size)
  }

  @JvmStatic
  fun setMaximumTrackTintColor(view: ReactSlider, color: Int?) {
    val drawable = view.progressDrawable.current as LayerDrawable
    val background = drawable.findDrawableByLayerId(android.R.id.background)
    if (color == null) {
      background.clearColorFilter()
    } else {
      if (Build.VERSION.SDK_INT > Build.VERSION_CODES.P) {
        background.colorFilter = PorterDuffColorFilter(color, PorterDuff.Mode.SRC_IN)
      } else {
        @Suppress("DEPRECATION")
        background.setColorFilter(color, PorterDuff.Mode.SRC_IN)
      }
    }
  }

  @JvmStatic
  fun setInverted(view: ReactSlider, inverted: Boolean) {
    view.scaleX = if (inverted) -1f else 1f
  }

  @JvmStatic
  fun setAccessibilityUnits(view: ReactSlider, accessibilityUnits: String?) {
    view.setAccessibilityUnits(accessibilityUnits)
  }

  @JvmStatic
  fun setAccessibilityIncrements(view: ReactSlider, accessibilityIncrements: ReadableArray?) {
    if (accessibilityIncrements == null) {
      return
    }
    val objectList = accessibilityIncrements.toArrayList()
    val stringList = ArrayList<String>(objectList.size)
    for (item in objectList) {
      stringList.add(item as String)
    }
    view.setAccessibilityIncrements(stringList)
  }

  @JvmStatic
  fun getExportedCustomBubblingEventTypeConstants(): Map<String, Any> {
    return MapBuilder.of(
      ReactSliderEvent.EVENT_NAME,
      MapBuilder.of("registrationName", ReactSliderEvent.EVENT_NAME),
    )
  }

  @JvmStatic
  fun getExportedCustomDirectEventTypeConstants(): Map<String, Any> {
    return MapBuilder.of(
      ReactSlidingStartEvent.EVENT_NAME,
      MapBuilder.of("registrationName", ReactSlidingStartEvent.EVENT_NAME),
      ReactSlidingCompleteEvent.EVENT_NAME,
      MapBuilder.of("registrationName", ReactSlidingCompleteEvent.EVENT_NAME),
    )
  }
}

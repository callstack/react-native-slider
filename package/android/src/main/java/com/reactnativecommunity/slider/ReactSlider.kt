package com.reactnativecommunity.slider

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.PorterDuff
import android.graphics.drawable.BitmapDrawable
import android.os.Build
import android.util.AttributeSet
import android.util.Log
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityManager
import androidx.appcompat.widget.AppCompatSeekBar
import com.facebook.react.modules.i18nmanager.I18nUtil
import java.net.URL
import java.util.Timer
import java.util.TimerTask
import java.util.concurrent.Executors

/**
 * Slider that behaves more like the iOS one, for consistency.
 *
 * On iOS, the value is 0..1. Android SeekBar only supports integer values. For consistency, we
 * pretend in JS that the value is 0..1 but set the SeekBar value to 0..100.
 *
 * Note that the slider is _not_ a controlled component (setValue isn't called during dragging).
 */
class ReactSlider @JvmOverloads constructor(
  context: Context,
  attrs: AttributeSet? = null,
) : AppCompatSeekBar(context, attrs) {

  /**
   * If step is 0 (unset) we default to this total number of steps. Don't use 100 which leads to
   * rounding errors (0.200000000001).
   */
  private val defaultTotalSteps = 128

  /**
   * We want custom min..max range. Android only supports 0..max range so we implement this
   * ourselves.
   */
  private var minValue = 0.0
  private var maxValue = 0.0

  /**
   * Value sent from JS (setState). Doesn't get updated during drag (slider is not a controlled
   * component).
   */
  private var value = 0.0

  internal var isSliding = false

  /** If zero it's determined automatically. */
  private var step = 0.0
  private var stepCalculated = 0.0
  private var accessibilityUnits: String? = null
  private var accessibilityIncrements: List<String>? = null

  /** Real limit value based on min and max values. This comes from props */
  private var realLowerLimit = Long.MIN_VALUE.toDouble()

  /** Lower limit based on the SeekBar progress 0..total steps */
  internal var lowerLimit = 0
    private set

  /** Real limit value based on min and max values. This comes from props */
  private var realUpperLimit = Long.MAX_VALUE.toDouble()

  /** Upper limit based on the SeekBar progress 0..total steps */
  internal var upperLimit = 0
    private set

  /** Thumb size in pixels (0 = default) */
  private var thumbSizePx = 0

  /** Original thumb drawable URI */
  private var thumbImageUri: String? = null

  /** Cached thumb tint color */
  private var thumbTintColor: Int? = null

  init {
    val sharedI18nUtilInstance = I18nUtil.getInstance()
    layoutDirection =
      if (sharedI18nUtilInstance.isRTL(context)) LAYOUT_DIRECTION_RTL else LAYOUT_DIRECTION_LTR
    disableStateListAnimatorIfNeeded()
  }

  private fun disableStateListAnimatorIfNeeded() {
    // We disable the state list animator for Android 6 and 7; this is a hack to prevent T37452851
    // and https://github.com/facebook/react-native/issues/9979
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M &&
      Build.VERSION.SDK_INT < Build.VERSION_CODES.O
    ) {
      stateListAnimator = null
    }
  }

  internal fun setMaxValue(max: Double) {
    maxValue = max
    updateAll()
  }

  internal fun setMinValue(min: Double) {
    minValue = min
    updateAll()
  }

  internal fun getValidProgressValue(progress: Int): Int {
    return when {
      progress < lowerLimit -> lowerLimit
      progress > upperLimit -> upperLimit
      else -> progress
    }
  }

  internal fun setValue(value: Double) {
    this.value = value
    updateValue()
  }

  internal fun setStep(step: Double) {
    this.step = step
    updateAll()
  }

  internal fun setLowerLimit(value: Double) {
    realLowerLimit = value
    updateLowerLimit()
  }

  internal fun setUpperLimit(value: Double) {
    realUpperLimit = value
    updateUpperLimit()
  }

  internal fun setAccessibilityUnits(accessibilityUnits: String?) {
    this.accessibilityUnits = accessibilityUnits
  }

  internal fun setAccessibilityIncrements(accessibilityIncrements: List<String>?) {
    this.accessibilityIncrements = accessibilityIncrements
  }

  override fun onPopulateAccessibilityEvent(event: AccessibilityEvent) {
    super.onPopulateAccessibilityEvent(event)

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
      if (event.eventType == AccessibilityEvent.TYPE_VIEW_ACCESSIBILITY_FOCUSED ||
        (event.eventType == AccessibilityEvent.TYPE_VIEW_SELECTED && isAccessibilityFocused)
      ) {
        setupAccessibility(value.toInt())
      }
    }
  }

  override fun announceForAccessibility(text: CharSequence?) {
    val ctx = context
    val manager = ctx.getSystemService(Context.ACCESSIBILITY_SERVICE) as AccessibilityManager

    if (manager.isEnabled && text != null) {
      val e = AccessibilityEvent.obtain()
      e.eventType = AccessibilityEvent.TYPE_ANNOUNCEMENT
      e.className = javaClass.name
      e.packageName = ctx.packageName
      e.text.add(text)

      val task = object : TimerTask() {
        override fun run() {
          manager.sendAccessibilityEvent(e)
        }
      }

      Timer().schedule(task, 1000)
    }
  }

  fun setupAccessibility(index: Int) {
    val units = accessibilityUnits
    val increments = accessibilityIncrements
    if (units != null && increments != null && increments.size - 1 == maxValue.toInt()) {
      val sliderValue = increments[index]
      val stringLength = units.length
      var spokenUnits = units
      if (sliderValue.toInt() == 1) {
        spokenUnits = spokenUnits.substring(0, stringLength - 1)
      }
      announceForAccessibility(String.format("%s %s", sliderValue, spokenUnits))
    }
  }

  /**
   * Convert SeekBar's native progress value (e.g. 0..100) to a value passed to JS (e.g. -1.0..2.5).
   */
  fun toRealProgress(seekBarProgress: Int): Double {
    return if (seekBarProgress == max) {
      maxValue
    } else {
      seekBarProgress * getStepValue() + minValue
    }
  }

  /** Update underlying native SeekBar's values. */
  private fun updateAll() {
    if (step == 0.0) {
      stepCalculated = (maxValue - minValue) / defaultTotalSteps.toDouble()
    }
    max = totalSteps
    keyProgressIncrement = 1
    updateLowerLimit()
    updateUpperLimit()
    updateValue()
  }

  /**
   * Update limit based on props limit, max and min Fallback to upper limit if invalid configuration
   * provided
   */
  private fun updateLowerLimit() {
    val limit = maxOf(realLowerLimit, minValue)
    val lower = kotlin.math.round((limit - minValue) / (maxValue - minValue) * totalSteps).toInt()
    if (lower > upperLimit) {
      Log.d("Invalid configuration", "upperLimit < lowerLimit; lowerLimit not set")
    } else {
      lowerLimit = minOf(lower, upperLimit)
    }
  }

  /** Update limit based on props limit, max and min */
  private fun updateUpperLimit() {
    val limit = minOf(realUpperLimit, maxValue)
    val upper = kotlin.math.round((limit - minValue) / (maxValue - minValue) * totalSteps).toInt()
    if (lowerLimit > upper) {
      Log.d("Invalid configuration", "upperLimit < lowerLimit; upperLimit not set")
    } else {
      upperLimit = upper
    }
  }

  /** Update value only (optimization in case only value is set). */
  private fun updateValue() {
    progress =
      kotlin.math.round((value - minValue) / (maxValue - minValue) * totalSteps).toInt()
  }

  private val totalSteps: Int
    get() = kotlin.math.ceil((maxValue - minValue) / getStepValue()).toInt()

  private fun getStepValue(): Double = if (step > 0) step else stepCalculated

  private fun getBitmapDrawable(uri: String): BitmapDrawable? {
    val executorService = Executors.newSingleThreadExecutor()
    val future = executorService.submit<BitmapDrawable?> {
      try {
        val bitmap: Bitmap? =
          if (uri.startsWith("http://") || uri.startsWith("https://") ||
            uri.startsWith("file://") || uri.startsWith("asset://") || uri.startsWith("data:")
          ) {
            BitmapFactory.decodeStream(URL(uri).openStream())
          } else {
            val drawableId =
              resources.getIdentifier(uri, "drawable", context.packageName)
            BitmapFactory.decodeResource(resources, drawableId)
          }
        BitmapDrawable(resources, bitmap)
      } catch (e: Exception) {
        e.printStackTrace()
        null
      }
    }
    return try {
      future.get()
    } catch (e: Exception) {
      e.printStackTrace()
      null
    }
  }

  fun setThumbImage(uri: String?) {
    thumbImageUri = uri
    refreshThumb()
  }

  fun setThumbSize(size: Float) {
    val density = resources.displayMetrics.density
    thumbSizePx = if (size > 0) kotlin.math.round(size * density).toInt() else 0
    refreshThumb()
  }

  fun setThumbTintColor(color: Int?) {
    thumbTintColor = color
    if (thumbImageUri != null || thumbSizePx > 0) {
      refreshThumb()
    } else {
      applyThumbTintColorFilter()
    }
  }

  private fun applyThumbTintColorFilter() {
    val thumbDrawable = getThumb() ?: return
    val tint = thumbTintColor
    if (tint != null) {
      thumbDrawable.setColorFilter(tint, PorterDuff.Mode.SRC_IN)
    } else {
      thumbDrawable.clearColorFilter()
    }
  }

  private fun refreshThumb() {
    val uri = thumbImageUri
    if (uri != null) {
      val drawable = getBitmapDrawable(uri)
      if (drawable != null) {
        if (thumbSizePx > 0) {
          val originalBitmap = drawable.bitmap
          val scaledBitmap =
            Bitmap.createScaledBitmap(originalBitmap, thumbSizePx, thumbSizePx, true)
          setThumb(BitmapDrawable(resources, scaledBitmap))
        } else {
          setThumb(drawable)
        }
        applyThumbTintColorFilter()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
          splitTrack = false
        }
        return
      }
    }

    if (thumbSizePx > 0) {
      val bitmap = Bitmap.createBitmap(thumbSizePx, thumbSizePx, Bitmap.Config.ARGB_8888)
      val canvas = Canvas(bitmap)

      val fillColor =
        thumbTintColor
          ?: (thumbTintList?.defaultColor ?: 0xFFFFFFFF.toInt())

      val fillPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.FILL
        color = fillColor
      }
      val radius = thumbSizePx / 2f
      canvas.drawCircle(radius, radius, radius, fillPaint)

      val strokePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.STROKE
        strokeWidth = 1f
        color = 0x1A000000
      }
      canvas.drawCircle(radius, radius, radius - 0.5f, strokePaint)

      setThumb(BitmapDrawable(resources, bitmap))
      applyThumbTintColorFilter()
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
        splitTrack = false
      }
    } else {
      applyThumbTintColorFilter()
    }
  }
}

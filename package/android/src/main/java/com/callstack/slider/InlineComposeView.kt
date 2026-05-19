package com.callstack.slider

import androidx.compose.runtime.Composable
import androidx.compose.runtime.Recomposer
import androidx.compose.ui.platform.AbstractComposeView
import androidx.compose.ui.platform.AndroidUiDispatcher
import androidx.compose.ui.platform.ViewCompositionStrategy
import androidx.compose.ui.platform.compositionContext
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.LifecycleRegistry
import androidx.lifecycle.setViewTreeLifecycleOwner
import androidx.savedstate.SavedStateRegistry
import androidx.savedstate.SavedStateRegistryController
import androidx.savedstate.SavedStateRegistryOwner
import androidx.savedstate.setViewTreeSavedStateRegistryOwner
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.events.Event
import com.facebook.react.uimanager.events.EventDispatcher
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch

abstract class RNCustomRenderComposeView(
  protected val reactContext: ThemedReactContext,
) : AbstractComposeView(reactContext), LifecycleOwner, SavedStateRegistryOwner {

  private val lifecycleRegistry = LifecycleRegistry(this)
  private val savedStateRegistryController = SavedStateRegistryController.create(this)

  override val lifecycle: Lifecycle get() = lifecycleRegistry
  override val savedStateRegistry: SavedStateRegistry
    get() = savedStateRegistryController.savedStateRegistry

  private var recomposerScope: CoroutineScope? = null

  var eventDispatcher: EventDispatcher? = null

  @Composable
  abstract fun ComposeContent()

  @Composable
  override fun Content() {
    ComposeContent()
  }

  init {
    savedStateRegistryController.performRestore(null)
    lifecycleRegistry.handleLifecycleEvent(Lifecycle.Event.ON_CREATE)
    setViewCompositionStrategy(
      ViewCompositionStrategy.DisposeOnLifecycleDestroyed(lifecycle),
    )
  }

  override fun onAttachedToWindow() {
    ensureRecomposer()
    resumeLifecycle()
    super.onAttachedToWindow()
  }

  override fun onDetachedFromWindow() {
    pauseLifecycle()
    super.onDetachedFromWindow()
  }

  open fun onDropInstance() {
    eventDispatcher = null
    lifecycleRegistry.handleLifecycleEvent(Lifecycle.Event.ON_DESTROY)
    recomposerScope?.cancel()
    recomposerScope = null
  }

  protected fun dispatchEvent(event: Event<*>) {
    val dispatcher = eventDispatcher ?: return
    post {
      dispatcher.dispatchEvent(event)
    }
  }

  protected fun getSurfaceId(): Int = UIManagerHelper.getSurfaceId(this)

  private fun ensureRecomposer() {
    if (recomposerScope != null) return

    setViewTreeLifecycleOwner(this)
    setViewTreeSavedStateRegistryOwner(this)

    val scope = CoroutineScope(AndroidUiDispatcher.CurrentThread)
    recomposerScope = scope
    val recomposer = Recomposer(scope.coroutineContext)
    scope.launch { recomposer.runRecomposeAndApplyChanges() }
    compositionContext = recomposer
  }

  private fun resumeLifecycle() {
    when (lifecycleRegistry.currentState) {
      Lifecycle.State.CREATED -> {
        lifecycleRegistry.handleLifecycleEvent(Lifecycle.Event.ON_START)
        lifecycleRegistry.handleLifecycleEvent(Lifecycle.Event.ON_RESUME)
      }
      Lifecycle.State.STARTED ->
        lifecycleRegistry.handleLifecycleEvent(Lifecycle.Event.ON_RESUME)
      else -> Unit
    }
  }

  private fun pauseLifecycle() {
    if (lifecycleRegistry.currentState == Lifecycle.State.DESTROYED) return
    lifecycleRegistry.handleLifecycleEvent(Lifecycle.Event.ON_PAUSE)
    lifecycleRegistry.handleLifecycleEvent(Lifecycle.Event.ON_STOP)
  }
}

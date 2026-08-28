#import <React/RCTUtils.h>
#import <UIKit/UIKit.h>

#import <react/renderer/core/LayoutConstraints.h>

#import <react/renderer/components/RNCSlider/RNCSliderShadowNode.h>

// See `RNCSliderComponentView.mm` for why this import has two spellings.
#if __has_include(<react_native_slider/react_native_slider-Swift.h>)
#import <react_native_slider/react_native_slider-Swift.h>
#else
#import "react_native_slider-Swift.h"
#endif

namespace facebook::react {

#pragma mark - LayoutableShadowNode

Size RNCSliderShadowNode::measureContent(
    const LayoutContext & /*layoutContext*/,
    const LayoutConstraints &layoutConstraints) const
{
  // Layout runs off the main thread, and SwiftUI can only be asked for a size on
  // it. Every slider gets the same answer, so pay for the hop once. This mirrors
  // `RCTSwitchSize()`, which React Native uses to size <Switch> the same way.
  static CGSize intrinsicSize;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    RCTUnsafeExecuteOnMainQueueSync(^{
      intrinsicSize = [RNCSliderView measuredIntrinsicSize];
    });
  });

  return layoutConstraints.clamp({
      .width = static_cast<Float>(intrinsicSize.width),
      .height = static_cast<Float>(intrinsicSize.height),
  });
}

} // namespace facebook::react

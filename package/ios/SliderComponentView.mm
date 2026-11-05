#import "SliderComponentView.h"

#import <react/renderer/components/CallstackSlider/EventEmitters.h>
#import <react/renderer/components/CallstackSlider/Props.h>
#import <react/renderer/components/CallstackSlider/RCTComponentViewHelpers.h>
#import <react/renderer/components/CallstackSlider/CallstackSliderComponentDescriptor.h>

#import <React/RCTConversions.h>

#import "RCTFabricComponentsPlugins.h"

// The pod is called `react-native-slider`, so Swift lands in the
// `react_native_slider` module. Which of the two spellings resolves depends on
// whether the app links pods as frameworks.
#if __has_include(<react_native_slider/react_native_slider-Swift.h>)
#import <react_native_slider/react_native_slider-Swift.h>
#else
#import "react_native_slider-Swift.h"
#endif

using namespace facebook::react;

@interface SliderComponentView () <RCTCallstackSliderViewProtocol>

@end

@implementation SliderComponentView {
  SliderView *_sliderView;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<CallstackSliderComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const CallstackSliderProps>();
    _props = defaultProps;

    _sliderView = [[SliderView alloc] initWithFrame:self.bounds];
    [self applySliderProps:*defaultProps];

    // Installed once and kept across recycles: the emitter it reaches for is
    // reset by `prepareForRecycle`, so it simply goes quiet until the view is
    // mounted again.
    __weak __typeof(self) weakSelf = self;
    _sliderView.onValueChange = ^(double value) {
      [weakSelf emitValueChange:value];
    };
    _sliderView.onLeftValueChange = ^(double value) {
      [weakSelf emitLeftValueChange:value];
    };
    _sliderView.onRightValueChange = ^(double value) {
      [weakSelf emitRightValueChange:value];
    };
    _sliderView.onSlidingStart = ^{
      [weakSelf emitSlidingStart];
    };
    _sliderView.onSlidingComplete = ^{
      [weakSelf emitSlidingComplete];
    };

    self.contentView = _sliderView;
  }

  return self;
}

- (void)applySliderProps:(const CallstackSliderProps &)props
{
  _sliderView.minimumValue = props.minimumValue;
  _sliderView.maximumValue = props.maximumValue;
  _sliderView.disabled = props.disabled;
  _sliderView.value = props.value;
  _sliderView.ranged = props.ranged;
  _sliderView.valueLeft = props.valueLeft;
  _sliderView.valueRight = props.valueRight;
  _sliderView.step = props.step;
  _sliderView.lowerLimit = props.lowerLimit;
  _sliderView.upperLimit = props.upperLimit;
  _sliderView.vertical = props.orientation == CallstackSliderOrientation::Vertical;
  _sliderView.minimumTrackColor = RCTUIColorFromSharedColor(props.minimumTrackColor);
  _sliderView.middleRangeTrackColor = RCTUIColorFromSharedColor(props.middleRangeTrackColor);
  _sliderView.maximumTrackColor = RCTUIColorFromSharedColor(props.maximumTrackColor);
  _sliderView.customTrack = props.customTrack;
  _sliderView.customThumb = props.customThumb;
  _sliderView.stepMarkers = props.stepMarkers != CallstackSliderStepMarkers::None;
  _sliderView.customStepMarkers = props.stepMarkers == CallstackSliderStepMarkers::Custom;
}

- (void)emitValueChange:(double)value
{
  const auto eventEmitter = std::static_pointer_cast<const CallstackSliderEventEmitter>(_eventEmitter);
  if (!eventEmitter) {
    return;
  }

  eventEmitter->onValueChange(CallstackSliderEventEmitter::OnValueChange{.value = value});
}

- (void)emitLeftValueChange:(double)value
{
  const auto eventEmitter = std::static_pointer_cast<const CallstackSliderEventEmitter>(_eventEmitter);
  if (!eventEmitter) {
    return;
  }

  eventEmitter->onLeftValueChange(CallstackSliderEventEmitter::OnLeftValueChange{.value = value});
}

- (void)emitRightValueChange:(double)value
{
  const auto eventEmitter = std::static_pointer_cast<const CallstackSliderEventEmitter>(_eventEmitter);
  if (!eventEmitter) {
    return;
  }

  eventEmitter->onRightValueChange(CallstackSliderEventEmitter::OnRightValueChange{.value = value});
}

- (void)emitSlidingStart
{
  const auto eventEmitter = std::static_pointer_cast<const CallstackSliderEventEmitter>(_eventEmitter);
  if (!eventEmitter) {
    return;
  }

  eventEmitter->onSlidingStart(CallstackSliderEventEmitter::OnSlidingStart{});
}

- (void)emitSlidingComplete
{
  const auto eventEmitter = std::static_pointer_cast<const CallstackSliderEventEmitter>(_eventEmitter);
  if (!eventEmitter) {
    return;
  }

  eventEmitter->onSlidingComplete(CallstackSliderEventEmitter::OnSlidingComplete{});
}

#pragma mark - RCTComponentViewProtocol

// The reading direction comes from the layout metrics rather than from a prop: React
// Native resolves it for the subtree the slider sits in - the app's own language and any
// `direction` style partway down the tree - and hands the answer to every component view
// it lays out. The base implementation turns it into `semanticContentAttribute` on this
// view; the slider's own drawing is a hosted SwiftUI view, which reads nothing from that,
// so the direction is handed to it directly as well.
- (void)updateLayoutMetrics:(const LayoutMetrics &)layoutMetrics
           oldLayoutMetrics:(const LayoutMetrics &)oldLayoutMetrics
{
  _sliderView.laysOutRightToLeft = layoutMetrics.layoutDirection == LayoutDirection::RightToLeft;

  [super updateLayoutMetrics:layoutMetrics oldLayoutMetrics:oldLayoutMetrics];
}

- (void)updateProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps
{
  const auto &oldViewProps = *std::static_pointer_cast<const CallstackSliderProps>(_props);
  const auto &newViewProps = *std::static_pointer_cast<const CallstackSliderProps>(props);

  if (oldViewProps.minimumValue != newViewProps.minimumValue) {
    _sliderView.minimumValue = newViewProps.minimumValue;
  }
  if (oldViewProps.maximumValue != newViewProps.maximumValue) {
    _sliderView.maximumValue = newViewProps.maximumValue;
  }
  // Applied ahead of the values, as it is in `applySliderProps` and in the spec the
  // Android delegate is generated from. Switching off ends the drag a slider believes
  // it owns, and a value it still believes it owns is one it keeps off the thumbs - so
  // a value applied first would be swallowed by that very rule, on a commit that both
  // switches the slider off and moves it.
  if (oldViewProps.disabled != newViewProps.disabled) {
    _sliderView.disabled = newViewProps.disabled;
  }
  if (oldViewProps.value != newViewProps.value) {
    _sliderView.value = newViewProps.value;
  }
  if (oldViewProps.ranged != newViewProps.ranged) {
    _sliderView.ranged = newViewProps.ranged;
  }
  if (oldViewProps.valueLeft != newViewProps.valueLeft) {
    _sliderView.valueLeft = newViewProps.valueLeft;
  }
  if (oldViewProps.valueRight != newViewProps.valueRight) {
    _sliderView.valueRight = newViewProps.valueRight;
  }
  if (oldViewProps.step != newViewProps.step) {
    _sliderView.step = newViewProps.step;
  }
  if (oldViewProps.lowerLimit != newViewProps.lowerLimit) {
    _sliderView.lowerLimit = newViewProps.lowerLimit;
  }
  if (oldViewProps.upperLimit != newViewProps.upperLimit) {
    _sliderView.upperLimit = newViewProps.upperLimit;
  }
  if (oldViewProps.orientation != newViewProps.orientation) {
    _sliderView.vertical = newViewProps.orientation == CallstackSliderOrientation::Vertical;
  }
  if (oldViewProps.minimumTrackColor != newViewProps.minimumTrackColor) {
    _sliderView.minimumTrackColor = RCTUIColorFromSharedColor(newViewProps.minimumTrackColor);
  }
  if (oldViewProps.middleRangeTrackColor != newViewProps.middleRangeTrackColor) {
    _sliderView.middleRangeTrackColor = RCTUIColorFromSharedColor(newViewProps.middleRangeTrackColor);
  }
  if (oldViewProps.maximumTrackColor != newViewProps.maximumTrackColor) {
    _sliderView.maximumTrackColor = RCTUIColorFromSharedColor(newViewProps.maximumTrackColor);
  }
  if (oldViewProps.customTrack != newViewProps.customTrack) {
    _sliderView.customTrack = newViewProps.customTrack;
  }
  if (oldViewProps.customThumb != newViewProps.customThumb) {
    _sliderView.customThumb = newViewProps.customThumb;
  }
  if (oldViewProps.stepMarkers != newViewProps.stepMarkers) {
    _sliderView.stepMarkers = newViewProps.stepMarkers != CallstackSliderStepMarkers::None;
    _sliderView.customStepMarkers = newViewProps.stepMarkers == CallstackSliderStepMarkers::Custom;
  }

  [super updateProps:props oldProps:oldProps];
}

// The only children a slider has are the custom track, thumbs and step markers
// JS renders in place of the built-in ones, and the slider view is what keeps
// them on its track, its thumbs and its steps.
- (void)mountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index
{
  [_sliderView mountChildView:childComponentView atIndex:index];
}

- (void)unmountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index
{
  [_sliderView unmountChildView:childComponentView];
}

- (void)prepareForRecycle
{
  [super prepareForRecycle];

  // `updateProps:` diffs against `_props`, so the props and the slider have to
  // be walked back to their defaults together.
  static const auto defaultProps = std::make_shared<const CallstackSliderProps>();
  _props = defaultProps;

  // A view retired mid-drag still believes it owns the thumb it was dragging,
  // and would drop the value pushed right after.
  [_sliderView cancelSliding];
  [self applySliderProps:*defaultProps];
}

@end

Class<RCTComponentViewProtocol> CallstackSliderCls(void)
{
  return SliderComponentView.class;
}

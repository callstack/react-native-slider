#import "RNCSliderComponentView.h"

#import <react/renderer/components/RNCSlider/EventEmitters.h>
#import <react/renderer/components/RNCSlider/Props.h>
#import <react/renderer/components/RNCSlider/RCTComponentViewHelpers.h>
#import <react/renderer/components/RNCSlider/RNCSliderComponentDescriptor.h>

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

@interface RNCSliderComponentView () <RCTRNCSliderViewProtocol>

@end

@implementation RNCSliderComponentView {
  RNCSliderView *_sliderView;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<RNCSliderComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const RNCSliderProps>();
    _props = defaultProps;

    _sliderView = [[RNCSliderView alloc] initWithFrame:self.bounds];
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

- (void)applySliderProps:(const RNCSliderProps &)props
{
  _sliderView.minimumValue = props.minimumValue;
  _sliderView.maximumValue = props.maximumValue;
  _sliderView.value = props.value;
  _sliderView.ranged = props.ranged;
  _sliderView.valueLeft = props.valueLeft;
  _sliderView.valueRight = props.valueRight;
  _sliderView.step = props.step;
  _sliderView.lowerLimit = props.lowerLimit;
  _sliderView.upperLimit = props.upperLimit;
  _sliderView.vertical = props.orientation == RNCSliderOrientation::Vertical;
  _sliderView.minimumTrackColor = RCTUIColorFromSharedColor(props.minimumTrackColor);
  _sliderView.middleRangeTrackColor = RCTUIColorFromSharedColor(props.middleRangeTrackColor);
  _sliderView.maximumTrackColor = RCTUIColorFromSharedColor(props.maximumTrackColor);
  _sliderView.customTrack = props.customTrack;
}

- (void)emitValueChange:(double)value
{
  const auto eventEmitter = std::static_pointer_cast<const RNCSliderEventEmitter>(_eventEmitter);
  if (!eventEmitter) {
    return;
  }

  eventEmitter->onValueChange(RNCSliderEventEmitter::OnValueChange{.value = value});
}

- (void)emitLeftValueChange:(double)value
{
  const auto eventEmitter = std::static_pointer_cast<const RNCSliderEventEmitter>(_eventEmitter);
  if (!eventEmitter) {
    return;
  }

  eventEmitter->onLeftValueChange(RNCSliderEventEmitter::OnLeftValueChange{.value = value});
}

- (void)emitRightValueChange:(double)value
{
  const auto eventEmitter = std::static_pointer_cast<const RNCSliderEventEmitter>(_eventEmitter);
  if (!eventEmitter) {
    return;
  }

  eventEmitter->onRightValueChange(RNCSliderEventEmitter::OnRightValueChange{.value = value});
}

- (void)emitSlidingStart
{
  const auto eventEmitter = std::static_pointer_cast<const RNCSliderEventEmitter>(_eventEmitter);
  if (!eventEmitter) {
    return;
  }

  eventEmitter->onSlidingStart(RNCSliderEventEmitter::OnSlidingStart{});
}

- (void)emitSlidingComplete
{
  const auto eventEmitter = std::static_pointer_cast<const RNCSliderEventEmitter>(_eventEmitter);
  if (!eventEmitter) {
    return;
  }

  eventEmitter->onSlidingComplete(RNCSliderEventEmitter::OnSlidingComplete{});
}

#pragma mark - RCTComponentViewProtocol

- (void)updateProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps
{
  const auto &oldViewProps = *std::static_pointer_cast<const RNCSliderProps>(_props);
  const auto &newViewProps = *std::static_pointer_cast<const RNCSliderProps>(props);

  if (oldViewProps.minimumValue != newViewProps.minimumValue) {
    _sliderView.minimumValue = newViewProps.minimumValue;
  }
  if (oldViewProps.maximumValue != newViewProps.maximumValue) {
    _sliderView.maximumValue = newViewProps.maximumValue;
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
    _sliderView.vertical = newViewProps.orientation == RNCSliderOrientation::Vertical;
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

  [super updateProps:props oldProps:oldProps];
}

// The only children a slider has are the custom track and thumbs JS renders in
// place of the built-in ones, and the slider view is what keeps them on its
// track and thumbs.
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
  static const auto defaultProps = std::make_shared<const RNCSliderProps>();
  _props = defaultProps;

  // A view retired mid-drag still believes it owns the thumb it was dragging,
  // and would drop the value pushed right after.
  [_sliderView cancelSliding];
  [self applySliderProps:*defaultProps];
}

@end

Class<RCTComponentViewProtocol> RNCSliderCls(void)
{
  return RNCSliderComponentView.class;
}

#ifdef RCT_NEW_ARCH_ENABLED

#import "RNCSliderComponentView.h"

#import <React/RCTConversions.h>

#import <react/renderer/components/RNCSlider/ComponentDescriptors.h>
#import <react/renderer/components/RNCSlider/EventEmitters.h>
#import <react/renderer/components/RNCSlider/Props.h>
#import <react/renderer/components/RNCSlider/RCTComponentViewHelpers.h>

#import "RCTFabricComponentsPlugins.h"
#import "RNCSlider.h"


using namespace facebook::react;

@interface RNCSliderComponentView () <RCTRNCSliderViewProtocol>

@end


@implementation RNCSliderComponentView
{
    RNCSlider *slider;
    float _unclippedValue;
    bool _minimumTrackImageSet;
    bool _maximumTrackImageSet;
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
        slider = [[RNCSlider alloc] initWithFrame:self.bounds];
        self.contentView = slider;
    }
    return self;
}


- (void)updateProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps
{
    const auto &oldScreenProps = *std::static_pointer_cast<const RNCSliderProps>(_props);
    const auto &newScreenProps = *std::static_pointer_cast<const RNCSliderProps>(props);
    
    if (oldScreenProps.value != newScreenProps.value) {
        slider.value = newScreenProps.value;
    }
    if (oldScreenProps.disabled != newScreenProps.disabled) {
        slider.enabled = !newScreenProps.disabled;
    }
    if (oldScreenProps.step != newScreenProps.step) {
        slider.step = newScreenProps.step;
    }
    if (oldScreenProps.inverted != newScreenProps.inverted) {
        [self setInverted:newScreenProps.inverted];
    }
    if (oldScreenProps.maximumValue != newScreenProps.maximumValue) {
        [slider setMaximumValue:newScreenProps.maximumValue];
    }
    if (oldScreenProps.minimumValue != newScreenProps.minimumValue) {
        [slider setMinimumValue:newScreenProps.minimumValue];
    }
    if (oldScreenProps.thumbTintColor != newScreenProps.thumbTintColor) {
        slider.thumbTintColor = RCTUIColorFromSharedColor(newScreenProps.thumbTintColor);
    }
    if (oldScreenProps.minimumTrackTintColor != newScreenProps.minimumTrackTintColor) {
        slider.minimumTrackTintColor = RCTUIColorFromSharedColor(newScreenProps.minimumTrackTintColor);
    }
    if (oldScreenProps.maximumTrackTintColor != newScreenProps.maximumTrackTintColor) {
        slider.maximumTrackTintColor = RCTUIColorFromSharedColor(newScreenProps.maximumTrackTintColor);
    }
    if (oldScreenProps.accessibilityUnits != newScreenProps.accessibilityUnits) {
        NSString *convertedAccessibilityUnits = [NSString stringWithCString:newScreenProps.accessibilityUnits.c_str()
                                                                   encoding:[NSString defaultCStringEncoding]];
        slider.accessibilityUnits = convertedAccessibilityUnits;
    }
    if (oldScreenProps.accessibilityIncrements != newScreenProps.accessibilityIncrements) {
        id accessibilityIncrements = [NSArray new];
        for (auto str : newScreenProps.accessibilityIncrements) {
            [accessibilityIncrements addObject:[NSString stringWithUTF8String:str.c_str()]];
        }
        [slider setAccessibilityIncrements:accessibilityIncrements];
    }
    [super updateProps:props oldProps:oldProps];
}

- (void)setInverted:(BOOL)inverted
{
  if (inverted) {
    self.transform = CGAffineTransformMakeScale(-1, 1);
  } else {
    self.transform = CGAffineTransformMakeScale(1, 1);
  }
}

@end

Class<RCTComponentViewProtocol> RNCSliderCls(void)
{
    return RNCSliderComponentView.class;
}

#endif

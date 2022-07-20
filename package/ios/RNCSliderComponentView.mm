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

- (void)updateProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps
{
    const auto &oldScreenProps = *std::static_pointer_cast<const RNCSliderProps>(_props);
    const auto &newScreenProps = *std::static_pointer_cast<const RNCSliderProps>(props);
    
    if (oldScreenProps.value != newScreenProps.value) {
        slider.value = newScreenProps.value;
    }
    if (oldScreenProps.enabled != newScreenProps.enabled) {
        slider.enabled = newScreenProps.enabled;
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
    if (oldScreenProps.inverted != newScreenProps.inverted) {
        [self setInverted:newScreenProps.inverted];
    }
    if (oldScreenProps.maximumValue != newScreenProps.maximumValue) {
        [self setMaximumValue:newScreenProps.maximumValue];
    }
    if (oldScreenProps.minimumValue != newScreenProps.minimumValue) {
        [self setMinimumValue:newScreenProps.minimumValue];
    }
    if (oldScreenProps.thumbTintColor != newScreenProps.thumbTintColor) {
        slider.thumbTintColor = RCTUIColorFromSharedColor(newScreenProps.thumbTintColor);
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
    
    [super updateProps:props oldProps:oldProps];
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

- (void)setValue:(float)value
{
    value = [self discreteValue:value];
    _unclippedValue = value;
    slider.value = value;
    [self setupAccessibility:value];
}

- (void)setValue:(float)value animated:(BOOL)animated
{
    value = [self discreteValue:value];
    _unclippedValue = value;
    [slider setValue:value animated:animated];
    [self setupAccessibility:value];
}

- (void)setupAccessibility:(float)value
{
    if (self.accessibilityUnits && self.accessibilityIncrements && [self.accessibilityIncrements count] - 1 == (int)slider.maximumValue) {
        int index = (int)value;
        NSString *sliderValue = (NSString *)[self.accessibilityIncrements objectAtIndex:index];
        NSUInteger stringLength = [self.accessibilityUnits length];
        
        NSString *spokenUnits = [NSString stringWithString:self.accessibilityUnits];
        if (sliderValue && [sliderValue intValue] == 1) {
            spokenUnits = [spokenUnits substringToIndex:stringLength-1];
        }
        
        self.accessibilityValue = [NSString stringWithFormat:@"%@ %@", sliderValue, spokenUnits];
    }
}

- (void)setMinimumValue:(float)minimumValue
{
    slider.minimumValue = minimumValue;
    slider.value = _unclippedValue;
}

- (void)setMaximumValue:(float)maximumValue
{
    slider.maximumValue = maximumValue;
    slider.value = _unclippedValue;
}


- (void)setTrackImage:(UIImage *)trackImage
{
    if (trackImage != _trackImage) {
        _trackImage = trackImage;
        CGFloat width = trackImage.size.width / 2;
        if (!_minimumTrackImageSet) {
            UIImage *minimumTrackImage = [trackImage resizableImageWithCapInsets:(UIEdgeInsets){
                0, width, 0, width
            } resizingMode:UIImageResizingModeStretch];
            [slider setMinimumTrackImage:minimumTrackImage forState:UIControlStateNormal];
        }
        if (!_maximumTrackImageSet) {
            UIImage *maximumTrackImage = [trackImage resizableImageWithCapInsets:(UIEdgeInsets){
                0, width, 0, width
            } resizingMode:UIImageResizingModeStretch];
            [slider setMaximumTrackImage:maximumTrackImage forState:UIControlStateNormal];
        }
    }
}

- (void)setMinimumTrackImage:(UIImage *)minimumTrackImage
{
    _trackImage = nil;
    _minimumTrackImageSet = true;
    minimumTrackImage = [minimumTrackImage resizableImageWithCapInsets:(UIEdgeInsets){
        0, minimumTrackImage.size.width, 0, 0
    } resizingMode:UIImageResizingModeStretch];
    [slider setMinimumTrackImage:minimumTrackImage forState:UIControlStateNormal];
}

- (UIImage *)minimumTrackImage
{
    return [slider thumbImageForState:UIControlStateNormal];
}

- (void)setMaximumTrackImage:(UIImage *)maximumTrackImage
{
    _trackImage = nil;
    _maximumTrackImageSet = true;
    maximumTrackImage = [maximumTrackImage resizableImageWithCapInsets:(UIEdgeInsets){
        0, 0, 0, maximumTrackImage.size.width
    } resizingMode:UIImageResizingModeStretch];
    [slider setMaximumTrackImage:maximumTrackImage forState:UIControlStateNormal];
}

- (UIImage *)maximumTrackImage
{
    return [slider thumbImageForState:UIControlStateNormal];
}

- (void)setThumbImage:(UIImage *)thumbImage
{
    [slider setThumbImage:thumbImage forState:UIControlStateNormal];
}


- (UIImage *)thumbImage
{
    return [slider thumbImageForState:UIControlStateNormal];
}

- (void)setInverted:(BOOL)inverted
{
    if (inverted) {
        slider.transform = CGAffineTransformMakeScale(-1, 1);
    } else {
        slider.transform = CGAffineTransformMakeScale(1, 1);
    }
}

- (float)discreteValue:(float)value
{
    if (self.step > 0 && value >= slider.maximumValue) {
        return slider.maximumValue;
    }
    
    if (self.step > 0 && self.step <= (slider.maximumValue - slider.minimumValue)) {
        double (^_round)(double) = ^(double x) {
            if (!UIAccessibilityIsVoiceOverRunning()) {
                return round(x);
            } else if (self.lastValue > value) {
                return floor(x);
            } else {
                return ceil(x);
            }
        };
        
        return MAX(slider.minimumValue,
                   MIN(slider.maximumValue, slider.minimumValue + _round((value - slider.minimumValue) / self.step) * self.step)
                   );
    }
    
    return value;
}

@end

Class<RCTComponentViewProtocol> RNCSliderCls(void)
{
    return RNCSliderComponentView.class;
}

#endif // RCT_NEW_ARCH_ENABLED

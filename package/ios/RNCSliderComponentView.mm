#import "SliderComponentView.h"

#import <React/RCTConversions.h>

#import <react/renderer/components/Slider/SliderComponentDescriptor.h>
#import <react/renderer/components/Slider/EventEmitters.h>
#import <react/renderer/components/Slider/Props.h>
#import <react/renderer/components/Slider/RCTComponentViewHelpers.h>
#import <React/RCTBridge+Private.h>
#import "RCTImagePrimitivesConversions.h"
#import <React/RCTImageLoaderProtocol.h>
#import "RCTFabricComponentsPlugins.h"
#import "Slider.h"

using namespace facebook::react;

@interface SliderComponentView () <RCTSliderViewProtocol>

@end


@implementation SliderComponentView
{
    Slider *slider;
    UIImage *_image;
    BOOL _isSliding;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
    return concreteComponentDescriptorProvider<SliderComponentDescriptor>();
}

+ (BOOL)shouldBeRecycled {
  return NO;
}

- (instancetype)initWithFrame:(CGRect)frame
{
    if (self = [super initWithFrame:frame]) {
        static const auto defaultProps = std::make_shared<const SliderProps>();
        _props = defaultProps;
        slider = [[Slider alloc] initWithFrame:self.bounds];
        [slider addTarget:self action:@selector(sliderValueChanged:)
         forControlEvents:UIControlEventValueChanged];
        [slider addTarget:self action:@selector(sliderTouchStart:)
         forControlEvents:UIControlEventTouchDown];
        [slider addTarget:self action:@selector(sliderTouchEnd:)
         forControlEvents:(UIControlEventTouchUpInside |
                           UIControlEventTouchUpOutside |
                           UIControlEventTouchCancel)];

        UITapGestureRecognizer *tapGesturer;
        tapGesturer = [[UITapGestureRecognizer alloc] initWithTarget: self action:@selector(tapHandler:)];
        [tapGesturer setNumberOfTapsRequired: 1];
        [slider addGestureRecognizer:tapGesturer];

        slider.value = (float)defaultProps->value;
        self.contentView = slider;
    }
    return self;
}

- (void)tapHandler:(UITapGestureRecognizer *)gesture {
    if ([gesture.view class] != [Slider class]) {
        return;
    }
    Slider *slider = (Slider *)gesture.view;
    slider.isSliding = _isSliding;

    // Ignore this tap if in the middle of a slide.
    if (_isSliding) {
        return;
    }

    if (!slider.tapToSeek) {
        return;
    }

    CGPoint touchPoint = [gesture locationInView:slider];
    float rangeWidth = slider.maximumValue - slider.minimumValue;
    
    float sliderPercent;
    if ([UIView userInterfaceLayoutDirectionForSemanticContentAttribute:slider.semanticContentAttribute] == UIUserInterfaceLayoutDirectionRightToLeft) {
        sliderPercent = 1.0 - (touchPoint.x / slider.bounds.size.width);
    } else {
        sliderPercent = touchPoint.x / slider.bounds.size.width;
    }

    slider.lastValue = slider.value;
    float value = slider.minimumValue + (rangeWidth * sliderPercent);

    if (value < slider.lowerLimit) {
        value = slider.lowerLimit;
    } else if (value > slider.upperLimit) {
        value = slider.upperLimit;
    }

    [slider setValue:[slider discreteValue:value] animated: YES];

    std::dynamic_pointer_cast<const SliderEventEmitter>(_eventEmitter)
    ->onSliderSlidingStart(SliderEventEmitter::OnSliderSlidingStart{.value = static_cast<Float>(slider.lastValue)});

    // Trigger onValueChange to address https://github.com/react-native-community/react-native-slider/issues/212
    std::dynamic_pointer_cast<const SliderEventEmitter>(_eventEmitter)
    ->onSliderValueChange(SliderEventEmitter::OnSliderValueChange{.value = static_cast<Float>(slider.value)});

    std::dynamic_pointer_cast<const SliderEventEmitter>(_eventEmitter)
    ->onSliderSlidingComplete(SliderEventEmitter::OnSliderSlidingComplete{.value = static_cast<Float>(slider.value)});
}

- (void)sliderValueChanged:(Slider *)sender
{
    [self RNCSendSliderEvent:sender withContinuous:YES isSlidingStart:NO];
}

- (void)sliderTouchStart:(Slider *)sender
{
    [self RNCSendSliderEvent:sender withContinuous:NO isSlidingStart:YES];
    _isSliding = YES;
    sender.isSliding = YES;
}

- (void)sliderTouchEnd:(Slider *)sender
{
    [self RNCSendSliderEvent:sender withContinuous:NO isSlidingStart:NO];
    sender.isSliding = NO;
    _isSliding = NO;
}

- (void)RNCSendSliderEvent:(Slider *)sender withContinuous:(BOOL)continuous isSlidingStart:(BOOL)isSlidingStart
{
    float value = [sender discreteValue:sender.value];

    if (value < sender.lowerLimit) {
        value = sender.lowerLimit;
        [sender setValue:value animated:NO];
    } else if (value > sender.upperLimit) {
        value = sender.upperLimit;
        [sender setValue:value animated:NO];
    }

    if(!sender.isSliding) {
        [sender setValue:value animated:NO];
    }

    if (continuous) {
        if (sender.lastValue != value)  {
            std::dynamic_pointer_cast<const SliderEventEmitter>(_eventEmitter)
            ->onSliderValueChange(SliderEventEmitter::OnSliderValueChange{.value = static_cast<Float>(value)});
        }
    } else {
        if (!isSlidingStart) {
            std::dynamic_pointer_cast<const SliderEventEmitter>(_eventEmitter)
            ->onSliderSlidingComplete(SliderEventEmitter::OnSliderSlidingComplete{.value = static_cast<Float>(value)});
        }
        if (isSlidingStart) {
            std::dynamic_pointer_cast<const SliderEventEmitter>(_eventEmitter)
            ->onSliderSlidingStart(SliderEventEmitter::OnSliderSlidingStart{.value = static_cast<Float>(value)});
        }
    }

    sender.lastValue = value;
}

- (void)updateProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps
{
    const auto &oldScreenProps = *std::static_pointer_cast<const SliderProps>(_props);
    const auto &newScreenProps = *std::static_pointer_cast<const SliderProps>(props);

    if (oldScreenProps.value != newScreenProps.value) {
        if (!slider.isSliding) {
            slider.value = newScreenProps.value;
        }
    }
    if (oldScreenProps.disabled != newScreenProps.disabled) {
        [slider setDisabled: newScreenProps.disabled];
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
    if (slider.lowerLimit != newScreenProps.lowerLimit) {
        if(newScreenProps.lowerLimit > slider.upperLimit){
            NSLog(@"Invalid configuration: upperLimit < lowerLimit; lowerLimit not set");
        } else {
            slider.lowerLimit = newScreenProps.lowerLimit;
        }
    }
    if (slider.upperLimit != newScreenProps.upperLimit) {
        if(newScreenProps.upperLimit < slider.lowerLimit){
            NSLog(@"Invalid configuration: upperLimit < lowerLimit; upperLimit not set");
        } else {
            slider.upperLimit = newScreenProps.upperLimit;
        }
    }
    if (oldScreenProps.tapToSeek != newScreenProps.tapToSeek) {
        slider.tapToSeek = newScreenProps.tapToSeek;
    }
    if (oldScreenProps.minimumValue != newScreenProps.minimumValue) {
        [slider setMinimumValue:newScreenProps.minimumValue];
    }
    if (oldScreenProps.thumbTintColor != newScreenProps.thumbTintColor) {
        slider.thumbTintColor = RCTUIColorFromSharedColor(newScreenProps.thumbTintColor);
    }
    if (oldScreenProps.thumbSize != newScreenProps.thumbSize) {
        slider.thumbSize = newScreenProps.thumbSize;
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
        id accessibilityIncrements = [NSMutableArray new];
        for (auto str : newScreenProps.accessibilityIncrements) {
            [accessibilityIncrements addObject:[NSString stringWithUTF8String:str.c_str()]];
        }
        [slider setAccessibilityIncrements:accessibilityIncrements];
    }
    if (oldScreenProps.thumbImage != newScreenProps.thumbImage) {
        [self loadImageFromImageSource:newScreenProps.thumbImage completionBlock:^(NSError *error, UIImage *image) {
            dispatch_async(dispatch_get_main_queue(), ^{
                [self->slider setThumbImage:image];
            });
        }
        failureBlock:^{
            [self->slider setThumbImage:nil];
        }];
    }
    if (oldScreenProps.trackImage != newScreenProps.trackImage) {
        [self loadImageFromImageSource:newScreenProps.trackImage completionBlock:^(NSError *error, UIImage *image) {
            dispatch_async(dispatch_get_main_queue(), ^{
                [self->slider setTrackImage:image];
            });
        }
        failureBlock:^{
            [self->slider setTrackImage:nil];
        }];
    }
    if (oldScreenProps.minimumTrackImage != newScreenProps.minimumTrackImage) {
        [self loadImageFromImageSource:newScreenProps.minimumTrackImage completionBlock:^(NSError *error, UIImage *image) {
            dispatch_async(dispatch_get_main_queue(), ^{
                [self->slider setMinimumTrackImage:image];
            });
        }
        failureBlock:^{
            [self->slider setMinimumTrackImage:nil];
        }];
    }
    if (oldScreenProps.maximumTrackImage != newScreenProps.maximumTrackImage) {
        [self loadImageFromImageSource:newScreenProps.maximumTrackImage completionBlock:^(NSError *error, UIImage *image) {
            dispatch_async(dispatch_get_main_queue(), ^{
                [self->slider setMaximumTrackImage:image];
            });
        }
        failureBlock:^{
            [self->slider setMaximumTrackImage:nil];
        }];
    }
    [super updateProps:props oldProps:oldProps];
}


// TODO temporarily using bridge, workaround for https://github.com/reactwg/react-native-new-architecture/discussions/31#discussioncomment-2717047, rewrite when Meta comes with a solution.
- (void)loadImageFromImageSource:(ImageSource)source completionBlock:(RNCLoadImageCompletionBlock)completionBlock failureBlock:(RNCLoadImageFailureBlock)failureBlock
{
    NSString *uri = [[NSString alloc] initWithUTF8String:source.uri.c_str()];
    if ((BOOL)uri.length) {
        [[[RCTBridge currentBridge] moduleForName:@"ImageLoader"]
        loadImageWithURLRequest:NSURLRequestFromImageSource(source)
        size:CGSizeMake(source.size.width, source.size.height)
        scale:source.scale
        clipped:NO
        resizeMode:RCTResizeModeCover
        progressBlock:nil
        partialLoadBlock:nil
        completionBlock:completionBlock];
    } else {
        failureBlock();
    }
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

Class<RCTComponentViewProtocol> SliderCls(void)
{
    return SliderComponentView.class;
}

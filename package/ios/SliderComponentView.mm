#import <React/RCTViewComponentView.h>
#import <React/RCTBridge+Private.h>
#import <React/RCTComponent.h>
#import <React/RCTConversions.h>
#import <React/RCTImageLoaderProtocol.h>
#import <react/renderer/imagemanager/RCTImagePrimitivesConversions.h>

#import <react/renderer/components/Slider/ComponentDescriptors.h>
#import <react/renderer/components/Slider/EventEmitters.h>
#import <react/renderer/components/Slider/Props.h>
#import <react/renderer/components/Slider/RCTComponentViewHelpers.h>

using namespace facebook::react;

@interface SliderView : UIView
@property (nonatomic, assign) double minValue;
@property (nonatomic, assign) double maxValue;
@property (nonatomic, assign) double step;
@property (nonatomic, copy) RCTDirectEventBlock onValueChange;
@end

@interface SliderComponentView : RCTViewComponentView <RCTSliderViewViewProtocol>
@end

typedef void (^SliderLoadImageCompletionBlock)(NSError *error, UIImage *image);
typedef void (^SliderLoadImageFailureBlock)(void);

@implementation SliderComponentView {
    SliderView *_sliderView;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
    return concreteComponentDescriptorProvider<SliderViewComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
    if (self = [super initWithFrame:frame]) {
        static const auto defaultProps = std::make_shared<const SliderViewProps>();
        _props = defaultProps;

        _sliderView = [[SliderView alloc] initWithFrame:self.bounds];
        __weak __typeof(self) weakSelf = self;
        _sliderView.onValueChange = ^(NSDictionary *event) {
            __strong __typeof(self) strongSelf = weakSelf;
            if (strongSelf == nil) {
                return;
            }

            auto eventEmitter = std::static_pointer_cast<const SliderViewEventEmitter>(strongSelf->_eventEmitter);
            if (eventEmitter == nullptr) {
                return;
            }

            NSNumber *value = event[@"value"];
            eventEmitter->onValueChange(SliderViewEventEmitter::OnValueChange{
                .value = value.doubleValue
            });
        };
        self.contentView = _sliderView;
    }

    return self;
}

- (void)updateProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps
{
    const auto &oldSliderProps = *std::static_pointer_cast<const SliderViewProps>(_props);
    const auto &newSliderProps = *std::static_pointer_cast<const SliderViewProps>(props);

    if (oldSliderProps.minValue != newSliderProps.minValue) {
        _sliderView.minValue = newSliderProps.minValue;
    }

    if (oldSliderProps.maxValue != newSliderProps.maxValue) {
        _sliderView.maxValue = newSliderProps.maxValue;
    }

    if (oldSliderProps.step != newSliderProps.step) {
        _sliderView.step = newSliderProps.step;
    }

    [super updateProps:props oldProps:oldProps];
}

@end

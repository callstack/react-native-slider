#import <UIKit/UIKit.h>
#import <React/RCTViewComponentView.h>
#import "Slider.h"

NS_ASSUME_NONNULL_BEGIN

typedef void (^RNCLoadImageCompletionBlock)(NSError * _Nullable error, UIImage * _Nullable image);
typedef void (^RNCLoadImageFailureBlock)();

@interface SliderComponentView : RCTViewComponentView

@property (nonatomic, copy) RCTBubblingEventBlock onSliderValueChange;
@property (nonatomic, copy) RCTBubblingEventBlock onSliderSlidingStart;
@property (nonatomic, copy) RCTBubblingEventBlock onSliderSlidingComplete;

@property (nonatomic, assign) float step;
@property (nonatomic, assign) float lastValue;
@property (nonatomic, assign) bool isSliding;

@property (nonatomic, assign) float lowerLimit;
@property (nonatomic, assign) float upperLimit;

@property (nonatomic, strong) UIImage *trackImage;
@property (nonatomic, strong) UIImage *minimumTrackImage;
@property (nonatomic, strong) UIImage *maximumTrackImage;
@property (nonatomic, strong) UIImage *thumbImage;
@property (nonatomic, assign) CGFloat thumbSize;
@property (nonatomic, assign) bool tapToSeek;
@property (nonatomic, strong) NSString *accessibilityUnits;
@property (nonatomic, strong) NSArray *accessibilityIncrements;

- (float) discreteValue:(float)value;

@end

NS_ASSUME_NONNULL_END

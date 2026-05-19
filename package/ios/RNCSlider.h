#import <UIKit/UIKit.h>

#import <React/RCTComponent.h>

@interface Slider : UISlider

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
- (void) setDisabled:(bool)disabled;
- (void) refreshThumb;

@end

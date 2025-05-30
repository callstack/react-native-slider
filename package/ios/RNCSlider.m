#import "RNCSlider.h"

@implementation RNCSlider
{
  float _unclippedValue;
  bool _minimumTrackImageSet;
  bool _maximumTrackImageSet;
}

- (instancetype)init {
  if (self = [super init]) {
      _upperLimit = FLT_MAX;
      _lowerLimit = FLT_MIN;
  }
  return self;
}

- (instancetype)initWithFrame:(CGRect)frame
{
    return [super initWithFrame:frame];
}

- (void)setValue:(float)value
{
    value = [self discreteValue:value];
  _unclippedValue = value;
  super.value = value;
  [self setupAccessibility:value];
}

- (void)setValue:(float)value animated:(BOOL)animated
{
    value = [self discreteValue:value];
  _unclippedValue = value;
  [super setValue:value animated:animated];
  [self setupAccessibility:value];
}

- (void)setupAccessibility:(float)value
{
  if (self.accessibilityUnits && self.accessibilityIncrements && [self.accessibilityIncrements count] - 1 == (int)self.maximumValue) {
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
  super.minimumValue = minimumValue;
  super.value = _unclippedValue;
}

- (void)setMaximumValue:(float)maximumValue
{
  super.maximumValue = maximumValue;
  super.value = _unclippedValue;
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
      [self setMinimumTrackImage:minimumTrackImage forState:UIControlStateNormal];
    }
    if (!_maximumTrackImageSet) {
      UIImage *maximumTrackImage = [trackImage resizableImageWithCapInsets:(UIEdgeInsets){
        0, width, 0, width
      } resizingMode:UIImageResizingModeStretch];
      [self setMaximumTrackImage:maximumTrackImage forState:UIControlStateNormal];
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
  [self setMinimumTrackImage:minimumTrackImage forState:UIControlStateNormal];
}

- (UIImage *)minimumTrackImage
{
  return [self thumbImageForState:UIControlStateNormal];
}

- (void)setMaximumTrackImage:(UIImage *)maximumTrackImage
{
  _trackImage = nil;
  _maximumTrackImageSet = true;
  maximumTrackImage = [maximumTrackImage resizableImageWithCapInsets:(UIEdgeInsets){
    0, 0, 0, maximumTrackImage.size.width
  } resizingMode:UIImageResizingModeStretch];
  [self setMaximumTrackImage:maximumTrackImage forState:UIControlStateNormal];
}

- (UIImage *)maximumTrackImage
{
  return [self thumbImageForState:UIControlStateNormal];
}

- (void)setThumbImage:(UIImage *)thumbImage
{
  [self setThumbImage:thumbImage forState:UIControlStateNormal];
}

- (UIImage *)thumbImage
{
  return [self thumbImageForState:UIControlStateNormal];
}

- (void)setInverted:(BOOL)inverted
{
  if (inverted) {
    self.transform = CGAffineTransformMakeScale(-1, 1);
  } else {
    self.transform = CGAffineTransformMakeScale(1, 1);
  }
}

- (void)setDisabled:(BOOL)disabled
{
    self.enabled = !disabled;
    [self layoutSubviews];
}

- (float)discreteValue:(float)value
{
    if (self.step > 0 && value >= self.maximumValue) {
        return self.maximumValue;
    }

    if (self.step > 0 && self.step <= (self.maximumValue - self.minimumValue)) {
        double (^_round)(double) = ^(double x) {
            if (!UIAccessibilityIsVoiceOverRunning()) {
                return round(x);
            } else if (self.lastValue > value) {
                return floor(x);
            } else {
                return ceil(x);
            }
        };

        return MAX(self.minimumValue,
            MIN(self.maximumValue, self.minimumValue + _round((value - self.minimumValue) / self.step) * self.step)
        );
    }

    return value;
}

@end

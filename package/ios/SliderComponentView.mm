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
@property (nonatomic, assign) double value;
@property (nonatomic, assign) double lowerLimit;
@property (nonatomic, assign) double upperLimit;
@property (nonatomic, assign) BOOL disabled;
@property (nonatomic, assign) BOOL inverted;
@property (nonatomic, assign) BOOL tapToSeek;
@property (nonatomic, strong) UIColor *minimumTrackTintColor;
@property (nonatomic, strong) UIColor *maximumTrackTintColor;
@property (nonatomic, strong) UIColor *thumbTintColor;
@property (nonatomic, strong) UIImage *thumbImage;
@property (nonatomic, assign) double thumbSize;
@property (nonatomic, strong) UIImage *trackImage;
@property (nonatomic, strong) UIImage *minimumTrackImage;
@property (nonatomic, strong) UIImage *maximumTrackImage;
@property (nonatomic, copy) RCTDirectEventBlock onValueChange;
@property (nonatomic, copy) RCTDirectEventBlock onSlidingStart;
@property (nonatomic, copy) RCTDirectEventBlock onSlidingComplete;
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
    _sliderView.onSlidingStart = ^(NSDictionary *event) {
      __strong __typeof(self) strongSelf = weakSelf;
      if (strongSelf == nil) {
        return;
      }

      auto eventEmitter = std::static_pointer_cast<const SliderViewEventEmitter>(strongSelf->_eventEmitter);
      if (eventEmitter == nullptr) {
        return;
      }

      NSNumber *value = event[@"value"];
      eventEmitter->onSlidingStart(SliderViewEventEmitter::OnSlidingStart{
        .value = value.doubleValue
      });
    };
    _sliderView.onSlidingComplete = ^(NSDictionary *event) {
      __strong __typeof(self) strongSelf = weakSelf;
      if (strongSelf == nil) {
        return;
      }

      auto eventEmitter = std::static_pointer_cast<const SliderViewEventEmitter>(strongSelf->_eventEmitter);
      if (eventEmitter == nullptr) {
        return;
      }

      NSNumber *value = event[@"value"];
      eventEmitter->onSlidingComplete(SliderViewEventEmitter::OnSlidingComplete{
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

  if (oldSliderProps.value != newSliderProps.value) {
    _sliderView.value = newSliderProps.value;
  }

  if (oldSliderProps.lowerLimit != newSliderProps.lowerLimit) {
    _sliderView.lowerLimit = newSliderProps.lowerLimit;
  }

  if (oldSliderProps.upperLimit != newSliderProps.upperLimit) {
    _sliderView.upperLimit = newSliderProps.upperLimit;
  }

  if (oldSliderProps.disabled != newSliderProps.disabled) {
    _sliderView.disabled = newSliderProps.disabled;
  }

  if (oldSliderProps.inverted != newSliderProps.inverted) {
    _sliderView.inverted = newSliderProps.inverted;
  }

  if (oldSliderProps.tapToSeek != newSliderProps.tapToSeek) {
    _sliderView.tapToSeek = newSliderProps.tapToSeek;
  }

  if (oldSliderProps.minimumTrackTintColor != newSliderProps.minimumTrackTintColor) {
    _sliderView.minimumTrackTintColor = RCTUIColorFromSharedColor(newSliderProps.minimumTrackTintColor);
  }

  if (oldSliderProps.maximumTrackTintColor != newSliderProps.maximumTrackTintColor) {
    _sliderView.maximumTrackTintColor = RCTUIColorFromSharedColor(newSliderProps.maximumTrackTintColor);
  }

  if (oldSliderProps.thumbTintColor != newSliderProps.thumbTintColor) {
    _sliderView.thumbTintColor = RCTUIColorFromSharedColor(newSliderProps.thumbTintColor);
  }

  if (oldSliderProps.thumbSize != newSliderProps.thumbSize) {
    _sliderView.thumbSize = newSliderProps.thumbSize;
  }

  if (oldSliderProps.thumbImage != newSliderProps.thumbImage) {
    [self loadImageFromImageSource:newSliderProps.thumbImage
                   completionBlock:^(__unused NSError *error, UIImage *image) {
                     dispatch_async(dispatch_get_main_queue(), ^{
                       self->_sliderView.thumbImage = image;
                     });
                   }
                      failureBlock:^{
                        self->_sliderView.thumbImage = nil;
                      }];
  }

  if (oldSliderProps.trackImage != newSliderProps.trackImage) {
    [self loadImageFromImageSource:newSliderProps.trackImage
                   completionBlock:^(__unused NSError *error, UIImage *image) {
                     dispatch_async(dispatch_get_main_queue(), ^{
                       self->_sliderView.trackImage = image;
                     });
                   }
                      failureBlock:^{
                        self->_sliderView.trackImage = nil;
                      }];
  }

  if (oldSliderProps.minimumTrackImage != newSliderProps.minimumTrackImage) {
    [self loadImageFromImageSource:newSliderProps.minimumTrackImage
                   completionBlock:^(__unused NSError *error, UIImage *image) {
                     dispatch_async(dispatch_get_main_queue(), ^{
                       self->_sliderView.minimumTrackImage = image;
                     });
                   }
                      failureBlock:^{
                        self->_sliderView.minimumTrackImage = nil;
                      }];
  }

  if (oldSliderProps.maximumTrackImage != newSliderProps.maximumTrackImage) {
    [self loadImageFromImageSource:newSliderProps.maximumTrackImage
                   completionBlock:^(__unused NSError *error, UIImage *image) {
                     dispatch_async(dispatch_get_main_queue(), ^{
                       self->_sliderView.maximumTrackImage = image;
                     });
                   }
                      failureBlock:^{
                        self->_sliderView.maximumTrackImage = nil;
                      }];
  }

  [super updateProps:props oldProps:oldProps];
}

- (void)loadImageFromImageSource:(ImageSource)source
                 completionBlock:(SliderLoadImageCompletionBlock)completionBlock
                    failureBlock:(SliderLoadImageFailureBlock)failureBlock
{
  NSString *uri = [[NSString alloc] initWithUTF8String:source.uri.c_str()];
  if (!(BOOL)uri.length) {
    failureBlock();
    return;
  }

  NSURL *url = NSURLFromImageSource(source);
  UIImage *localImage = [self localImageForURL:url uri:uri];
  if (localImage != nil) {
    completionBlock(nil, localImage);
    return;
  }

  if ([url.scheme isEqualToString:@"http"] || [url.scheme isEqualToString:@"https"]) {
    NSURLSessionDataTask *task = [NSURLSession.sharedSession
        dataTaskWithURL:url
      completionHandler:^(NSData *data, __unused NSURLResponse *response, NSError *error) {
        UIImage *image = data == nil ? nil : [UIImage imageWithData:data scale:source.scale];
        if (image != nil) {
          completionBlock(error, image);
        } else {
          failureBlock();
        }
      }];
    [task resume];
    return;
  }

  RCTBridge *bridge = [RCTBridge currentBridge];
  id<RCTImageLoaderProtocol> imageLoader = [bridge moduleForName:@"ImageLoader"];
  if (imageLoader == nil) {
    failureBlock();
    return;
  }

  [imageLoader loadImageWithURLRequest:NSURLRequestFromImageSource(source)
                                  size:CGSizeMake(source.size.width, source.size.height)
                                 scale:source.scale
                               clipped:NO
                            resizeMode:RCTResizeModeCover
                         progressBlock:nil
                      partialLoadBlock:nil
                       completionBlock:completionBlock];
}

- (UIImage *)localImageForURL:(NSURL *)url uri:(NSString *)uri
{
  if (url.fileURL) {
    UIImage *fileImage = [UIImage imageWithContentsOfFile:url.path];
    if (fileImage != nil) {
      return fileImage;
    }
  }

  NSArray<NSString *> *names = @[
    uri,
    uri.lastPathComponent,
    uri.lastPathComponent.stringByDeletingPathExtension,
  ];

  for (NSString *name in names) {
    UIImage *namedImage = [UIImage imageNamed:name];
    if (namedImage != nil) {
      return namedImage;
    }

    NSString *extension = name.pathExtension;
    NSString *resourceName = extension.length > 0 ? name.stringByDeletingPathExtension : name;
    NSString *resourcePath = [NSBundle.mainBundle pathForResource:resourceName
                                                           ofType:extension.length > 0 ? extension : nil];
    if (resourcePath != nil) {
      UIImage *resourceImage = [UIImage imageWithContentsOfFile:resourcePath];
      if (resourceImage != nil) {
        return resourceImage;
      }
    }
  }

  return nil;
}

@end

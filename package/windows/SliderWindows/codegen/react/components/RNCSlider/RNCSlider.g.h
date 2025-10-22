
/*
 * This file is auto-generated from RNCSliderNativeComponent spec file in flow / TypeScript.
 */
// clang-format off
#pragma once

#include <NativeModules.h>

#ifdef RNW_NEW_ARCH
#include <JSValueComposition.h>

#include <winrt/Microsoft.ReactNative.Composition.h>
#include <winrt/Microsoft.UI.Composition.h>
#endif // #ifdef RNW_NEW_ARCH

#ifdef RNW_NEW_ARCH

namespace SliderCodegen {

REACT_STRUCT(RNCSliderProps)
struct RNCSliderProps : winrt::implements<RNCSliderProps, winrt::Microsoft::ReactNative::IComponentProps> {
  RNCSliderProps(winrt::Microsoft::ReactNative::ViewProps props, const winrt::Microsoft::ReactNative::IComponentProps& cloneFrom)
    : ViewProps(props)
  {
     if (cloneFrom) {
       auto cloneFromProps = cloneFrom.as<RNCSliderProps>();
       accessibilityUnits = cloneFromProps->accessibilityUnits;
       accessibilityIncrements = cloneFromProps->accessibilityIncrements;
       disabled = cloneFromProps->disabled;
       inverted = cloneFromProps->inverted;
       vertical = cloneFromProps->vertical;
       tapToSeek = cloneFromProps->tapToSeek;
       maximumTrackImage = cloneFromProps->maximumTrackImage;
       maximumTrackTintColor = cloneFromProps->maximumTrackTintColor;
       maximumValue = cloneFromProps->maximumValue;
       minimumTrackImage = cloneFromProps->minimumTrackImage;
       minimumTrackTintColor = cloneFromProps->minimumTrackTintColor;
       minimumValue = cloneFromProps->minimumValue;
       step = cloneFromProps->step;
       testID = cloneFromProps->testID;
       thumbImage = cloneFromProps->thumbImage;
       thumbTintColor = cloneFromProps->thumbTintColor;
       trackImage = cloneFromProps->trackImage;
       value = cloneFromProps->value;
       lowerLimit = cloneFromProps->lowerLimit;
       upperLimit = cloneFromProps->upperLimit;  
     }
  }

  void SetProp(uint32_t hash, winrt::hstring propName, winrt::Microsoft::ReactNative::IJSValueReader value) noexcept {
    winrt::Microsoft::ReactNative::ReadProp(hash, propName, value, *this);
  }

  REACT_FIELD(accessibilityUnits)
  std::optional<std::string> accessibilityUnits;

  REACT_FIELD(accessibilityIncrements)
  std::optional<std::vector<std::string>> accessibilityIncrements;

  REACT_FIELD(disabled)
  std::optional<bool> disabled{};

  REACT_FIELD(inverted)
  std::optional<bool> inverted{};

  REACT_FIELD(vertical)
  std::optional<bool> vertical{};

  REACT_FIELD(tapToSeek)
  std::optional<bool> tapToSeek{};

  REACT_FIELD(maximumTrackImage)
  winrt::Microsoft::ReactNative::JSValue maximumTrackImage{nullptr};

  REACT_FIELD(maximumTrackTintColor)
  winrt::Microsoft::ReactNative::Color maximumTrackTintColor{nullptr};

  REACT_FIELD(maximumValue)
  std::optional<double> maximumValue{};

  REACT_FIELD(minimumTrackImage)
  winrt::Microsoft::ReactNative::JSValue minimumTrackImage{nullptr};

  REACT_FIELD(minimumTrackTintColor)
  winrt::Microsoft::ReactNative::Color minimumTrackTintColor{nullptr};

  REACT_FIELD(minimumValue)
  std::optional<double> minimumValue{};

  REACT_FIELD(step)
  std::optional<double> step{};

  REACT_FIELD(testID)
  std::optional<std::string> testID;

  REACT_FIELD(thumbImage)
  winrt::Microsoft::ReactNative::JSValue thumbImage{nullptr};

  REACT_FIELD(thumbTintColor)
  winrt::Microsoft::ReactNative::Color thumbTintColor{nullptr};

  REACT_FIELD(trackImage)
  winrt::Microsoft::ReactNative::JSValue trackImage{nullptr};

  REACT_FIELD(value)
  std::optional<float> value{};

  REACT_FIELD(lowerLimit)
  std::optional<float> lowerLimit{};

  REACT_FIELD(upperLimit)
  std::optional<float> upperLimit{};

  const winrt::Microsoft::ReactNative::ViewProps ViewProps;
};

REACT_STRUCT(RNCSlider_OnChange)
struct RNCSlider_OnChange {
  REACT_FIELD(value)
  float value{};

  REACT_FIELD(fromUser)
  std::optional<bool> fromUser{};
};

REACT_STRUCT(RNCSlider_OnRNCSliderSlidingStart)
struct RNCSlider_OnRNCSliderSlidingStart {
  REACT_FIELD(value)
  float value{};

  REACT_FIELD(fromUser)
  std::optional<bool> fromUser{};
};

REACT_STRUCT(RNCSlider_OnRNCSliderSlidingComplete)
struct RNCSlider_OnRNCSliderSlidingComplete {
  REACT_FIELD(value)
  float value{};

  REACT_FIELD(fromUser)
  std::optional<bool> fromUser{};
};

REACT_STRUCT(RNCSlider_OnRNCSliderValueChange)
struct RNCSlider_OnRNCSliderValueChange {
  REACT_FIELD(value)
  float value{};

  REACT_FIELD(fromUser)
  std::optional<bool> fromUser{};
};

struct RNCSliderEventEmitter {
  RNCSliderEventEmitter(const winrt::Microsoft::ReactNative::EventEmitter &eventEmitter)
      : m_eventEmitter(eventEmitter) {}

  using OnChange = RNCSlider_OnChange;
  using OnRNCSliderSlidingStart = RNCSlider_OnRNCSliderSlidingStart;
  using OnRNCSliderSlidingComplete = RNCSlider_OnRNCSliderSlidingComplete;
  using OnRNCSliderValueChange = RNCSlider_OnRNCSliderValueChange;

  void onChange(OnChange &value) const {
    m_eventEmitter.DispatchEvent(L"change", [value](const winrt::Microsoft::ReactNative::IJSValueWriter writer) {
      winrt::Microsoft::ReactNative::WriteValue(writer, value);
    });
  }

  void onRNCSliderSlidingStart(OnRNCSliderSlidingStart &value) const {
    m_eventEmitter.DispatchEvent(L"rNCSliderSlidingStart", [value](const winrt::Microsoft::ReactNative::IJSValueWriter writer) {
      winrt::Microsoft::ReactNative::WriteValue(writer, value);
    });
  }

  void onRNCSliderSlidingComplete(OnRNCSliderSlidingComplete &value) const {
    m_eventEmitter.DispatchEvent(L"rNCSliderSlidingComplete", [value](const winrt::Microsoft::ReactNative::IJSValueWriter writer) {
      winrt::Microsoft::ReactNative::WriteValue(writer, value);
    });
  }

  void onRNCSliderValueChange(OnRNCSliderValueChange &value) const {
    m_eventEmitter.DispatchEvent(L"rNCSliderValueChange", [value](const winrt::Microsoft::ReactNative::IJSValueWriter writer) {
      winrt::Microsoft::ReactNative::WriteValue(writer, value);
    });
  }

 private:
  winrt::Microsoft::ReactNative::EventEmitter m_eventEmitter{nullptr};
};

template<typename TUserData>
struct BaseRNCSlider {

  virtual void UpdateProps(
    const winrt::Microsoft::ReactNative::ComponentView &/*view*/,
    const winrt::com_ptr<RNCSliderProps> &newProps,
    const winrt::com_ptr<RNCSliderProps> &/*oldProps*/) noexcept {
    m_props = newProps;
  }

  // UpdateLayoutMetrics will only be called if this method is overridden
  virtual void UpdateLayoutMetrics(
    const winrt::Microsoft::ReactNative::ComponentView &/*view*/,
    const winrt::Microsoft::ReactNative::LayoutMetrics &/*newLayoutMetrics*/,
    const winrt::Microsoft::ReactNative::LayoutMetrics &/*oldLayoutMetrics*/) noexcept {
  }

  // UpdateState will only be called if this method is overridden
  virtual void UpdateState(
    const winrt::Microsoft::ReactNative::ComponentView &/*view*/,
    const winrt::Microsoft::ReactNative::IComponentState &/*newState*/) noexcept {
  }

  virtual void UpdateEventEmitter(const std::shared_ptr<RNCSliderEventEmitter> &eventEmitter) noexcept {
    m_eventEmitter = eventEmitter;
  }

  // MountChildComponentView will only be called if this method is overridden
  virtual void MountChildComponentView(const winrt::Microsoft::ReactNative::ComponentView &/*view*/,
           const winrt::Microsoft::ReactNative::MountChildComponentViewArgs &/*args*/) noexcept {
  }

  // UnmountChildComponentView will only be called if this method is overridden
  virtual void UnmountChildComponentView(const winrt::Microsoft::ReactNative::ComponentView &/*view*/,
           const winrt::Microsoft::ReactNative::UnmountChildComponentViewArgs &/*args*/) noexcept {
  }

  // Initialize will only be called if this method is overridden
  virtual void Initialize(const winrt::Microsoft::ReactNative::ComponentView &/*view*/) noexcept {
  }

  // CreateVisual will only be called if this method is overridden
  virtual winrt::Microsoft::UI::Composition::Visual CreateVisual(const winrt::Microsoft::ReactNative::ComponentView &view) noexcept {
    return view.as<winrt::Microsoft::ReactNative::Composition::ComponentView>().Compositor().CreateSpriteVisual();
  }

  // FinalizeUpdate will only be called if this method is overridden
  virtual void FinalizeUpdate(const winrt::Microsoft::ReactNative::ComponentView &/*view*/,
                                        winrt::Microsoft::ReactNative::ComponentViewUpdateMask /*mask*/) noexcept {
  }

  

  const std::shared_ptr<RNCSliderEventEmitter>& EventEmitter() const { return m_eventEmitter; }
  const winrt::com_ptr<RNCSliderProps>& Props() const { return m_props; }

private:
  winrt::com_ptr<RNCSliderProps> m_props;
  std::shared_ptr<RNCSliderEventEmitter> m_eventEmitter;
};

template <typename TUserData>
void RegisterRNCSliderNativeComponent(
    winrt::Microsoft::ReactNative::IReactPackageBuilder const &packageBuilder,
    std::function<void(const winrt::Microsoft::ReactNative::Composition::IReactCompositionViewComponentBuilder&)> builderCallback) noexcept {
  packageBuilder.as<winrt::Microsoft::ReactNative::IReactPackageBuilderFabric>().AddViewComponent(
      L"RNCSlider", [builderCallback](winrt::Microsoft::ReactNative::IReactViewComponentBuilder const &builder) noexcept {
        auto compBuilder = builder.as<winrt::Microsoft::ReactNative::Composition::IReactCompositionViewComponentBuilder>();

        builder.SetCreateProps([](winrt::Microsoft::ReactNative::ViewProps props,
                              const winrt::Microsoft::ReactNative::IComponentProps& cloneFrom) noexcept {
            return winrt::make<RNCSliderProps>(props, cloneFrom); 
        });

        builder.SetUpdatePropsHandler([](const winrt::Microsoft::ReactNative::ComponentView &view,
                                     const winrt::Microsoft::ReactNative::IComponentProps &newProps,
                                     const winrt::Microsoft::ReactNative::IComponentProps &oldProps) noexcept {
            auto userData = view.UserData().as<TUserData>();
            userData->UpdateProps(view, newProps ? newProps.as<RNCSliderProps>() : nullptr, oldProps ? oldProps.as<RNCSliderProps>() : nullptr);
        });

        compBuilder.SetUpdateLayoutMetricsHandler([](const winrt::Microsoft::ReactNative::ComponentView &view,
                                      const winrt::Microsoft::ReactNative::LayoutMetrics &newLayoutMetrics,
                                      const winrt::Microsoft::ReactNative::LayoutMetrics &oldLayoutMetrics) noexcept {
            auto userData = view.UserData().as<TUserData>();
            userData->UpdateLayoutMetrics(view, newLayoutMetrics, oldLayoutMetrics);
        });

        builder.SetUpdateEventEmitterHandler([](const winrt::Microsoft::ReactNative::ComponentView &view,
                                     const winrt::Microsoft::ReactNative::EventEmitter &eventEmitter) noexcept {
          auto userData = view.UserData().as<TUserData>();
          userData->UpdateEventEmitter(std::make_shared<RNCSliderEventEmitter>(eventEmitter));
        });

        if CONSTEXPR_SUPPORTED_ON_VIRTUAL_FN_ADDRESS (&TUserData::FinalizeUpdate != &BaseRNCSlider<TUserData>::FinalizeUpdate) {
            builder.SetFinalizeUpdateHandler([](const winrt::Microsoft::ReactNative::ComponentView &view,
                                     winrt::Microsoft::ReactNative::ComponentViewUpdateMask mask) noexcept {
            auto userData = view.UserData().as<TUserData>();
            userData->FinalizeUpdate(view, mask);
          });
        } 

        if CONSTEXPR_SUPPORTED_ON_VIRTUAL_FN_ADDRESS (&TUserData::UpdateState != &BaseRNCSlider<TUserData>::UpdateState) {
          builder.SetUpdateStateHandler([](const winrt::Microsoft::ReactNative::ComponentView &view,
                                     const winrt::Microsoft::ReactNative::IComponentState &newState) noexcept {
            auto userData = view.UserData().as<TUserData>();
            userData->UpdateState(view, newState);
          });
        }

        if CONSTEXPR_SUPPORTED_ON_VIRTUAL_FN_ADDRESS (&TUserData::MountChildComponentView != &BaseRNCSlider<TUserData>::MountChildComponentView) {
          builder.SetMountChildComponentViewHandler([](const winrt::Microsoft::ReactNative::ComponentView &view,
                                      const winrt::Microsoft::ReactNative::MountChildComponentViewArgs &args) noexcept {
            auto userData = view.UserData().as<TUserData>();
            return userData->MountChildComponentView(view, args);
          });
        }

        if CONSTEXPR_SUPPORTED_ON_VIRTUAL_FN_ADDRESS (&TUserData::UnmountChildComponentView != &BaseRNCSlider<TUserData>::UnmountChildComponentView) {
          builder.SetUnmountChildComponentViewHandler([](const winrt::Microsoft::ReactNative::ComponentView &view,
                                      const winrt::Microsoft::ReactNative::UnmountChildComponentViewArgs &args) noexcept {
            auto userData = view.UserData().as<TUserData>();
            return userData->UnmountChildComponentView(view, args);
          });
        }

        compBuilder.SetViewComponentViewInitializer([](const winrt::Microsoft::ReactNative::ComponentView &view) noexcept {
          auto userData = winrt::make_self<TUserData>();
          if CONSTEXPR_SUPPORTED_ON_VIRTUAL_FN_ADDRESS (&TUserData::Initialize != &BaseRNCSlider<TUserData>::Initialize) {
            userData->Initialize(view);
          }
          view.UserData(*userData);
        });

        if CONSTEXPR_SUPPORTED_ON_VIRTUAL_FN_ADDRESS (&TUserData::CreateVisual != &BaseRNCSlider<TUserData>::CreateVisual) {
          compBuilder.SetCreateVisualHandler([](const winrt::Microsoft::ReactNative::ComponentView &view) noexcept {
            auto userData = view.UserData().as<TUserData>();
            return userData->CreateVisual(view);
          });
        }

        // Allow app to further customize the builder
        if (builderCallback) {
          builderCallback(compBuilder);
        }
      });
}

} // namespace SliderCodegen

#endif // #ifdef RNW_NEW_ARCH

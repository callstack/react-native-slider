// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

#include "pch.h"
#include "SliderViewManager.h"
#include "NativeModules.h"
#include "SliderView.h"

namespace winrt {
    using namespace Microsoft::ReactNative;
    using namespace Windows::Foundation::Collections;

    namespace xaml = winrt::Windows::UI::Xaml;
}

namespace winrt::SliderWindows::implementation {

    SliderViewManager::SliderViewManager() {}

    // IViewManager
    winrt::hstring SliderViewManager::Name() noexcept {
        return L"RNCSlider";
    }

    xaml::FrameworkElement SliderViewManager::CreateView() noexcept {
        return winrt::SliderWindows::SliderView(m_reactContext);
    }

    // IViewManagerWithReactContext
    winrt::IReactContext SliderViewManager::ReactContext() noexcept {
        return m_reactContext;
    }

    void SliderViewManager::ReactContext(IReactContext reactContext) noexcept {
        m_reactContext = reactContext;
    }

    // IViewManagerWithNativeProperties
    IMapView<hstring, ViewManagerPropertyType> SliderViewManager::NativeProps() noexcept {
        auto nativeProps = winrt::single_threaded_map<hstring, ViewManagerPropertyType>();

        nativeProps.Insert(L"maximumValue", ViewManagerPropertyType::Number);
        nativeProps.Insert(L"minimumValue", ViewManagerPropertyType::Number);
        nativeProps.Insert(L"value", ViewManagerPropertyType::Number);
        nativeProps.Insert(L"step", ViewManagerPropertyType::Number);

        nativeProps.Insert(L"inverted", ViewManagerPropertyType::Boolean);
        nativeProps.Insert(L"disabled", ViewManagerPropertyType::Boolean);
        nativeProps.Insert(L"vertical", ViewManagerPropertyType::Boolean);

        nativeProps.Insert(L"minimumTrackTintColor", ViewManagerPropertyType::Color);
        nativeProps.Insert(L"maximumTrackTintColor", ViewManagerPropertyType::Color);
        nativeProps.Insert(L"thumbTintColor", ViewManagerPropertyType::Color);
        nativeProps.Insert(L"thumbImage", ViewManagerPropertyType::Map);

        return nativeProps.GetView();
    }

    void SliderViewManager::UpdateProperties(xaml::FrameworkElement const& view,
        IJSValueReader const& propertyMapReader) noexcept {
        if (auto sliderView = view.try_as<SliderView>()) {
            sliderView->UpdateProperties(propertyMapReader);
        } else {
            OutputDebugStringW(L"Type deduction for SliderView failed.");
        }
    }

    // IViewManagerWithExportedEventTypeConstants
    ConstantProviderDelegate SliderViewManager::ExportedCustomBubblingEventTypeConstants() noexcept {
        return nullptr;
    }

    ConstantProviderDelegate SliderViewManager::ExportedCustomDirectEventTypeConstants() noexcept {
        return [](winrt::IJSValueWriter const& constantWriter) {
            WriteCustomDirectEventTypeConstant(constantWriter, "onChange");
            WriteCustomDirectEventTypeConstant(constantWriter, L"topSlidingStart", L"onRNCSliderSlidingStart");
            WriteCustomDirectEventTypeConstant(constantWriter, L"topSlidingComplete", L"onRNCSliderSlidingComplete");
        };
    }

}

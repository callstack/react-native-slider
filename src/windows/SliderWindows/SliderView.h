// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

#pragma once

#include "SliderView.g.h"
#include "winrt/Microsoft.ReactNative.h"
#include "NativeModules.h"

namespace winrt::SliderWindows::implementation {

    namespace xaml = winrt::Windows::UI::Xaml;

    class SliderView : public SliderViewT<SliderView> {
    public:
        SliderView(Microsoft::ReactNative::IReactContext const& reactContext);
        void UpdateProperties(Microsoft::ReactNative::IJSValueReader const& reader);

    private:
        Microsoft::ReactNative::IReactContext m_reactContext{ nullptr };
        bool m_updating{ false };

        xaml::Controls::Primitives::RangeBase::ValueChanged_revoker m_sliderValueChangedRevoker{};
        xaml::UIElement::ManipulationStarting_revoker m_sliderManipulationStartingRevoker{};
        xaml::UIElement::ManipulationCompleted_revoker m_sliderManipulationCompletedRevoker{};

        void RegisterEvents();
        void OnValueChangedHandler(
            winrt::Windows::Foundation::IInspectable const& sender,
            xaml::Controls::Primitives::RangeBaseValueChangedEventArgs const& args);
        void OnManipulationStartingHandler(
            winrt::Windows::Foundation::IInspectable const& sender,
            xaml::Input::ManipulationStartingRoutedEventArgs const& args);
        void OnManipulationCompletedHandler(
            winrt::Windows::Foundation::IInspectable const& sender,
            xaml::Input::ManipulationCompletedRoutedEventArgs const& args);

        const double CalculateStepFrequencyPercentageValue(const double& stepPropertyValue) const noexcept;

        double m_maxValue, m_minValue;
        double m_value;

        bool isSliding;

        bool onValueChangeSent, onSlidingStartSent, onSlidingCompleteSent;
    };
}

namespace winrt::SliderWindows::factory_implementation {
    struct SliderView : SliderViewT<SliderView, implementation::SliderView> {};
}

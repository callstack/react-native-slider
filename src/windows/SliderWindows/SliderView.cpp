// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

#include "pch.h"

#include "JSValueXaml.h"

#include "SliderView.h"
#include "SliderView.g.cpp"

#include "winrt/Windows.UI.Xaml.Media.h"
#include "winrt/Windows.UI.Xaml.Media.Imaging.h"
#include "winrt/Windows.UI.Xaml.Input.h"

namespace winrt {
    using namespace Microsoft::ReactNative;
    using namespace Windows::Foundation;
    using namespace Windows::UI;
    using namespace Windows::UI::Xaml::Media;
    using namespace Windows::UI::Xaml::Media::Imaging;
}

namespace winrt::SliderWindows::implementation {

    SliderView::SliderView(winrt::IReactContext const& reactContext) : m_reactContext(reactContext) {
        RegisterEvents();
    }

    void SliderView::RegisterEvents() {
        //Set this so that Slider passes on Manipulation* events.
        this->ManipulationMode(xaml::Input::ManipulationModes::All);

        m_sliderValueChangedRevoker = this->ValueChanged(winrt::auto_revoke,
            [ref = get_weak()](auto const& sender, auto const& args) {
            if (auto self = ref.get()) {
                self->OnValueChangedHandler(sender, args);
            }
        });

        m_sliderManipulationStartingRevoker = this->ManipulationStarting(winrt::auto_revoke,
            [ref = get_weak()](auto const& sender, auto const& args) {
            if (auto self = ref.get()) {
                self->OnManipulationStartingHandler(sender, args);
            }
        });

        m_sliderManipulationCompletedRevoker = this->ManipulationCompleted(winrt::auto_revoke,
            [ref = get_weak()](auto const& sender, auto const& args) {
            if (auto self = ref.get()) {
                self->OnManipulationCompletedHandler(sender, args);
            }
        });
    }

    void SliderView::UpdateProperties(winrt::IJSValueReader const& reader) {
        m_updating = true;

        bool updatedValue = false;
        bool updatedMaxValue = false;
        bool updatedMinValue = false;

        auto const& propertyMap = JSValueObject::ReadFrom(reader);

        for (auto const& pair : propertyMap) {
            auto const& propertyName = pair.first;
            auto const& propertyValue = pair.second;

            if (propertyName == "value") {
                if (propertyValue.IsNull()) {
                    this->ClearValue(xaml::Controls::Primitives::RangeBase::ValueProperty());
                }
                else {
                    updatedValue = true;
                    m_value = propertyValue.AsDouble();
                }
            }
            else if (propertyName == "maximumValue") {
                if (propertyValue.IsNull()) {
                    this->ClearValue(xaml::Controls::Primitives::RangeBase::MaximumProperty());
                }
                else {
                    updatedMaxValue = true;
                    m_maxValue = propertyValue.AsDouble();
                }
            }
            else if (propertyName == "minimumValue") {
                if (propertyValue.IsNull()) {
                    this->ClearValue(xaml::Controls::Primitives::RangeBase::MinimumProperty());
                }
                else {
                    updatedMinValue = true;
                    m_minValue = propertyValue.AsDouble();
                }
            }
            else if (propertyName == "step") {
                if (propertyValue.IsNull()) {
                    this->ClearValue(xaml::Controls::Slider::StepFrequencyProperty());
                }
                else {
                    auto&& step = CalculateStepFrequencyPercentageValue(propertyValue.AsDouble());
                    this->StepFrequency(step);
                }
            }
            else if (propertyName == "inverted") {
                if (propertyValue.IsNull()) {
                    this->ClearValue(xaml::Controls::Slider::IsDirectionReversedProperty());
                }
                else {
                    this->IsDirectionReversed(propertyValue.AsBoolean());
                }
            }
            else if (propertyName == "disabled") {
                if (propertyValue.IsNull()) {
                    this->ClearValue(xaml::Controls::Control::IsEnabledProperty());
                }
                else {
                    this->IsEnabled(!propertyValue.AsBoolean());
                }
            }
            else if (propertyName == "vertical") {
                if (propertyValue.IsNull()) {
                    this->ClearValue(xaml::Controls::Slider::OrientationProperty());
                }
                else {
                    this->Orientation(propertyValue.AsBoolean() ?
                        xaml::Controls::Orientation::Vertical :
                        xaml::Controls::Orientation::Horizontal);
                }
            }
            else if (propertyName == "minimumTrackTintColor") {
                if (!propertyValue.IsNull()) {
                    auto resDict = this->Resources();

                    resDict.Insert(winrt::box_value(L"SliderTrackValueFill"), propertyValue.To<winrt::Brush>());
                    resDict.Insert(winrt::box_value(L"SliderTrackValueFillPointerOver"), propertyValue.To<winrt::Brush>());
                    resDict.Insert(winrt::box_value(L"SliderTrackValueFillPressed"), propertyValue.To<winrt::Brush>());
                }
            }
            else if (propertyName == "maximumTrackTintColor") {
                if (!propertyValue.IsNull()) {
                    auto resDict = this->Resources();

                    resDict.Insert(winrt::box_value(L"SliderTrackFill"), propertyValue.To<winrt::Brush>());
                    resDict.Insert(winrt::box_value(L"SliderTrackFillPointerOver"), propertyValue.To<winrt::Brush>());
                    resDict.Insert(winrt::box_value(L"SliderTrackFillPressed"), propertyValue.To<winrt::Brush>());
                }
            }
            else if (propertyName == "thumbTintColor") {
                if (!propertyValue.IsNull()) {
                    auto resDict = this->Resources();

                    resDict.Insert(winrt::box_value(L"SliderThumbBackground"), propertyValue.To<winrt::Brush>());
                    resDict.Insert(winrt::box_value(L"SliderThumbBackgroundPointerOver"), propertyValue.To<winrt::Brush>());
                    resDict.Insert(winrt::box_value(L"SliderThumbBackgroundPressed"), propertyValue.To<winrt::Brush>());
                }
            }
            else if (propertyName == "thumbImage") {
                if (!propertyValue.IsNull()) {
                    auto imgUriString = propertyValue.AsObject()["uri"].AsString();
                    BitmapImage bitmap = BitmapImage(Uri(to_hstring(imgUriString)));
                    ImageBrush imgB = ImageBrush();
                    imgB.ImageSource(bitmap);

                    auto resDict = this->Resources();
                    resDict.Insert(winrt::box_value(L"SliderThumbBackground"), imgB);
                    resDict.Insert(winrt::box_value(L"SliderThumbBackgroundPointerOver"), imgB);
                    resDict.Insert(winrt::box_value(L"SliderThumbBackgroundPressed"), imgB);
                }
            }
        }

        // This is to mitigate platform bugs related to the order of setting min/max values in certain XAML controls.
        if (updatedMaxValue) {
            this->Maximum(m_maxValue);
        }
        if (updatedMinValue) {
            this->Minimum(m_minValue);
        }
        if (updatedValue) {
            this->Value(m_value);
        }

        m_updating = false;
    }

    void SliderView::OnValueChangedHandler( winrt::IInspectable const& /*sender*/,
        xaml::Controls::Primitives::RangeBaseValueChangedEventArgs const& args )
    {
        if( !m_updating )
        {
            m_reactContext.DispatchEvent(
                *this,
                L"topChange",
                [&]( winrt::Microsoft::ReactNative::IJSValueWriter const& eventDataWriter ) noexcept
                {
                    eventDataWriter.WriteObjectBegin();
                    {
                        WriteProperty( eventDataWriter, L"value", args.NewValue() );
                    }
                    eventDataWriter.WriteObjectEnd();
                } );
            onValueChangeSent = true;
        }
    }

    void SliderView::OnManipulationStartingHandler( winrt::IInspectable const& sender,
        xaml::Input::ManipulationStartingRoutedEventArgs const& args )
    {
        if( !m_updating )
        {
            auto self = sender.try_as<xaml::Controls::Slider>();

            m_reactContext.DispatchEvent(
                *this,
                L"topSlidingStart",
                [&]( winrt::Microsoft::ReactNative::IJSValueWriter const& eventDataWriter ) noexcept
                {
                    eventDataWriter.WriteObjectBegin();
                    {
                        WriteProperty( eventDataWriter, L"value", self.Value() );
                    }
                    eventDataWriter.WriteObjectEnd();
                } );

            if( onValueChangeSent )
            {
                m_reactContext.DispatchEvent(
                    *this,
                    L"topSlidingComplete",
                    [&]( winrt::Microsoft::ReactNative::IJSValueWriter const& eventDataWriter ) noexcept
                    {
                        eventDataWriter.WriteObjectBegin();
                        {
                            WriteProperty( eventDataWriter, L"value", self.Value() );
                        }
                        eventDataWriter.WriteObjectEnd();
                    } );
                onSlidingCompleteSent = true;
            }
            onValueChangeSent = false;
            onSlidingStartSent = true;
            onSlidingCompleteSent = false;
        }
    }

    void SliderView::OnManipulationCompletedHandler( winrt::IInspectable const& sender,
        xaml::Input::ManipulationCompletedRoutedEventArgs const& args )
    {
        if( !m_updating && onSlidingCompleteSent == false )
        {
            auto self = sender.try_as<xaml::Controls::Slider>();

            m_reactContext.DispatchEvent(
                *this,
                L"topSlidingComplete",
                [&]( winrt::Microsoft::ReactNative::IJSValueWriter const& eventDataWriter ) noexcept
                {
                    eventDataWriter.WriteObjectBegin();
                    {
                        WriteProperty( eventDataWriter, L"value", self.Value() );
                    }
                    eventDataWriter.WriteObjectEnd();
                } );
            onSlidingCompleteSent = true;
            onValueChangeSent = false;
        }
    }

    const double SliderView::CalculateStepFrequencyPercentageValue(const double& stepPropertyValue) const noexcept {
        if (stepPropertyValue != 0) {
            return stepPropertyValue;
        }
        else {
            return (m_maxValue - m_minValue) / 100.f;
        }
    }
}

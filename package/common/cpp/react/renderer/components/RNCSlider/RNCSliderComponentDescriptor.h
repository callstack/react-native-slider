#pragma once

#include <react/renderer/components/RNCSlider/RNCSliderShadowNode.h>
#include <react/renderer/core/ConcreteComponentDescriptor.h>
#include "RNCSliderMeasurementsManager.h"

namespace facebook {
    namespace react {

        class RNCSliderComponentDescriptor final
                : public ConcreteComponentDescriptor<RNCSliderShadowNode> {
#ifdef ANDROID
        public:
            RNCSliderComponentDescriptor(const ComponentDescriptorParameters &parameters)
                    : ConcreteComponentDescriptor(parameters), measurementsManager_(
                    std::make_shared<RNCSliderMeasurementsManager>(contextContainer_)) {}

            void adopt(ShadowNode &shadowNode) const override {
                ConcreteComponentDescriptor::adopt(shadowNode);


                auto &rncSliderShadowNode =
                        static_cast<RNCSliderShadowNode &>(shadowNode);

                // `RNCSliderShadowNode` uses `RNCSliderMeasurementsManager` to
                // provide measurements to Yoga.
                rncSliderShadowNode.setSliderMeasurementsManager(
                        measurementsManager_);

                // All `RNCSliderShadowNode`s must have leaf Yoga nodes with properly
                // setup measure function.
                rncSliderShadowNode.enableMeasurement();
            }
        private:
            const std::shared_ptr<RNCSliderMeasurementsManager> measurementsManager_;
#else
        public:
            RNCSliderComponentDescriptor(const ComponentDescriptorParameters &parameters)
            : ConcreteComponentDescriptor(parameters) {}
#endif
        };

    }
}

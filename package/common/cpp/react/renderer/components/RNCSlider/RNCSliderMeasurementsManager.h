#ifdef ANDROID
#pragma once

#include <react/renderer/core/ConcreteComponentDescriptor.h>
#include <react/renderer/core/LayoutConstraints.h>
#include <react/utils/ContextContainer.h>

namespace facebook::react {

    class RNCSliderMeasurementsManager {
    public:
        RNCSliderMeasurementsManager(
                const std::shared_ptr<const ContextContainer> &contextContainer)
                : contextContainer_(contextContainer) {}

        Size measure(SurfaceId surfaceId, LayoutConstraints layoutConstraints) const;

    private:
        const std::shared_ptr<const ContextContainer> contextContainer_;
        mutable std::mutex mutex_;
        mutable bool hasBeenMeasured_ = false;
        mutable Size cachedMeasurement_{};

    };
}
#endif

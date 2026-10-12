#ifdef ANDROID
#pragma once

#include <react/renderer/core/ConcreteComponentDescriptor.h>
#include <react/renderer/core/LayoutConstraints.h>
#include <react/utils/ContextContainer.h>

#include <mutex>
#include <optional>

namespace facebook::react {

    class RNCSliderMeasurementsManager {
    public:
        RNCSliderMeasurementsManager(
                const std::shared_ptr<const ContextContainer> &contextContainer)
                : contextContainer_(contextContainer) {}

        /*
         * The size of a slider, which every slider on a surface shares - apart
         * from those drawing step markers of their own, which are measured to
         * fit them instead. Each of the two is asked for once and kept.
         */
        Size measure(
                SurfaceId surfaceId,
                LayoutConstraints layoutConstraints,
                bool drawsStepMarkers) const;

    private:
        const std::shared_ptr<const ContextContainer> contextContainer_;
        mutable std::mutex mutex_;
        mutable std::optional<Size> cachedMeasurement_;
        mutable std::optional<Size> cachedStepMarkedMeasurement_;

    };
}
#endif

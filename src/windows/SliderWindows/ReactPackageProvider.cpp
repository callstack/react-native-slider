// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

#include "pch.h"
#include "ReactPackageProvider.h"
#include "ReactPackageProvider.g.cpp"

#include "SliderViewManager.h"

using namespace winrt::Microsoft::ReactNative;

namespace winrt::SliderWindows::implementation {

  void ReactPackageProvider::CreatePackage(IReactPackageBuilder const& packageBuilder) noexcept {
      packageBuilder.AddViewManager(L"SliderViewManager", []() { return winrt::make<SliderViewManager>(); });
  }

}
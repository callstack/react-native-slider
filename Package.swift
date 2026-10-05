// swift-tools-version: 6.0
// AUTO-SCAFFOLDED by react-native spm scaffold — safe to edit & commit via patch-package.
// AUTO-SCAFFOLDED-VERSION: 19
// Cache slot: 0.87.1/dual-flavor
// Edit the contents below if needed and re-run `npx patch-package <dep-name>`
// to persist across `npm install`. To regenerate from the podspec, remove
// this file (or just this marker) and re-run `npx react-native spm scaffold`.
//
// Package references are plain relative paths, computed when this file was
// scaffolded. They stay correct because the file is re-scaffolded per app
// and cache slot, and any node_modules relayout reinstalls this package
// (dropping the file) anyway.

import PackageDescription

let package = Package(
    name: "Slider",
    platforms: [.iOS(.v15)],
    products: [
        .library(name: "Slider", targets: ["Slider"]),
    ],
    dependencies: [
        .package(name: "ReactNative", path: "../../../../xcframeworks"),
        .package(name: "React-GeneratedCode", path: "../../../ios"),
    ],
    targets: [
        .target(
            name: "Slider",
            dependencies: [.product(name: "ReactHeaders", package: "ReactNative"), .product(name: "ReactNativeHeaders", package: "ReactNative"), .product(name: "ReactNativeDependenciesHeaders", package: "ReactNative"), .product(name: "ReactAppHeaders", package: "React-GeneratedCode")],
            path: ".",
            sources: [
                "common/cpp/react/renderer/components/RNCSlider/RNCSliderComponentDescriptor.h",
                "common/cpp/react/renderer/components/RNCSlider/RNCSliderMeasurementsManager.cpp",
                "common/cpp/react/renderer/components/RNCSlider/RNCSliderMeasurementsManager.h",
                "common/cpp/react/renderer/components/RNCSlider/RNCSliderShadowNode.cpp",
                "common/cpp/react/renderer/components/RNCSlider/RNCSliderShadowNode.h",
                "common/cpp/react/renderer/components/RNCSlider/RNCSliderState.h",
                "ios/RNCSlider.h",
                "ios/RNCSlider.m",
                "ios/RNCSliderComponentView.h",
                "ios/RNCSliderComponentView.mm",
            ],
            publicHeadersPath: "ios",
            cSettings: [.headerSearchPath("common/cpp"), .headerSearchPath("common/cpp/react/renderer/components/RNCSlider"), .headerSearchPath("ios"), .headerSearchPath("."), .unsafeFlags(["-include", "react-native-spm-prefix.h"])],
            cxxSettings: [.headerSearchPath("common/cpp"), .headerSearchPath("common/cpp/react/renderer/components/RNCSlider"), .headerSearchPath("ios"), .headerSearchPath("."), .unsafeFlags(["-include", "react-native-spm-prefix.h"]), .unsafeFlags(["-DFOLLY_NO_CONFIG", "-DFOLLY_MOBILE=1", "-DFOLLY_USE_LIBCPP=1", "-Wno-comma", "-Wno-shorten-64-to-32", "-DRCT_NEW_ARCH_ENABLED=1"]), .define("DEBUG", .when(configuration: .debug)), .define("NDEBUG", .when(configuration: .release))],
            linkerSettings: [.linkedFramework("UIKit"), .linkedFramework("Foundation"), .linkedFramework("CoreGraphics")]
        ),
    ],
    cxxLanguageStandard: .cxx20
)

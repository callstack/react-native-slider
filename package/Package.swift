// swift-tools-version: 6.0
import PackageDescription

// Swift Package Manager support for React Native's SwiftPM autolinking
// (react-native >= 0.87, `npx react-native spm`). CocoaPods users are unaffected:
// react-native-slider.podspec stays the source of truth there.
//
// The two React Native packages are resolved by the autolinker relative to
// build/generated/autolinking/libs/react-native-slider in the app, as in
// react-native-safe-area-context. They do not resolve in a bare clone.
let package = Package(
    name: "react-native-slider",
    platforms: [.iOS("15.1")],
    products: [
        .library(name: "react-native-slider", targets: ["react-native-slider"]),
    ],
    dependencies: [
        .package(name: "ReactNative", path: "../../../../xcframeworks"),
        .package(name: "React-GeneratedCode", path: "../../../ios"),
    ],
    targets: [
        .target(
            name: "react-native-slider",
            dependencies: [
                .product(name: "ReactHeaders", package: "ReactNative"),
                .product(name: "ReactNativeHeaders", package: "ReactNative"),
                .product(name: "ReactNativeDependenciesHeaders", package: "ReactNative"),
                .product(name: "ReactAppHeaders", package: "React-GeneratedCode"),
            ],
            path: ".",
            exclude: [
                "ios/RNCSlider.xcodeproj",
            ],
            sources: [
                "ios",
                "common/cpp",
            ],
            publicHeadersPath: "ios",
            cSettings: [
                .headerSearchPath("ios"),
                .headerSearchPath("common/cpp"),
                .headerSearchPath("common/cpp/react/renderer/components/RNCSlider"),
            ],
            cxxSettings: [
                .headerSearchPath("ios"),
                .headerSearchPath("common/cpp"),
                .headerSearchPath("common/cpp/react/renderer/components/RNCSlider"),
                // Same flags the podspec build gets from React Native's CocoaPods setup.
                .unsafeFlags([
                    "-DFOLLY_NO_CONFIG",
                    "-DFOLLY_CFG_NO_COROUTINES=1",
                    "-DFOLLY_MOBILE=1",
                    "-DFOLLY_USE_LIBCPP=1",
                    "-DRCT_NEW_ARCH_ENABLED=1",
                    "-Wno-comma",
                    "-Wno-shorten-64-to-32",
                ]),
                .define("DEBUG", .when(configuration: .debug)),
                .define("NDEBUG", .when(configuration: .release)),
            ],
            linkerSettings: [
                .linkedFramework("UIKit"),
                .linkedFramework("Foundation"),
            ]
        ),
    ],
    cxxLanguageStandard: .cxx20
)

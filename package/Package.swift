// swift-tools-version: 6.0

import Foundation
import PackageDescription

// React Native autolinks this package under
// <app>/ios/build/generated/autolinking/libs/ReactNativeSlider.
// Exclude unused root entries in both checkouts and npm installations so
// SwiftPM does not scan examples, dependencies, or metadata for resources.
let usedRootEntries: Set<String> = ["ios", "common", "include", "spm-headers", "Package.swift"]
let unusedRootEntries = try! FileManager.default.contentsOfDirectory(atPath: Context.packageDirectory)
    .filter { !usedRootEntries.contains($0) }
    .sorted()

let package = Package(
    name: "ReactNativeSlider",
    platforms: [.iOS("15.1")],
    products: [
        .library(name: "ReactNativeSlider", targets: ["ReactNativeSlider"]),
    ],
    dependencies: [
        .package(name: "ReactNative", path: "../../../../xcframeworks"),
        .package(name: "React-GeneratedCode", path: "../../../ios"),
    ],
    targets: [
        .target(
            name: "ReactNativeSlider",
            dependencies: [
                .product(name: "ReactHeaders", package: "ReactNative"),
                .product(name: "ReactNativeHeaders", package: "ReactNative"),
                .product(name: "ReactNativeDependenciesHeaders", package: "ReactNative"),
                .product(name: "ReactAppHeaders", package: "React-GeneratedCode"),
            ],
            path: ".",
            exclude: ["ios/RNCSlider.xcodeproj"] + unusedRootEntries,
            sources: ["ios", "common/cpp"],
            // Keep the public header tree separate from the legacy Xcode project.
            publicHeadersPath: "include",
            cSettings: [
                .define("RCT_NEW_ARCH_ENABLED", to: "1"),
                .headerSearchPath("ios"),
                .headerSearchPath("common/cpp"),
                .headerSearchPath("spm-headers"),
            ],
            cxxSettings: [
                .define("RCT_NEW_ARCH_ENABLED", to: "1"),
                .headerSearchPath("ios"),
                .headerSearchPath("common/cpp"),
                .headerSearchPath("spm-headers"),
                .define("DEBUG", .when(configuration: .debug)),
                .define("NDEBUG", .when(configuration: .release)),
            ],
            linkerSettings: [
                .linkedFramework("UIKit"),
                .linkedFramework("Foundation"),
                .linkedFramework("CoreGraphics"),
            ]
        ),
    ],
    cxxLanguageStandard: .cxx20
)

require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name         = "react-native-slider"
  s.version      = package['version']
  s.summary      = package['description']
  s.license      = package['license']

  s.authors      = package['author']
  s.homepage     = package['homepage']
  s.platforms    = { :ios => "9.0", :visionos => "1.0" }

  s.source       = { :git => "https://github.com/callstack/react-native-slider.git", :tag => "v#{s.version}" }
  s.source_files = "ios/**/*.{h,m,mm}"

  s.subspec "common" do |ss|
    ss.source_files         = "common/cpp/**/*.{cpp,h}"
    ss.pod_target_xcconfig  = { "HEADER_SEARCH_PATHS" => "\"$(PODS_TARGET_SRCROOT)/common/cpp\"" }
  end

  if defined?(install_modules_dependencies)
    install_modules_dependencies(s)
  else
    s.dependency 'React-Core'
    s.compiler_flags = "-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1 -Wno-comma -Wno-shorten-64-to-32 -DRCT_NEW_ARCH_ENABLED=1"
    s.pod_target_xcconfig = {
      "HEADER_SEARCH_PATHS" => "\"$(PODS_ROOT)/boost\"",
      "OTHER_CPLUSPLUSFLAGS" => "-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1",
      "CLANG_CXX_LANGUAGE_STANDARD" => "c++17"
    }
    s.dependency "React-RCTFabric"
    s.dependency "React-Codegen"
    s.dependency "RCT-Folly"
    s.dependency "RCTRequired"
    s.dependency "RCTTypeSafety"
    s.dependency "ReactCommon/turbomodule/core"
  end
end

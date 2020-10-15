'use strict';

const windowsSwitch = '--use-react-native-windows';

if (process.argv.includes(windowsSwitch)) {
  process.argv = process.argv.filter(arg => arg !== windowsSwitch);
  process.argv.push('--config=metro.config.windows.js');
  module.exports = {
    reactNativePath: '../node_modules/react-native-windows',
  };
} else {
  module.exports = {
    project: {
      android: {sourceDir: './android'},
      ios: {project: './ios/example.xcodeproj'},
    },
  };
}

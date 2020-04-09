const root = process.cwd();
const path = require('path');

module.exports = {
    dependencies: {
        '@react-native-community/slider': {
            root: path.resolve(__dirname, '..', 'src'),
        },
    },
};
const path = require('path');

module.exports = {
    entry: path.join(__dirname, 'pilApp.js'),
    output: {
        filename: 'bundle.js',
        path: path.join(__dirname, 'dist'),
        library: {
          name: "pilcrow",
          type: "umd"
        }
    },
    resolve: {
        extensions: [ '.js' ]
    },
    module: {
        rules: []
    }
};

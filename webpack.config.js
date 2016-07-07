var webpack = require('webpack');

module.exports = {
    entry: "./src/index.js",
    output: {
        path: './public',
        filename: "bundle.js",
        publicPath: 'http://localhost:8080/built/'
    },
    devServer: {
      contentBase: './public',
      publicPath: 'http://localhost:8080/built/'
    },
    module: {
      loaders: [
        { test: /\.scss$/, loaders: ["style", "css", "sass"] },
        { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ },
        { test: /\.css$/, loader: 'style-loader!css-loader' },
        { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "url-loader?limit=10000&minetype=application/font-woff" },
        { test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "file-loader" },
        { test: /\.(jpe?g|png|gif|svg)$/i,
          loaders: [
            'file?hash=sha512&digest=hex&name=[hash].[ext]',
            'image-webpack?bypassOnDebug&optimizationLevel=7&interlaced=false'
          ]
        }
      ]
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new webpack.IgnorePlugin(new RegExp("^(fs|ipc)$"))
    ],
    target: 'web'
};

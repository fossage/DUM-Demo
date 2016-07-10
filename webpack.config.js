var webpack      = require('webpack');
var precss       = require('precss');
var autoprefixer = require('autoprefixer');
var postCssSort  = require('postcss-sorting');
var svgo         = require('postcss-svgo');
var inlineSvg    = require('postcss-inline-svg')({});
var fontMagician = require('postcss-font-magician')();

module.exports = {
    entry: "./client/index.js",
    output: {
        path: './public',
        filename: "bundle.js",
        publicPath: 'http://localhost:8080/public/'
    },
    devServer: {
      contentBase: './public',
      publicPath: 'http://localhost:8080/public/'
    },
    module: {
      loaders: [
        { test: /\.scss$/, loaders: ["style", "css", "sass"] },
        { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ },
        { test: /\.css$/, loader: 'style-loader!css-loader!postcss-loader' },
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
    postcss: function () {
        return [require('postcss-inline-svg'), precss, autoprefixer, postCssSort, fontMagician, svgo];
    },
    target: 'web'
};

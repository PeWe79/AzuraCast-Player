/**
 * Webpack client-side config file
 */
const path = require('path');
const webpack = require('webpack');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require("terser-webpack-plugin");
const isProd = (process.env.NODE_ENV === 'production');

// dev server and globals styles
const serverHost = '0.0.0.0';
const serverPort = 8080;
const basePath = path.join(__dirname, '/');
const appEntry   = './src/app.js';
const bundleDir  = './public/bundles/';

// webpack config
module.exports = {

  entry: {
    app: appEntry,
  },

  output: {
    path: basePath,
    filename: path.join(bundleDir, '[name].min.js'),
  },

  module: {
    rules: [
      {
        test: /\.(jpe?g|png|gif|svg|map|css|eot|woff|woff2|ttf)$/,
        loader: 'ignore-loader',
      },
      {
        test: /\.scss$/i,
        exclude: /node_modules/,
        use: [MiniCssExtractPlugin.loader, 
          // Translates CSS into CommonJS
          { loader: 'css-loader', options: { url: false, sourceMap: true } },
          // Compiles Sass to CSS
          { 
            loader: 'sass-loader', 
            options: { 
              implementation: require('sass'),
              sourceMap: true 
            } 
          }
        ],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      }
    ]
  },

  plugins: [
    new MiniCssExtractPlugin({
      // path: basePath,
      filename: path.join(bundleDir, '[name].min.css')
    }),
  ],
  optimization: {
    minimize: true,
    minimizer: [
      // CSS minimizer
      new CssMinimizerPlugin({
        minimizerOptions: {
          preset: [
            "default",
            {
              discardComments: { removeAll: true },
            },
          ],
        },
        minify: CssMinimizerPlugin.cleanCssMinify,
      }),
      // Javascript minimizer
      new TerserPlugin({
        terserOptions: {
          ecma: undefined,
          warnings: false,
          parse: {},
          compress: {},
          mangle: true, // Note `mangle.properties` is `false` by default.
          module: false,
          output: null,
          toplevel: false,
          nameCache: null,
          ie8: false,
          keep_classnames: undefined,
          keep_fnames: false,
          safari10: false,
          format: {
            comments: false,
          },
        },
        extractComments: false,
      })
    ],
  },

  devServer: {
    host: serverHost,
    port: serverPort,
    contentBase: basePath,
    clientLogLevel: 'info',
    hot: false,
    liveReload: true,
    inline: true,
    quiet: false,
    noInfo: false,
    compress: false,
  },

  performance: {
    hints: 'error',
    maxEntrypointSize: 614400,
    maxAssetSize: 614400
  },
  mode: 'development',
}

if (isProd) {
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.optimize.TerserPlugin({
      compress: {
        warnings: false
      }
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    })
  ])
}
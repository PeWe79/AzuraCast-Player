/**
 * Webpack client-side config file
 */
const path = require( 'path' );
const webpack = require( 'webpack' );
const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' );
const isProd = ( process.env.NODE_ENV === 'production' );

// dev server and globals styles
const serverHost = '0.0.0.0';
const serverPort = 8080;
const basePath = path.join( __dirname, '/' );
const appEntry   = './src/app.js';
const bundleDir  = './public/bundles/';

// webpack config
module.exports = {

  entry: {
    app: appEntry,
  },

  output: {
    path: basePath,
    filename: path.join( bundleDir, '[name].min.js' ),
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
          // Creates `style` nodes from JS strings
          "style-loader", 
          // Translates CSS into CommonJS
          "css-loader", 
          "postcss-loader", 
          // Compiles Sass to CSS
          "sass-loader"
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
      filename: path.join( bundleDir, '[name].min.css' )
    }),
  ],

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

if ( isProd ) {
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    })
  ])
}

/**
 * Webpack client-side config file
 */
const path = require( 'path' );
const webpack = require( 'webpack' );
const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' );
const isProd = ( process.env.NODE_ENV === 'production' );

// dev server and globals styles
// const serverHost = '192.168.1.152';
const serverHost = 'localhost';
const serverPort = 8080;
const serverRoot = path.join( __dirname, '/' );
const appEntry   = './src/app.js';
const bundleDir  = './public/bundles/';

// get loader config based on env
// const cssLoaders = () => {
//   let use = [ 'style-loader', 'css-loader', 'postcss-loader', 'sass-loader' ];
//   let fallback = isProd ? use.shift() : '';
//   return isProd ? MiniCssExtractPlugin.extract( { use, fallback } ) : use;
// }

// webpack config
module.exports = {

  entry: {
    app: appEntry,
  },

  output: {
    path: serverRoot,
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
        // use: cssLoaders(),
        use: [MiniCssExtractPlugin.loader, 
          "style-loader", 
          "css-loader", 
          "postcss-loader", 
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
    new MiniCssExtractPlugin()
  ],

  devServer: {
    host: serverHost,
    port: serverPort,
    contentBase: serverRoot,
    clientLogLevel: 'info',
    hot: true,
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

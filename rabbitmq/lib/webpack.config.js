var path = require( 'path' );
var webpack = require( 'webpack' );
var config = require( './config/config' );

module.exports = {
  devtool: 'eval',
  entry: [
    'webpack-dev-server/client?http://' + config.host + ':' + config.port,
    'webpack/hot/only-dev-server',
    './src/index'
  ],
  output: {
    path: path.join( __dirname, 'dist' ),
    filename: 'bundle.js',
    publicPath: '/dist/'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ],
  module: {
    loaders: [
      { test: /\.json$/, loader: 'json-loader' },
      { test: /\.js$/, loader: 'react-hot', include: path.join( __dirname, 'src' ) },
      { test: /\.js$/, loader: 'babel', query: { presets: [ 'es2015', 'react', 'stage-0' ] }, include: path.join( __dirname, 'src' ) },
      { test: /\.less$/, loader: 'style!css!less' },
      { test: /\.css$/, loader: 'style-loader!css-loader' },
      //deal with fonts
      { test: /\.woff(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&mimetype=application/font-woff" },
      { test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&mimetype=application/font-woff2" },
      { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&mimetype=application/octet-stream" },
      { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: "file" },
      { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&mimetype=image/svg+xml" },
      { test: /\.(png|jpg|gif)$/, loader: 'url?limit=65000' }
    ]
  },
  node: {
    console: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    console: true
  }
};

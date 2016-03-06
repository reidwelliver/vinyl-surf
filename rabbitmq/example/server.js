var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var serverConfig = require( './config/config' );
var config = require('./webpack.config');
var stomp = require('./src/stomp-client.min.js');


new WebpackDevServer(webpack(config), {
  publicPath: config.output.publicPath,
  hot: true,
  historyApiFallback: true
}).listen( serverConfig.port, serverConfig.host, function (err, result) {
  if (err) {
    console.log(err);
  }

  console.log('Listening at ' + serverConfig.host + ':' + serverConfig.port);
});

mq = new stomp.default({
			endpoint: 'ws://vinyl.surf:15674/stomp/websocket',
			user: 'vinyl-surf',
			pass: 'vinyl-surf'
});
console.log(mq);
mq.connect({},function(){
  console.log("connected!");
  mq.subscribe('Room-1234',function(message){
    console.log(message);
  },{});

  mq.publish('Room-1234',{"data":"hi guys!"},{});
});

import stomp from './stomp-client.js';

window.


window.mq = new stomp({
			endpoint: 'ws://vinyl.surf:15674/stomp/websocket',
			user: 'vinyl-surf',
			pass: 'vinyl-surf'
});

mq.connect({},function(){
  console.log("connected!");
  mq.subscribe('Room-1234',function(message){
    console.log(message);
  },{});

  mq.publish('Room-1234',{"data":"hi everybody!"},{});
});

window.lols = function(){
  mq.publish('Room-1234',{"data":"hi everybody!"},{});
}

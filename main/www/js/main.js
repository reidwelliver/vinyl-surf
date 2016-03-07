/*
if(!window.messages){
	window.messages = new stomp({
		endpoint: 'ws://vinyl.surf:15674/stomp/websocket',
		user: 'vinyl-surf',
		pass: 'vinyl-surf'
	});
}

if(!window.messages.state.connected){
	window.messages.connect(function(){
		console.log("connected!");
	});
}
*/

function loadRoom(){
	$.ajax("http://localhost:12380/index.html",{
		type:"GET",
		dataFilter: null,
		dataType: "html",
		converters: {},
		success:function(data, textStatus, jqXHR) {$("#room").html(data); console.log('success');},
		error: function(jqXHR, textStatus, errorThrown) {console.log("failure",errorThrown);}
	});
}

function loadAuth(){
	$.ajax("http://localhost:49080/atest/index.html",{
		type:"GET",
		dataFilter: null,
		dataType: "html",
		converters: {},
		success:function(data, textStatus, jqXHR) {$("#auth").html(data); console.log('success');},
		error: function(jqXHR, textStatus, errorThrown) {console.log("failure",errorThrown);}
	});
}

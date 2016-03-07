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

window.popup = function (string) {
    var snackbarContainer = $('#toast');
    console.log(snackbarContainer.MaterialSnackbar);
    snackbarContainer.MaterialSnackbar.showSnackbar({message: string});
}

function loadRoom(){
	$.ajax("room/index.html",{
		type:"GET",
		dataFilter: null,
		dataType: "html",
		converters: {},
		success:function(data, textStatus, jqXHR) {
            $("#page-content").html(data); 
            console.log('success');
            componentHandler.upgradeAllRegistered();
        
        },
		error: function(jqXHR, textStatus, errorThrown) {console.log("failure",errorThrown);}
	});
}

function loadAuth(){
	$.ajax("auth/index.html",{
		type:"GET",
		dataFilter: null,
		dataType: "html",
		converters: {},
		success:function(data, textStatus, jqXHR) {
            $("#page-content").html(data); 
            componentHandler.upgradeAllRegistered();
            console.log('success');
        
        },
		error: function(jqXHR, textStatus, errorThrown) {console.log("failure",errorThrown);}
	});
}

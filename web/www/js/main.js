
if(!window.messages){
	window.messages = new stomp({
		endpoint: 'ws://vinyl.surf:15674/stomp/websocket',
		user: 'vinyl-surf',
		pass: 'vinyl-surf'
	});
}


window.popup = function (string) {
    var container = $("#popup");
    if (string == "hide") {
        container.hide();
    }
    else {
        if (!container.is(":visible")) {
            container.show();
        }
        container.text(string);
    }
}

function loadRoom(){
    window.popup("hide");
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

function loadAdmin(){
    window.popup("hide");
	$.ajax("admin/index.html",{
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
    window.popup("hide");
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

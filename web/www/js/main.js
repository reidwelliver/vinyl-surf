
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

function hideOtherContainers() {
		$("#page-content-room").hide();
		$("#page-content-auth").hide();
		$("#page-content-admin").hide();
}

function checkAndHideRoom() {
	var tubular = $("#tubular-container");
	var tubularshield = $("#tubular-shield");

	if (tubular != null) {
		tubular.hide();
	}
	if (tubularshield != null) {
		tubular.hide();
	}

}

function loadRoom(){
    window.popup("hide");
		hideOtherContainers();
		$("#page-content-room").show();

	$.ajax("room/index.html",{
		type:"GET",
		dataFilter: null,
		dataType: "html",
		converters: {},
		success:function(data, textStatus, jqXHR) {
            $("#page-content-room").html(data);
            console.log('success');
            componentHandler.upgradeAllRegistered();

        },
		error: function(jqXHR, textStatus, errorThrown) {console.log("failure",errorThrown);}
	});
}

function loadAdmin(){
    window.popup("hide");
		checkAndHideRoom();
		hideOtherContainers();
		$("#page-content-admin").show();

	$.ajax("admin/index.html",{
		type:"GET",
		dataFilter: null,
		dataType: "html",
		converters: {},
		success:function(data, textStatus, jqXHR) {
            $("#page-content-admin").html(data);
            console.log('success');
            componentHandler.upgradeAllRegistered();

        },
		error: function(jqXHR, textStatus, errorThrown) {console.log("failure",errorThrown);}
	});
}


function loadAuth(){
    window.popup("hide");
		checkAndHideRoom();
		hideOtherContainers();
		$("#page-content-auth").show();

	$.ajax("auth/index.html",{
		type:"GET",
		dataFilter: null,
		dataType: "html",
		converters: {},
		success:function(data, textStatus, jqXHR) {
            $("#page-content-auth").html(data);
            componentHandler.upgradeAllRegistered();
            console.log('success');

        },
		error: function(jqXHR, textStatus, errorThrown) {console.log("failure",errorThrown);}
	});
}

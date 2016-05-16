
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

function logout() {
    console.log("logout");
    changeTabsLogout();
    window.vinyl = undefined;
    loadAuth();
    window.popup("Logged out");
}

function changeTabsLogout() {

  $('.auth-link').each(function(i, obj) {
    $(obj).text("Login/Register");
    $(obj).attr("href", "javascript:loadAuth()");
  });

  $('.profile-link').each(function(i, obj) {
    $(obj).hide();
  });
  if (window.vinyl.user.administrator != null) {
    $('.admin-link').each(function(i, obj) {
      $(obj).hide();
    });
  }
  $("#auth-grid").show();
}

function showTabsLogin() {
  $("#auth-grid").hide();

  $('.auth-link').each(function(i, obj) {
    $(obj).text("Logout " + window.vinyl.user.username);
    $(obj).attr("href", "javascript:logout()")
  });

  $('.profile-link').each(function(i, obj) {
    $(obj).show();
  });
  if (window.vinyl.user.administrator != null) {
    $('.admin-link').each(function(i, obj) {
      $(obj).show();
    });
  }
}

function checkLogin(callback) {
  if (window.vinyl !== undefined) {
    console.log(window.vinyl);
    window.messages.invoke('isAuthenticated',{xtoken: window.vinyl.xtoken}, function(data){
        callback(null, data);
    });
  } else {
    loadAuth();
  }
}

function hideOtherContainers() {
		$("#page-content-room").hide();
		$("#page-content-auth").hide();
		$("#page-content-admin").hide();
    $("#page-content-profile").hide();
}

function checkAndShowRoom() {
  var tubular = $("#tubular-container");
	var tubularshield = $("#tubular-shield");
  var tubularPlayer = $('#tubular-player');

	if (tubular != undefined) {
		tubular.show();
	}
	if (tubularshield != undefined) {
		tubularshield.show();
	}
  if (tubularPlayer != undefined) {
    tubularPlayer.show();
  }
}


function checkAndHideRoom() {
	var tubular = $("#tubular-container");
	var tubularShield = $("#tubular-shield");
  var tubularPlayer = $('#tubular-player');

	if (tubular != undefined) {
    console.log("hide tubular");
		tubular.hide();
	}
	if (tubularShield != undefined) {
    console.log("hide shield");
		tubularShield.hide();
	}
  if (tubularPlayer != undefined) {
    console.log("hide player");
    tubularPlayer.hide();
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
            checkAndShowRoom();
            $("#page-content-room").html(data);
            componentHandler.upgradeAllRegistered();

        },
		error: function(jqXHR, textStatus, errorThrown) {console.log("failure",errorThrown);}
	});
}

function loadProfile() {
  if (window.vinyl === undefined) {
    window.popup("You must login first!");
    return;
  }

  window.popup("hide");
  checkAndHideRoom();
  hideOtherContainers();
  $("#page-content-profile").show();

  $.ajax("profile/index.html",{
		type:"GET",
		dataFilter: null,
		dataType: "html",
		converters: {},
		success:function(data, textStatus, jqXHR) {
          $("#page-content-profile").html(data);
          componentHandler.upgradeAllRegistered();

      },
		error: function(jqXHR, textStatus, errorThrown) {console.log("failure",errorThrown);}
	});

}

function loadAdmin(){
    window.popup("hide");

    if (window.vinyl.user.administrator == null) {
      window.popup("You must login first!");
      return;
    }

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

        },
		error: function(jqXHR, textStatus, errorThrown) {console.log("failure",errorThrown);}
	});
}


function checkConnection(callback){
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
			if(callback && typeof callback === 'function'){
				callback();
			}
		});
	} else if(callback && typeof callback === 'function'){
			callback();
	}
}


$(document).ready(function(){
  checkConnection(loadRoom);
});

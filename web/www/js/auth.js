
function Authentication(readyCallback) {
    var thisAuth = this;
    var connected = false;

    this.Register = function() {
         window.popup("hide");
         window.messages.invoke('Register',{username: $("#reg-username").val(), password: $("#reg-password").val(), email: $("#reg-email").val()}, function(data){
            console.log(data);
            if (data.error) {
                window.popup(data.error);
                console.log(data.error);

            }
            else {
                token = data.xtoken;
            }
        });
    }

    this.CheckToken = function(token, callback) {
      window.messages.invoke('isAuthenticated',{xtoken: token}, function(data){
          thisAuth.connected = true;
          callback(null, data);
      });
    }

    this.init = function() {
        if (window.vinyl === undefined) {
          thisAuth.CheckToken("", function(err, data) {
            thisAuth.connected = true;
            console.log(data);
          });
        }
        else {
          thisAuth.CheckToken(window.vinyl.token, function(err, data) {
            thisAuth.connected = true;
            console.log(data);
          });
        }
    }

    this.Login = function() {
        window.popup("hide");
        console.log("Trying to login");
				var username = $("#login-username").val();
        window.messages.invoke('Login',{username: username, password: $("#login-password").val()}, function(data){
            console.log(data);
            if (data.error) {
                window.popup(data.error);
                console.log(data.error);
            }
            else {
                token = data.xtoken;
                window.popup("Logged in");
								window.vinyl = data;
                showTabsLogin();
            }
        });
    }

    if (window.vinyl === undefined) {
        if(!window.messages.state.connected){
    			window.messages.connect(function(){
    				console.log("connected!");
    				thisAuth.init();
    			});
    		} else {
    			thisAuth.init();
    		}
    }
    else {
      $("#auth-grid").hide();
      console.log(window.vinyl);
    }
}

if (auth === undefined)
  var auth = new Authentication();

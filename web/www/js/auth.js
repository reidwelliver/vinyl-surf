
function Authentication(readyCallback) {
    var thisAuth = this;
    var connected = false;

    this.Register = function() {
         window.popup("hide");
         var username = $("#reg-username").val();
         var password = $("#reg-password").val();
         if (username.length < 4 || password.length < 4) {
            window.popup("Username and Password must be more than 4 characters!");
            return;
         }

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
          thisAuth.CheckToken(window.vinyl.xtoken, function(err, data) {
            thisAuth.connected = true;
            console.log(data);
          });
        }
    }

    this.Login = function() {
        window.popup("hide");
        console.log("Trying to login");
        window.messages.invoke('Login',{username: $("#login-username").val(), password: $("#login-password").val()}, function(data){
            console.log(data);
            if (data.error) {
                window.popup(data.error);
                console.log(data.error);
            }
            else {

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

//if (auth === undefined)
  var auth = new Authentication();

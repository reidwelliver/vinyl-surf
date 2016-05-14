
function Authentication(readyCallback) {
    var thisAuth = this;
    var token = "";
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
     /*           messages.invoke('isAuthenticated',{xtoken: token}, function(data){
                    thisAuth.connected = true;
                    console.log(data);
                });       */
            }
        });
    }

    this.init = function() {
        window.messages.connect(function(){
            console.log("connected!");
            window.messages.invoke('isAuthenticated',{xtoken: token}, function(data){
                thisAuth.connected = true;
                console.log(data);
            });
        });
    }

		this.GetSessionData = function () {
				return localStorage.getItem("auth");
		}

    this.Login = function() {
        window.popup("hide");
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
                localStorage.setItem("auth", data.user);
            }
        });
    }

		if(!window.messages.state.connected){
			window.messages.connect(function(){
				console.log("connected!");
				thisAuth.init();
			});
		} else {
			thisAuth.init();
		}
}

var auth = new Authentication();

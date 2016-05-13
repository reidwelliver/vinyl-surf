messages = new stomp({
	endpoint: 'ws://vinyl.surf:15674/stomp/websocket',
	user: 'vinyl-surf',
    pass: 'vinyl-surf'
});

function Authentication(readyCallback) {
    var thisAuth = this;
    var token = "";
    var connected = false;

    this.Register = function() {
         window.popup("hide");
         messages.invoke('Register',{username: $("#reg-username").val(), password: $("#reg-password").val(), email: $("#reg-email").val()}, function(data){
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
        messages.connect(function(){
            console.log("connected!");
            messages.invoke('isAuthenticated',{xtoken: token}, function(data){
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
        messages.invoke('Login',{username: username, password: $("#login-password").val()}, function(data){
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

    thisAuth.init();
}

var auth = new Authentication();

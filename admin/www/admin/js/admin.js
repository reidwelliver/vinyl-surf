function Authentication(readyCallback) {
    var thisAuth = this;
    var token = "";
    
    
    this.init = function() {
        thisAuth.socket = io.connect("192.168.99.100:11337/auth");
        thisAuth.socket.on('connect', function(socket) {
            console.log('Connected!');
        });
        
        thisAuth.socket.on('Token', function(data) {
            if (data.token == undefined) {
                console.log("Login failed!");
                return;
            }
            console.log('Received token', data.token);
            thisAuth.token = data.token;
        });
        
    }
    this.login = function() {
        thisAuth.socket.emit('Login', {
			username: $("#login-username").val(), password: $("#login-password").val()
		});   
    }
    thisAuth.init();
}

var auth = new Authentication({});
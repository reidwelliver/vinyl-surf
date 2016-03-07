messages = new stomp({
	endpoint: 'ws://vinyl.surf:15674/stomp/websocket',
	user: 'vinyl-surf',
    pass: 'vinyl-surf'
});

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
    thisAuth.newinit = function() {
        messages.connect(function(){
            console.log("connected!");
            messages.invoke('isAuthenticated',{xtoken: token}, function(data){
                console.log('success!');
            }); 
        });
    }
    
    this.login = function() {
        thisAuth.socket.emit('Login', {
			username: $("#login-username").val(), password: $("#login-password").val()
		});   
    }
    thisAuth.newinit();
}

var auth = new Authentication();
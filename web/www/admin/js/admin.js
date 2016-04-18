messages = new stomp({
	endpoint: 'ws://vinyl.surf:15674/stomp/websocket',
	user: 'vinyl-surf',
    pass: 'vinyl-surf'
});


function Admin(readyCallback) {
    var thisAdmin = this;
    var token = localStorage.getItem("token");
    console.log(token);
    
    this.StompEvents = function () {
        messages.connect( function() {
            console.log("connected!");

            messages.invoke('GetAllUsers',{xtoken: token}, function(data){   
                console.log("Admin data:", data);
            });
        });
    }
    this.init = function () {
        thisAdmin.StompEvents();
    }
    thisAdmin.init();
}
                    

var admin = new Admin();
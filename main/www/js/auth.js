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
         messages.invoke('Register',{username: $("#reg-username").val(), password: $("#reg-password").val(), email: $("#reg-email").val()}, function(data){            
            console.log(data);
            if (data.err) {
                window.popup(data.err);
                console.log(data.err);
                
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
    
    
    this.Login = function() {        
        messages.invoke('Login',{username: $("#login-username").val(), password: $("#login-password").val()}, function(data){            
            console.log(data);
            if (data.err) {
                window.popup(data.err);
                console.log(data.err);
            }
            else {
                token = data.xtoken;
                localStorage.setItem("token", token);
           /*     messages.invoke('isAuthenticated',{xtoken: token}, function(data){
                    thisAuth.connected = true;
                    console.log(data);
                });      */              
            }
        });  
    }
    
    thisAuth.init();
}

var auth = new Authentication();
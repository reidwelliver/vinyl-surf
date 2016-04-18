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
                if (data.error) {
                    window.popup(data.error);
                }
                else {
                    console.log("Admin data:", data);  
                    var users = data.users;
                    for (var i = 0; i < users.length; i++) {

                        $("#user-table").find('tbody')
                            .append($('<tr>')
                                .append($('<td>')
                                )
                                .append($('<td>')
                                    .text(users[i].id)
                                )
                                 .append($('<td>')
                                    .text(users[i].username)
                                )
                                .append($('<td>')
                                    .text(function () { if (users[i].administrator) return "admin"; else { return "user"} ; })
                                )
                                 .append($('<td>')
                                    .text(users[i].create_date)
                                )                                    
                            );                       
                    }                       
                }
            });
            messages.invoke('GetAllReports',{xtoken: token}, function(data){   
                if (data.error) {
                    window.popup(data.error);
                }
                else {
                    console.log("reports data:", data);  
                    var reports = data.reports;
                    for (var i = 0; i < reports.length; i++) {

                        $("#reports-table").find('tbody')
                            .append($('<tr>')
                                .append($('<td>')
                                )
                                .append($('<td>')
                                    .text(reports[i].id)
                                )
                                 .append($('<td>')
                                    .text(reports[i].username)
                                )
                                .append($('<td>')
                                    .text(reports[i].room)
                                )
                                 .append($('<td>')
                                    .text(reports[i].reason)
                                )                                    
                            );                       
                    }                       
                }
            });
        });
    }
    this.init = function () {
        thisAdmin.StompEvents();
    }
    thisAdmin.init();
}
                    
var admin = new Admin();
function Admin(readyCallback) {
    var thisAdmin = this;
    var token = window.vinyl.xtoken;

    this.SearchUser = function () {
    //  console.log($("#user-search"));
      var user = $("#user-search").val();
      console.log("text:", user);
      window.messages.invoke('SearchUsers',{xtoken: token, user: user}, function(data){
        console.log(data);
        var users = data.users;
        $("#user-table tbody tr").remove();

        for (var i = 0; i < users.length; i++) {
          $("#user-table").find('tbody')
              .append($('<tr>')
                  .append($('<td>')
                    .append('<input class="user-box" id="' + users[i].id + '" type="checkbox" />')
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

      });
    }

    this.BanUsers = function () {
      var users = [];
      console.log("Ban Users");
      $('.user-box').each(function(i, obj) {
        if ($(obj).is(':checked'))
          users.push({id: obj.id});
      });
      window.messages.invoke('BanUsers',{xtoken: token, users: users}, function(data){
        window.popup("Users Banned");
      });
    }

    this.StompEvents = function () {
        window.messages.invoke('GetAllUsers',{xtoken: token}, function(data){
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
                              .append('<input class="user-box" id="' + users[i].id + '" type="checkbox" />')
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
        window.messages.invoke('GetAllReports',{xtoken: token}, function(data){
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
    }
    this.init = function () {
        thisAdmin.StompEvents();
    }

	if(!window.messages.state.connected){
		window.messages.connect(function(){
			console.log("connected!");
      thisAdmin.init();
		});
	} else {
    thisAdmin.init();
	}
}

var admin = new Admin();

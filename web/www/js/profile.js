
function Profile (readyCallback) {

  this.ChangePassword = function() {
      console.log("Change Password ", window.vinyl.xtoken);
      window.popup("hide");

      var password1 = $("#password-1").val();
      var password2 = $("#password-2").val();

      if (password1 != password2) {
        window.popup("Passwords don't match!");
        return;
      }
      console.log(password1);
      console.log(password2);
      window.messages.invoke('ChangePassword',{xtoken: window.vinyl.xtoken, password: password1}, function(data){
          console.log(data);
          if (data.error) {
              window.popup(data.error);
              console.log(data.error);
          }
          else {
              console.log(data);
              window.popup("Password Changed!");
          }
      });
  }

  this.ChangeEmail = function() {
      console.log("Change Email ", window.vinyl.xtoken);
      window.popup("hide");

      var email1 = $("#email-1").val();
      var password2 = $("#email-2").val();

      if (email1 != email2) {
        window.popup("Emails don't match!");
        return;
      }

      window.messages.invoke('ChangeEmail',{xtoken: window.vinyl.xtoken, email: email}, function(data){
          console.log(data);
          if (data.error) {
              window.popup(data.error);
              console.log(data.error);
          }
          else {
              console.log(data);
              window.popup("Email Changed!");
          }
      });
  }

  if (window.vinyl === undefined) {
      if(!window.messages.state.connected){
        window.messages.connect(function(){
          console.log("connected!");
        });
      } else {
      }
  }
  else {
    console.log(window.vinyl);
  }

}

if (profile === undefined) {
  var profile = new Profile(null);
}

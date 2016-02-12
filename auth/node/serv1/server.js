var app = require('express')();
var sql = require('sql');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mysql = require('mysql');
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

function Auth(callback) {
    var thisAuth = this;
    var socket = io.of('auth');
    var connect = mysql.createConnection({
      host     : 'localhost',
      user     : 'root',
      password : '',
      database : 'surf'
    });   
    
    this.User = function(username, password, email) {
        this.username = username;
        this.password = password;
        this.email = email;
    }
    
    this.Login = function(username, password) {
        var thisLogin = this;
        this.DoLogin(username, password, function(err, success) {
            if (err) {
                console.log(err);
                console.log(new Error().stack);
            }
            else if (success) {
                console.log("Logged in");
                socket.emit('user');
            }   
            else {
                console.log("Login failed");
            }
        });
    }
    this.DoLogin = function(username, password, callback) {
        connect.query("SELECT * FROM users WHERE username = ? and password = ?", [username, password],  function (err, rows, fields) {
            if (err) {
                callback(err, false);
            }
            else if (rows.length > 0) {
               callback(err, true);
            }        
            else {
                callback(err, false);
            }
        });         
    }
    this.checkUsername = function(username, callback) {
        connect.query("SELECT * FROM users WHERE username = ?", username, function (err, rows, fields) {
            if (err) {
                callback(err, false);
            }
            else if (rows.length > 0) {
               callback(err, false);
            }        
            else {
                callback(err, true);
            }
        });          
    }
    this.SQLRegister = function(user, callback) {
        var qUser = {username: user.username, password: user.password, email: user.email};
        connect.query("INSERT INTO users SET ?", qUser, function (err, results) {
            if (err) {
                callback(err, false);
            }
            callback(err, true);
        });         
    }
    this.Register = function(username, password, email) {
        var thisRegister = this;
        this.checkUsername(username, function(err, success) {
            if (err) {
                console.log(new Error().stack);
            }
            if (success) {
                thisRegister.SQLRegister(new thisRegister.User(username, password, email), function(err, success) {
                    if (err) {

                    }
                    else if (success) {
                        console.log("registered");
                    }
                });
            }
            else
                console.log("user already registered");
        });        
    }
}

var auth = new Auth(null);
auth.Login("test1", "test", "test@test.com");
var path = require('path');
var express = require('express');
var app2 = require('express')();
var http = require('http').Server(express);
var io = require('socket.io')(http);

app2.get('/', function(req, res){
res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log(('user disconnected'));
  });
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
    console.log('message: ' + msg);
  });
});

promise = require('bluebird');
mongoose = promise.promisifyAll(require('mongoose'));
fs = promise.promisifyAll(require('fs'));


var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

//config
app.use(express.static('app'));
mongoose.connect('mongodb://localhost/qwirk_db');

//import models
models = require('./app/src/models');

app.listen(3000, () => {
    console.log('http://localhost:3000');
});

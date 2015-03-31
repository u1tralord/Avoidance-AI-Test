var socketio = require('socket.io');
var http = require('http');
var express = require('express');
var fs = require('fs');
var path = require('path');

var router = express();
router.use(express.static(path.resolve(__dirname, 'client')));
var server = http.createServer(router);

var config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

var io = socketio.listen(server);


io.sockets.on('connection', function (socket) {
  console.log('Client Connected! ['+getNewID()+']');

  socket.on('disconnect', function() {
    console.log('Client Disconnected!');
  });
});

console.log("Server started");

setInterval(function() {
  mainThread();
}, 1000 / config.updateRate);

setInterval(function() {
  pingThread();
}, 1000 / config.pingRate);

function mainThread(){

}

function pingThread(){
    
}

function broadcast(eventName, eventData){

}

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});

function getNewID(){
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}
var http = require('http');
var path = require("path");
var express = require('express');
var app = express();
var httpServer = http.createServer(app);
var io = require("socket.io")(httpServer);
var port = process.env.PORT || 8080;
const listUser = [];
httpServer.listen(port);

io.on('connection', (socket) => {
    socket.on('new_user', (user) => {
    	var isExist = listUser.some(i => i.username === user.username);
    	if(isExist){
    		return socket.emit('register_fail');
    	}
    	socket.peerid = user.peerid;
    	listUser.push(user);
    	socket.emit("list_online", listUser);
        socket.broadcast.emit('new_user',user);
    });

    socket.on('disconnect', () => {
    	var index = listUser.findIndex(i => i.peerid === socket.peerid);
    	listUser.splice(index, 1);
    	socket.broadcast.emit('user_disconnect',socket.peerid);
    });
});

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname+'/index.html'));
});

app.use('/resources', express.static('./source'));

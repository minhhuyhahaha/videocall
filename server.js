/**
 * This script starts a https server accessible at https://localhost:8443
 * to test the chat
 *
 * @author Carlos Delgado
 */
var http   = require('http');
var path   = require("path");
var express = require('express');

var app = express();
var httpServer = http.createServer(app);
var io = require("socket.io")(httpServer);
var LANAccess = "0.0.0.0";

httpServer.listen(8080, LANAccess);

io.on('connection', function (user) {
    user.on('join', function (info) {
        user.broadcast.emit('join',info);
    })
});

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname+'/index.html'));
});

// Expose the css and js resources as "resources"
app.use('/resources', express.static('./source'));

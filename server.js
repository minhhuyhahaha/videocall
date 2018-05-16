/**
 * This script starts a https server accessible at https://localhost:8443
 * to test the chat
 *
 * @author Carlos Delgado
 */
var fs     = require('fs');
var http   = require('http');
var https  = require('https');
var path   = require("path");
var os     = require('os');
var ifaces = os.networkInterfaces();

// Public Self-Signed Certificates for HTTPS connection
var privateKey  = fs.readFileSync('./certificates/key.pem', 'utf8');
var certificate = fs.readFileSync('./certificates/cert.pem', 'utf8');

var credentials = {key: privateKey, cert: certificate};
var express = require('express');
var app = express();

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';


app.use('/peerjs', require('peer').ExpressPeerServer(app.listen(server_port)));
/**
 *  Show in the console the URL access for other devices in the network
 */

// Allow access from all the devices of the network (as long as connections are allowed by the firewall)\
// For http
httpServer.listen(server_port, server_ip_address);
// For https
//httpsServer.listen(server_port, LANAccess);

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname+'/index.html'));
});

// Expose the css and js resources as "resources"
app.use('/resources', express.static('./source'));

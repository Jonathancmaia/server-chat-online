var express = require('express');
var app = express();
var ExpressPeerServer = require('peer').ExpressPeerServer;
 
var server = app.listen(9000);
 
var options = {
    debug: true
}
 
app.use('/', ExpressPeerServer(server, options));
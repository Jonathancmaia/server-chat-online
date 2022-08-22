var express = require('express');
var app = express();
var ExpressPeerServer = require('peer').ExpressPeerServer;
const https = require('https');
const fs = require('fs');

const httpsServer = https.createServer({
    cert: fs.readFileSync('free-chat-online.cf/fullchain.pem'),
    key: fs.readFileSync('free-chat-online.cf/privkey.pem')
  }, app).listen(9000);
 
var options = {
    debug: true
}
 
app.use('/', ExpressPeerServer(httpsServer, options));
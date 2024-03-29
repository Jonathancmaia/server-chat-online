var express = require('express');
var app = express();
var ExpressPeerServer = require('peer').ExpressPeerServer;
const https = require('https');
const fs = require('fs');

const httpsServer = https
  .createServer(
    {
      cert: fs.readFileSync(
        '/etc/letsencrypt/live/vps49384.publiccloud.com.br/fullchain.pem',
      ),
      key: fs.readFileSync(
        '/etc/letsencrypt/live/vps49384.publiccloud.com.br/privkey.pem',
      ),
    },
    app,
  )
  .listen(9000);

var options = {
  debug: true,
};

app.use('/', ExpressPeerServer(httpsServer, options));

var app = require('express')();
var http = require('http').Server(app);
GLOBAL.io = require('socket.io')(http);

GLOBAL.Server = require('./server/server.js');
GLOBAL.World = require('./server/world.js');
GLOBAL.Serializer = require('./server/serializer.js');
GLOBAL.Messages = require('./server/messages.js');
GLOBAL.Events = require('./server/events.js');
GLOBAL.Util = require('./server/util.js');
GLOBAL.moment = require('moment');

World.Init();

app.get('/', function(req, res) {
    res.sendfile(__dirname + '/index.html');
});

app.get(/^(.*)$/, function(req, res, next) {
    var file = req.params[0];
    if (file == '/favicon.ico')
        return;
    else
        res.sendfile(__dirname + file);
});

io.on('connection', function(socket) {
    Server.Connect(socket);
    socket.emit('Response', {
        type: 'Game',
        method: 'SendInfo'
    });

    socket.on('disconnect', function() {
        Server.Disconnect(socket);
    });

    socket.on('Request', function(msg) {
        if (Server._players[socket.id] == null) {
            Server.Connect(socket);
            socket.emit('RequestInfo');
        }

        msg.id = socket.id;
        msg.data || (msg.data = {});

        GLOBAL[msg.type][msg.method](socket, msg);
    });
});

var port = process.env.PORT || 5000;
http.listen(port, function() {
    console.log('listening on *:' + port);
});
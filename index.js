var app = require('express')();
var http = require('http').Server(app);
GLOBAL.io = require('socket.io')(http);

GLOBAL.Server = require('./server/server.js');
GLOBAL.World = require('./server/world.js');
GLOBAL.Serializer = require('./server/serializer.js');
GLOBAL.Messages = require('./server/messages.js');
GLOBAL.Events = require('./server/events.js');
GLOBAL.Util = require('./server/util.js');
GLOBAL.Items = require('./server/item.js');

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

        if (msg.type == 'Player')
            Server.GetPlayer(socket.id)[msg.method](msg.data);
        else if (msg.type == 'Room') {
            var player = Server.GetPlayer(socket.id);
            player.room.GetItem(player, msg.data);
        }
        else
            GLOBAL[msg.type][msg.method](socket, msg);
    });
});

var port = process.env.PORT || 5000;
http.listen(port, function() {
    console.log('listening on *:' + port);
});
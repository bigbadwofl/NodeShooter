var app = require('express')();
var http = require('http').Server(app);
GLOBAL.io = require('socket.io')(http);

var Server = require('./server/server.js');
GLOBAL.World = require('./server/world.js');

World.Init();

app.get('/', function (req, res) {
	res.sendfile(__dirname + '/index.html');
});

app.get(/^(.*)$/, function(req, res, next){
	res.sendfile(__dirname + req.params[0]);
});

io.on('connection', function (socket) {
    Server.Connect(socket.id);

    socket.on('Request', function (msg) {
        msg.id = socket.id;
        msg.data || (msg.data = {});

        GLOBAL[msg.type][msg.method](msg);
    });
});

var port = process.env.PORT || 5000;
http.listen(port, function () {
	console.log('listening on *:' + port);
});
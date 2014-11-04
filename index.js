var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function (req, res) {
	res.sendfile(__dirname + '/index.html');
});

app.get(/^(.*)$/, function(req, res, next){
	res.sendfile(__dirname + req.params[0]);
});

io.on('connection', function (socket) {
	socket.on('Move', function (msg) {
		io.emit('Move', msg);
	});

	socket.on('Connect', function (msg) {
		io.emit('Connect', msg);
	});

	socket.on('Notify', function (msg) {
		io.emit('Notify', msg);
	});
});

var port = process.env.PORT || 5000;
http.listen(port, function () {
	console.log('listening on *:' + port);
});
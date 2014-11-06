GLOBAL.app = require('express')();
var http = require('http').Server(app);

var Player = require('./player.js');
var GAE = require('./gae.js');

var Server = {
	_players: {},
	GetPlayer: function (id) {
		return this._players[id];
	},
	Connect: function (socket) {
		var player = new Player();
		player.socket = socket;
		player.id = socket.id;

		this._players[socket.id] = player;
	},
	SetName: function (socket, data) {
		var player = this._players[socket.id];
		player.username = data.data.username;

		this.Load(socket);

		if (player.room != null)
			World.SyncRoom(player.room);
	},
	Save: function (socket, data) {
		var player = this._players[socket.id];

		GAE.Set('player', player.username, JSON.stringify(player._items));
	},
	Load: function (socket) {
		var player = this._players[socket.id];

		GAE.Get('player', player.username, function (result) {
			if (result == null)
				return;

			player._items = JSON.parse(result);

			

			socket.emit('Response', {
				type: 'Game',
				method: 'GetPlayer',
				data: Serializer.Serialize('PLAYER', player)
			});
		});
	},
	Disconnect: function (socket) {
		var player = this._players[socket.id];
		if (player.room != null) {
			player.room.RemovePlayer(socket.id);

			var room = player.room;
			player.room = null;

			World.SyncRoom(room);
		}
		
		delete this._players[socket.id];
	},
	Send: function (data) {
		var id = data.id;
		delete data.id;

		this._players[id].socket.emit('Response', data);
	}
};

module.exports = Server;
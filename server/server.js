var app = require('express')();
var http = require('http').Server(app);

var Player = require('./player.js');

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
	Disconnect: function (socket) {
		var player = this._players[socket.id];
		if (player.room != null) {
			player.room.RemovePlayer(player.username);

			var room = player.room;
			player.room = null;

			for (var p in this._players) {
				player = this._players[p];
				if (player.room == room)
					World.GetRoom({
						type: 'World',
						method: 'GetRoom',
						id: player.id,
						data: {}
					});
			}
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
GLOBAL.app = require('express')();
var http = require('http').Server(app);

var Player = require('./player.js');
var GAE = require('./gae.js');

var Server = {
	_players: {},
	GetPlayer: function (id) {
		return this._players[id];
	},
	GetPlayerName: function (name) {
		for (var p in this._players) {
			var player = this._players[p];

			if (player.username == name)
				return player;
		}
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
		else {
			World.GetRoom(socket, {
				data: {
					id: 'r0'
				}
			});
		}
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
	Broadcast: function (generalMessage, specificMessage, specificPlayer) {
		for (var p in this._players) {
			var player = this._players[p];

			if ((specificPlayer == null) || (player != specificPlayer)) {
				player.socket.emit('Response', {
					type: 'Game',
					method: 'GetMessage',
					data: {
						message: generalMessage
					}
				});
			}
			else if ((specificPlayer != null) && (player == specificPlayer)) {
				player.socket.emit('Response', {
					type: 'Game',
					method: 'GetMessage',
					data: {
						message: specificMessage
					}
				});
			}
		}
	},
	Send: function (data) {
		var id = data.id;
		delete data.id;

		this._players[id].socket.emit('Response', data);
	}
};

module.exports = Server;
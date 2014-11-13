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
	Log: function (message) {
		console.log('[' + moment().format('DD-MM-YY HH:mm:ss') + '] ' + message);
	},
	Connect: function (socket) {
		var player = new Player();
		player.socket = socket;
		player.id = socket.id;

		this._players[socket.id] = player;
	},
	SetName: function (socket, data) {
		this.Log('Connect: ' + data.data.username);

		var player = this._players[socket.id];
		player.username = data.data.username;

		this.Load(socket);

		if (player.room != null)
			World.SyncRoom(player.room);
		else
			World.GetRoom(socket, {	data: {	id: 'r0' } });
	},
	Save: function (socket) {
		var player = this._players[socket.id];

		GAE.Set('player', player.username, JSON.stringify(player._items));
	},
	Load: function (socket) {
		var player = this._players[socket.id];

		GAE.Get('player', player.username, function (result) {
			if (result == null)
				player.ResetItems();
			else
				player._items = JSON.parse(result);

			Server.SyncPlayer(player);
		});
	},
	Disconnect: function (socket) {
		var player = this._players[socket.id];

		this.Save(socket);

		this.Log('Disconnect: ' + player.username);

		if (player.room != null) {
			player.room.RemovePlayer(socket.id);

			var room = player.room;
			player.room = null;

			World.SyncRoom(room);
		}
		
		delete this._players[socket.id];

		this.SendResponse(socket, 'Game', 'Disconnect');
	},
	SendMessage: function (socket, msg, type) {
		var data = {
			message: msg,
			type: type
		};

		this.SendResponse(socket, 'Game', 'GetMessage', data);
	},
	BroadcastMessage: function (template, data, player, room) {
		if (player != null) {
			var msg = Messages.Get(template, data, 'player');
			this.SendMessage(player.socket, msg.player, msg.type);
		}

		if (room != null) {
			for (var p in this._players) {
				var innerPlayer = this._players[p];

				if ((innerPlayer.room != room) || ((player != null) && (innerPlayer == player)))
					continue;

				var msg = Messages.Get(template, data, 'room');
				this.SendMessage(innerPlayer.socket, msg.room, msg.type);
			}
		}
	},
	SendResponse: function (socket, type, method, data) {
		socket.emit('Response', {
			type: type,
			method: method,
			data: data
		});
	},
	SyncPlayer: function (player) {
		var data = Serializer.Serialize('PLAYER', player);
		data._items = data._items.slice(0);

		data._xp = player._xp / player._xpMax;

		this.SendResponse(player.socket, 'Game', 'GetPlayer', data);
	}
};

module.exports = Server;
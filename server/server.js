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

		this._players[socket.id] = player;
	},
	Send: function (data) {
		var id = data.id;
		delete data.id;

		this._players[id].socket.emit('Response', data);
	}
};

module.exports = Server;
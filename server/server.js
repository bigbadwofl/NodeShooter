var app = require('express')();
var http = require('http').Server(app);

var Player = require('./player.js');

var Server = {
	_players: {},
	Connect: function (id) {
		var player = new Player();

		this._players[id] = player;
	},
	Send: function (data) {
		var id = data.id;
		delete data.id;

		io.emit('Response', data);
	}
};

module.exports = Server;
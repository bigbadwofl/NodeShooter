var Room = require('./room.js');
var Server = require('./server.js');
var Random = require('./random.js');

var World = {
	_rooms: [],
	Init: function () {
		for (var i = 0; i < 5; i++) {
			var room = new Room();

			this._rooms.push(room);
		}
	},
	GetRoom: function (socket, data) {
		var player = Server.GetPlayer(socket.id);
		var room = player.room;

		if (player.room != null) {
			player.room.RemovePlayer(socket.id);
			this.SyncRoom(player.room);
		}

		var room = Random.El(this._rooms);
		room.AddPlayer(socket.id);
		player.room = room;

		this.SyncRoom(room);
	},
	GetItem: function (socket, data) {
		var player = Server.GetPlayer(socket.id);
		var room = player.room;

		room.GetItem(player, data.data.name);
		this.SyncRoom(room);

		socket.emit('Response', {
			type: 'Game',
			method: 'GetPlayer',
			data: Serializer.Serialize('PLAYER', player)
		});
	},
	SyncRoom: function (room) {
		var roomData = Serializer.Serialize('ROOM', room);
		roomData._players = roomData._players.slice(0);

		for (var i = 0; i < roomData._players.length; i++) {
			roomData._players[i] = Server._players[roomData._players[i]].username;
		}

		for (var i = 0; i < room._players.length; i++) {
			var player = room._players[i];

			Server.Send({
				id: player,
				type: 'World',
				method: 'GetRoom',
				data: roomData
			});
		}
	}
};

module.exports = World;
var Room = require('./room.js');
var Server = require('./server.js');
var Random = require('./random.js');
var Serializer = require('./serializer.js');

var World = {
	_rooms: [],
	Init: function () {
		for (var i = 0; i < 5; i++) {
			var room = new Room();

			this._rooms.push(room);
		}
	},
	GetRoom: function (data) {
		var player = Server.GetPlayer(data.id);
		var room = player.room;

		if (player.room != null) {
			player.room.RemovePlayer(data.id);
			this.SyncRoom(player.room);
		}

		var room = Random.El(this._rooms);
		room.AddPlayer(data.id);
		player.room = room;

		this.SyncRoom(room);
	},
	SyncRoom: function (room) {
		var roomData = Serializer.Serialize('ROOM', room);
		roomData.players = roomData.players.slice(0);

		for (var i = 0; i < roomData.players.length; i++) {
			roomData.players[i] = Server._players[roomData.players[i]].username;
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
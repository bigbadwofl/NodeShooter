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
		if (player.room != null) {
			player.room.RemovePlayer(data.data.username);
		}

		var room = Random.El(this._rooms);
		room.AddPlayer(data.data.username);

		player.room = room;

		data.data = Serializer.Serialize('ROOM', room);
		Server.Send(data);
	}
};

module.exports = World;
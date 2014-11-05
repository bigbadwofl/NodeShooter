var Room = require('./room.js');
var Server = require('./server.js');
var Random = require('./random.js');
var Serializer = require('./serializer.js');

var World = {
	_rooms: [],
	Init: function () {
		for (var i = 0; i < 10; i++) {
			var room = new Room();

			this._rooms.push(room);
		}
	},
	GetRoom: function (data) {
		data.data = Serializer.Serialize('ROOM', Random.El(this._rooms));
		Server.Send(data);
	}
};

module.exports = World;
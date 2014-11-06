var Room = require('./room.js');
var Server = require('./server.js');
var Random = require('./random.js');
GLOBAL.Zones = require('./zones.js');

var World = {
	_rooms: {},
	_deaths: [],
	Init: function () {
		this.LoadZone('City');
		setInterval(function () {
			World.ResetZone('City');
		}, 10000);
		setInterval(function () {
			World.Update('City');
		}, 3000);
	},
	LoadZone: function (zoneName) {
		var zone = Zones[zoneName];

		zone.Rooms.forEach(function (roomData) {
			var room = new Room(roomData);
			World._rooms[room._id] = room;
		});

		this.ResetZone(zoneName);
	},
	ResetZone: function (zoneName) {
		var zone = Zones[zoneName];

		zone.Rooms.forEach(function (roomData) {
			var room = World._rooms[roomData.id];
			if (room.Reset(roomData))
				World.SyncRoom(room);
		});
	},
	Update: function (zoneName) {
		for (var r in this._rooms) {
			var room = this._rooms[r];
			room.Update();
		}
	},
	GetRoom: function (socket, data) {
		var player = Server.GetPlayer(socket.id);
		var room = player.room;

		if (player.room != null) {
			player.room.RemovePlayer(socket.id);
			this.SyncRoom(player.room);
		}

		var room = this._rooms[data.data.id];
		room.AddPlayer(socket.id);
		player.room = room;

		this.SyncRoom(room);
	},
	Move: function (socket, data) {
		var player = Server.GetPlayer(socket.id);
		var room = player.room;

		var exit = room._exits[data.data.direction];

		if (exit == null)
			return;

		this.GetRoom(socket, {
			data: {
				id: exit
			}
		});
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
	DropItem: function (socket, data) {
		var player = Server.GetPlayer(socket.id);
		var room = player.room;

		room.DropItem(player, data.data.name);
		this.SyncRoom(room);

		socket.emit('Response', {
			type: 'Game',
			method: 'GetPlayer',
			data: Serializer.Serialize('PLAYER', player)
		});
	},
	AttackMob: function (socket, data) {
		var player = Server.GetPlayer(socket.id);
		var room = player.room;

		room.AttackMob(player, data.data.name);

		this.SyncRoom(room);

		Server.Broadcast(player.username + ' hits the ' + data.data.name, 'you hit the ' + data.data.name, player);
	},
	SendMessage: function (socket, data) {
		var fromPlayer = Server.GetPlayer(socket.id);
		var toPlayer = Server.GetPlayerName(data.data.name);
		
		toPlayer.socket.emit('Response', {
			type: 'Game',
			method: 'GetMessage',
			data: {
				message: fromPlayer.username + ' says ' + data.data.message
			}
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
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
		}, 60000);
		setInterval(function () {
			World.Update('City');
		}, 5000);
	},
	LoadZone: function (zoneName) {
		var zone = Zones[zoneName];

		zone.Rooms.forEach(function (roomData) {
			var room = new Room(roomData);
			World._rooms[room._id] = room;
		});
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

		if (room != null) {
			room.RemovePlayer(socket.id, player.followers);
			this.SyncRoom(room);
		}

		room = this._rooms[data.data.id];
		room.AddPlayer(socket.id, player.followers);
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

		Server.Broadcast(player.username + ' took: ' + data.data.name, 'you took: ' + data.data.name, player, room);
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

		Server.Broadcast(player.username + ' dropped: ' + data.data.name, 'you drop: ' + data.data.name, player, room);
	},
	AttackMob: function (socket, data) {
		var player = Server.GetPlayer(socket.id);
		var room = player.room;

		if (player._fighting) {
			player.socket.emit('Response', {
				type: 'Game',
				method: 'GetMessage',
				data: {
					message: 'you are already fighting'
				}
			});

			return;
		}

		(function attackCallback() {
			var killed = room.AttackMob(player, data.data.name);
			player._fighting = !killed;
			World.SyncRoom(room);

			if (!killed)
				setTimeout(attackCallback, 1000);
		})();
	},
	Follow: function (socket, data) {
		var player = Server.GetPlayer(socket.id);
		var followPlayer = Server.GetPlayerName(data.data.name);

		followPlayer.followers.push(player);

		player.socket.emit('Response', {
			type: 'Game',
			method: 'GetMessage',
			data: {
				message: 'you start following ' + data.data.name
			}
		});

		followPlayer.socket.emit('Response', {
			type: 'Game',
			method: 'GetMessage',
			data: {
				message: player.username + ' starts following you'
			}
		});
	},
	SendMessage: function (socket, data) {
		var fromPlayer = Server.GetPlayer(socket.id);
		var toPlayer = Server.GetPlayerName(data.data.name);
		
		toPlayer.socket.emit('Response', {
			type: 'Game',
			method: 'GetMessage',
			data: {
				message: fromPlayer.username + ' said ' + data.data.message
			}
		});

		fromPlayer.socket.emit('Response', {
			type: 'Game',
			method: 'GetMessage',
			data: {
				message: 'you said ' + data.data.message + ' to ' + toPlayer.username
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
			var socket = Server.GetPlayer(player).socket;

			socket.emit('Response', {
				id: player,
				type: 'World',
				method: 'GetRoom',
				data: roomData
			});
		}
	}
};

module.exports = World;
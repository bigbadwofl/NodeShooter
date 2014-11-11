var Room = require('./room.js');
var Server = require('./server.js');
var Random = require('./random.js');
GLOBAL.Zones = require('./zones.js');

var World = {
	_rooms: {},
	_deaths: [],
	_fights: [],
	Init: function () {
		this.LoadZone('City');
		setInterval(function () {
			World.ResetZone('City');
		}, 60000);
		setInterval(function () {
			World.Update('City');
		}, 5000);
		setInterval(function () {
			World.Attack();
		}, 1000)
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
	Attack: function () {
		for (var i = 0; i < this._fights.length; i++) {
			var fight = this._fights[i];

			console.log(fight._player.username + ' ' + fight._mob.name);

			var killed = fight._player.room.AttackMob(fight._player, fight._mob.name);
			fight._player._fighting = !killed;
			
			World.SyncRoom(fight._player.room);

			if (killed) {
				console.log('pre: ' + this._fights.length);
				this._fights.splice(i, 1);
				i--;

				console.log('post: ' + this._fights.length);
			}
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

		player.Unfollow();

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

		Server.SyncPlayer(player);

		Server.Broadcast(player.username + ' took: ' + data.data.name, 'you took: ' + data.data.name, player, room);
	},
	DropItem: function (socket, data) {
		var player = Server.GetPlayer(socket.id);
		var room = player.room;

		room.DropItem(player, data.data.id);
		this.SyncRoom(room);

		Server.SyncPlayer(player);

		Server.Broadcast(player.username + ' dropped: ' + data.data.name, 'you drop: ' + data.data.name, player, room);
	},
	AttackMob: function (socket, data) {
		var player = Server.GetPlayer(socket.id);

		if (player._fighting) {
			Server.SendMessage(player.socket, 'you are already fighting');
			return;
		}

		var mob = player.room.GetMob(data.data.name);
		if (mob == null) {

			Server.SendMessage(player.socket, "they're not here");
			return;
		}

		console.log('set fighting: ' + data.data.name);

		player._fighting = true;
		mob._fighting = true;

		this._fights.push({
			_player: player,
			_mob: mob
		});
	},
	Follow: function (socket, data) {
		Server.GetPlayer(socket.id).Follow(data.data.name);
	},
	SendMessage: function (socket, data) {
		var fromPlayer = Server.GetPlayer(socket.id);
		var toPlayer = Server.GetPlayerName(data.data.name);

		Server.SendMessage(toPlayer.socket, fromPlayer.username + ' said ' + data.data.message);
		Server.SendMessage(fromPlayer.socket, 'you said ' + data.data.message + ' to ' + toPlayer.username);
	},
	SyncRoom: function (room) {
		var roomData = Serializer.Serialize('ROOM', room);
		roomData._players = roomData._players.slice(0);

		for (var i = 0; i < roomData._players.length; i++) {
			roomData._players[i] = Server._players[roomData._players[i]].username;
		}

		roomData._items = roomData._items.slice(0);

		for (var i = 0; i < roomData._items.length; i++) {
			roomData._items[i] = roomData._items[i].name;
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
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

			var killed = fight._player.room.AttackMob(fight._player, fight._mob.name);
			fight._player._fighting = !killed;
			
			World.SyncRoom(fight._player.room);

			if (killed) {
				this._fights.splice(i, 1);
				i--;

				for (var j = 0; j < this._fights.length; j++) {
					if (i == j)
						continue;

					var checkFight = this._fights[j];
					if (checkFight._mob == fight._mob) {
						this._fights.splice(j, 1);
						checkFight._player._fighting = false;
						if (j < i)
							i--;
						j--;
					}
				}
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

		Server.BroadcastMessage('TakeItem', { name: player.username, item: data.data.name }, player, room);
	},
	DropItem: function (socket, data) {
		var player = Server.GetPlayer(socket.id);
		var room = player.room;

		room.DropItem(player, data.data.id);
		this.SyncRoom(room);

		Server.SyncPlayer(player);

		Server.BroadcastMessage('DropItem', { name: player.username, item: data.data.name }, player, room);
	},
	AttackMob: function (socket, data) {
		var player = Server.GetPlayer(socket.id);

		if (player._fighting) {
			Server.BroadcastMessage('AlreadyFighting', {}, player, null);
			return;
		}

		var mob = player.room.GetMob(data.data.name);
		if (mob == null) {
			Server.BroadcastMessage('NotHere', {}, player, null);
			return;
		}

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

		Server.BroadcastMessage('DoSay', { message: data.data.message }, fromPlayer, null);
		Server.BroadcastMessage('HearSay', { name: fromPlayer.username, message: data.data.message }, toPlayer, null);
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
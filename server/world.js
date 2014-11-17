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
				room.Sync();
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

			if ((fight._player == null) || (fight._player.room == null)) {
				this._fights.splice(i, 1);

				if (Util.FindIndex(this, this._fights, function (f) { return (f._mob == fight._mob); }) == -1)
					fight._mob._fighting = false;

				i--;
				continue;
			}

			var killed = fight._player.room.AttackMob(fight._player, fight._mob.name);
			fight._player._fighting = !killed;
			
			fight._player.room.Sync();

			if (fight._player._hp <= 0) {
				fight._player.Die();
				fight._player._fighting = false;
				this._fights.splice(i, 1);
				i--;
				continue;
			}

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
	Move: function (socket, data) {
		var player = Server.GetPlayer(socket.id);
		var room = player.room;

		if (player._fighting) {
			Server.BroadcastMessage('Fighting', {}, player, null);
			return;
		}

		var exit = room._exits[data.data.direction];

		if (exit == null)
			return;

		player.Unfollow();

		player.SetRoom(exit);
	},
	BuyItem: function (socket, data) {
		var player = Server.GetPlayer(socket.id);
		var mob = player.room.GetMob(data.data.mob);
		mob._shop.BuyItem(socket, data.data.item);
	},
	AttackMob: function (socket, data) {
		var player = Server.GetPlayer(socket.id);

		var mob = player.room.GetMob(data.data.name);
		if (mob._shop != null) {
			mob._shop.ListItems(socket);
			return;
		}

		if (player._fighting) {
			Server.BroadcastMessage('AlreadyFighting', {}, player, null);
			return;
		}

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

		Server.BroadcastMessage('DoSay', { name: fromPlayer.username, message: data.data.message }, fromPlayer, fromPlayer.room);
	}
};

module.exports = World;
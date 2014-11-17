var Random = require('./random.js');
var Mob = require('./mob.js');

function Room(data) {
	data.items || (data.items = []);
	data.mobs || (data.mobs = []);

	this._id = data.id;
	this._name = data.name;
	this._description = data.description;
	this._exits = data.exits;
	this._players = [];
	this._mobs = [];
	this._items = [];

	this.Update = function() {
		for (var i = 0; i < this._mobs.length; i++) {
			if (this._mobs[i].Move(this))
				i--;
		}
	};

	this.AddMob = function(mobID, mobData, mobItemData) {
		var mob = new Mob(mobID, mobData, mobItemData);
		this._mobs.push(mob);
	};

	this.BuildItem = function (id, data) {
		this._items.push(Items.Build(id, data));
	};

	for (var i = 0; i < data.items.length; i++) {
		this.BuildItem(data.items[i]);
	}

	for (var i = 0; i < data.mobs.length; i++) {
		this._mobs.push(new Mob(data.mobs[i]));
	}

	this.Reset = function(data) {
		var changed = false;

		for (var i = 0; i < data.items.length; i++) {
			if (this._items.some(function(findItem) {
				return (findItem.id == data.items[i].id);
			}))
				continue;

			changed = true;

			this.BuildItem(data.items[i]);
		}

		for (var i = 0; i < data.mobs.length; i++) {
			var skip = true;
			for (var j = 0; j < World._deaths.length; j++) {
				if (World._deaths[j] == data.mobs[i].id) {
					skip = false;
					World._deaths.splice(j, 1);
					break;
				}
			}
			if (skip)
				continue;

			changed = true;

			this._mobs.push(new Mob(data.mobs[i]));
		}

		return changed;
	};

	this.GetItem = function(player, name) {
		for (var i = 0; i < this._items.length; i++) {
			if (this._items[i].name == name) {
				if (player.items == null) {
					player.GetItem(this._items[i]);
					player.Sync();
				}
				else
					player.items.push(this._items[i].id);

				if (player.socket != null)
					Server.BroadcastMessage('TakeItem', { name: player.username, item: name }, player, this);

				this._items.splice(i, 1);
				break;
			}
		}

		this.Sync();
	};

	this.GetMob = function (name) {
		return Util.Find(this, this._mobs, function (mob) { return (mob.name == name); });
	};

	this.DropItem = function(player, name) {
		for (var i = 0; i < player._items.length; i++) {
			if (player._items[i].name == name) {
				var id = player._items[i].id;

				Server.BroadcastMessage('DropItem', { name: player.username, item: player._items[i].name }, player, this);

				this.BuildItem(id);

				player._items.splice(i, 1);
				return;
			}
		}
	};

	this.AttackMob = function(player, name) {
		var mob = Util.Find(this, this._mobs, function(mob) {
			return (mob.name == name);
		});
		if (mob == null)
			return false;
		else
			return mob.Attack(player, this);
	};

	this.AddPlayer = function(id, followers) {
		this._players.push(id);

		//Hostile Mobs
		var player = Server.GetPlayer(id);
		for (var i = 0; i < this._mobs.length; i++) {
			var mob = this._mobs[i];
			if (!mob._hostile)
				continue;

			World._fights.push({
				_player: player,
				_mob: mob
			});
		}

		if (followers == null)
			return;

		for (var i = 0; i < followers.length; i++) {
			this._players.push(followers[i].socket.id);
		}
	};

	this.RemovePlayer = function(id, followers) {
		for (var i = 0; i < this._players.length; i++) {
			if (this._players[i] == id) {
				this._players.splice(i, 1);
				i--;
			}
		}

		if (followers == null)
			return;

		for (var i = 0; i < followers.length; i++) {
			var follower = followers[i];

			Server.BroadcastMessage('PerformFollow', { name: Server.GetPlayer(id).username }, follower, null);

			Util.RemoveWhere(this, this._players, function(player) {
				return (player == follower.socket.id);
			});
		}
	};

	this.Sync = function () {
		var roomData = Serializer.Serialize('ROOM', this);
		roomData._players = roomData._players.slice(0);

		for (var i = 0; i < roomData._players.length; i++) {
			roomData._players[i] = Server._players[roomData._players[i]].username;
		}

		roomData._items = roomData._items.slice(0);
		for (var i = 0; i < roomData._items.length; i++) {
			roomData._items[i] = roomData._items[i].name;
		}

		for (var i = 0; i < this._players.length; i++) {
			var player = this._players[i];
			var socket = Server.GetPlayer(player).socket;

			Server.SendResponse(socket, 'World', 'GetRoom', roomData);
		}
	};
};

module.exports = Room;
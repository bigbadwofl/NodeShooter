var Random = require('./random.js');
var Mob = require('./mob.js');

function Room(data) {
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

	this.AddItem = function(id, itemData) {
		var item = { id: id, name: itemData.name };
		this._items.push(item);
	};

	for (var i = 0; i < data.items.length; i++) {
		var itemData = Zones.City.Items[data.items[i]];

		this.AddItem(data.items[i], itemData);
	}

	for (var i = 0; i < data.mobs.length; i++) {
		var mobData = Zones.City.Mobs[data.mobs[i].id];
		var mobItemData = data.mobs[i].items;
		mobItemData = mobItemData.slice(0);
		for (var j = 0; j < mobItemData.length; j++) {
			var tempItem = Zones.City.Items[mobItemData[j]];
			tempItem.id = mobItemData[j]
			mobItemData[j] = tempItem;
		}

		this.AddMob(data.mobs[i].id, mobData, mobItemData);
	}

	this.Reset = function(data) {
		var changed = false;

		for (var i = 0; i < data.items.length; i++) {
			var itemData = Zones.City.Items[data.items[i]];

			if (this._items.some(function(findItem) {
				return (findItem.id == itemData.id);
			}))
				continue;

			changed = true;

			this.AddItem(data.items[i], itemData);
		}

		for (var i = 0; i < data.mobs.length; i++) {
			var mobData = Zones.City.Mobs[data.mobs[i].id];

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

			var mobItemData = data.mobs[i].items;

			mobItemData = mobItemData.slice(0);
			for (var j = 0; j < mobItemData.length; j++) {
				var tempItem = Zones.City.Items[mobItemData[j]];
				tempItem.id = mobItemData[j]
				mobItemData[j] = tempItem;
			}

			this.AddMob(data.mobs[i].id, mobData, mobItemData);
		}

		return changed;
	};

	this.GetItem = function(player, name) {
		for (var i = 0; i < this._items.length; i++) {
			if (this._items[i].name == name) {
				if (player.items == null)
					player._items.push(this._items[i]);
				else
					player.items.push(this._items[i]);

				if (player.socket != null)
					Server.BroadcastMessage('TakeItem', { name: player.username, item: name }, player, this);

				this._items.splice(i, 1);
				return;
			}
		}
	};

	this.GetMob = function (name) {
		return Util.Find(this, this._mobs, function (mob) { return (mob.name == name); });
	};

	this.DropItem = function(player, id) {
		var itemData = Zones.City.Items[id];

		for (var i = 0; i < player._items.length; i++) {
			if (player._items[i].id == id) {
				Server.BroadcastMessage('DropItem', { name: player.username, item: player._items[i].name }, player, this);

				this.AddItem(id, itemData);

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
};

module.exports = Room;
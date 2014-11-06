var Random = require('./random.js');

function Room(data) {
	this._id = data.id;
	this._name = data.name;
	this._description = data._description;
	this._exits = data.exits;
	this._players = [];
	this._mobs = [];
	this._items = [];

	for (var i = 0; i < data.items.length; i++) {
		var itemData = Zones.City.Items[data.items[i]];

		var item = itemData.name;
		this._items.push(item);
	}

	for (var i = 0; i < data.mobs.length; i++) {
		var mobData = Zones.City.Mobs[data.mobs[i]];

		var mob = {
			name: mobData.name,
			hp: mobData.hp
		};
		this._mobs.push(mob);
	}

	this.Update = function () {
		for (var i = 0; i < this._mobs.length; i++) {
			var mob = this._mobs[i];

			if (Random.Int(0, 10) == 0) {
				var newRoomID = Random.Prop(this._exits);
				var newRoom = World._rooms[newRoomID];

				this._mobs.splice(i, 1);
				newRoom._mobs.push(mob);
				i--;

				World.SyncRoom(this);
				World.SyncRoom(newRoom);
			}
		}
	};

	this.Reset = function (data) {
		var changed = false;

		for (var i = 0; i < data.items.length; i++) {
			var itemData = Zones.City.Items[data.items[i]];

			if (this._items.some(function (findItem) { return (findItem == itemData.name); }))
				continue;

			changed = true;

			var item = itemData.name;
			this._items.push(item);
		}

		for (var i = 0; i < data.mobs.length; i++) {
			var mobData = Zones.City.Mobs[data.mobs[i]];

			var skip = true;
			for (var j = 0; j < World._deaths.length; j++) {
				if (World._deaths[j] == mobData.name) {
					skip = false;
					World._deaths.splice(j, 1);
					break;
				}
			}
			if (skip)
				continue;

			changed = true;

			var mob = {
				name: mobData.name,
				hp: mobData.hp
			};
			this._mobs.push(mob);
		}

		return changed;
	};

	this.GetItem = function (player, name) {
		for (var i = 0; i < this._items.length; i++) {
			if (this._items[i] == name) {
				player._items.push(this._items[i]);
				this._items.splice(i, 1);
				return;
			}
		}
	};

	this.DropItem = function (player, name) {
		this._items.push(name);

		for (var i = 0; i < player._items.length; i++) {
			if (player._items[i] == name) {
				player._items.splice(i, 1);
				return;
			}
		}
	};

	this.AttackMob = function (player, name) {
		for (var i = 0; i < this._mobs.length; i++) {
			var mob = this._mobs[i];
			if (mob.name != name)
				continue;
			
			mob.hp--;

			if (mob.hp <= 0) {
				World._deaths.push(this._mobs[i].name);
				this._mobs.splice(i, 1);
			}

			return;
		}
	};

	this.AddPlayer = function (id) {
		this._players.push(id);
	};

	this.RemovePlayer = function (id) {
		for (var i = 0; i < this._players.length; i++) {
			if (this._players[i] == id) {
				this._players.splice(i, 1);
				i--;
			}
		}
	};
};

module.exports = Room;
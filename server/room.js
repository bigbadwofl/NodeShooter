var Random = require('./random.js');

function Room(data) {
	this._id = data.id;
	this._name = data.name;
	this._description = data._description;
	this._exits = data.exits;
	this._players = [];
	this._mobs = [];
	this._items = [];

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
				Server.Broadcast('the ' + mob.name + ' left', null, null, this);
				World.SyncRoom(newRoom);
				Server.Broadcast('the ' + mob.name + ' arrived', null, null, newRoom);
			}
		}
	};

	this.AddMob = function (mobID, mobData, mobItemData) {
		var mob = {
			id: mobID,
			name: mobData.name,
			hp: mobData.hp,
			items: mobItemData
		};
		this._mobs.push(mob);
	};

	this.AddItem = function (itemData) {
		var item = itemData.name;
		this._items.push(item);
	};

	for (var i = 0; i < data.items.length; i++) {
		var itemData = Zones.City.Items[data.items[i]];

		this.AddItem(itemData);
	}

	for (var i = 0; i < data.mobs.length; i++) {
		var mobData = Zones.City.Mobs[data.mobs[i].id];
		var mobItemData = data.mobs[i].items;

		this.AddMob(data.mobs[i].id, mobData, mobItemData);
	}

	this.Reset = function (data) {
		var changed = false;

		for (var i = 0; i < data.items.length; i++) {
			var itemData = Zones.City.Items[data.items[i]];

			if (this._items.some(function (findItem) { return (findItem == itemData.name); }))
				continue;

			changed = true;

			this.AddItem(itemData);
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

			this.AddMob(data.mobs[i].id, mobData, mobItemData);
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
				Server.Broadcast(player.username + ' killed the ' + mob.name, 'you killed the ' + mob.name, player, this);
				if (mob.items.length > 0)
					Server.Broadcast('the ' + mob.name + ' dropped something on death', null, null, this);

				for (var j = 0; j < mob.items.length; j++) {
					this.AddItem(Zones.City.Items[mob.items[j]]);
				}

				World._deaths.push(mob.id);
				this._mobs.splice(i, 1);

				return true;
			}
			else {
				Server.Broadcast(player.username + ' hit the ' + mob.name, 'you hit the ' + mob.name, player, this);
				Server.Broadcast('the ' + mob.name + ' hit ' + player.username, 'the ' + mob.name + ' hit you', player, this);
			}

			return false;
		}

		return false;
	};

	this.AddPlayer = function (id, followers) {
		this._players.push(id);

		if (followers != null) {
			for (var i = 0; i < followers.length; i++) {
				this._players.push(followers[i].socket.id);
			}
		}
	};

	this.RemovePlayer = function (id, followers) {
		for (var i = 0; i < this._players.length; i++) {
			if (this._players[i] == id) {
				this._players.splice(i, 1);
				i--;
			}
		}

		if (followers != null) {
			for (var i = 0; i < followers.length; i++) {
				var follower = followers[i].socket.id;
				followers[i].socket.emit('Response', {
					type: 'Game',
					method: 'GetMessage',
					data: {
						message: 'you follow ' + Server.GetPlayer(id).username
					}
				});

				for (var j = 0; j < this._players.length; j++) {
					if (this._players[j] == follower) {
						this._players.splice(j, 1);
						j--;
					}
				}
			}
		}
	};
};

module.exports = Room;
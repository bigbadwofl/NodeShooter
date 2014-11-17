var jsonpack = require('jsonpack/main');

function Player() {
	this._items = [];
	this.followers = [];
	this._fighting = false;
	this._hp = 10;
	this._hpMax = 10;
	this._xp = 0;
	this._xpMax = 10;
	this._level = 1;
	this._gold = 1000;

	this.ResetItems = function () {
		this._items = [ ];
		this._gold = 1000;
	};

	this.Follow = function (playerName) {
		var oldFollower = this._following;

		this.Unfollow();

		if ((playerName == null) || ((oldFollower != null) && (oldFollower.username == playerName)))
			return;

		var followPlayer = Server.GetPlayerName(playerName);

		this._following = followPlayer;

		followPlayer.followers.push(this);

		Server.BroadcastMessage('DoFollow', { name: followPlayer.username }, this, null);
		Server.BroadcastMessage('HearFollow', { name: this.username }, followPlayer, null);
	};

	this.GetItem = function (item) {
		if (item.id == 'gold') {
			this._gold += item.value;

			return;
		}

		this._items.push(item);
	};

	this.DropItem = function (itemName) {
		this.room.DropItem(this, itemName);
		this.room.Sync();
		this.Sync();
	};

	this.EquipItem = function (itemName) {
		var item = Util.Find(this, this._items, function (i) {
			return (i.name == itemName);
		});

		if (item == null)
			return;

		Server.BroadcastMessage('Equip', { name: this.username, item: item.name }, this, this.room);

		item.eq = true;

		this.Sync();
	};

	this.SetRoom = function (id) {
		var room = this.room;

		if (room != null) {
			room.RemovePlayer(this.socket.id, this.followers);
			room.Sync();
		}

		room = World._rooms[id];
		room.AddPlayer(this.socket.id, this.followers);
		this.room = room;

		room.Sync();
	};

	this.UnequipItem = function (itemName) {
		var item = Util.Find(this, this._items, function (i) {
			return (i.name == itemName);
		});

		if (item == null)
			return;

		Server.BroadcastMessage('Unequip', { name: this.username, item: item.name }, this, this.room);

		delete item.eq;

		this.Sync();
	};

	this.GetXP = function (mob) {
		this._xp += mob.lvl;

		Server.BroadcastMessage('GetXP', { amount: mob.lvl }, this, null);

		if (this._xp >= this._xpMax) {
			this._xp -= this._xpMax;
			this._xpMax += this._xpMax;
			this._level++;
			this._hpMax = 9 + this._level;
			this._hp = this._hpMax;
			Server.BroadcastMessage('AdvanceLevel', { name: this.username }, this, this.room);
		}

		this.Sync();
	};

	this.Die = function () {
		this._xp -= this._level;
		(this._xp < 0) && (this._xp = 0);

		this.RegenHP(true);

		Server.BroadcastMessage('Died', { name: this.username }, this, this.room);
		this.SetRoom('r3');
		this.Sync();
	};

	this.RegenHP = function (max) {
		if (max)
			this._hp = this._hpMax;
		else {
			this._hp++;
			if (this._hp > this._hpMax)
				this._hp = this._hpMax;
		}
	};

	this.TakeDamage = function (mob) {
		this._hp -= mob.dmg;

		Server.BroadcastMessage('MobDoHit', { name: this.username, mob: mob.name, p: mob._prefix }, this, this.room);
	};

	this.Unfollow = function() {
		if (this._following == null)
			return;

		var followPlayer = this._following;
		Util.RemoveWhere(this, followPlayer.followers, function(p) {
			return (p.username == this.username);
		});
		this._following = null;

		Server.BroadcastMessage('DoUnfollow', { name: followPlayer.username }, this, null);
		Server.BroadcastMessage('HearUnfollow', { name: this.username }, followPlayer, null);
	};

	this.Save = function () {
		if (this.room == null)
			return;
		
		var data = {
			level: this._level,
			xp: this._xp,
			gold: this._gold,
			items: this._items,
			room: this.room._id
		};

		for (var i = 0; i < data.items.length; i++) {
			var item = data.items[i];
			var id = item.id;
			item.eq && (id += '|e');

			data.items[i] = id;
		}

		GAE.Set('player', this.username, JSON.stringify(data));
	};

	this.Load = function () {
		var player = this;

		GAE.Get('player', this.username, function (result) {
			var room = 'r0';

			if (result == null)
				player.ResetItems();
			else {
				var data = JSON.parse(result);

				player._items = data.items;
				player._level = data.level;
				player._gold = data.gold;
				player._xp = data.xp;

				player._xpMax = player._level * 10;
				player._hpMax = 9 + player._level;
				player._hp = player._hpMax;

				for (var i = 0; i < player._items.length; i++) {
					player._items[i] = Items.Build(player._items[i]);
				}

				if (data.room)
					room = data.room;
			}

			if (player.room != null)
				player.room.Sync();
			else
				player.SetRoom(room);

			player.Sync();
		});
	};

	this.Sync = function () {
		var data = Serializer.Serialize('PLAYER', this);
		data._xp = this._xp / this._xpMax;
		Server.SendResponse(this.socket, 'Game', 'GetPlayer', data);
	};
}

module.exports = Player;
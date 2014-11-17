var jsonpack = require('jsonpack/main');

function Player() {
	this._items = [];
	this._eq = {};
	this.followers = [];
	this._fighting = false;
	this._hp = 10;
	this._hpMax = 10;
	this._xp = 0;
	this._xpMax = 10;
	this._level = 1;
	this._gold = 0;

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

	this.EquipItem = function (item) {
		var item = Util.Find(this, this._items, function (i) {
			return (i.name == item);
		});

		if (item == null)
			return;

		Server.BroadcastMessage('Equip', { name: this.username, item: item.name }, this, this.room);

		this._eq[item.slot] = item;

		Server.SyncPlayer(this);
	};

	this.UnequipItem = function (item) {
		var item = Util.Find(this, this._items, function (i) {
			return (i.name == item);
		});

		if (item == null)
			return;

		Server.BroadcastMessage('Unequip', { name: this.username, item: item.name }, this, this.room);

		delete this._eq[item.slot];

		Server.SyncPlayer(this);
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

		Server.SyncPlayer(this);
	};

	this.Die = function () {
		this._xp -= this._level;
		(this._xp < 0) && (this._xp = 0);

		this.RegenHP(true);

		Server.BroadcastMessage('Died', { name: this.username }, this, this.room);
		World.GetRoom(this.socket, { data: { id: 'r3' } });
		Server.SyncPlayer(this);
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
			eq: this._eq,
			room: this.room._id
		};

		GAE.Set('player', this.username, jsonpack.pack(data));
	};

	this.Load = function () {
		var player = this;

		GAE.Get('player', this.username, function (result) {
			var room = 'r0';

			if (result == null)
				player.ResetItems();
			else {
				var data = jsonpack.unpack(result);

				player._items = data.items;
				player._eq = data.eq || {};
				player._level = data.level;
				player._gold = data.gold;
				player._xp = data.xp;

				player._xpMax = player._level * 10;
				player._hpMax = 9 + player._level;
				player._hp = player._hpMax;

				if (data.room)
					room = data.room;
			}

			if (player.room != null)
				World.SyncRoom(player.room);
			else
				World.GetRoom(player.socket, {	data: {	id: room } });

			Server.SyncPlayer(player);
		});
	};
}

module.exports = Player;
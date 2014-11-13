var Random = require('./random.js');
var Shop = require('./shop.js');

function Mob(id, data, items) {
	this.id = id;
	this.name = data.name;
	this.hp = data.lvl;
	this.lvl = data.lvl;
	this.dmg = data.lvl;
	this.items = items;
	this._fighting = false;
	this._handler = data.handler;

	this._roam = !!data.roam;
	this._hostile = !!data.hostile;

	this._prefix = data.prefix;
	(this._prefix == null) && (this._prefix = 'the ');
	this._shop = data.shop && (new Shop(data.shop, this));
	this._gold = data.gold || 0;

	this.Move = function(room) {
	if ((!this._roam) || (this._fighting) || (Random.Int(0, 10) > 0)) {
			if ((!this._fighting) && (this._handler != null))
				this[this._handler](room);

			return false;
		}

		var newRoomID = Random.Prop(room._exits);
		var newRoom = World._rooms[newRoomID];

		Util.RemoveWhere(this, room._mobs, function(mob) {
			return (mob.id == this.id);
		});

		newRoom._mobs.push(this);

		World.SyncRoom(room);
		Server.BroadcastMessage('MobLeft', { name: this.name, p: this._prefix }, null, room);
		World.SyncRoom(newRoom);
		Server.BroadcastMessage('MobArrived', { name: this.name, p: this._prefix }, null, newRoom);

		return true;
	};

	this.Attack = function(player, room) {
		var getHit = (Random.Int(0, 10) > 2);
		if (getHit)
			this.hp -= player._level;

		var data = { name: player.username, mob: this.name, p: this._prefix };

		if (this.hp <= 0) {
			Server.BroadcastMessage('MobKilled', data, player, room);
			if (this.items.length > 0)
				Server.BroadcastMessage('MobLoot', { name: this.name, p: this._prefix }, null, room);

			if (this._gold > 0) {
				room.AddItem('gold', {
					name: this._gold + ' coins',
					price: this._gold
				});
			}

			for (var j = 0; j < this.items.length; j++) {
				room.AddItem(this.items[j].id, this.items[j]);
			}

			player.GetXP(this);

			World._deaths.push(this.id);
			
			Util.RemoveWhere(this, room._mobs, function(mob) {
				return (mob.id == this.id);
			});

			return true;
		} else {
			var doHit = (Random.Int(0, 10) > 2);

			var doBroadcast = function (message) { Server.BroadcastMessage(message, data, player, room); };

			if (getHit) 
				doBroadcast('MobGetHit');
			else 
				doBroadcast('MobGetMissed');

			if (doHit) {
				player.TakeDamage(this);
				Server.SyncPlayer(player);
			}
			else
				doBroadcast('MobDoMissed');
		}

		return false;
	};

	this.Clean = function (room) {
		var items = room._items;
		if (items.length == 0)
			return;

		var item = Random.El(items);

		room.GetItem(this, item.name);
		World.SyncRoom(room);
		Server.BroadcastMessage('JanitorClean', { name: this.name, p: this._prefix }, null, room);
	};

	this.Pee = function (room) {
		if (!Random.Roll(7))
			return;

		var mobs = room._mobs;
		if (mobs.length == 0)
			return;

		var mob = this;

		while (mob == this)
			mob = Random.El(mobs);

		Server.BroadcastMessage('DogPee', { name: this.name, target: mob.name, p: mob._prefix }, null, room);		
	};
}

module.exports = Mob;
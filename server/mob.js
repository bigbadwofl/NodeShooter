var Random = require('./random.js');
var Shop = require('./shop.js');

function Mob(data) {
	var mobData = Zones.City.Mobs[data.id];

	this.id = data.id;
	this.name = mobData.name;
	this.hp = mobData.lvl;
	this.lvl = mobData.lvl;
	this.dmg = mobData.lvl;
	this.items = data.items || [];
	this._fighting = false;
	this._handler = mobData.handler;

	this._roam = !!mobData.roam;
	this._hostile = !!mobData.hostile;

	this._prefix = mobData.prefix;
	(this._prefix == null) && (this._prefix = 'the ');
	this._shop = mobData.shop && (new Shop(mobData.shop, this));
	this._gold = mobData.gold || 0;

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

		room.Sync();
		Server.BroadcastMessage('MobLeft', { name: this.name, p: this._prefix }, null, room);
		newRoom.Sync();
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
				room.BuildItem('gold', this._gold);
			}

			for (var j = 0; j < this.items.length; j++) {
				room.BuildItem(this.items[j]);
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
				player.Sync();
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
		room.Sync();
		console.log(this.items);
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
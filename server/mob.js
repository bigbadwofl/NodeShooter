var Random = require('./random.js');

function Mob(id, data, items) {
	this.id = id;
	this.name = data.name;
	this.hp = data.hp;
	this.items = items;
	this._fighting = false;
	this._handler = data.handler;

	this.Move = function(room) {
		if ((this._fighting) || (Random.Int(0, 10) > 0)) {
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
		Server.BroadcastMessage('MobLeft', { name: this.name }, null, room);
		World.SyncRoom(newRoom);
		Server.BroadcastMessage('MobArrived', { name: this.name }, null, newRoom);

		return true;
	};

	this.Clean = function (room) {
		var items = room._items;
		if (items.length == 0)
			return;

		var item = Random.El(items);

		room.GetItem(this, item.name);
		World.SyncRoom(room);
		Server.BroadcastMessage('JanitorClean', { name: this.name }, null, room);
	};

	this.Attack = function(player, room) {
		var getHit = (Random.Int(0, 10) > 2);
		if (getHit)
			this.hp--;

		if (this.hp <= 0) {
			Server.BroadcastMessage('MobKilled', { name: player.username, mob: this.name }, player, room);
			if (this.items.length > 0)
				Server.BroadcastMessage('MobLoot', { name: this.name }, null, room);

			for (var j = 0; j < this.items.length; j++) {
				room.AddItem(this.items[j].id, this.items[j]);
			}

			player.GetXP();

			World._deaths.push(this.id);
			
			Util.RemoveWhere(this, room._mobs, function(mob) {
				return (mob.id == this.id);
			});

			return true;
		} else {
			var doHit = (Random.Int(0, 10) > 2);

			if (getHit)
				Server.BroadcastMessage('MobGetHit', { name: player.username, mob: this.name }, player, room);
			else
				Server.BroadcastMessage('MobGetMissed', { name: player.username, mob: this.name }, player, room);

			if (doHit) {
				Server.BroadcastMessage('MobDoHit', { name: player.username, mob: this.name }, player, room);
				player._hp--;
				Server.SyncPlayer(player);
			}
			else
				Server.BroadcastMessage('MobDoMissed', { name: player.username, mob: this.name }, player, room);
		}

		return false;
	};
}

module.exports = Mob;
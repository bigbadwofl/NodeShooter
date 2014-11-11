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
		Server.Broadcast('the ' + this.name + ' left', null, null, room);
		World.SyncRoom(newRoom);
		Server.Broadcast('the ' + this.name + ' arrived', null, null, newRoom);

		return true;
	};

	this.Clean = function (room) {
		var items = room._items;
		if (items.length == 0)
			return;

		var item = Random.El(items);

		room.GetItem(this, item.name);
		World.SyncRoom(room);
		Server.Broadcast('the ' + this.name + ' picks up some trash', null, null, room);

		console.log(this.items);
	};

	this.Attack = function(player, room) {
		var getHit = (Random.Int(0, 10) > 2);
		if (getHit)
			this.hp--;

		if (this.hp <= 0) {
			Server.Broadcast(player.username + ' killed the ' + this.name, 'you killed the ' + this.name, player, room);
			if (this.items.length > 0)
				Server.Broadcast('the ' + this.name + ' dropped something on death', null, null, room);

			for (var j = 0; j < this.items.length; j++) {
				room.AddItem(this.items[j].id, this.items[j]);
			}

			World._deaths.push(this.id);
			
			Util.RemoveWhere(this, room._mobs, function(mob) {
				return (mob.id == this.id);
			});

			return true;
		} else {
			var doHit = (Random.Int(0, 10) > 2);

			if (getHit)
				Server.Broadcast(player.username + ' hit the ' + this.name, 'you hit the ' + this.name, player, room);
			else
				Server.Broadcast(player.username + ' missed the ' + this.name, 'you missed the ' + this.name, player, room);

			if (doHit) {
				Server.Broadcast('the ' + this.name + ' hit ' + player.username, 'the ' + this.name + ' hit you', player, room);
				player._hp--;
				Server.SyncPlayer(player);
			}
			else
				Server.Broadcast('the ' + this.name + ' missed ' + player.username, 'the ' + this.name + ' missed you', player, room);
		}

		return false;
	};
}

module.exports = Mob;
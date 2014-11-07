var Random = require('./random.js');

function Mob(id, data, items) {
	this.id = id;
	this.name = data.name;
	this.hp = data.hp;
	this.items = items;

	this.Move = function(room) {
		if (Random.Int(0, 10) > 2)
			return false;

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

	this.Attack = function(player, room) {
		this.hp--;

		if (this.hp <= 0) {
			Server.Broadcast(player.username + ' killed the ' + this.name, 'you killed the ' + this.name, player, room);
			if (this.items.length > 0)
				Server.Broadcast('the ' + this.name + ' dropped something on death', null, null, room);

			for (var j = 0; j < this.items.length; j++) {
				room.AddItem(Zones.City.Items[this.items[j]]);
			}

			World._deaths.push(this.id);
			
			Util.RemoveWhere(this, room._mobs, function(mob) {
				return (mob.id == this.id);
			});

			World.SyncRoom(room);

			return true;
		} else {
			Server.Broadcast(player.username + ' hit the ' + this.name, 'you hit the ' + this.name, player, room);
			Server.Broadcast('the ' + this.name + ' hit ' + player.username, 'the ' + this.name + ' hit you', player, room);
		}

		return false;
	};
}

module.exports = Mob;
var Messages = {
	Get: function (name, data, useType) {
		var msg = this.Templates[name];
		if (msg == null) {
			Server.Log("Error: Couldn't find message '" + name + "'");
			return;
		}
		msg = {
			player: msg.player,
			room: msg.room,
			type: msg.type
		};

		for (var p in data) {
			msg[useType] = msg[useType].replace('$' + p, data[p]);
		}

		return msg;
	},
	Templates: {
		TakeItem: {
			player: 'you took: $item',
			room: '$name took: $item',
			type: 'error'
		},
		DropItem: {
			player: 'you dropped: $item',
			room: '$name dropped: $item',
			type: 'error'
		},
		AlreadyFighting: {
			player: 'you are already fighting',
			type: 'info'
		},
		NotHere: {
			player: 'they are not here',
			type: 'info'
		},
		DoSay: {
			player: 'you said: $message',
			type: 'error'
		},
		HearSay: {
			player: '$name said: $message',
			type: 'error'
		},
		DoFollow: {
			player: 'you started following $name',
			type: 'info'
		},
		HearFollow: {
			player: '$name started following you',
			type: 'info'
		},
		DoUnfollow: {
			player: 'you stopped following $name',
			type: 'info'
		},
		HearUnfollow: {
			player: '$name stopped following you',
			type: 'info'
		},
		PerformFollow: {
			player: 'you followed $name',
			type: 'info'
		},
		MobLeft: {
			room: 'the $name left',
			type: 'info'
		},
		MobArrived: {
			room: 'the $name arrived',
			type: 'info'
		},
		MobKilled: {
			player: 'you killed the $mob',
			room: '$name killed the $mob',
			type: 'info'
		},
		MobLoot: {
			room: 'the $name dropped something on death',
			type: 'error'
		},
		MobGetHit: {
			player: 'you hit the $mob',
			room: '$name hit the $mob',
			type: 'combat'
		},
		MobGetMissed: {
			player: 'you missed the $mob',
			room: '$name missed the $mob',
			type: 'combat'
		},
		MobDoHit: {
			player: 'the $mob hit you',
			room: 'the $mob hit $name',
			type: 'combat'
		},
		MobDoMissed: {
			player: 'the $mob missed you',
			room: 'the $mob missed $name',
			type: 'combat'
		},
		JanitorClean: {
			room: 'the $name picked up some trash',
			type: 'info'
		},
		GetXP: {
			player: 'you gained 1 xp',
			type: 'error'
		}
		,
		AdvanceLevel: {
			player: 'you advanced to the next level',
			room: '$name advanced to the next level',
			type: 'error'
		}
	}
};

module.exports = Messages;
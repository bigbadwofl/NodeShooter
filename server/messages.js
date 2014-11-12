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
			room: '$name said: $message',
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
			room: '$p$name left',
			type: 'info'
		},
		MobArrived: {
			room: '$p$name arrived',
			type: 'info'
		},
		MobKilled: {
			player: 'you killed $p$mob',
			room: '$name killed $p$mob',
			type: 'info'
		},
		MobLoot: {
			room: '$p$name dropped something on death',
			type: 'error'
		},
		MobGetHit: {
			player: 'you hit $p$mob',
			room: '$name hit $p$mob',
			type: 'combat'
		},
		MobGetMissed: {
			player: 'you missed $p$mob',
			room: '$name missed $p$mob',
			type: 'combat'
		},
		MobDoHit: {
			player: '$p$mob hit you',
			room: '$p$mob hit $name',
			type: 'combat'
		},
		MobDoMissed: {
			player: '$p$mob missed you',
			room: '$p$mob missed $name',
			type: 'combat'
		},
		JanitorClean: {
			room: '$p$name picked up some trash',
			type: 'info'
		},
		DogPee: {
			room: 'the $name peed on $p$target',
			type: 'info'
		},
		GetXP: {
			player: 'you gained $amount xp',
			type: 'error'
		},
		AdvanceLevel: {
			player: 'you advanced to the next level',
			room: '$name advanced to the next level',
			type: 'error'
		},
		Died: {
			player: 'you died and lost some xp',
			room: '$name died',
			type: 'error'
		}
	}
};

module.exports = Messages;
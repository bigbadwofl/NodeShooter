var Random = require('./random.js');

function Room() {
	this._name = 'Room ' + Random.Int(1, 100);
	this._description = 'Description ' + Random.Int(1, 100);
	this._players = [];
	this._mobs = [];
	this._items = [];

	var itemCount = Random.Int(0, 1);
	for (var i = 0; i < itemCount; i++) {
		var itemPrefixes = ['Broken', 'Iron', 'Steel', 'Copper', 'Silver', 'Golden'];
		var itemSuffixes = ['Sword', 'Axe', 'Helm', 'Boots', 'Gloves'];

		var item = Random.El(itemPrefixes) + ' ' + Random.El(itemSuffixes);

		this._items.push(item);
	}

	var mobCount = Random.Int(0, 1);
	for (var i = 0; i < mobCount; i++) {
		var mobPrefixes = ['Cowardly', 'Strong', 'Sketchy', 'Fiery', 'Magical', 'Rotting'];
		var mobSuffixes = ['Rat', 'Llama', 'Sloth', 'Ogre', 'Guard'];

		var mob = Random.El(mobPrefixes) + ' ' + Random.El(mobSuffixes);

		mob = {
			name: mob,
			hp: Random.Int(2, 5)
		};

		this._mobs.push(mob);
	}

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
				this._mobs.splice(i, 1);
			}

			return;
		}
	};

	this.AddPlayer = function (id) {
		this._players.push(id);
	};

	this.RemovePlayer = function (id) {
		for (var i = 0; i < this._players.length; i++) {
			if (this._players[i] == id) {
				this._players.splice(i, 1);
				i--;
			}
		}
	};
};

module.exports = Room;
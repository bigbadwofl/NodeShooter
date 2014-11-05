var Random = require('./random.js');

function Room() {
	this._name = 'Room ' + Random.Int(1, 100);
	this._description = 'Description ' + Random.Int(1, 100);
	this._players = [];

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
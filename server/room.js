var Random = require('./random.js');

function Room() {
	this._name = 'Room ' + Random.Int(1, 100);
	this._description = 'Description ' + Random.Int(1, 100);
};

module.exports = Room;
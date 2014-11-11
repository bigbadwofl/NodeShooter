var Serializer = {
	_config: {
		ROOM: ['name', 'description', 'exits', 'players', 'items', 'mobs'],
		PLAYER: ['items', 'hp']
	},
	Serialize: function (type, object) {
		var config = this._config[type];
		var data = {};

		config.forEach(function (field) {
			data['_' + field] = object['_' + field];
		});	

		return data;
	}
};

module.exports = Serializer;
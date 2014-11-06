var Serializer = {
	_config: {
		ROOM: ['name', 'description', 'players', 'items', 'mobs'],
		PLAYER: ['items']
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
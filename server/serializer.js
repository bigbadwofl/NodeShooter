var Serializer = {
	_config: {
		ROOM: ['name', 'description']
	},
	Serialize: function (type, object) {
		var config = this._config[type];
		var data = {};

		config.forEach(function (field) {
			data[field] = object['_' + field];
		});	

		return data;
	}
};

module.exports = Serializer;
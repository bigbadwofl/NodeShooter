var unirest = require('unirest');

var GAE = {
	Set: function (entity, field, value, callback, scope) {
		var data = {
			ent: entity,
			field: field,
			value: value
		};

		this.AJAX('setData', data, callback, scope);
	},
	Get: function (entity, field, callback, scope) {
		var data = {
			ent: entity,
			field: field
		};

		this.AJAX('getData', data, callback, scope);
	},
	Check: function (entity, field, value, callback, scope) {
		var data = {
			ent: entity,
			field: field,
			value: value
		};

		this.AJAX('checkData', data, callback, scope);
	},
	AJAX: function (action, data, callback, scope) {
		data.game = 'MUD';

		unirest.post('http://big-bad-wofl.appspot.com/' + action)
		.headers({ 'Accept': 'application/json' })
		.send(data)
		.end(function (response) {
  			if (!callback)
    			return;

    		if (scope == null)
    			callback(response.body);
    		else
    			callback.call(scope, response.body);
		});
	}
};

module.exports = GAE;
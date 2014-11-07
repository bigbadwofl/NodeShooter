var Events = {
	_events: {},
	Add: function (event, object, method) {
		if (!this._events[event])
			this._events[event] = [];

		this._events[event].push({
			object: object,
			method: method
		});
	},
	Remove: function (event, object, method) {
		var list = this._events[event];
		if (!list)
			return;

		for (var i = 0; i < list.length; i++) {
			var l = list[i];

			if ((l.object == object) && (l.method == method)) {
				list.splice(i, 1);
				i--;
			}
		}
	},
	Fire: function (event, data) {
		this._events[event];
		if (!list)
			return;

		for (var i = 0; i < list.length; i++) {
			var l = list[i];

			l.object[l.method](data);
		}
	}
};

module.exports = Events;
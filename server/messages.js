var Messages = {
	Get: function (name, data) {
		var msg = this.Templates[name];

		for (var p in data) {
			msg = msg.replace('$' + p, data[p]);
		}

		return msg;
	},
	Templates: {
		TakeItem: '$player took: $item'
	}
};

module.exports = Messages;
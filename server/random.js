var Random = {
	Int: function (low, high) {
		return high || (high = low, low = 0), ~~this.Float(low, high + 1);
	},
	Float: function (low, high) {
		return high || (high = low, low = 0), low + Math.random() * (high - low);
	},
	El: function (data) {
		return data[this.Int(data.length - 1)];
	},
	Prop: function (data) {
		var count = 0;

		var temp = [];

		for (var p in data) {
			temp.push(data[p]);
		}

		return this.El(temp);
	}
};

 if (typeof module !== 'undefined' && module.exports)
	module.exports = Random;
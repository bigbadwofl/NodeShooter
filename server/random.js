var Random = {
	Int: function (low, high) {
		return high || (high = low, low = 0), ~~this.Float(low, high + 1);
	},
	Float: function (low, high) {
		return high || (high = low, low = 0), low + Math.random() * (high - low);
	},
	El: function (data) {
		return data[this.Int(data.length - 1)];
	}
};

module.exports = Random;
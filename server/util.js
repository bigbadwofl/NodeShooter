var Util = {
	Find: function (scope, array, predicate) {
		var index = this.FindIndex(scope, array, predicate);

		if (index == -1)
			return null;
		else
			return array[index];
	},
	FindIndex: function (scope, array, predicate) {
		for (var i = 0; i < array.length; i++) {
			var value = array[i];

			if (predicate.call(scope, value))
				return i;
		}

		return -1;
	},
	RemoveWhere: function (scope, array, predicate) {
		var index = this.FindIndex(scope, array, predicate);

		if (index == -1)
			return false;
		else {
			array.splice(index, 1);
			return true;
		}
	}
};

module.exports = Util;
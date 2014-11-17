var Items = {
	Build: function (id, data) {
		var itemData = null;
		var eq = false;

		if (id == 'gold') {
			itemData = {
				name: data + ' coins',
				value: data,
				slot: 'Misc'
			};
		}
		else {
			if (id.indexOf('|e') > -1) {
				eq = true;
				id = id.replace('|e', '');
			}

			itemData = Zones.City.Items[id];
		}

		var item = {
			id: id,
			name: itemData.name,
			value: itemData.value,
			slot: itemData.slot
		};

		eq && (item.eq = true);

		return item;
	}
};

module.exports = Items;
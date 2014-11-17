function Shop(id, mob) {
	var data = Zones.City.Shops[id];

	this._items = mob.items;
	this._name = data.name;
	this._priceScale = data.priceScale;
	this._mob = mob.name;

	this.ListItems = function (socket) {
		var list = [];

		for (var i = 0; i < this._items.length; i++) {
			var item = this._items[i];
			var itemData = Zones.City.Items[item];

			list.push({
				id: item,
				name: itemData.name,
				value: itemData.value * this._priceScale
			});
		}

		Server.SendResponse(socket, 'Shop', 'ListItems', {
			id: this._mob,
			name: this._name,
			items: list
		});
	};

	this.BuyItem = function (socket, item) {
		var player = Server.GetPlayer(socket.id);

		var itemData = Zones.City.Items[item];

		if (player._gold < itemData.value * this._priceScale) {
			Server.BroadcastMessage('FundsItem', { }, player, null);
			return;
		}

		player.GetItem(Items.Build(item));
		player._gold -= itemData.value * this._priceScale;

		Server.BroadcastMessage('BoughtItem', { name: itemData.name }, player, null);
		player.Sync();

		this.ListItems(socket);
	}
}

module.exports = Shop;
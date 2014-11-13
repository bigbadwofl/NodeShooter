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

			list.push({
				id: item.id,
				name: item.name,
				price: item.price * this._priceScale
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

		var item = Util.Find(this, this._items, function (i) {
			return (i.id == item);
		});

		player._items.push(item);
		Server.BroadcastMessage('BoughtItem', { name: item.name }, player, null);
	}
}

module.exports = Shop;
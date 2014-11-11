function Player() {
	this._items = [];
	this.followers = [];
	this._fighting = false;
	this._hp = 30;

	this.Follow = function (playerName) {
		var oldFollower = this._following;

		this.Unfollow();

		if ((playerName == null) || ((oldFollower != null) && (oldFollower.username == playerName)))
			return;

		var followPlayer = Server.GetPlayerName(playerName);

		this._following = followPlayer;

		followPlayer.followers.push(this);

		Server.SendMessage(this.socket, 'you start following ' + playerName);
		Server.SendMessage(followPlayer.socket, this.username + ' starts following you');
	};

	this.Unfollow = function() {
		if (this._following == null)
			return;

		var followPlayer = this._following;
		Util.RemoveWhere(this, followPlayer.followers, function(p) {
			return (p.username == this.username);
		});
		this._following = null;

		Server.SendMessage(this.socket, 'you stop following ' + followPlayer.username);
		Server.SendMessage(followPlayer.socket, this.username + ' stops following you');
	};
}

module.exports = Player;
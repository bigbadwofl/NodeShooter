function Player() {
	this._items = [];
	this.followers = [];
	this._fighting = false;
	this._hp = 10;
	this._xp = 0;
	this._xpMax = 10;
	this._level = 1;

	this.Follow = function (playerName) {
		var oldFollower = this._following;

		this.Unfollow();

		if ((playerName == null) || ((oldFollower != null) && (oldFollower.username == playerName)))
			return;

		var followPlayer = Server.GetPlayerName(playerName);

		this._following = followPlayer;

		followPlayer.followers.push(this);

		Server.BroadcastMessage('DoFollow', { name: followPlayer.username }, this, null);
		Server.BroadcastMessage('HearFollow', { name: this.username }, followPlayer, null);
	};

	this.GetXP = function (mob) {
		this._xp += mob.lvl;

		Server.BroadcastMessage('GetXP', { amount: mob.lvl }, this, null);

		if (this._xp >= this._xpMax) {
			this._xp -= this._xpMax;
			this._xpMax += this._xpMax;
			this._level++;
			this._hp = 9 + this._level;
			Server.BroadcastMessage('AdvanceLevel', { name: this.username }, this, this.room);
		}

		Server.SyncPlayer(this);
	};

	this.Die = function () {
		this._xp -= this._level;
		(this._xp < 0) && (this._xp = 0);

		this._hp = 10;

		Server.BroadcastMessage('Died', { name: this.username }, this, this.room);
		World.GetRoom(this.socket, { data: { id: 'r3' } });
		Server.SyncPlayer(this);
	};

	this.TakeDamage = function (mob) {
		this._hp -= mob.dmg;

		Server.BroadcastMessage('MobDoHit', { name: this.username, mob: mob.name, p: mob._prefix }, this, this.room);
	};

	this.Unfollow = function() {
		if (this._following == null)
			return;

		var followPlayer = this._following;
		Util.RemoveWhere(this, followPlayer.followers, function(p) {
			return (p.username == this.username);
		});
		this._following = null;

		Server.BroadcastMessage('DoUnfollow', { name: followPlayer.username }, this, null);
		Server.BroadcastMessage('HearUnfollow', { name: this.username }, followPlayer, null);
	};
}

module.exports = Player;
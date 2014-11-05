var socket = io();

var Renderer = {
    _ctx: null,
    Init: function() {
        var canvas = $('canvas')[0];

        canvas.width = 700;
        canvas.height = 700;

        this._ctx = canvas.getContext('2d');
    },
    Render: function() {
        Game._players.forEach(function(player) {
            Renderer._ctx.fillStyle = player._color;
            Renderer._ctx.fillRect(player._position.x, player._position.y, 10, 10);
        });
    }
};

var Game = {
    _username: 'player_' + Random.Int(10, 99),
    Init: function () {
        socket.on('Response', function (data) {
            window[data.type][data.method](data.data);
        });

        socket.emit('Player', { username: this._username });

        $('button').on('click', function () { World.RequestRoom() });
    }
};

var World = {
    RequestRoom: function () {
        $('#room-text').empty();

        socket.emit('Request', {
            type: 'World',
            method: 'GetRoom',
            data: {
                username: Game._username
            }
        });
    },
    GetRoom: function (data) {
        var players = '';
        data.players.forEach(function (player) {
            if (player != Game._username)
                players += player + '<br />';
        });

        $('#room-text').html(data.name + '<br />' + data.description + '<br />' + players);
    }
};
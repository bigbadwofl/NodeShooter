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
    Init: function () {
        socket.on('Response', function (data) {
            window[data.type][data.method](data.data);
        });

        $('button').on('click', function () { World.RequestRoom() });
    }
};

var World = {
    RequestRoom: function () {
        $('#room-text').empty();

        socket.emit('Request', {
            type: 'World',
            method: 'GetRoom'
        });
    },
    GetRoom: function (data) {
        $('#room-text').html(data.name + '<br />' + data.description);
    }
};
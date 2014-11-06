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

        $('#btnRoom').on('click', function () { World.RequestRoom(); });
        $('#btnShowLogin').on('click', function () { $('.overlay').show(); });

        $('#btnLogin').on('click', function () { 
            var username = $('#txtUsername').val();
            Game._username = username;
            Game.SendInfo();
            $('.overlay').hide();
        });

        $('#btnSave').on('click', function () { 
            socket.emit('Request', {
                type: 'Server',
                method: 'Save'
            });
        });
    },
    GetPlayer: function (data) {
        Player = data;
    },
    SendInfo: function () {
        socket.emit('Request', { 
            type: 'Server',
            method: 'SetName',
            data: {
                username: Game._username 
            }
        });
        World.RequestRoom();
    }
};

var World = {
    RequestRoom: function () {
        $('#btnRoom').prop('disabled', true);

        socket.emit('Request', {
            type: 'World',
            method: 'GetRoom',
            data: {
                username: Game._username
            }
        });
    },
    GetRoom: function (data) {
        $('#room-text div').empty();

        data._players.forEach(function (player) {
            if (player != Game._username) {
                $('<div>' + player + '</div>').appendTo($('#room-text .mobs'));
            }
        });

        data._items.forEach(function (item) {
            $('<div>' + item + '</div>')
            .appendTo($('#room-text .items'))
            .on('click', function () {
                socket.emit('Request', {
                    type: 'World',
                    method: 'GetItem',
                    data: {
                        name: $(this).html()
                    }
                });
            });
        });

        $('#room-text .name').html(data._name);
        $('#room-text .description').html(data._description);

        $('button').prop('disabled', false);
    }
};
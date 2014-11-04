var socket = io();

var Game = {
    _players: {},
    _ctx: null,
    _name: '',
    Init: function() {
        this._name = '_' + RI(1000, 9999);

        var canvas = $('canvas')[0];

        canvas.width = 700;
        canvas.height = 700;

        this._ctx = canvas.getContext('2d');

        socket.emit('Connect', this._name);

        socket.on('Connect', function (msg) {
            Game.Connect(msg);
        });

        socket.on('Notify', function (msg) {
            Game.Notify(msg);
        });

        $('body').on('keydown', function (event) {
            var key = String.fromCharCode(event.keyCode);

            if (key == 'D')
                socket.emit('Move', Game._name + '$1|0');
            if (key == 'A')
                socket.emit('Move', Game._name + '$-1|0');
            if (key == 'W')
                socket.emit('Move', Game._name + '$0|-1');
            else if (key == 'S')
                socket.emit('Move', Game._name + '$0|1');
        });

        socket.on('Move', function (msg) {
            var data = msg.split('$');
            Game.Move(data[0], data[1]);
        });
    },
    Notify: function (msg) {
        var data = msg.split('$');

       this._players[data[0]] = new Player();
       var pos = data[1].split('|');
       this._players[data[0]]._color = pos[0];
       this._players[data[0]]._x = pos[1]|0;
       this._players[data[0]]._y = pos[2]|0;
    },
    Connect: function (name) {
        this._players[name] = new Player();

        var p = this._players[this._name];
        socket.emit('Notify', this._name + '$' + p._color + '|' + p._x + '|' + p._y);
    }, 
    Move: function (name, data) {
        var d = data.split('|');
        this._players[name].Move(d[0] | 0, d[1] | 0);

        this._ctx.clearRect(0, 0, 700, 700);

        for (var p in this._players) {
            var player = this._players[p];
            player.Render();
        }
    }
};

function Player() {
    this._x = 10;
    this._y = 10;

    this._color = ['red', 'green', 'blue', 'cyan', 'magenta', 'black'][RI(5)];

    this.Move = function(x, y) {
        this._x += x;
        this._y += y;
    };

    this.Render = function() {
        Game._ctx.fillStyle = this._color;
        Game._ctx.fillRect(this._x, this._y, 10, 10);
    };
}

function RF(a, b) {
    return b || (b = a, a = 0), a + Math.random() * (b - a)
}

function RI(a, b) {
    return b || (b = a, a = 0), ~~RF(a, b + 1)
}
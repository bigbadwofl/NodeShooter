var socket = io();

var Game = {
    _players: {},
    _ctx: null,
    _name: '',
    Init: function() {
        this._name = '_' + RI(1000, 9999);

        I.Init();

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

            if (key == 'A')
                socket.emit('Move', Game._name + '$1|0');
            else if (key == 'S')
                socket.emit('Move', Game._name + '$0|1');
        });

        socket.on('Move', function (msg) {
            var data = msg.split('$');
            Game.Move(data[0], data[1]);
        });

        setInterval(Game.Update, 15);
    },
    Notify: function (msg) {
        var data = msg.split('$');

       this._players[data[0]] = new Player();
       var pos = data[1].split('|');
       this._players[data[0]]._x = pos[0]|0;
       this._players[data[0]]._y = pos[1]|0;
    },
    Connect: function (name) {
        this._players[name] = new Player();

        var p = this._players[this._name];
        socket.emit('Notify', this._name + '$' + p._x + '|' + p._y);
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

    this.Move = function(x, y) {
        this._x += x;
        this._y += y;
    };

    this.Render = function() {
        Game._ctx.fillStyle = 'red';
        Game._ctx.fillRect(this._x, this._y, 10, 10);
    };
}

var L = 'length';
var SL = 'slice';
var PS = 'push';

var I = {
    keys: [],
    keyStates: [],
    Init: function() {
        document.body.onkeydown = this.KeyDown,
        document.body.onkeyup = this.KeyDown
    },
    KeyDown: function(a, b, c, d, k, s) {
        for (b = String.fromCharCode(a.keyCode),
            c = "keyup" != a.type,
            d = -1,
            i = -1,
            k = I.keys,
            s = I.keyStates; ++i < k[L];)
            if (k[i] == b) return d = i, c || (k[SL](i, 1), s[SL](i, 1));
        c && (-1 == d ? (k[PS](b), s[PS](1)) : s[d]++)
    },
    Key: function(a, b, d, e, k, s) {
        k = this.keys, s = this.keyStates;
        for (i = 0; i < k[L]; i++) {
            d = k[i];
            if (d == a) {
                e = s[i] > 0;
                return b && (k[SL](i, 1), s[SL](i, 1)), e
            }
        }
        return !1
    },
    Keys: function(a, b, c) {
        for (c = [], i = 0; i < a[L]; i++) null != a[i] ? c[PS](this.CheckKeyDown(a[i], b)) : c[PS](!1);
        return c
    }
};

function P(a, b, c, d) {
    return .4202 * (.7 * PN(2 * a / c, 2 * b / c) + .49 * PN(4 * a / c, 4 * b / c) + 1.19) * d
}

function PG(a, b, c) {
    return c = ~~a + 57 * ~~b, c = c << 12 ^ c, 1 - (2147483647 & ~~(c * (60493 * c * c + 19990303) + 1376312589 + "")[SS](2, 18)) / 1073741824
}

function PN(a, b, c, d) {
    return c = ~~a, d = ~~b, PI(PI(PG(c, d), PG(c + 1, d), a - c), PI(PG(c, d + 1), PG(c + 1, d + 1), a - c), b - d)
}

function PI(a, b, c, d) {
    return d = (1 - MC(3.14 * c)) / 2, a * (1 - d) + b * d
}

function RF(a, b) {
    return b || (b = a, a = 0), a + Math.random() * (b - a)
}

function RI(a, b) {
    return b || (b = a, a = 0), ~~RF(a, b + 1)
}

function RE(a) {
    return a[RI(a[L] - 1)]
}

function RN(a, b, c, d) {
    for (b || (b = a, a = 0), d = 0, c = 0; ++d < 5; c += RF(1));
    return a + (c - 2) / 2 * b
}

function RNA(a, b) {
    return MA(RN(a, b))
}

function RNE(a) {
    return a[~~RNA(a[L] - 1)]
}
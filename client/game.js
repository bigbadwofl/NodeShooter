var socket = io();

var Game = {
    _username: '',
    Init: function () {
        socket.on('Response', function (data) {
            window[data.type][data.method](data.data);
        });

        $('#btnShowLogin').on('click', function() {
            Util.ShowHide('.overlay');
        });

        $('#btnLogin').on('click', function() {
            var username = $('#txtUsername').val();
            Game._username = username;

            Game.SendRequest('Server', 'SetName', { username: Game._username });

            $('#info').empty();
            Util.ShowHide('!#inventory #buttonPanel');
        });

        $('#btnInventory').on('click', function() {
            $('#inventory-heading').html('Inventory');
            Util.ShowHide('#inventory !#buttonPanel');
        });

        $('#btnCloseInventory').on('click', function() {
           Util.ShowHide('!#inventory #buttonPanel');
        });

        $('#btnChat').on('click', function () {
            $('#txtChat').val('');
            Util.ShowHide('!.xp-box .chat-box');
        });

        $('#btnSendChat').on('click', function () {
            Game.SendRequest('World', 'SendMessage', { message: $('#txtChat').val() });
            Util.ShowHide('.xp-box !.chat-box');
        });

        $('#btnCancelChat').on('click', function () {
            Util.ShowHide('.xp-box !.chat-box');
        });

        Util.ShowHide('!.chat-box');
    },
    GetPlayer: function (data) {
        if (!$('#game').is(':visible'))
            Util.ShowHide('!.overlay #game');

        Player = data;

        var itemDiv = $('#inventory-contents');
        itemDiv.empty();
        Player._items.forEach(function (item) {
            $('<span>' + item.name + '</span>')
            .appendTo(itemDiv)
            .attr('id', item.id)
            .on('click', function () {
                Game.SendRequest('World', 'DropItem', {
                    id: $(this).attr('id'),
                    name: $(this).html()
                });
            });
        });

        //XP Bar
        $('.xp').css('width', ~~(data._xp * 100) + '%');
        $('.xp-box span').html('level ' + data._level);

        $('#hud').html('hp: ' + Player._hp);
    },
    Disconnect: function () {
        Util.ShowHide('.overlay !#game');
    },
    GetMessage: function (data) {
        var div = $('#info');
        var html = div.html();

        data.type || (data.type = 'combat');

        var className = 'class="message-' + data.type + '"';

        html += '<span ' + className + '>' + data.message + '</span>';
        div.html(html);

        div = div[0];
        div.scrollTop = div.scrollHeight;
    },
    SendInfo: function () {
        Util.ShowHide('.overlay !#game');
    },
    SendRequest: function (type, method, data) {
        socket.emit('Request', {
            type: type,
            method: method,
            data: data
        });
    }
};

var Shop = {
    _shopID: -1,
    ListItems: function (data) {
        this._shopID = data.id;

        Util.ShowHide('#inventory !#buttonPanel');

        $('#inventory-heading').html(data.name);
        var contentDiv = $('#inventory-contents');
        contentDiv.empty();

        data.items.forEach(function (item) {
            $('<span>' + item.name + '</span>')
            .appendTo(contentDiv)
            .attr('id', item.id)
            .on('click', function () {
                console.log(this._sho)
                Game.SendRequest('World', 'BuyItem', { mob: Shop._shopID, item: $(this).attr('id') });
            });
        });
    }
};

var World = {
    GetRoom: function (data) {
        $('#room-text div').empty();

        var buttonPanel = $('#buttonPanel');
        buttonPanel.find('.exitButton').remove();
        for (var direction in data._exits) {
            var exitTo = data._exits[direction];

            $('<button class="exitButton">' + direction + '</button>')
                .appendTo(buttonPanel)
                .on('click', function () {
                    Game.SendRequest('World', 'Move', { direction: $(this).html() });
                });
        }

        data._players.forEach(function (player) {
            if (player != Game._username) {
                $('<div>' + player + '</div>')
                .appendTo($('#room-text .players'))
                .on('click', function () {
                    //Game.SendRequest('World', 'Follow', { name: $(this).html() });
                });
            }
        });

        data._mobs.forEach(function (mob) {
            var mobString = mob.name + ' (' + mob.hp + ' hp)';
            $('<div>' + mobString + '</div>')
            .appendTo($('#room-text .mobs'))
            .attr('name', mob.name)
            .on('click', function () {
                Game.SendRequest('World', 'AttackMob', { name: $(this).attr('name') }) 
            });
        });

        data._items.forEach(function (item) {
            $('<div>' + item + '</div>')
            .appendTo($('#room-text .items'))
            .on('click', function () { 
                Game.SendRequest('World', 'GetItem', { name: $(this).html() }) 
            });
        });

        $('#room-text .name').html(data._name);
        $('#room-text .description').html(data._description);

        $('button').prop('disabled', false);
    }
};

var Util = {
    ShowHide: function (dataString) {
        var data = dataString.split(' ');

        data.forEach(function (el) {
            var method = 'show';
            (el[0] == '!') && (method = 'hide') && (el = el.substring(1, el.length));
            $(el)[method]();
        });
    }
};
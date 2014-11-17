var socket = io();

var Game = {
    _username: '',
    Init: function () {
        socket.on('Response', function (data) {
            window[data.type][data.method](data.data);
        });

        $('#btnLogin').on('click', function() {
            var username = $('#txtUsername').val();
            Game._username = username;

            Game.SendRequest('Server', 'SetName', { username: Game._username });

            $('#info').empty();
        });

        $('#btnInventory').on('click', function() {
            Inventory.ListItems();

            $('#inventory-heading').html('Inventory');
            GameStates.Set('sidebar');
        });

         $('#btnEquipment').on('click', function() {
            Equipment.ListItems();

            $('#inventory-heading').html('Equipment');
            GameStates.Set('sidebar');
        });

        $('#btnCloseInventory').on('click', function() {
           GameStates.Set('sidebuttons');
        });

        $('#btnChat').on('click', function () {
            $('#txtChat').val('');
            GameStates.Set('bottomchat');
        });

        $('#btnSendChat').on('click', function () {
            Game.SendRequest('World', 'SendMessage', { message: $('#txtChat').val() });
            GameStates.Set('bottomxp');
        });

        $('#btnCancelChat').on('click', function () {
            GameStates.Set('bottomxp');
        });
    },
    GetPlayer: function (data) {
        if (GameStates._state != 'game')
            GameStates.Set('game');

        Player = data;

        if (($('#inventory').is(':visible')) && ($('#inventory-heading').html() == 'Inventory'))
            Inventory.ListItems();
        else if (($('#inventory').is(':visible')) && ($('#inventory-heading').html() == 'Equipment'))
            Equipment.ListItems();

        //XP Bar
        $('.xp').css('width', ~~(data._xp * 100) + '%');
        $('.xp-box span').html('level ' + data._level);

        $('#hud').html('hp: ' + Player._hp);
    },
    Disconnect: function () {
        GameSates.Set('login');
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

        GameStates.Set('sidebar');

        $('#inventory-heading').html(data.name);
        var contentDiv = $('#inventory-contents');
        contentDiv.empty();

        data.items.forEach(function (item) {
            $('<span>' + item.name + ' (' + item.value + ')</span>')
            .appendTo(contentDiv)
            .attr('id', item.id)
            .attr('value', item.value)
            .on('click', function () {
                Game.SendRequest('World', 'BuyItem', { mob: Shop._shopID, item: $(this).attr('id') });
            });
        });

         $('<span id="shopGold">' + Player._gold + ' coins</span>')
        .appendTo(contentDiv);
    }
};

var Inventory = {
    ListItems: function () {
        GameStates.Set('sidebar');

        $('#inventory-heading').html('Inventory');
        var contentDiv = $('#inventory-contents');
        contentDiv.empty();

        Player._items.forEach(function (item) {
            if (item.eq)
                return;

            $('<span>' + item.name + '</span>')
            .appendTo(contentDiv)
            .on('mousedown', function (e) {
                if (e.button == 0) {
                    Game.SendRequest('Player', 'DropItem', $(this).html());
                }
                else if (e.button == 2) {
                    Game.SendRequest('Player', 'EquipItem', $(this).html());
                }
            });
        });

        $('<span>' + Player._gold + ' coins</span>').appendTo(contentDiv)
    }
};

var Equipment = {
    ListItems: function () {
        GameStates.Set('sidebar');

        $('#inventory-heading').html('Equipment');
        var contentDiv = $('#inventory-contents');
        contentDiv.empty();

        Player._items.forEach(function (item) {
            if (!item.eq)
                return;

            $('<span>' + item.slot + ': ' + item.name + '</span>')
            .appendTo(contentDiv)
            .attr('name',item.name)
            .on('click', function () {
                 Game.SendRequest('Player', 'UnequipItem', $(this).attr('name'));
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
                Game.SendRequest('World', 'AttackMob', { name: $(this).attr('name') });
            });
        });

        data._items.forEach(function (item) {
            $('<div>' + item + '</div>')
            .appendTo($('#room-text .items'))
            .on('click', function () { 
                Game.SendRequest('Room', 'GetItem', $(this).html());
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

var GameStates = {
    _state: 'login',
    _game: '!.overlay #game .xp-box',
    _login: '.overlay !#game',
    _sidebar: '#inventory !#buttonPanel',
    _sidebuttons: '!#inventory #buttonPanel',
    _bottomchat: '!.xp-box .chat-box',
    _bottomxp: '.xp-box !.chat-box',
    Set: function (name) {
        this._state = name;
        Util.ShowHide(this['_' + name]);
    }
};
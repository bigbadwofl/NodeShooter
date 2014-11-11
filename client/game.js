var socket = io();

var Game = {
    _username: 'player_' + Random.Int(100, 999),
    Init: function () {
        console.log('blaaaa');
        socket.on('Response', function (data) {
            window[data.type][data.method](data.data);
        });

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

        $('#btnInventory').on('click', function () { 
            $('#inventory').show();
            $('#buttonPanel').hide();
        });

        $('#btnCloseInventory').on('click', function () {
            $('#inventory').hide();
            $('#buttonPanel').show();
        });
    },
    GetPlayer: function (data) {
        Player = data;

        var itemDiv = $('#inventory-contents');
        itemDiv.empty();
        Player._items.forEach(function (item) {
            $('<span>' + item.name + '</span>')
            .appendTo(itemDiv)
            .attr('id', item.id)
            .on('click', function () {
                var itemName = $(this).html();
                socket.emit('Request', {
                    type: 'World',
                    method: 'DropItem',
                    data: {
                        id: $(this).attr('id'),
                        name: $(this).html()
                    }
                });
            });
        });

        $('#hud').html('hp: ' + Player._hp);
    },
    GetMessage: function (data) {
        var div = $('#info');
        var html = div.html();
        html += '<span>' + data.message + '</span>';
        div.html(html);

        div = div[0];
        div.scrollTop = div.scrollHeight;
    },
    SendInfo: function () {
        socket.emit('Request', { 
            type: 'Server',
            method: 'SetName',
            data: {
                username: Game._username 
            }
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
                    socket.emit('Request', {
                        type: 'World',
                        method: 'Move',
                        data: {
                            direction: $(this).html()
                        }
                    });
                });
        }

        data._players.forEach(function (player) {
            if (player != Game._username) {
                $('<div>' + player + '</div>')
                .appendTo($('#room-text .players'))
                .on('click', function () {
                    socket.emit('Request', {
                        type: 'World',
                        method: 'Follow',
                        data: {
                            name: $(this).html()
                        }
                    });
                });
            }
        });

        data._mobs.forEach(function (mob) {
            var mobString = mob.name + ' (' + mob.hp + ' hp)';
            $('<div>' + mobString + '</div>')
            .appendTo($('#room-text .mobs'))
            .attr('name', mob.name)
            .on('click', function () {
                socket.emit('Request', {
                    type: 'World',
                    method: 'AttackMob',
                    data: {
                        name: $(this).attr('name')
                    }
                });
            });
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
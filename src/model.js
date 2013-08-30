var createHexModel = function (fig) {
    'use strict';

    var that = jsMessage.mixinPubSub(),
        size = fig.size,
        board = null,
        publishBoard = function () {
            that.publish('board', board);
        };

    that.getBoard = function () {
        return board;
    };

    that.getTile = function (coord) {
        return board[stringKey(coord)];
    };

    that.setBoard = function (newBoard) {
        board = newBoard;
        publishBoard();
    };

    that.setTile = function () {//coord, data) {

        if(_.isArray(arguments[0])) {
            that.setTile.apply(that, arguments[0]);
        }
        else {
            _.each(arguments, function (data) {
                var tile = that.getTile(data.coord);
                delete data.coord;
                _.each(data, function (val, key) {
                    tile[key] = val;
                });
            });

            publishBoard();
        }
    };

    that.focus = (function () {
        var lastCoord = {};
        return function (coord) {
            var thisHex, lastHex;
            if(!_.isEqual(coord, lastCoord)) {
                thisHex = board[stringKey(coord)];
                lastHex = board[stringKey(lastCoord)];

                if(lastHex) {
                    lastHex.focus = false;
                }
                if(thisHex) {
                    thisHex.focus = true;
                }

                lastCoord = coord;
                publishBoard();
            }
        };
    }());

    return that;
};

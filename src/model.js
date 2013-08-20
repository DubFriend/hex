var createHexModel = function (fig) {
    'use strict';
    var that = jsMessage.mixinPubSub(),
        size = fig.size,
        board = (function () {
            var board = {};
            _.each(hexagonOfCoordinates(size), function (coord) {
                board[coord.x + ',' + coord.y] = {};
            });
            board['0,0'].height = 1;
            return board;
        }()),

        publishBoard = function () {
            that.publish('board', board);
        },

        axialToCubic = function (axial) {};

    that.getBoard = function () {
        return board;
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

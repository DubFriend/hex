var createHexModel = function (fig) {
    'use strict';

    var facesCoord = [
        { x: 7, y: 4 }, { x: 7, y: 163 },
        { x: 126, y: 4 }, { x: 126, y: 163 },
        { x: 245, y: 4 }, { x: 245, y: 163 },
        { x: 364, y: 4 }, { x: 364, y: 163 },
        { x: 483, y: 4 }
    ];

    var that = jsMessage.mixinPubSub(),
        size = fig.size,
        board = (function () {
            var board = {};
            _.each(hexagonOfCoordinates(size), function (coord) {
                board[coord.x + ',' + coord.y] = {
                    clipCoord: facesCoord[_.random(facesCoord.length - 1)]
                };
            });
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

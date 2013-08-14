(function () {
'use strict';

//using axial coordinate system
//http://www.redblobgames.com/grids/hexagons/#coordinates

var parseKey = function (stringKey) {
    var numbers = stringKey.split(',');
    return {
        x: Number(numbers[0]),
        y: Number(numbers[1])
    };
};

var stringKey = function (objectKey) {
    return objectKey.x + ',' + objectKey.y;
};

window.createHex = function (fig) {
    var that = {},
        view = fig.view,
        size = fig.size,
        board = (function () {
            var board = {};
            _.each(_.range(-size + 1, size), function (x) {
                _.each(_.range(-size + 1, size), function (y) {
                    if(Math.abs(x + y) < size) {
                        board[x + ',' + y] = null;
                    }
                });
            });
            return board;
        }()),

        axialToCubic = function (axial) {};

    that.drawBoard = function (center) {
        view.drawHexagonalGrid(board, center);
    };

    return that;
};

window.createHexView = function (fig) {
    var that = {},
        ctx = fig.context,

        WIDTH = fig.width,
        HEIGHT = fig.height,

        radius = fig.radius || 40,
        shortLeg = radius / 2,
        longLeg = radius * Math.sqrt(3) / 2,

        screenCenter = {
            x: WIDTH / 2,
            y: HEIGHT / 2
        },

        coordToPixels = function (coord, center) {
            return {
                x: coord.x * 1.5 * radius + screenCenter.x,
                y: coord.y * longLeg * 2 + coord.x * longLeg + screenCenter.y
            };
        },

        isCoordOnScreen = function (pixel) {
            return ( pixel.x >= 0 && pixel.x < WIDTH &&
                     pixel.y >= 0 && pixel.y < HEIGHT );
        };

    //radius is distance from center to vertex in pixels
    that.drawHexagon = function (fig) {
        var x = fig.center.x,
            y = fig.center.y;

        ctx.strokeStyle = 'rgb(150, 150, 80)';
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        _.each(_.range(Math.PI/3, 2*Math.PI, Math.PI/3), function (deg) {
            ctx.lineTo(
                x + Math.cos(deg) * radius,
                y + Math.sin(deg) * radius
            );
        });
        ctx.closePath();
        ctx.stroke();
    };

    that.drawHexagonalGrid = function (board, center) {
        _.each(board, function (val, key) {
            var coord = parseKey(key),
                pixel = coordToPixels(coord, center);

            if(isCoordOnScreen(pixel)) {
                that.drawHexagon({
                    center: {
                        x: pixel.x + center.x,
                        y: pixel.y + center.y
                    },
                    coord: coord
                });
            }
        });
    };

    return that;
};


}());

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

var addVector = function (a, b) {
    return {
        x: a.x + b.x,
        y: a.y + b.y
    };
};

window.createHex = function (fig) {
    var that = {},
        //view = fig.view,
        size = fig.size,
        board = (function () {
            var board = {};
            _.each(_.range(1 - size, size), function (x) {
                _.each(_.range(1 - size, size), function (y) {
                    if(Math.abs(x + y) < size) {
                        board[x + ',' + y] = null;
                    }
                });
            });
            return board;
        }()),

        axialToCubic = function (axial) {};

    that.getBoard = function () {
        return board;
    };

    //that.drawBoard = function (center) {
    //    view.clear();
    //    view.drawHexagonalGrid(board, center);
    //};

    return that;
};

window.createHexView = function (fig) {
    var that = {},
        ctx = fig.context,

        WIDTH = fig.width,
        HEIGHT = fig.height,

        radius = fig.radius || 40,
        longLeg = radius * Math.sqrt(3) / 2,
        //shortLeg = radius / 2,

        screenCenter = {
            x: WIDTH / 2,
            y: HEIGHT / 2
        },

        coordToPixels = function (coord, center) {
            return {
                x: Math.round(coord.x * 1.5 * radius - center.x + screenCenter.x),
                y: Math.round(coord.y * longLeg * 2 + coord.x * longLeg - center.y + screenCenter.y)
            };
        },

        //returns coordinates of closest coordinates, pixel distance from the center.
        pixelToCoord = function (pixel) {
            var x = Math.round(pixel.x / (1.5 * radius));
            var y = Math.round(-x / 2) + Math.round(pixel.y / (2 * longLeg));
            return {
                x: x,
                y: y
            };
        },

        isPixelOnScreen = function (pixel) {
            return ( pixel.x >= 0 && pixel.x < WIDTH &&
                     pixel.y >= 0 && pixel.y < HEIGHT );
        },

        //generate a list of only board coordinates that are on screen.
        //note that this method doesnt check if coordinates exist on actual game board.
        //also right now it's returning a parallelogram shape (some squares arent on board)
        coordOnScreen = (function () {
            var hexWidth = Math.round((WIDTH / (radius * 1.5)) / 2 + 1),
                hexHeight = Math.round((HEIGHT / (longLeg * 2)) / 2 * 2);
            return function (center) {
                var centerHex = pixelToCoord(center);
                var coord = [];
                _.each(_.range(1-hexWidth, hexWidth), function (x) {
                    _.each(_.range(1-hexHeight, hexHeight), function (y) {
                        coord.push({
                            x: centerHex.x + x,
                            y: centerHex.y + y
                        });
                    });
                });
                return coord;
            };
        }());

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

        ctx.fillText(fig.coord.x + ", " + fig.coord.y, x, y);
    };


    that.drawHexagonalGrid = function (board, center) {
        _.each(coordOnScreen(center), function (coord) {
            var pixel = coordToPixels(coord, center);
            if(board[stringKey(coord)] !== undefined && isPixelOnScreen(pixel)) {
                that.drawHexagon({ center: pixel, coord: coord });
            }
        });
    };

    that.clear = function () {
        ctx.clearRect(0, 0, WIDTH, HEIGHT);
    };

    return that;
};


window.createHexController = function (fig) {
    var that = {},
        model = fig.model,
        view = fig.view,
        center = { x: 0, y: 0 },
        velocity = { x: 0, y: 0 },
        WIDTH = fig.width,
        HEIGHT = fig.height;

    that.drawBoard = function () {
        view.clear();
        center = addVector(center, velocity);
        view.drawHexagonalGrid(model.getBoard(), center);
    };

    that.tick = function () {
        that.drawBoard();
    };

    that.borderScroll = function (pixel) {
        var direction = addVector(pixel, { x: -WIDTH / 2, y: -HEIGHT / 2 });
        velocity.x = 0;
        velocity.y = 0;
        if(direction.x > 100) {
            velocity.x = 2;
        }
        else if(direction.x < -100) {
            velocity.x = -2;
        }
        if(direction.y > 100) {
            velocity.y = 2;
        }
        else if(direction.y < -100){
            velocity.y = -2;
        }
    };

    return that;
};


}());

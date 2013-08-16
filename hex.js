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

//note: sign(0) === 1
var sign = function (x) {
    return x < 0 ? -1 : 1;
};


window.createHexModel = function (fig) {
    var that = {},
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

    return that;
};


//rendering only
window.createHexDraw = function (ctx) {
    var that = {};

    that.hexagon = function (fig) {
        var x = fig.center.x,
            y = fig.center.y,
            radius = fig.radius;

        ctx.strokeStyle = 'rgb(150, 150, 80)';
        ctx.fillStyle = 'rgb(0, 71, 111)';
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        _.each(_.range(Math.PI/3, 2*Math.PI, Math.PI/3), function (deg) {
            ctx.lineTo(
                x + Math.cos(deg) * radius,
                y + Math.sin(deg) * radius
            );
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.strokeText(fig.coord.x + ", " + fig.coord.y, x, y);
    };

    that.clear = function () {
        ctx.clearRect(0, 0, SCREEN.width, SCREEN.height);
    };

    return that;
};


//view based logic only, no rendering (use createHexDraw)
window.createHexView = function (fig) {
    var that = {},
        draw = fig.draw,
        radius = fig.radius || 40,
        longLeg = radius * Math.sqrt(3) / 2,
        //shortLeg = radius / 2,
        screenCenter = { x: SCREEN.width / 2, y: SCREEN.height / 2 },

        coordToPixels = function (coord, center) {
            return {
                x: Math.round(coord.x * 1.5 * radius - center.x + screenCenter.x),
                y: Math.round(coord.y * longLeg * 2 + coord.x * longLeg - center.y + screenCenter.y)
            };
        },

        //returns coordinates of closest coordinates, pixel distance from the center.
        pixelToCoord = function (pixel) {
            var x = Math.round(pixel.x / (1.5 * radius)),
                y = Math.round(-x / 2) + Math.round(pixel.y / (2 * longLeg));
            return { x: x, y: y };
        };

        //isPixelOnScreen = function (pixel) {
        //    return ( pixel.x >= 0 && pixel.x < SCREEN.width &&
        //             pixel.y >= 0 && pixel.y < SCREEN.height );
        //};

    //public for testing purposes only
    that.coordOnScreen = (function () {
        var hexWidth = Math.floor((SCREEN.width/ (radius * 1.5)) / 2 + 2),
            hexHeight = Math.floor(((SCREEN.height) / (longLeg * 2)) / 2 + 3),

            hexRange = function (xDiff) {
                var shift = -Math.floor(Math.abs(xDiff / 2)) * sign(xDiff),
                    cut = xDiff % 2 === 1 && sign(xDiff) === 1 ? -1 : 0;

                return _.range(
                    1 - hexHeight + shift + cut,
                    hexHeight + shift + cut
                );
            };

        return function (center) {
            return _.flatten(_.map(_.range(1-hexWidth, hexWidth), function (x) {
                return _.map(hexRange(x), function (y) {
                    return addVector(pixelToCoord(center), { x: x, y: y });
                });
            }));
        };

    }());

    that.drawHexagonalGrid = function (board, center) {
        _.each(that.coordOnScreen(center), function (coord) {
            if(board[stringKey(coord)] !== undefined ) {
                draw.hexagon({
                    center: coordToPixels(coord, center),
                    coord: coord,
                    radius: radius
                });
            }
        });
    };

    that.clear = function () {
        draw.clear();
    };

    return that;
};


window.createHexController = function (fig) {
    var that = {},
        model = fig.model,
        view = fig.view,
        center = { x: 0, y: 0 },
        velocity = { x: 0, y: 0 },

        drawBoard = function () {
            view.clear();
            center = addVector(center, velocity);
            view.drawHexagonalGrid(model.getBoard(), center);
        };

    that.tick = function () {
        drawBoard();
    };

    that.borderScroll = (function () {
        var calculateBorderVelocity = function (direction, length) {
            var velocity = 0;
            if(Math.abs(direction) > length / 6) {
                velocity = Math.round(
                    direction / Math.abs(direction) * (Math.abs(direction) - length / 6) / 20
                );
            }
            return velocity;
        };

        return function (pixel) {
            var direction = addVector(pixel, {
                x: -SCREEN.width / 2,
                y: -SCREEN.height / 2
            });
            velocity.x = calculateBorderVelocity(direction.x, SCREEN.width);
            velocity.y = calculateBorderVelocity(direction.y, SCREEN.height);
        };
    }());

    return that;
};


}());

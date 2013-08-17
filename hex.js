
//using axial coordinate system
//http://www.redblobgames.com/grids/hexagons/#coordinates

//canvas dimensions. (assigned values after canvas is created)
var SCREEN = { width: null, height: null };


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
    var combined = {};
    _.each(a, function (val, key) {
        combined[key] = val + b[key];
    });
    return combined;
};

//note: sign(0) === 1
var sign = function (x) {
    return x < 0 ? -1 : 1;
};

var toPolar = function (cartesian) {
    var x = cartesian.x, y = cartesian.y,
        theta = Math.abs(x) > 0.001 ? Math.atan(y/x) : Math.PI / 2 * -sign(y);

    theta += x <= 0 && y <= 0 || x <= 0 && y > 0 ? Math.PI : 0;

    return {
        radius: Math.round(Math.sqrt(x * x + y * y)),
        theta: theta
    };
};

var toCartesian = function (polar) {
    return {
        x: Math.round(polar.radius * Math.cos(polar.theta)),
        y: Math.round(polar.radius * Math.sin(polar.theta))
    };
};

var toRadian = function (deg) {
    return Math.PI * deg / 180;
};

var toDegree = function (rad) {
    return 180 * rad / Math.PI;
};



var createHexModel = function (fig) {
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
var createHexDraw = function (ctx) {
    var that = {};

    that.hexagon = function (fig) {
        var x = fig.center.x,
            y = fig.center.y,
            radius = fig.radius,
            tilt = fig.tilt;

        ctx.strokeStyle = 'rgb(150, 150, 80)';
        ctx.fillStyle = 'rgb(0, 71, 111)';
        ctx.beginPath();
        ctx.moveTo(x + radius * Math.cos(tilt), y + radius * Math.sin(tilt));
        _.each(_.range(Math.PI/3, 2*Math.PI, Math.PI/3), function (deg) {
            ctx.lineTo(
                x + Math.cos(deg + tilt) * radius,
                y + Math.sin(deg + tilt) * radius
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
var createHexView = function (fig) {
    var that = {},
        draw = fig.draw,
        radius = fig.radius || 40,
        longLeg = radius * Math.sqrt(3) / 2,
        //shortLeg = radius / 2,
        screenCenter = { x: SCREEN.width / 2, y: SCREEN.height / 2 },

        coordToPixels = function (coord, center, tilt) {
            return addVector(
                toCartesian(addVector(
                    toPolar({
                        x: coord.x * 1.5 * radius - center.x,
                        y: coord.y * longLeg * 2 + coord.x * longLeg - center.y
                    }),
                    { radius: 0, theta: tilt }
                )),
                screenCenter
            );
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

    that.drawHexagonalGrid = function (board, center, tilt) {
        _.each(that.coordOnScreen(center), function (coord) {
            if(board[stringKey(coord)] !== undefined ) {
                draw.hexagon({
                    center: coordToPixels(coord, center, tilt),
                    coord: coord,
                    radius: radius,
                    tilt: tilt
                });
            }
        });
    };

    that.clear = function () {
        draw.clear();
    };

    return that;
};



var createHexController = function (fig) {
    var that = {},
        model = fig.model,
        view = fig.view,
        center = { x: 0, y: 0 },
        velocity = { x: 0, y: 0 },
        tilt = 0,

        drawBoard = function () {
            view.clear();
            center = addVector(center, velocity);
            view.drawHexagonalGrid(model.getBoard(), center, tilt);
        };

    that.tick = function () {
        drawBoard();
    };

    that.rotate = function (diff) {
        tilt += toRadian(diff);
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
                }),

                untilted = {
                    x: calculateBorderVelocity(direction.x, SCREEN.width),
                    y: calculateBorderVelocity(direction.y, SCREEN.height)
                };

            velocity = toCartesian(addVector(
                toPolar(untilted),
                { radius: 0, theta: -tilt }
            ));
        };
    }());

    return that;
};

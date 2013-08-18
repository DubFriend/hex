
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
        radius: Math.sqrt(x * x + y * y),
        theta: theta
    };
};

var toCartesian = function (polar) {
    return {
        x: polar.radius * Math.cos(polar.theta),
        y: polar.radius * Math.sin(polar.theta)
    };
};

var toRadian = function (deg) {
    return Math.PI * deg / 180;
};

var toDegree = function (rad) {
    return 180 * rad / Math.PI;
};

//returns axial coordinates of dimensions +-size for both axies (0 indexed)
var hexagonOfCoordinates = function (size, center) {
    center = center || { x: 0, y: 0 };
    var coords = [];
    _.each(_.range(1 + center.x - size, center.x + size), function (x) {
        _.each(_.range(1 + center.y - size, center.y + size), function (y) {
            if(Math.abs(x - center.x + y - center.y) < size) {
                coords.push({ x: x, y: y });
            }
        });
    });
    return coords;
};



var createHexModel = function (fig) {
    'use strict';
    var that = {},
        size = fig.size,
        board = (function () {
            var board = {};
            _.each(hexagonOfCoordinates(size), function (coord) {
                board[coord.x + ',' + coord.y] = null;
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
    'use strict';
    var that = {};

    that.hexagon = (function () {

        var radius, tilt, moves = [];

        return function (fig) {
            var x = fig.center.x,
                y = fig.center.y;

            //caching calculations
            if(fig.radius !== radius || fig.tilt !== tilt) {
                radius = fig.radius;
                tilt = fig.tilt;
                moves = _.map(_.range(0, 2*Math.PI, Math.PI/3), function (deg) {
                    return {
                        x: Math.cos(deg + tilt) * radius,
                        y: Math.sin(deg + tilt) * radius
                    };
                });
            }

            ctx.strokeStyle = fig.stroke || 'rgb(150, 150, 80)';
            ctx.fillStyle = fig.fill || 'rgb(0, 71, 111)';

            ctx.beginPath();
            ctx.moveTo(x + moves[0].x, y + moves[0].y);
            _.each(_.rest(moves), function (move) {
                ctx.lineTo(x + move.x, y + move.y);
            });
            ctx.closePath();

            ctx.fill();
            ctx.stroke();
            ctx.strokeText(fig.coord.x + ", " + fig.coord.y, x, y);
        };
    }());

    that.clear = function () {
        ctx.clearRect(0, 0, SCREEN.width, SCREEN.height);
    };

    return that;
};



//view based logic only, no rendering (use createHexDraw)
var createHexView = function (fig) {
    'use strict';
    var that = {},
        draw = fig.draw,
        radius = null,
        longLeg = null,
        screenCenter = { x: SCREEN.width / 2, y: SCREEN.height / 2 },

        coordToPixels = function (coord, center, tilt) {
            var unitX = radius,
                unitY = longLeg;
            return addVector(
                toCartesian(addVector(
                    toPolar({
                        x: coord.x * 1.5 * unitX - center.x,
                        y: coord.y * unitY * 2 + coord.x * unitY - center.y
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
        },

        isPixelOnScreen = function (pixel) {
            return ( pixel.x >= -radius && pixel.x < SCREEN.width + radius &&
                     pixel.y >= -radius && pixel.y < SCREEN.height + radius );
        },

        localCoord = function (center) {
            var size = Math.floor(
                (_.max([SCREEN.width, SCREEN.height]) / (radius * 1.5)) / 2 + 4
            );
            return hexagonOfCoordinates(size, pixelToCoord(center));
        };

    that.drawHexagonalGrid = function (fig) {
        radius = fig.radius;
        longLeg = fig.radius * Math.sqrt(3) / 2;
        _.each(localCoord(fig.center), function (coord) {
            var pixel = coordToPixels(coord, fig.center, fig.tilt);
            if(fig.board[stringKey(coord)] !== undefined && isPixelOnScreen(pixel)) {
                draw.hexagon({
                    center: pixel,
                    coord: coord,
                    radius: radius,
                    tilt: fig.tilt
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
    'use strict';
    var that = {},
        model = fig.model,
        view = fig.view,
        center = { x: 0, y: 0 },
        velocity = { x: 0, y: 0 },
        tilt = 0,
        radius = 40,

        drawBoard = function () {
            view.clear();
            view.drawHexagonalGrid({
                board: model.getBoard(),
                center: center,
                tilt: tilt,
                radius: radius
            });
        };

    that.tick = (function() {
        var lastCenter = { x: 0, y: 0 }, lastTilt, lastRadius;
        return function () {

            if(
                //lastCenter.x !== center.x ||
                //lastCenter.y !== center.y ||
                velocity.x !== 0 || velocity.y !== 0 ||
                lastTilt !== tilt ||
                lastRadius !== radius
            ) {
                center = addVector(center, velocity);
                drawBoard();
            }
            lastCenter.x = center.x;
            lastCenter.y = center.y;
            lastTilt = tilt;
            lastRadius = radius;
        };
    }());

    that.rotate = function (diff) {
        tilt += toRadian(diff);
    };

    that.zoom = function (diff) {
        radius += radius + diff >= 25 && radius + diff <= 150 ? diff : 0;
    };

    that.borderScroll = (function () {
        var calculateBorderVelocity = function (direction, length) {
            if(Math.abs(direction) > length / 6) {
                return sign(direction) * (Math.abs(direction)-length/6)/20;
            }
            else {
                return 0;
            }
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

var hex = (function () {

//canvas dimensions. (assigned values after canvas is created)
var SCREEN = { width: null, height: null };

var KEY = {
    left: 37,
    up: 38,
    right: 39,
    down: 40
};

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

var vector = (function () {
    'use strict';

    var reduceVector = function (collection, reduceFunction) {
        return _.reduce(collection, function (memo, vector) {
            var combined = {};
            _.each(vector, function (val, key) {
                combined[key] = reduceFunction(val, memo[key]);
            });
            return combined;
        });
    };

    return {
        add: function () {
            return reduceVector(arguments, function (a, b) { return a + b; });
        },

        dotProduct: function () {
            return reduceVector(arguments, function (a, b) { return a * b; });
        },

        negative: function (vector) {
            var negated = {};
            _.each(vector, function (val, key) { negated[key] = -val; });
            return negated;
        },

        subtract: function (a, b) {
            return this.add(a, this.negative(b));
        }
    };
}());

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
    'use strict';
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
    var that = jsMessage.mixinPubSub(),
        size = fig.size,
        board = (function () {
            var board = {};
            _.each(hexagonOfCoordinates(size), function (coord) {
                board[coord.x + ',' + coord.y] = {};
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

//rendering only
var createHexDraw = function (ctx) {
    'use strict';
    var that = {},
        radius,
        tilt,
        moves = [];

    that.hexagon = (function () {

        //var radius, tilt, moves = [];

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
            //note: text is super slow on firefox.
            ctx.strokeText(fig.coord.x + ", " + fig.coord.y, x, y);

            /*ctx.fillStyle = fig.fill || 'rgb(0, 71, 111)';
            ctx.beginPath();
            ctx.arc(x, y, fig.radius/2, 0, Math.PI*2, true);
            ctx.closePath();
            ctx.fill();*/
        };
    }());

    that.circle = function

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

        rotate = function (cartesian, tilt) {
            return toCartesian(vector.add(
                toPolar(cartesian), { radius: 0, theta: tilt }
            ));
        },

        coordToPixels = function (coord, center, tilt) {
            return vector.add(
                rotate(
                    {
                        x: coord.x * 1.5 * radius - center.x,
                        y: coord.y * longLeg * 2 + coord.x * longLeg - center.y
                    },
                    tilt
                ),
                screenCenter
            );
        },

        //returns coordinates of closest coordinates, pixel distance from the center.
        pixelToCoord = function (pixel) {
            var x = Math.round(pixel.x / (1.5 * radius)),
                y = Math.round(-x / 2 + pixel.y / (2 * longLeg));
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

    that.pixelToCoord = function (fig) {
        radius =- fig.radius;
        longLeg = fig.radius * Math.sqrt(3) / 2;

        var center = fig.center,
            cursor = fig.pixel,
            tilt = fig.tilt,
            shifted = vector.add(
                center,
                rotate(vector.subtract(cursor, screenCenter), -tilt)
            );

        shifted.x *= -1;
        var coord = pixelToCoord(shifted);

        return coord;
    };

    that.drawHexagonalGrid = function (fig) {
        radius = fig.radius;
        longLeg = fig.radius * Math.sqrt(3) / 2;
        _.each(localCoord(fig.center), function (coord) {
            var pixel = coordToPixels(coord, fig.center, fig.tilt);

            var hexagon = fig.board[stringKey(coord)];

            if(hexagon && isPixelOnScreen(pixel)) {
                draw.hexagon({
                    center: pixel,
                    coord: coord,
                    radius: radius,
                    tilt: fig.tilt,
                    fill: hexagon.focus ? 'green' : null
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
        //board wigs out if everything is perfectly zero'd
        center = { x: 1, y: 0 },
        velocity = { x: 0, y: 0 },
        tilt = 0,
        radius = 40;

    that.drawBoard = function (board) {
        view.clear();
        view.drawHexagonalGrid({
            board: board,
            center: center,
            tilt: tilt,
            radius: radius
        });
    };

    that.tick = (function() {
        var lastCenter = { x: 0, y: 0 }, lastTilt, lastRadius;
        return function () {
            if(!(
                velocity.x === 0 &&
                velocity.y === 0 &&
                lastTilt === tilt &&
                lastRadius === radius
            )) {
                center = vector.add(center, velocity);
                that.drawBoard(model.getBoard());
                //update last orientation
                lastCenter.x = center.x;
                lastCenter.y = center.y;
                lastTilt = tilt;
                lastRadius = radius;
            }
        };
    }());

    that.focus = function (coord) {
        model.focus(coord);
    };

    that.rotate = function (diff) {
        tilt += toRadian(diff);
    };

    that.zoom = function (diff) {
        radius += radius + diff >= 25 && radius + diff <= 150 ? diff : 0;
    };

    that.coordAt = function (pixel) {
        return view.pixelToCoord({
            center: center,
            tilt: tilt,
            radius: radius,
            pixel: pixel
        });
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
            var direction = vector.add(pixel, {
                    x: -SCREEN.width / 2,
                    y: -SCREEN.height / 2
                }),

                untilted = {
                    x: calculateBorderVelocity(direction.x, SCREEN.width),
                    y: calculateBorderVelocity(direction.y, SCREEN.height)
                };

            velocity = toCartesian(vector.add(
                toPolar(untilted),
                { radius: 0, theta: -tilt }
            ));
        };
    }());

    return that;
};

var createHexEventManager = function (fig) {
    'use strict';
    var that = {},
        $canvas = fig.$canvas,
        $startButton = fig.$startButton,
        $stopButton = fig.$stopButton,
        intervalRef,
        hex = fig.hex,
        canvasEvents = {},

        getCursorCoord = function (e) {
            var targ, x, y;
            if(!e) {
                e = window.event;
            }
            if(e.target) {
                targ = e.target;
            }
            else if(e.srcElement) {
                targ = e.srcElement;
            }
            if(targ.nodeType == 3) {
                targ = targ.parentNode;
            }

            x = e.pageX - $(targ).offset().left;
            y = e.pageY - $(targ).offset().top;

            return { x : x, y: y };
        };

    that.start = function () {
        if(!intervalRef) {
            intervalRef = setInterval(function () {
                hex.tick();
            }, 16);
        }
    };

    that.stop = function () {
        clearInterval(intervalRef);
        intervalRef = null;
    };

    $canvas.mousemove(function (event) {
        if(intervalRef) {
            hex.borderScroll(getCursorCoord(event));
        }
        hex.focus(hex.coordAt(getCursorCoord(event)));
    });

    $canvas.mouseleave(function () {
        if(intervalRef) {
            hex.borderScroll({ x: SCREEN.width / 2, y: SCREEN.height / 2 });
        }
    });

    $canvas.click(function (event) {
        hex.coordAt(getCursorCoord(event));
    });

    $(document).keydown(function (event) {
        switch(event.keyCode) {
            case KEY.left:
                hex.rotate(-1);
                break;
            case KEY.up:
                hex.zoom(1);
                break;
            case KEY.right:
                hex.rotate(1);
                break;
            case KEY.down:
                hex.zoom(-1);
                break;
        }
        return false;
    });

    $startButton.click(_.bind(that.start, that));

    $stopButton.click(_.bind(that.stop, that));

    return that;
};

$(document).ready(function () {
    'use strict';

    var $gameWindow = $('#window'),
        $canvas = $('<canvas id="game-screen" ' +
                        'width="' + $gameWindow.width() + '" ' +
                        'height="' + $gameWindow.height() + '"></canvas>');

    $gameWindow.append($canvas);

    SCREEN.width = $canvas.width();
    SCREEN.height = $canvas.height();

    var hexModel = createHexModel({ size: 50 });
    var hexView = createHexView({
        draw: createHexDraw($canvas[0].getContext('2d')),
    });

    var hex = createHexController({
        model: hexModel,
        view: hexView
    });

    hexModel.subscribe('board', _.bind(hex.drawBoard, hex));

    var hexEventManager = createHexEventManager({
        $canvas: $canvas,
        $startButton: $('#start'),
        $stopButton: $('#stop'),
        hex: hex
    });

    hexEventManager.start();

});


//return public api here.
return {

};

}());

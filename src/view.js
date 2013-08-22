//view based logic only, no rendering (use createHexDraw)
var createHexView = function (fig) {
    'use strict';
    var that = {},
        draw = fig.draw,
        radius = null,
        longLeg = null,
        screenCenter = { x: SCREEN.width / 2, y: SCREEN.height / 2 },

        coordToPixels = function (coord, center, tilt) {
            return {
                x: coord.x * 1.5 * radius - center.x + screenCenter.x,
                y: (coord.y * longLeg * 2 - center.y + coord.x * longLeg /*- center.y*/ + screenCenter.y)
            };
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
                (_.max([SCREEN.width, SCREEN.height]) / (radius * 1.5)) / 2 + 8
            );
            return hexagonOfCoordinates(size, pixelToCoord(center));
        };


    that.pixelToCoord = function (fig) {
        radius =- fig.radius;
        longLeg = fig.radius * Math.sqrt(3) / 3;

        var center = fig.center,
            cursor = fig.pixel,
            tilt = fig.tilt,
            shifted = vector.add(center, vector.subtract(cursor, screenCenter));

        shifted.x *= -1;
        var coord = pixelToCoord(shifted);

        return coord;
    };

    that.drawHexagonalGrid = function (fig) {
        radius = fig.radius;
        longLeg = fig.radius * Math.sqrt(3) / 3;

        _.each(localCoord(fig.center), function (coord) {
            var pixel = coordToPixels(coord, fig.center, fig.tilt);
            var hexagon = fig.board[stringKey(coord)];

            if(hexagon && isPixelOnScreen(pixel)) {

                draw.image({
                    image: hexagon.image,
                    coord: {
                        x: pixel.x - radius,
                        y: pixel.y - longLeg
                    },
                    clip: {
                        coord: { x: 4, y: 0 },
                        width: { x: 442, y: 388}
                    },
                    width: { x: radius * 2, y: longLeg * 2 }
                });

                if(hexagon.focus) {
                    draw.hexagon({
                        center: pixel,
                        coord: coord,
                        lineWidth: 7,
                        radius: radius,
                        height: hexagon.height || 0,
                        stroke: 'rgb(255, 92, 40)'
                    });
                }
            }
        });
    };

    that.clear = function () {
        draw.clear();
    };

    return that;
};

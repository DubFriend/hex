//view based logic only, no rendering (use createHexDraw)
var createHexView = function (fig) {
    'use strict';
    var that = {},
        draw = fig.draw,
        focusColor = fig.focusColor || 'rgb(255, 92, 40)',
        focusWidth = fig.focusWidth || 7,
        skewHeight = fig.skewHeight || 0,
        radius = null,
        longLeg = null,
        screenCenter = { x: SCREEN.width / 2, y: SCREEN.height / 2 },

        coordToPixels = function (coord, center) {
            return {
                x: coord.x * 1.5 * radius - center.x + screenCenter.x,
                y: (coord.y * longLeg * 2 - center.y + screenCenter.y +
                    coord.x * longLeg)
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
                (_.max([SCREEN.width, SCREEN.height]) / (radius * 1.5)) / 2 + 5
            );
            return hexagonOfCoordinates(size, pixelToCoord(center));
        },

        updateDimensions = function (newRadius) {
            radius =  newRadius;
            longLeg = newRadius * Math.sqrt(3) / (2 + skewHeight);
        };

    that.pixelToCoord = function (fig) {
        updateDimensions(fig.radius);
        return pixelToCoord(vector.add(
            fig.center,
            vector.subtract(fig.pixel, screenCenter)
        ));
    };

    that.drawHexagonalGrid = function (fig) {
        updateDimensions(fig.radius);

        _.each(localCoord(fig.center), function (coord) {
            var pixel = coordToPixels(coord, fig.center),
                hexagon = fig.board[stringKey(coord)];

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
                        radius: radius,
                        coord: coord,
                        color: focusColor,
                        lineWidth: focusWidth,
                        skewHeight: skewHeight
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

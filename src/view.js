//view based logic only, no rendering (use createHexDraw)
var createHexView = function (fig) {
    'use strict';
    var that = {},

        backgroundDraw = fig.backgroundDraw,
        foregroundDraw = fig.foregroundDraw,

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
                (_.max([SCREEN.width, SCREEN.height]) / (radius * 1.5)) / 2 + 6
            );
            return hexagonOfCoordinates(size, pixelToCoord(center));
        },

        updateDimensions = function (newRadius) {
            radius =  newRadius;
            longLeg = newRadius * Math.sqrt(3) / (2 + skewHeight);
        },

        foreachViewableTile = function (fig, callback) {
            updateDimensions(fig.radius);
            _.each(localCoord(fig.center), function (coord) {
                var pixelCenter = coordToPixels(coord, fig.center),
                    hexagon = fig.board[stringKey(coord)];

                if(hexagon && isPixelOnScreen(pixelCenter)) {
                    callback(hexagon, pixelCenter, coord);
                }
            });
        },

        offsetPixelCoord = function (pixelCoord) {
            return { x: pixelCoord.x - radius, y: pixelCoord.y - longLeg };
        },

        drawSprite = function (hexagon, pixelCoord) {
            if(hexagon.foreground instanceof Sprite) {
                var spriteData = hexagon.foreground.getData();
                foregroundDraw.image({
                    image: spriteData.image,
                    clip: spriteData.clip,
                    pixelCoord: offsetPixelCoord(pixelCoord),
                    width: { x: radius * 2, y: longLeg * 2 }
                });
            }
        },

        drawBackground = function (hexagon, pixelCoord) {
            if(hexagon.background) {
                backgroundDraw.image({
                    image: hexagon.background.image,
                    clip: hexagon.background.clip,
                    pixelCoord: offsetPixelCoord(pixelCoord),
                    width: {  x: radius * 2, y: longLeg * 2 }
                });
            }
        },

        drawFocus = function (hexagon, pixelCoord, boardCoord) {
            if(hexagon.focus) {
                backgroundDraw.hexagon({
                    pixelCoord: pixelCoord,
                    boardCoord: boardCoord,
                    radius: radius,
                    color: focusColor,
                    lineWidth: focusWidth,
                    skewHeight: skewHeight
                });
            }
        };


    that.pixelToCoord = function (fig) {
        updateDimensions(fig.radius);
        return pixelToCoord(vector.add(
            fig.center,
            vector.subtract(fig.pixel, screenCenter)
        ));
    };

    that.drawForegroundSpritesOnly = function (fig) {
        foreachViewableTile(fig, drawSprite);
    };

    that.drawHexagonalGrid = function (fig) {
        foreachViewableTile(fig, function (hexagon, pixelCoord, boardCoord) {
            drawBackground(hexagon, pixelCoord);
            drawSprite(hexagon, pixelCoord);
            drawFocus(hexagon, pixelCoord, boardCoord);
        });
    };

    that.clearBackground = _.bind(backgroundDraw.clear, backgroundDraw);
    that.clearForeground = _.bind(foregroundDraw.clear, foregroundDraw);

    return that;
};

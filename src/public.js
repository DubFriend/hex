//createHex is returned from the intro-outro closure, (code is in outro.js),
//it is the only publicly available variable in the production version.
var createHex = function (fig) {
    'use strict';
    fig = fig || {};
    var that = {},
        $gameWindow = fig.$gameWindow || $('#window'),
        $canvas = $('<canvas id="' + (fig.canvasId || 'game-screen') + '" ' +
                        'width="' + $gameWindow.width() + '" ' +
                        'height="' + $gameWindow.height() + '"></canvas>');

    $gameWindow.append($canvas);

    SCREEN.width = $canvas.width();
    SCREEN.height = $canvas.height();

    var model = createHexModel({ size: fig.size || 50 }),

        view = createHexView({
            draw: createHexDraw($canvas[0].getContext('2d'))
        }),

        hex = createHexController({ model: model, view: view }),

        eventManager = createHexEventManager({
            $canvas: $canvas,
            $startButton: fig.$start || $('#start'),
            $stopButton: fig.$stop || $('#stop'),
            hex: hex,

            mouseMove: fig.mouseMove || function (coord) {
                hex.borderScroll(coord);
                hex.focus(hex.coordAt(coord));
            },

            mouseLeave: fig.mouseLeave || function (coord) {
                hex.borderScroll({ x: SCREEN.width / 2, y: SCREEN.height / 2 });
            },

            click: fig.click || function (coord) {
                console.log(hex.coordAt(coord));
            },

            key: fig.key || {
                up: {
                    down: _.partial(hex.zoom, 1),
                    up: _.partial(hex.zoom, 0)
                },
                down: {
                    down: _.partial(hex.zoom, -1),
                    up: _.partial(hex.zoom, 0)
                }
            }
        });

    model.subscribe('board', _.bind(hex.drawBoard, hex));

    eventManager.start();

    var coordinateChange = fig.coordinateChange || function () {};

    that.getHoverCoord = function () {};

    that.setTile = function (fig) {};

    that.getTile = function (coord) {};

    return that;
};

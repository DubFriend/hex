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
            hex: hex
        });

    model.subscribe('board', _.bind(hex.drawBoard, hex));
    eventManager.start();

    return that;
};

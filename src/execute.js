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

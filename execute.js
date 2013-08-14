$(document).ready(function () {
    'use strict';
    var $gameWindow = $('#window'),
        $canvas = $('<canvas id="game-screen" ' +
                        'width="' + $gameWindow.width() + '" ' +
                        'height="' + $gameWindow.height() + '"></canvas>');

    $gameWindow.append($canvas);

    var hex = createHex({
        size: 7,
        view: createHexView({
            context: $canvas[0].getContext('2d'),
            width: $canvas.width(),
            height: $canvas.height()
        })
    });

    hex.drawBoard({ x: 0, y: 0 });
});

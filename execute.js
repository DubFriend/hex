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

    var dx = 0, dy = 0;
    setInterval(function () {
        hex.drawBoard({x: dx, y: dy });
        dx += -1;
        dy += 1;
    }, 16);
    hex.drawBoard({ x: 100, y: 150 });
});

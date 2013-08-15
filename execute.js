$(document).ready(function () {
    'use strict';
    var $gameWindow = $('#window'),
        $canvas = $('<canvas id="game-screen" ' +
                        'width="' + $gameWindow.width() + '" ' +
                        'height="' + $gameWindow.height() + '"></canvas>');

    $gameWindow.append($canvas);

    var hex = createHex({
        size: 50,
        view: createHexView({
            context: $canvas[0].getContext('2d'),
            width: $canvas.width(),
            height: $canvas.height()
        })
    });

    var dx = 0, dy = 0;
    setInterval(function () {
        hex.drawBoard({x: dx, y: dy });
        dx += 3;
        dy += 3;
    }, 16);
    hex.drawBoard({ x: 100, y: 150 });
});

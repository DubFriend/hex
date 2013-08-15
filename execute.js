$(document).ready(function () {
    'use strict';
    //http://www.quirksmode.org/js/events_properties.html
    var getCursorCoord = function (e) {
        var targ;
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
        var x = e.pageX - $(targ).offset().left;
        var y = e.pageY - $(targ).offset().top;

        return { x : x, y: y };
    };

    var $gameWindow = $('#window'),
        $canvas = $('<canvas id="game-screen" ' +
                        'width="' + $gameWindow.width() + '" ' +
                        'height="' + $gameWindow.height() + '"></canvas>');

    $gameWindow.append($canvas);

    var hex = createHexController({
        model: createHex({
            size: 50
        }),
        view: createHexView({
            context: $canvas[0].getContext('2d'),
            width: $canvas.width(),
            height: $canvas.height()
        }),
        width: $canvas.width(),
        height: $canvas.height()
    });

    $canvas.mousemove(function (event) {
        hex.borderScroll(getCursorCoord(event));
    });

    setInterval(function () {
        hex.tick();
    }, 16);

});

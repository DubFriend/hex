$(document).ready(function () {
    'use strict';

    //http://www.quirksmode.org/js/events_properties.html
    var getCursorCoord = function (e) {
        var targ, x, y;
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

        x = e.pageX - $(targ).offset().left;
        y = e.pageY - $(targ).offset().top;

        return { x : x, y: y };
    };

    var $gameWindow = $('#window'),
        $canvas = $('<canvas id="game-screen" ' +
                        'width="' + $gameWindow.width() + '" ' +
                        'height="' + $gameWindow.height() + '"></canvas>');

    $gameWindow.append($canvas);

    SCREEN.width = $canvas.width();
    SCREEN.height = $canvas.height();

    var hex = createHexController({
        model: createHexModel({
            size: 50
        }),
        view: createHexView({
            draw: createHexDraw($canvas[0].getContext('2d')),
        })
    });

    var intervalRef;

    $canvas.mousemove(function (event) {
        if(intervalRef) {
            hex.borderScroll(getCursorCoord(event));
        }
    });

    $canvas.mouseleave(function () {
        if(intervalRef) {
            hex.borderScroll({ x: SCREEN.width / 2, y: SCREEN.height / 2 });
        }
    });

    $canvas.click(function (event) {
        if(intervalRef) {
            hex.coordAt(getCursorCoord(event));
        }
    });

    $(document).keydown(function (event) {
        switch(event.keyCode) {
            case 37: //left
                hex.rotate(-1);
                break;
            case 38: //up
                hex.zoom(1);
                break;
            case 39: //right
                hex.rotate(1);
                break;
            case 40: //down
                hex.zoom(-1);
                break;
        }
        return false;
    });

    var start = function () {
        if(!intervalRef) {
            intervalRef = setInterval(function () {
                hex.tick();
            }, 16);
        }
    };

    var stop = function () {
        clearInterval(intervalRef);
        intervalRef = null;
    };

    $('#start').click(start);
    $('#stop').click(stop);

    start();
});

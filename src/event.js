var createHexEventManager = function (fig) {
    'use strict';
    fig = fig || {};
    var that = {},
        $canvas = fig.$canvas,
        $startButton = fig.$startButton,
        $stopButton = fig.$stopButton,
        intervalRef,
        hex = fig.hex,
        //canvasEvents = {},

        getCursorCoord = function (e) {
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

    that.start = function () {
        if(!intervalRef) {
            intervalRef = setInterval(function () {
                hex.tick();
            }, 16);
        }
    };

    that.stop = function () {
        clearInterval(intervalRef);
        intervalRef = null;
    };


    $canvas.mousemove(function (event) {
        if(intervalRef) {
            hex.borderScroll(getCursorCoord(event));
        }
        hex.focus(hex.coordAt(getCursorCoord(event)));
    });

    $canvas.mouseleave(function () {
        if(intervalRef) {
            hex.borderScroll({ x: SCREEN.width / 2, y: SCREEN.height / 2 });
        }
    });

    $canvas.click(function (event) {
        hex.coordAt(getCursorCoord(event));
    });

    $(document).keydown(function (event) {
        switch(event.keyCode) {
            case KEY.left:
                hex.rotate(-1);
                break;
            case KEY.up:
                hex.zoom(1);
                break;
            case KEY.right:
                hex.rotate(1);
                break;
            case KEY.down:
                hex.zoom(-1);
                break;
        }
        return false;
    });

    $startButton.click(_.bind(that.start, that));

    $stopButton.click(_.bind(that.stop, that));

    return that;
};

var createHexEventManager = function (fig) {
    'use strict';
    fig = fig || {};
    var that = {},
        $canvas = fig.$canvas,
        $startButton = fig.$startButton,
        $stopButton = fig.$stopButton,
        intervalRef,
        hex = fig.hex,

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
        hex.tick();
        requestAnimationFrame(_.bind(that.start, that));
    };

    $canvas.mousemove(_.compose(fig.mouseMove, getCursorCoord));

    $canvas.mouseleave(_.compose(fig.mouseLeave, getCursorCoord));

    $canvas.click(_.compose(fig.click, getCursorCoord));

    $(document).keydown(function (event) {
        switch(event.keyCode) {
            case KEY.left:
                break;
            case KEY.right:
                break;
            case KEY.up:
                fig.key.up.down();
                break;
            case KEY.down:
                fig.key.down.down();
                break;
            default:
                console.log('unrecognized key');
        }
        return false;
    });

    $(document).keyup(function (event) {
        switch(event.keyCode) {
            case KEY.left:
                break;
            case KEY.right:
                break;
            case KEY.up:
                fig.key.up.up();
                break;
            case KEY.down:
                fig.key.down.up();
                break;
        }
        return false;
    });

    $startButton.click(_.bind(that.start, that));

    return that;
};

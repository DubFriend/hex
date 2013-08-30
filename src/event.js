var createHexEventManager = function (fig) {
    'use strict';
    fig = fig || {};
    var that = {},
        $canvas = fig.$canvas,
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

            return { x: x, y: y };
        },

        processKeyEvent = function (type, event) {
            var keyConfig = fig.key[event.keyCode];
            if(keyConfig && keyConfig[type]) {
                keyConfig[type]();
            }
            else {
                console.log('unrecognized key (' + type + ')');
            }
            return false;
        };

    $(document).keydown(_.partial(processKeyEvent, 'down'));
    $(document).keyup(_.partial(processKeyEvent, 'up'));

    $canvas.mousemove(_.compose(fig.mouseMove, getCursorCoord));
    $canvas.mouseleave(_.compose(fig.mouseLeave, getCursorCoord));
    $canvas.click(_.compose(fig.click, getCursorCoord));
    $canvas.mousewheel(function(event, delta, deltaX, deltaY) {
        event.preventDefault();
        fig.mouseWheel(deltaX, deltaY);
    });

    that.start = function () {
        hex.tick();
        requestAnimationFrame(that.start);
    };

    return that;
};

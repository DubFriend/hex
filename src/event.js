var createHexEventManager = function (fig) {
    'use strict';
    fig = fig || {};
    var that = {},
        $canvas = fig.$canvas,
        $startButton = fig.$startButton,
        $stopButton = fig.$stopButton,
        intervalRef,
        hex = fig.hex;

    that.start = function () {
        hex.tick();
        requestAnimationFrame(_.bind(that.start, that));
        intervalRef = true;
    };

    that.stop = function () {
        clearInterval(intervalRef);
        intervalRef = null;
    };

    $canvas.mousemove(fig.mouseMove);

    $canvas.mouseleave(fig.mouseLeave);

    $canvas.click(fig.click);

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

    $stopButton.click(_.bind(that.stop, that));

    return that;
};

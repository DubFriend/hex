$(document).ready(function () {
    'use strict';

    var hex = createHex({
        $gameWindow: $('#window'),
        size: 50,
        canvasId: 'game-screen',

        mouseMove: function (coord) {
            this.borderScroll(coord);
            this.focus(this.coordAt(coord));
        },

        mouseLeave: function (coord) {
            this.borderScroll({ x: SCREEN.width / 2, y: SCREEN.height / 2 });
        },

        click: function (coord) {
            console.log(this.coordAt(coord));
        },

        key: function (keyCode) {
            var keys = {};
            keys[keyCode.up] = {
                down: _.partial(this.zoom, 1),
                up: _.partial(this.zoom, 0)
            };
            keys[keyCode.down] = {
                down: _.partial(this.zoom, -1),
                up: _.partial(this.zoom, 0)
            };
            return keys;
        }
    });

});

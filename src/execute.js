$(document).ready(function () {
    'use strict';

    var hex = createHex({
        $gameWindow: $('#window'),
        canvasId: 'game-screen',

        size: 50,

        minZoom: 40,
        maxZoom: 150,
        radius: 70,

        focusColor: 'orange',
        focusWidth: 9,

        mouseMove: function (coord) {
            this.borderScroll(coord);
            this.focus(this.coordAt(coord));
        },

        mouseLeave: function () {
            this.stopScroll();
        },

        click: function (coord) {
            console.log(this.coordAt(coord));
        },

        key: function (keyCode) {
            var keys = {};

            keys[keyCode.up] = {
                down: this.zoomIn,
                up: this.zoomStop
            };

            keys[keyCode.down] = {
                down: this.zoomOut,
                up: this.zoomStop
            };

            return keys;
        }
    });

});

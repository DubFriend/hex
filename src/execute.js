$(document).ready(function () {
    'use strict';

    var hex = createHex({
        $gameWindow: $('#window'),
        canvasId: 'game-screen',

        size: 50,

        skewHeight: 1,

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

    var lightHexagonImg = new Image(),
        darkHexagonImg = new Image();
    lightHexagonImg.src = 'hexagon_light.png';
    darkHexagonImg.src = 'hexagon_dark.png';

    hex.setBoard((function () {
        var board = {};
        _.each(hex.hexagonOfCoordinates(50), function (coord) {
            board[hex.stringKey(coord)] = {
                background: {
                    image: _.random(1) ? lightHexagonImg : darkHexagonImg,
                    clip: {
                        coord: { x: 4, y: 0 },
                        width: { x: 442, y: 388 }
                    }
                }
            };
        });
        return board;
    }()));

    //setting the center tiles to alternate between light and dark image
    var blinkCount = 0;
    setInterval(function () {
        var tempBoard = hex.getBoard();
        _.each(hex.neighborCoordinates({ x: 0, y: 0 }), function (coord) {
            var hexagon = tempBoard[hex.stringKey(coord)];
            hexagon.background = {
                image: blinkCount % 2 === 0 ? lightHexagonImg : darkHexagonImg,
                clip: {
                    coord: { x: 4, y: 0 },
                    width: { x: 442, y: 388 }
                }
            };
        });
        hex.setBoard(tempBoard);
        blinkCount += 1;
    }, 500);

    hex.start();

});

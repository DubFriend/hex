$(document).ready(function () {
    'use strict';

    var hex = createHex({
        $gameWindow: $('#window'),

        size: 50,

        skewHeight: 1,

        minZoom: 40,
        maxZoom: 150,
        radius: 70,

        focusColor: 'orange',
        focusWidth: 9,

        //functions get 'this' bound to the createHex instance

        mouseMove: function (coord) {
            this.borderScroll(coord);
            this.focus(this.coordAt(coord));
        },

        mouseLeave: function () {
            this.stopScroll();
        },

        mouseWheel: function (dx, dy) {
            this.zoom(dy * 7);
            setTimeout(_.bind(this.zoomStop, this), 60);
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
        darkHexagonImg = new Image(),
        smurfSpriteImg = new Image();
    lightHexagonImg.src = 'hexagon_light.png';
    darkHexagonImg.src = 'hexagon_dark.png';
    smurfSpriteImg.src = 'smurf_sprite.png';

    var hexagonClip = {
        coord: { x: 4, y: 0 },
        width: { x: 442, y: 388 }
    };

    hex.setBoard((function () {
        var board = {};
        _.each(hex.hexagonOfCoordinates(50), function (coord) {
            board[hex.stringKey(coord)] = {
                background: {
                    image: _.random(1) ? lightHexagonImg : darkHexagonImg,
                    clip: hexagonClip
                }
            };
        });
        return board;
    }()));

    var smurfSprite = hex.createSprite({
        image: smurfSpriteImg,
        frameSpeed: 60,
        frames: _.map(_.range(16), function (num) {
            return {
                coord: {
                    x: (num % 4) * 127.75,
                    y: Math.floor(num / 4) * 127.75
                },
                width: { x: 127.75, y: 127.75 }
            };
        })
    });

    hex.setTile(_.map(_.range(50), function () {
        return {
            coord: { x: _.random(-15, 15), y: _.random(-15, 15) },
            foreground: smurfSprite
        };
    }));

    //setting the center tiles to alternate between light and dark image
    setInterval((function () {
        var blinkCount = 0;
        return function () {
            //can take array of objects
            hex.setTile(_.map(hex.neighborCoordinates({ x: 0, y: 0 }), function (coord) {
                return {
                    coord: coord,
                    background : {
                        image: blinkCount % 2 === 0 ? lightHexagonImg : darkHexagonImg,
                        clip: hexagonClip
                    }
                };
            }));

            //or as seperate parameters
            hex.setTile({
                coord: { x: 0, y: 0 },
                background: {
                    image: blinkCount % 2 === 1 ? lightHexagonImg : darkHexagonImg,
                    clip: hexagonClip
                }
            });

            blinkCount += 1;
        };
    }()), 500);

    hex.start();

});

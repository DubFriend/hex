var createHexController = function (fig) {
    'use strict';
    var that = {},
        model = fig.model,
        view = fig.view,
        //board wigs out if everything is perfectly zero'd
        center = { x: 1, y: 0 },
        velocity = { x: 0, y: 0 },
        tilt = 0,
        radius = 60,
        ZOOM = {
            min: fig.minZoom || 25,
            max: fig.maxZoom || 150
        };

    that.drawBoard = function (board) {
        view.clear();
        view.drawHexagonalGrid({
            board: board,
            center: center,
            tilt: tilt,
            radius: radius
        });
    };

    that.tick = (function() {
        var lastCenter = { x: 0, y: 0 }, lastTilt, lastRadius;
        return function () {
            if(!(
                velocity.x === 0 &&
                velocity.y === 0 &&
                lastTilt === tilt &&
                lastRadius === radius
            )) {
                center = vector.add(center, velocity);
                that.drawBoard(model.getBoard());
                //update last orientation
                lastCenter.x = center.x;
                lastCenter.y = center.y;
                lastTilt = tilt;
                lastRadius = radius;
            }
        };
    }());

    that.focus = function (coord) {
        model.focus(coord);
    };

    that.zoom = function (diff) {
        radius += radius + diff >= ZOOM.min && radius + diff <= ZOOM.max ? diff : 0;
    };

    that.coordAt = function (pixel) {
        return view.pixelToCoord({
            center: center,
            tilt: tilt,
            radius: radius,
            pixel: pixel
        });
    };

    that.borderScroll = (function () {
        /*var calculateBorderVelocity = function (direction, length) {
            if(Math.abs(direction) > length / 2.8) {
                return sign(direction) * (Math.abs(direction)-length/2.8)/7;
            }
            else {
                return 0;
            }
        };*/

        var calculateBorderVelocity = function (pixel) {
            var scrollZone = {
                x: SCREEN.width / 2.8,
                y: SCREEN.height / 2.8
            };

            if(Math.abs(pixel.x) > scrollZone.x) {
                return {
                    x: sign(pixel.x) * (Math.abs(pixel.x) - scrollZone.x) / 7,
                    y: pixel.y / 50
                };
            }
            else if(Math.abs(pixel.y) > scrollZone.y) {
                return {
                    y: sign(pixel.y) * (Math.abs(pixel.y) - scrollZone.y) / 7,
                    x: pixel.x / 50
                };
            }
            else {
                return { x: 0, y: 0 };
            }

            /*if(
                Math.abs(pixel.x) > scrollZone.x ||
                Math.abs(pixel.y) > scrollZone.y
            ) {
                return {


                }
            }*/
        };

        return function (pixel) {
            var direction = vector.add(
                pixel,
                {
                    x: -SCREEN.width / 2,
                    y: -SCREEN.height / 2
                }
            );


            velocity = calculateBorderVelocity(direction);
            /*velocity = {
                x: calculateBorderVelocity(direction.x, SCREEN.width),
                y: calculateBorderVelocity(direction.y, SCREEN.height)
            };*/
        };
    }());

    return that;
};

var createHexController = function (fig) {
    'use strict';
    var that = {},
        model = fig.model,
        view = fig.view,
        //board wigs out if everything is perfectly zero'd
        center = { x: 1, y: 0 },
        velocity = { x: 0, y: 0 },
        tilt = 0,
        radius = 60;

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

    that.rotate = function (diff) {
        tilt += toRadian(diff);
    };

    that.zoom = function (diff) {
        radius += radius + diff >= 25 && radius + diff <= 150 ? diff : 0;
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
        var calculateBorderVelocity = function (direction, length) {
            if(Math.abs(direction) > length / 6) {
                return sign(direction) * (Math.abs(direction)-length/6)/20;
            }
            else {
                return 0;
            }
        };

        return function (pixel) {
            var direction = vector.add(pixel, {
                    x: -SCREEN.width / 2,
                    y: -SCREEN.height / 2
                }),

                untilted = {
                    x: calculateBorderVelocity(direction.x, SCREEN.width),
                    y: calculateBorderVelocity(direction.y, SCREEN.height)
                };

            velocity = toCartesian(vector.add(
                toPolar(untilted),
                { radius: 0, theta: -tilt }
            ));
        };
    }());

    return that;
};

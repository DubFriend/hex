//rendering only
var createHexDraw = function (ctx) {
    'use strict';
    var that = {};

    that.hexagon = (function () {

        var radius, moves = [];

        return function (fig) {
            var x = fig.pixelCoord.x,
                y = fig.pixelCoord.y;

            //caching calculations
            if(fig.radius !== radius) {
                radius = fig.radius;
                moves = _.map(_.range(0, 2*Math.PI, Math.PI/3), function (deg) {
                    return {
                        x: Math.cos(deg) * radius,
                        y: Math.sin(deg) * radius / (1 + (fig.skewHeight || 0) / 2)
                    };
                });
            }

            ctx.strokeStyle = fig.color || 'rgb(150, 150, 80)';
            ctx.font = 'normal 16px helvetica';
            ctx.lineWidth = fig.lineWidth || 1;

            ctx.beginPath();
            ctx.moveTo(x + moves[0].x, y + moves[0].y);
            _.each(_.rest(moves), function (move) {
                ctx.lineTo(x + move.x, y + move.y);
            });
            ctx.closePath();

            ctx.stroke();
            //note: rendering text is slow
            ctx.lineWidth = 1;
            ctx.strokeText(fig.boardCoord.x + ", " + fig.boardCoord.y, x, y);
        };
    }());

    that.image = function (fig) {
        var args = [fig.image];
            //coord = fig.pixelCoord;

        if(fig.clip) {
            args.push(
                Math.floor(fig.clip.coord.x), Math.floor(fig.clip.coord.y),
                Math.floor(fig.clip.width.x), Math.floor(fig.clip.width.y)
            );
        }

        args.push(fig.pixelCoord.x, fig.pixelCoord.y);

        if(fig.width) {
            args.push(Math.floor(fig.width.x), Math.floor(fig.width.y));
        }

        ctx.drawImage.apply(ctx, args);
    };

    that.clear = function (coord, width) {
        coord = coord || { x: 0, y: 0};
        width = width || { x: SCREEN.width, y: SCREEN.height };
        ctx.clearRect(coord.x, coord.y, width.x, width.y);
    };

    return that;
};


//create animated sprite
var Sprite = function () {};
var createSprite = function (fig) {
    var that = new Sprite(),
        sheet = fig.image,
        frameSpeed = fig.frameSpeed,
        frames = fig.frames,
        currentFrame = 0,
        frameDelta = 0,
        lastChangeTime = Date.now(),
        paused = false;

    that.getData = function () {
        if(!paused) {
            if(frameDelta > frameSpeed) {
                currentFrame += 1;
                frameDelta = 0;
            }
            else {
                var now = Date.now();
                frameDelta += now - lastChangeTime;
                lastChangeTime = now;
            }
        }

        return {
            image: sheet,
            clip:frames[currentFrame % frames.length]
        };
    };

    that.pause = function () {
        paused = true;
    };

    that.resume = function () {
        paused = false;
    };

    return that;
};

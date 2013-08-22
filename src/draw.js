//rendering only
var createHexDraw = function (ctx) {
    'use strict';
    var that = {};

    that.hexagon = (function () {

        var radius, moves = [];

        return function (fig) {
            var x = fig.center.x,
                y = fig.center.y - fig.height * radius / 4;

            //caching calculations
            if(fig.radius !== radius ) {
                radius = fig.radius;
                moves = _.map(_.range(0, 2*Math.PI, Math.PI/3), function (deg) {
                    return {
                        x: Math.cos(deg) * radius,
                        y: Math.sin(deg) * radius / 1.5
                    };
                });
            }

            ctx.strokeStyle = fig.stroke || 'rgb(150, 150, 80)';
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
            ctx.strokeText(fig.coord.x + ", " + fig.coord.y, x, y);
        };
    }());

    that.image = function (fig) {
        var args = [fig.image];

        if(fig.clip) {
            args.push(
                Math.floor(fig.clip.coord.x), Math.floor(fig.clip.coord.y),
                Math.floor(fig.clip.width.x), Math.floor(fig.clip.width.y)
            );
        }

        args.push(fig.coord.x, fig.coord.y);

        if(fig.width) {
            args.push(Math.floor(fig.width.x), Math.floor(fig.width.y));
        }

        ctx.drawImage.apply(ctx, args);
    };

    that.clear = function () {
        ctx.clearRect(0, 0, SCREEN.width, SCREEN.height);
    };

    return that;
};

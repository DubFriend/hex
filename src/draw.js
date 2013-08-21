//rendering only
var createHexDraw = function (ctx) {
    'use strict';
    var that = {};

    that.hexagon = (function () {

        var radius, /*tilt,*/ moves = [];

        return function (fig) {
            var x = fig.center.x,
                y = fig.center.y - fig.height * radius / 4;

            //caching calculations
            if(fig.radius !== radius ) {//|| fig.tilt !== tilt) {
                radius = fig.radius;
                //tilt = fig.tilt;
                moves = _.map(_.range(0, 2*Math.PI, Math.PI/3), function (deg) {
                    return {
                        x: Math.cos(deg /*+ tilt*/) * radius,
                        y: Math.sin(deg /*+ tilt*/) * radius / 1.5
                    };
                });
            }

            ctx.strokeStyle = fig.stroke || 'rgb(150, 150, 80)';
            //ctx.fillStyle = fig.fill || 'rgb(0, 71, 111)';

            ctx.beginPath();
            ctx.moveTo(x + moves[0].x, y + moves[0].y);
            _.each(_.rest(moves), function (move) {
                ctx.lineTo(x + move.x, y + move.y);
            });
            ctx.closePath();

            //ctx.fill();
            ctx.stroke();
            //note: text is super slow on firefox.
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

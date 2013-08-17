(function () {//START hex model
'use strict';

var hex, size;

module('Hex Model', {
    setup: function () {
        size = 5;
        hex = createHexModel({ size: size });
    }
});

test('Initial Board', function () {
    var board = {};
    _.each(_.range(1 - size, size), function (x) {
        _.each(_.range(1 - size, size), function (y) {
            if(Math.abs(x + y) < size) {
                board[x + ',' + y] = null;
            }
        });
    });
    deepEqual(hex.getBoard(), board, 'correct initial board');
});


}());//END hex model


(function () {//START hex view
'use strict';

var hexView, hexagonData;

module('Hex View', {
    setup: function () {
        hexagonData = [];
        var radius = 5;
        window.SCREEN = {
            width: radius * 3,
            height: Math.floor(4 * radius * Math.sqrt(3) / 2)
        };
        hexView = createHexView({
            radius: radius,
            draw: {
                hexagon: function (fig) {
                    hexagonData.push(fig);
                },
                clear: function () {}
            }
        });
    }
});

test('coordOnScreen - center at origin', function () {
    deepEqual(
        hexView.coordOnScreen({ x: 0, y: 0 }),
        [{ x: -2, y: -1 }, { x: -2, y: 0 }, { x: -2, y: 1 }, { x: -2, y: 2 },
         { x: -2, y: 3 }, { x: -1, y: -2 }, { x: -1, y: -1 }, { x: -1, y: 0 },
         { x: -1, y: 1 }, { x: -1, y: 2 }, { x: 0, y: -2 }, { x: 0, y: -1 },
         { x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: -3 },
         { x: 1, y: -2 }, { x: 1, y: -1 }, { x: 1, y: 0 }, { x: 1, y: 1 },
         { x: 2, y: -3 }, { x: 2, y: -2 }, { x: 2, y: -1 }, { x: 2, y: 0 },
         { x: 2, y: 1 }],
        'returns correct squares'
    );
});

}());//END hex view

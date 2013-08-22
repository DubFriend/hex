var parseKey = function (stringKey) {
    var numbers = stringKey.split(',');
    return {
        x: Number(numbers[0]),
        y: Number(numbers[1])
    };
};

var stringKey = function (objectKey) {
    return objectKey.x + ',' + objectKey.y;
};

var vector = (function () {
    'use strict';

    var reduceVector = function (collection, reduceFunction) {
        return _.reduce(collection, function (memo, vector) {
            var combined = {};
            _.each(vector, function (val, key) {
                combined[key] = reduceFunction(val, memo[key]);
            });
            return combined;
        });
    };

    return {
        add: function () {
            return reduceVector(arguments, function (a, b) { return a + b; });
        },

        dotProduct: function () {
            return reduceVector(arguments, function (a, b) { return a * b; });
        },

        negative: function (vector) {
            var negated = {};
            _.each(vector, function (val, key) { negated[key] = -val; });
            return negated;
        },

        subtract: function (a, b) {
            return this.add(a, this.negative(b));
        }
    };
}());

//note: sign(0) === 1
var sign = function (x) {
    return x < 0 ? -1 : 1;
};

var toPolar = function (cartesian) {
    var x = cartesian.x, y = cartesian.y,
        theta = Math.abs(x) > 0.001 ? Math.atan(y/x) : Math.PI / 2 * -sign(y);

    theta += x <= 0 && y <= 0 || x <= 0 && y > 0 ? Math.PI : 0;

    return {
        radius: Math.sqrt(x * x + y * y),
        theta: theta
    };
};

var toCartesian = function (polar) {
    return {
        x: polar.radius * Math.cos(polar.theta),
        y: polar.radius * Math.sin(polar.theta)
    };
};

var toRadian = function (deg) {
    return Math.PI * deg / 180;
};

var toDegree = function (rad) {
    return 180 * rad / Math.PI;
};

var eachToMap = function (arrayOfKeys, callback) {
    var map = {};
    _.each(arrayOfKeys, function (key) {
        map[key] = callback(key);
    });
    return map;
};

var neighborCoord = function (coord) {
    return [
        { x: coord.x, y: coord.y + 1 },
        { x: coord.x, y: coord.y - 1 },
        { x: coord.x + 1, y: coord.y },
        { x: coord.x + 1, y: coord.y - 1 },
        { x: coord.x - 1, y: coord.y },
        { x: coord.x - 1, y: coord.y + 1}
    ];
};

//returns axial coordinates of dimensions +-size for both axies (0 indexed)
var hexagonOfCoordinates = function (size, center) {
    'use strict';
    center = center || { x: 0, y: 0 };
    var coords = [];
    _.each(_.range(1 + center.x - size, center.x + size), function (x) {
        _.each(_.range(1 + center.y - size, center.y + size), function (y) {
            if(Math.abs(x - center.x + y - center.y) < size) {
                coords.push({ x: x, y: y });
            }
        });
    });
    return coords;
};

var getCursorCoord = function (e) {
    var targ, x, y;
    if(!e) {
        e = window.event;
    }
    if(e.target) {
        targ = e.target;
    }
    else if(e.srcElement) {
        targ = e.srcElement;
    }
    if(targ.nodeType == 3) {
        targ = targ.parentNode;
    }

    x = e.pageX - $(targ).offset().left;
    y = e.pageY - $(targ).offset().top;

    return { x : x, y: y };
};

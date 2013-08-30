/*! Copyright (c) 2013 Brandon Aaron (http://brandonaaron.net)
 * Licensed under the MIT License (LICENSE.txt).
 *
 * Thanks to: http://adomas.org/javascript-mouse-wheel/ for some pointers.
 * Thanks to: Mathias Bank(http://www.mathias-bank.de) for a scope bug fix.
 * Thanks to: Seamus Leahy for adding deltaX and deltaY
 *
 * Version: 3.1.3
 *
 * Requires: 1.2.2+
 */

(function (factory) {
    if ( typeof define === 'function' && define.amd ) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        // Node/CommonJS style for Browserify
        module.exports = factory;
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {

    var toFix = ['wheel', 'mousewheel', 'DOMMouseScroll', 'MozMousePixelScroll'];
    var toBind = 'onwheel' in document || document.documentMode >= 9 ? ['wheel'] : ['mousewheel', 'DomMouseScroll', 'MozMousePixelScroll'];
    var lowestDelta, lowestDeltaXY;

    if ( $.event.fixHooks ) {
        for ( var i = toFix.length; i; ) {
            $.event.fixHooks[ toFix[--i] ] = $.event.mouseHooks;
        }
    }

    $.event.special.mousewheel = {
        setup: function() {
            if ( this.addEventListener ) {
                for ( var i = toBind.length; i; ) {
                    this.addEventListener( toBind[--i], handler, false );
                }
            } else {
                this.onmousewheel = handler;
            }
        },

        teardown: function() {
            if ( this.removeEventListener ) {
                for ( var i = toBind.length; i; ) {
                    this.removeEventListener( toBind[--i], handler, false );
                }
            } else {
                this.onmousewheel = null;
            }
        }
    };

    $.fn.extend({
        mousewheel: function(fn) {
            return fn ? this.bind("mousewheel", fn) : this.trigger("mousewheel");
        },

        unmousewheel: function(fn) {
            return this.unbind("mousewheel", fn);
        }
    });


    function handler(event) {
        var orgEvent = event || window.event,
            args = [].slice.call(arguments, 1),
            delta = 0,
            deltaX = 0,
            deltaY = 0,
            absDelta = 0,
            absDeltaXY = 0,
            fn;
        event = $.event.fix(orgEvent);
        event.type = "mousewheel";

        // Old school scrollwheel delta
        if ( orgEvent.wheelDelta ) { delta = orgEvent.wheelDelta; }
        if ( orgEvent.detail )     { delta = orgEvent.detail * -1; }

        // New school wheel delta (wheel event)
        if ( orgEvent.deltaY ) {
            deltaY = orgEvent.deltaY * -1;
            delta  = deltaY;
        }
        if ( orgEvent.deltaX ) {
            deltaX = orgEvent.deltaX;
            delta  = deltaX * -1;
        }

        // Webkit
        if ( orgEvent.wheelDeltaY !== undefined ) { deltaY = orgEvent.wheelDeltaY; }
        if ( orgEvent.wheelDeltaX !== undefined ) { deltaX = orgEvent.wheelDeltaX * -1; }

        // Look for lowest delta to normalize the delta values
        absDelta = Math.abs(delta);
        if ( !lowestDelta || absDelta < lowestDelta ) { lowestDelta = absDelta; }
        absDeltaXY = Math.max(Math.abs(deltaY), Math.abs(deltaX));
        if ( !lowestDeltaXY || absDeltaXY < lowestDeltaXY ) { lowestDeltaXY = absDeltaXY; }

        // Get a whole value for the deltas
        fn = delta > 0 ? 'floor' : 'ceil';
        delta  = Math[fn](delta / lowestDelta);
        deltaX = Math[fn](deltaX / lowestDeltaXY);
        deltaY = Math[fn](deltaY / lowestDeltaXY);

        // Add event and delta to the front of the arguments
        args.unshift(event, delta, deltaX, deltaY);

        return ($.event.dispatch || $.event.handle).apply(this, args);
    }

}));

var createHex = (function () {

// _____________________________________________________________________________
//
// ---------------------------   jsMessage   -----------------------------------
//
// jsMessage provides mixins for publish/subscribe, and event binding patterns.
//
// Author : Brian Detering | BDeterin@gmail.com | BrianDetering.net
// GitHub : github.com/DubFriend/jsmessage

(function () {
"use strict";

// ----------------- Underscore Subset, renamed to "lib" -----------------------
//     Underscore.js 1.5.1
//     http://underscorejs.org
//     (c) 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

// Establish the object that gets returned to break out of a loop iteration.
var breaker = {};

// Save bytes in the minified (but not gzipped) version:
var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

// Create quick reference variables for speed access to core prototypes.
var push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    concat           = ArrayProto.concat,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

// All **ECMAScript 5** native function implementations that we hope to use
// are declared here.
var nativeForEach      = ArrayProto.forEach,
    nativeFilter       = ArrayProto.filter;

var lib = {};

// The cornerstone, an `each` implementation, aka `forEach`.
// Handles objects with the built-in `forEach`, arrays, and raw objects.
// Delegates to **ECMAScript 5**'s native `forEach` if available.
lib.each = function (obj, iterator, context) {
    if (obj == null) {
        return;
    }
    if (nativeForEach && obj.forEach === nativeForEach) {
        obj.forEach(iterator, context);
    }
    else if (obj.length === +obj.length) {
        for (var i = 0, l = obj.length; i < l; i++) {
            if (iterator.call(context, obj[i], i, obj) === breaker) {
                return;
            }
        }
    }
    else {
        for (var key in obj) {
            if (lib.has(obj, key)) {
                if (iterator.call(context, obj[key], key, obj) === breaker) {
                    return;
                }
            }
        }
    }
};

// Return all the elements that pass a truth test.
// Delegates to **ECMAScript 5**'s native `filter` if available.
lib.filter = function (obj, iterator, context) {
    var results = [];
    if (obj == null) {
        return results;
    }
    if (nativeFilter && obj.filter === nativeFilter) {
        return obj.filter(iterator, context);
    }
    lib.each(obj, function(value, index, list) {
        if (iterator.call(context, value, index, list)) {
            results.push(value);
        }
    });
    return results;
};

lib.isFunction = function(obj) {
    return typeof obj === 'function';
};

// Shortcut function for checking if an object has a given property directly
// on itself (in other words, not on a prototype).
lib.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
};


//--------------------------- end underscore -----------------------------------



var messaging = {};
//attache to the global object, or to exports (for nodejs)
if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = messaging;
    }
    exports.jsMessage = messaging;
}
else {
    if(this.jsMessage === undefined) {
        this.jsMessage = messaging;
    }
    else {
        throw "jsMessage is allready defined";
    }
}


messaging.mixinPubSub = function (object) {
    object = object || {};
    var subscribers = {},
        universalSubscribers = [];

    object.subscribe = function (topic, callback) {
        if(topic) {
            subscribers[topic] = subscribers[topic] || [];
            subscribers[topic].push(callback);
        }
        else {
            universalSubscribers.push(callback);
        }
    };

    object.unsubscribe = function (subscriber, topic) {
        var filter = function (topic) {
            return lib.filter(subscribers[topic], function (callback) {
                return callback !== subscriber;
            });
        };

        if(topic) {
            if(subscribers[topic]) {
                subscribers[topic] = filter(topic);
            }
            else {
                throw "topic not found";
            }
        }
        else {
            lib.each(subscribers, function (values, topic) {
                subscribers[topic] = filter(topic);
            });
            universalSubscribers = lib.filter(universalSubscribers, function (callback) {
                return callback !== subscriber;
            });
        }
    };

    object.publish = function (topic, data) {
        if(topic) {
            lib.each(subscribers[topic], function (callback) {
                callback(data);
            });
        }
        else {
            lib.each(subscribers, function (values, topic) {
                lib.each(values, function (callback) {
                    if(callback) {
                        callback(data);
                    }
                });
            });
        }
        lib.each(universalSubscribers, function (callback) {
            callback(data);
        });
    };

    object.autoPublish = function (topic, publishMap) {
        var data, that = this;
        //if setData provided, then sets data and publishes it.
        //otherwise just gets the data.
        return function (setData) {
            var publishData;
            if(setData === undefined) {
                return data;
            }
            else {
                data = setData;
                publishData = publishMap ? publishMap(setData) : setData;
                that.publish(topic, publishData);
            }
        };
    };

    return object;
};


messaging.mixinEvents = function (object, argumentGenerators) {
    var bindings = {},
        argGen = argumentGenerators || {};

    //wrap each function of the object with its trigger.
    lib.each(object, function (property, name) {
        if(lib.isFunction(property)) {
            object[name] = function () {
                var callbackArg,
                    returnValue = property.apply(object, arguments);

                if(bindings[name]) {
                    if(argGen[name]) {
                        callbackArg = argGen[name].apply(object, [returnValue]);
                    }
                    lib.each(bindings[name], function (callback) {
                        callback(callbackArg);
                    });
                }

                return returnValue;
            };
        }
    });

    object.on = function (event, callback) {
        bindings[event] = bindings[event] || [];
        bindings[event].push(callback);
    };

    object.off = function (event, callback) {
        if(callback) {
            bindings[event] = lib.filter(bindings[event], function (subscriber) {
                return subscriber !== callback;
            });
        }
        else {
            bindings[event] = undefined;
        }
    };

    return object;
};

}).call(this);

//module level definitions

//canvas dimensions. (assigned values after canvas is created)
var SCREEN = { width: null, height: null };

var KEY = {
    left: 37,
    up: 38,
    right: 39,
    down: 40
};

//module level function definitions.

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

var createHexModel = function (fig) {
    'use strict';


    var that = jsMessage.mixinPubSub(),
        size = fig.size,
        board = null,
        publishBoard = function () {
            that.publish('board', board);
        };

    that.getBoard = function () {
        return board;
    };

    that.getTile = function (coord) {
        return board[stringKey(coord)];
    };

    that.setBoard = function (newBoard) {
        board = newBoard;
        publishBoard();
    };

    that.setTile = function () {//coord, data) {

        if(_.isArray(arguments[0])) {
            that.setTile.apply(that, arguments[0]);
        }
        else {
            _.each(arguments, function (data) {
                var tile = that.getTile(data.coord);
                delete data.coord;
                _.each(data, function (val, key) {
                    tile[key] = val;
                });
            });

            /*var tile = that.getTile(coord);
            _.each(data, function (val, key) {
                tile[key] = val;
            });*/

            publishBoard();
        }
    };

    that.focus = (function () {
        var lastCoord = {};
        return function (coord) {
            var thisHex, lastHex;
            if(!_.isEqual(coord, lastCoord)) {
                thisHex = board[stringKey(coord)];
                lastHex = board[stringKey(lastCoord)];

                if(lastHex) {
                    lastHex.focus = false;
                }
                if(thisHex) {
                    thisHex.focus = true;
                }

                lastCoord = coord;
                publishBoard();
            }
        };
    }());

    return that;
};

//rendering only
var createHexDraw = function (ctx) {
    'use strict';
    var that = {};

    that.hexagon = (function () {

        var radius, moves = [];

        return function (fig) {
            var x = fig.center.x,
                y = fig.center.y;

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

//view based logic only, no rendering (use createHexDraw)
var createHexView = function (fig) {
    'use strict';
    var that = {},

        backgroundDraw = fig.backgroundDraw,
        foregroundDraw = fig.foregroundDraw,

        focusColor = fig.focusColor || 'rgb(255, 92, 40)',
        focusWidth = fig.focusWidth || 7,
        skewHeight = fig.skewHeight || 0,
        radius = null,
        longLeg = null,
        screenCenter = { x: SCREEN.width / 2, y: SCREEN.height / 2 },

        coordToPixels = function (coord, center) {
            return {
                x: coord.x * 1.5 * radius - center.x + screenCenter.x,
                y: (coord.y * longLeg * 2 - center.y + screenCenter.y +
                    coord.x * longLeg)
            };
        },

        //returns coordinates of closest coordinates, pixel distance from the center.
        pixelToCoord = function (pixel) {
            var x = Math.round(pixel.x / (1.5 * radius)),
                y = Math.round(-x / 2 + pixel.y / (2 * longLeg));
            return { x: x, y: y };
        },

        isPixelOnScreen = function (pixel) {
            return ( pixel.x >= -radius && pixel.x < SCREEN.width + radius &&
                     pixel.y >= -radius && pixel.y < SCREEN.height + radius );
        },

        localCoord = function (center) {
            var size = Math.floor(
                (_.max([SCREEN.width, SCREEN.height]) / (radius * 1.5)) / 2 + 6
            );
            return hexagonOfCoordinates(size, pixelToCoord(center));
        },

        updateDimensions = function (newRadius) {
            radius =  newRadius;
            longLeg = newRadius * Math.sqrt(3) / (2 + skewHeight);
        };

    that.pixelToCoord = function (fig) {
        updateDimensions(fig.radius);
        return pixelToCoord(vector.add(
            fig.center,
            vector.subtract(fig.pixel, screenCenter)
        ));
    };

    that.drawForeground = function (fig) {
        updateDimensions(fig.radius);
         _.each(localCoord(fig.center), function (coord) {
            var pixel = coordToPixels(coord, fig.center),
                hexagon = fig.board[stringKey(coord)],
                pixelCoord = { x: pixel.x - radius, y: pixel.y - longLeg },
                width = {  x: radius * 2, y: longLeg * 2 };

            if(hexagon && isPixelOnScreen(pixel)) {
                if(hexagon.foreground) {
                    if(hexagon.foreground instanceof Sprite) {
                        var spriteData = hexagon.foreground.getData();
                        foregroundDraw.image({
                            image: spriteData.image,
                            clip: spriteData.clip,
                            coord: pixelCoord,
                            width: width
                        });
                    }
                }
            }
        });
    };

    that.drawHexagonalGrid = function (fig) {
        updateDimensions(fig.radius);

        _.each(localCoord(fig.center), function (coord) {
            var pixel = coordToPixels(coord, fig.center),
                hexagon = fig.board[stringKey(coord)],
                pixelCoord = { x: pixel.x - radius, y: pixel.y - longLeg },
                width = {  x: radius * 2, y: longLeg * 2 };

            if(hexagon && isPixelOnScreen(pixel)) {

                backgroundDraw.image({
                    image: hexagon.background.image,
                    clip: hexagon.background.clip,
                    coord: pixelCoord,
                    width: width
                });

                if(hexagon.foreground) {
                    if(hexagon.foreground instanceof Sprite) {
                        var spriteData = hexagon.foreground.getData();
                        foregroundDraw.image({
                            image: spriteData.image,
                            clip: spriteData.clip,
                            coord: pixelCoord,
                            width: width
                        });
                    }
                }

                if(hexagon.focus) {
                    backgroundDraw.hexagon({
                        center: pixel,
                        radius: radius,
                        coord: coord,
                        color: focusColor,
                        lineWidth: focusWidth,
                        skewHeight: skewHeight
                    });
                }
            }
        });
    };


    that.clearBackground = _.bind(backgroundDraw.clear, backgroundDraw);
    that.clearForeground = _.bind(foregroundDraw.clear, foregroundDraw);

    return that;
};

var createHexController = function (fig) {
    'use strict';
    var that = {},
        model = fig.model,
        view = fig.view,
        //board wigs out if everything is perfectly zero'd
        center = { x: 1, y: 0 },
        velocity = { x: 0, y: 0 },
        radius = fig.radius || 60,
        zoom = {
            min: fig.minZoom || 25,
            max: fig.maxZoom || 150,
            diff: 0
        },

        updateRadius = function () {
            var newRadius = radius + zoom.diff >= zoom.min && radius + zoom.diff <= zoom.max ? radius + zoom.diff : radius;
            center.x *= newRadius / radius;
            center.y *= newRadius / radius;
            radius = newRadius;
        };

    that.drawBoard = function (board) {
        view.clearBackground();
        view.clearForeground();
        view.drawHexagonalGrid({
            board: board,
            center: center,
            radius: radius
        });
    };

    that.drawForeground = function (board) {
        view.clearForeground();
        view.drawForeground({
            board: board,
            center: center,
            radius: radius
        });
    };

    that.tick = (function() {
        var lastCenter = { x: 0, y: 0 }, lastRadius;
        return function () {
            updateRadius();
            if(!(
                velocity.x === 0 &&
                velocity.y === 0 &&
                lastRadius === radius
            )) {
                center = vector.add(center, velocity);
                that.drawBoard(model.getBoard());
                //update last orientation
                lastCenter.x = center.x;
                lastCenter.y = center.y;
                lastRadius = radius;
            }
            else {
                that.drawForeground(model.getBoard());
            }
        };
    }());

    that.focus = function (coord) {
        model.focus(coord);
    };

    that.zoom = function (diff) {
        zoom.diff = radius + diff >= zoom.min && radius + diff <= zoom.max ? diff : 0;
    };

    that.coordAt = function (pixel) {
        return view.pixelToCoord({
            center: center,
            radius: radius,
            pixel: pixel
        });
    };

    that.borderScroll = (function () {

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
        };

        return function (pixel) {
            velocity = calculateBorderVelocity({
                x: pixel.x - SCREEN.width / 2,
                y: pixel.y - SCREEN.height / 2
            });
        };
    }());

    return that;
};

var createHexEventManager = function (fig) {
    'use strict';
    fig = fig || {};
    var that = {},
        $canvas = fig.$canvas,
        hex = fig.hex,

        getCursorCoord = function (e) {
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

            return { x: x, y: y };
        },

        processKeyEvent = function (type, event) {
            var keyConfig = fig.key[event.keyCode];
            if(keyConfig && keyConfig[type]) {
                keyConfig[type]();
            }
            else {
                console.log('unrecognized key (' + type + ')');
            }
            return false;
        };

    $(document).keydown(_.partial(processKeyEvent, 'down'));
    $(document).keyup(_.partial(processKeyEvent, 'up'));

    $canvas.mousemove(_.compose(fig.mouseMove, getCursorCoord));
    $canvas.mouseleave(_.compose(fig.mouseLeave, getCursorCoord));
    $canvas.click(_.compose(fig.click, getCursorCoord));
    $canvas.mousewheel(function(event, delta, deltaX, deltaY) {
        event.preventDefault();
        fig.mouseWheel(deltaX, deltaY);
    });

    that.start = function () {
        hex.tick();
        requestAnimationFrame(_.bind(that.start, that));
    };

    return that;
};

//createHex is returned from the intro-outro closure, (code is in outro.js),
//it is the only publicly available variable in the production version.
var createHex = function (fig) {
    'use strict';
    fig = fig || {};
    var that = {},
        $gameWindow = fig.$gameWindow,

        buildCanvas = function (htmlClass) {
            return $('<canvas class="' + htmlClass + '" ' +
                        'width="' + $gameWindow.width() + '" ' +
                        'height="' + $gameWindow.height() + '"></canvas>');
        },

        $backgroundCanvas = buildCanvas('background'),
        $foregroundCanvas = buildCanvas('foreground');

    $gameWindow.append($backgroundCanvas);
    $gameWindow.append($foregroundCanvas);

    SCREEN.width = $foregroundCanvas.width();
    SCREEN.height = $foregroundCanvas.height();

    var model = createHexModel({
            size: fig.size
        }),

        view = createHexView({
            backgroundDraw: createHexDraw($backgroundCanvas[0].getContext('2d')),
            foregroundDraw: createHexDraw($foregroundCanvas[0].getContext('2d')),
            focusColor: fig.focusColor,
            focusWidth: fig.focusWidth,
            skewHeight: fig.skewHeight
        }),

        hex = createHexController({
            model: model,
            view: view,
            minZoom: fig.minZoom,
            maxZoom: fig.maxZoom,
            radius: fig.radius
        });

    that.zoom = _.bind(hex.zoom, hex);
    that.zoomIn = _.partial(that.zoom, 1);
    that.zoomOut = _.partial(that.zoom, -1);
    that.zoomStop = _.partial(that.zoom, 0);

    that.borderScroll = _.bind(hex.borderScroll, hex);
    that.focus = _.bind(hex.focus, hex);
    that.coordAt = _.bind(hex.coordAt, hex);

    that.stopScroll = _.partial(hex.borderScroll, {
        x: SCREEN.width / 2,
        y: SCREEN.height / 2
    });

    that.setTile = _.bind(model.setTile, model);
    that.setBoard = _.bind(model.setBoard, model);
    that.getTile = _.bind(model.getTile, model);
    that.getBoard = _.bind(model.getBoard, model);

    that.hexagonOfCoordinates = hexagonOfCoordinates;
    that.stringKey = stringKey;
    that.neighborCoordinates = neighborCoord;

    that.createSprite = createSprite;

    var eventManager = createHexEventManager({
        $canvas: $foregroundCanvas,
        hex: hex,
        mouseMove: _.bind(fig.mouseMove, that),
        mouseLeave: _.bind(fig.mouseLeave, that),
        click: _.bind(fig.click, that),
        mouseWheel: _.bind(fig.mouseWheel, that),
        key: fig.key.call(that, KEY)
    });

    that.start = _.bind(eventManager.start, eventManager);

    model.subscribe('board', _.bind(hex.drawBoard, hex));

    return that;
};

//defined in public.js
return createHex;
}());

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
        frameSpeed: 50,
        frames: _.map(_.range(16), function (num) {
            return {
                coord: {
                    x: (num % 4) * 128,
                    y: Math.floor(num / 4) * 128
                },
                width: { x: 128, y: 128 }
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

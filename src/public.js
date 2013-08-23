//createHex is returned from the intro-outro closure, (code is in outro.js),
//it is the only publicly available variable in the production version.
var createHex = function (fig) {
    'use strict';
    fig = fig || {};
    var that = {},
        $gameWindow = fig.$gameWindow,
        $canvas = $('<canvas id="' + fig.canvasId + '" ' +
                        'width="' + $gameWindow.width() + '" ' +
                        'height="' + $gameWindow.height() + '"></canvas>');

    $gameWindow.append($canvas);

    SCREEN.width = $canvas.width();
    SCREEN.height = $canvas.height();

    var model = createHexModel({ size: fig.size }),
        view = createHexView({
            draw: createHexDraw($canvas[0].getContext('2d')),
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


    that.setTile = function (fig) {};
    that.setBoard = function (board) {
    };
    that.getTile = function (coord) {};

    that.hexagonOfCoordinates = hexagonOfCoordinates;


    var eventManager = createHexEventManager({
        $canvas: $canvas,
        hex: hex,
        mouseMove: _.bind(fig.mouseMove, that),
        mouseLeave: _.bind(fig.mouseLeave, that),
        click: _.bind(fig.click, that),
        key: fig.key.call(that, KEY)
    });

    model.subscribe('board', _.bind(hex.drawBoard, hex));

    eventManager.start();

    return that;
};

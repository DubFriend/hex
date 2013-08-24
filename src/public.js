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

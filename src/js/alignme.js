/*global window, $, document */
var _ = require('lodash'),
    proto = {};

function AlignMe(overlay, options) {
    var that = this;
    // Configurable Attributes
    that.overlay     = $(overlay);
    that.relateTo    = $(options.relateTo) || null;
    that.constrainBy = $(options.constrainBy) || null;
    that.skipViewport = (options.skipViewport === false) ? false : true;
    if (!that.overlay) {
        throw new Error('`el` element is required');
    }
    if (!that.relateTo) {
        throw new Error('`relateTo` option is required');
    }
}

proto = {
    getPoints: function ($el) {
        var that = this,
            offset = $el.offset(),
            width = $el.outerWidth(),
            height = $el.outerHeight();

        return {
            left   : offset.left,
            top    : offset.top,
            right  : offset.left + width,
            bottom : offset.top + height,
            width  : width,
            height : height
        };
    },
    getPositions: function (overlayData, relateToData) {
        var that = this,
            center = relateToData.left + (relateToData.width / 2) - (overlayData.width / 2);

        return [
            // lblt ['left', 'bottom'], ['left', 'top']
            {left: relateToData.left, top: relateToData.top - overlayData.height, name: 'lblt'},
            // cbct ['center', 'bottom'], ['center', 'top']
            // {left: center, top: relateToData.top - overlayData.height, name: 'cbct'}, // TODO
            // rbrt ['right', 'bottom'], ['right', 'top']
            {left: relateToData.right - overlayData.width, top: relateToData.top - overlayData.height, name: 'rbrt'},

            // ltrt ['left', 'top'], ['right', 'top']
            {left: relateToData.right, top: relateToData.top, name: 'ltrt'},
            // lbrb ['left', 'bottom'], ['right', 'bottom']
            {left: relateToData.right, top: relateToData.bottom - overlayData.height, name: 'lbrb'},

            // rtrb ['right', 'top'], ['right', 'bottom']
            {left: relateToData.right - overlayData.width, top: relateToData.bottom, name: 'rtrb'},
            // ctcb ['center', 'top'], ['center', 'bottom']
            // {left: center, top: relateToData.bottom, name: 'ctcb'}, // TODO
            // ltlb ['left', 'top'], ['left', 'bottom']
            {left: relateToData.left, top: relateToData.bottom, name: 'ltlb'},

            // rblb ['right', 'bottom'], ['left', 'bottom']
            {left: relateToData.left - overlayData.width, top: relateToData.bottom - overlayData.height, name: 'rblb'},
            // rtlt ['right', 'top'], ['left', 'top']
            {left: relateToData.left - overlayData.width, top: relateToData.top, name: 'rtlt'}
        ];
    },
    align: function () {
        var that = this,
            hasBest = false,
            pos,
            positions,
            overlay = that.overlay,
            relateTo = that.relateTo,
            constrainBy = that.constrainBy,
            // Overlay
            overlayData = that.getPoints(overlay),
            relateToData = that.getPoints(relateTo),
            constrainByData = that.getPoints(constrainBy),
            // Constrain by viewport
            $window,
            topmost,
            bottommost;

        // Get all possible positions
        positions = that.getPositions(overlayData, relateToData);

        if (!that.skipViewport) {
            $window = $(window);
            topmost = $window.scrollTop();
            bottommost = topmost + $window.height();
            if (topmost > constrainByData) {
                constrainByData.top = topmost;
            }
            if (bottommost < constrainByData.bottom) {
                constrainByData.bottom = bottommost;
                constrainByData.height = bottommost - topmost;
            }
        }

        _.each(positions, function (pos) {
            // 4 distances to border of constrain
            var distances = [
                pos.top - constrainByData.top,
                constrainByData.right - pos.left + overlayData.width,
                constrainByData.bottom - pos.top + overlayData.height,
                pos.left - constrainByData.left
            ];
            if (
                pos.left >= constrainByData.left &&
                pos.top >= constrainByData.top &&
                pos.left + overlayData.width <= constrainByData.right &&
                pos.top + overlayData.height <= constrainByData.bottom
            ) {
                hasBest = true;
                // Inside distance. The more the better.
                pos.inDistance = Math.min.apply(null, distances);
            } else {
                // Outside distance. The less the better.
                pos.outDistance = Math.max.apply(null, distances);
            }
        });

        if (hasBest) {
            // Get the one with the largest distance
            pos = _.max(positions, function (pos) {return pos.inDistance;});
            overlay.offset(pos);

        } else {
            // Get the one with the smallest distance
            pos = _.min(positions, function (pos) {return pos.outDistance;});
            overlay.offset(pos);
        }
    }
};

_.extend(AlignMe.prototype, proto);

window.AlignMe = AlignMe;


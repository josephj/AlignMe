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
            {left: relateToData.left, top: relateToData.top - overlayData.height},
            // cbct ['center', 'bottom'], ['center', 'top']
            {left: center, top: relateToData.top - overlayData.height},
            // rbrt ['right', 'bottom'], ['right', 'top']
            {left: relateToData.right - overlayData.width, top: relateToData.top - overlayData.height},

            // tlrt ['top', 'left'], ['right', 'top']
            {left: relateToData.right, top: relateToData.top},
            // lbrb ['left', 'bottom'], ['right', 'bottom']
            {left: relateToData.right, top: relateToData.bottom - overlayData.height},

            // rtrb ['right', 'top'], ['right', 'bottom']
            {left: relateToData.right - overlayData.width, top: relateToData.bottom},
            // ctcb ['center', 'top'], ['center', 'bottom']
            {left: center, top: relateToData.bottom},
            // ltlb ['left', 'top'], ['left', 'bottom']
            {left: relateToData.left, top: relateToData.bottom},

            // rblb ['right', 'bottom'], ['left', 'bottom']
            {left: relateToData.left - overlayData.width, top: relateToData.bottom - overlayData.height},
            // rtlt ['right', 'top'], ['left', 'top']
            {left: relateToData.left - overlayData.width, top: relateToData.top}
        ];
    },
    align: function () {
        var $window = $(window);
        var topmost = $window.scrollTop();
        var bottommost = topmost + $window.height();

        var that = this,
            hasBest = false,
            positions,
            overlay = that.overlay,
            relateTo = that.relateTo,
            constrainBy = that.constrainBy,
            offset = overlay.offset(),
            overlayData = that.getPoints(overlay),
            relateToData = that.getPoints(relateTo),
            constrainByData = that.getPoints(constrainBy);

        // Get all possible positions
        positions = that.getPositions(overlayData, relateToData);

        if (!that.skipViewport) {
            topmost = $window.scrollTop();
            bottommost = topmost + $window.height();
            constrainByData.top = topmost;
            constrainByData.bottom = bottommost;
            constrainByData.height = bottommost - topmost;
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
                pos.top + overlayData.height <= constrainByData.height
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
            overlay.offset(_.max(positions, function(pos) {return pos.inDistance;}));
        } else {
            // Get the one with the smallest distance
            overlay.offset(_.min(positions, function(pos) {return pos.outDistance;}));
        }
    }
};

_.extend(AlignMe.prototype, proto);

window.AlignMe = AlignMe;


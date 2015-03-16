// DON'T MODIFY THIS FILE!
// MODIFY ITS SOURCE FILE!
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*global window, $, define, document */
/**
 * A JavaScript utility which automatically aligns position of an overlay.
 *
 *      @example
 *      var alignMe = new AlignMe($overlay, {
 *          relateTo: '.draggable',
 *          constrainBy: '.parent',
 *          skipViewport: false
 *      });
 *      alignMe.align();
 *
 * @class AlignMe
 * @param {HTMLElement} overlay Overlay element
 * @param {Object} options Configurable options
 */
function AlignMe(overlay, options) {
    var that = this;

    that.overlay = $(overlay);
    //======================
    // Config Options
    //======================
    /**
     * @cfg {HTMLElement} relateTo (required)
     * The reference element
     */
    that.relateTo = $(options.relateTo) || null;
    /**
     * @cfg {HTMLElement} relateTo
     * The reference element
     */
    that.constrainBy = $(options.constrainBy) || null;
    /**
     * @cfg {HTMLElement} [skipViewport=true]
     * Ignore window as another constrain element
     */
    that.skipViewport = (options.skipViewport === false) ? false : true;

    // Stop if overlay or options.relatedTo arent provided
    if (!that.overlay) {
        throw new Error('`overlay` element is required');
    }
    if (!that.relateTo) {
        throw new Error('`relateTo` option is required');
    }
}

var _getMax,
    _getPoints,
    _listPositions,
    _setConstrainByViewport;

// Replacement for _.max
_getMax = function (obj, attr) {
    var maxValue = 0,
        maxItem,
        i, o;

    for (i in obj) {
        if (obj.hasOwnProperty(i)) {
            o = obj[i];
            if (o[attr] > maxValue) {
                maxValue = o[attr];
                maxItem = o;
            }
        }
    }

    return maxItem;
};

// Get coordinates and dimension of an element
_getPoints = function ($el) {
    var offset = $el.offset(),
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
};

// List all possible XY coordindates
_listPositions = function (overlayData, relateToData) {
    var center = relateToData.left + (relateToData.width / 2) - (overlayData.width / 2);

    return [
        // lblt ['left', 'bottom'], ['left', 'top']
        {left: relateToData.left, top: relateToData.top - overlayData.height, name: 'lblt'},
        // cbct ['center', 'bottom'], ['center', 'top']
        // {left: center, top: relateToData.top - overlayData.height, name: 'cbct'},
        // rbrt ['right', 'bottom'], ['right', 'top']
        {left: relateToData.right - overlayData.width, top: relateToData.top - overlayData.height, name: 'rbrt'},

        // ltrt ['left', 'top'], ['right', 'top']
        {left: relateToData.right, top: relateToData.top, name: 'ltrt'},
        // lbrb ['left', 'bottom'], ['right', 'bottom']
        {left: relateToData.right, top: relateToData.bottom - overlayData.height, name: 'lbrb'},

        // rtrb ['right', 'top'], ['right', 'bottom']
        {left: relateToData.right - overlayData.width, top: relateToData.bottom, name: 'rtrb'},
        // ctcb ['center', 'top'], ['center', 'bottom']
        // {left: center, top: relateToData.bottom, name: 'ctcb'},
        // ltlb ['left', 'top'], ['left', 'bottom']
        {left: relateToData.left, top: relateToData.bottom, name: 'ltlb'},

        // rblb ['right', 'bottom'], ['left', 'bottom']
        {left: relateToData.left - overlayData.width, top: relateToData.bottom - overlayData.height, name: 'rblb'},
        // rtlt ['right', 'top'], ['left', 'top']
        {left: relateToData.left - overlayData.width, top: relateToData.top, name: 'rtlt'}
    ];
};

// Take current viewport/window as constrain.
_setConstrainByViewport = function (constrainByData) {
    var $window = $(window),
        topmost = $window.scrollTop(),
        bottommost = topmost + $window.height();

    if (topmost > constrainByData) {
        constrainByData.top = topmost;
    }
    if (bottommost < constrainByData.bottom) {
        constrainByData.bottom = bottommost;
        constrainByData.height = bottommost - topmost;
    }
    return constrainByData;
};

/**
 * Align overlay automatically
 *
 * @method align
 * @return {Array} The best XY coordinates
 */
AlignMe.prototype.align = function () {
    var that = this,
        overlay = that.overlay,
        overlayData = _getPoints(overlay),
        relateToData = _getPoints(that.relateTo),
        constrainByData = _getPoints(that.constrainBy),
        positions = _listPositions(overlayData, relateToData), // All possible positions
        hasContain = false, // Indicates if any positions are fully contained by constrain element
        bestPos = {}, // Return value
        pos, i; // For Iteration

    // Constrain by viewport
    if (!that.skipViewport) {
        _setConstrainByViewport(constrainByData);
    }

    for (i in positions) {
        if (positions.hasOwnProperty(i)) {
            pos = positions[i];
            pos.right = pos.left + overlayData.width;
            pos.bottom = pos.top + overlayData.height;
            if (
                pos.left >= constrainByData.left &&
                pos.top >= constrainByData.top &&
                pos.right <= constrainByData.right &&
                pos.bottom <= constrainByData.bottom
            ) {
                // Inside distance. The more the better.
                // 4 distances to border of constrain
                pos.inDistance = Math.min.apply(null, [
                    pos.top - constrainByData.top,
                    constrainByData.right - pos.left + overlayData.width,
                    constrainByData.bottom - pos.top + overlayData.height,
                    pos.left - constrainByData.left
                ]);
                // Update flag
                hasContain = true;
            } else {
                // The more overlap the better
                pos.overlapSize =
                    (Math.min(pos.right, constrainByData.right) - Math.max(pos.left, constrainByData.left)) *
                    (Math.min(pos.bottom, constrainByData.bottom) - Math.max(pos.top, constrainByData.top)) ;
            }
        }
    }

    bestPos = (hasContain) ? _getMax(positions, 'inDistance') : _getMax(positions, 'overlapSize');
    overlay.offset(bestPos);

    return bestPos;
};

//if (typeof exports === 'object' && exports) { // CommonJS
module.exports = AlignMe;
//} else if (typeof define === 'function' && define.amd) { // AMD
    //define(['exports'], AlignMe);
//}

if (window.Stackla) { // Vanilla JS
    window.Stackla.AlignMe = AlignMe;
} else {
    window.AlignMe = AlignMe;
}


},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYWxpZ25tZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLypnbG9iYWwgd2luZG93LCAkLCBkZWZpbmUsIGRvY3VtZW50ICovXG4vKipcbiAqIEEgSmF2YVNjcmlwdCB1dGlsaXR5IHdoaWNoIGF1dG9tYXRpY2FsbHkgYWxpZ25zIHBvc2l0aW9uIG9mIGFuIG92ZXJsYXkuXG4gKlxuICogICAgICBAZXhhbXBsZVxuICogICAgICB2YXIgYWxpZ25NZSA9IG5ldyBBbGlnbk1lKCRvdmVybGF5LCB7XG4gKiAgICAgICAgICByZWxhdGVUbzogJy5kcmFnZ2FibGUnLFxuICogICAgICAgICAgY29uc3RyYWluQnk6ICcucGFyZW50JyxcbiAqICAgICAgICAgIHNraXBWaWV3cG9ydDogZmFsc2VcbiAqICAgICAgfSk7XG4gKiAgICAgIGFsaWduTWUuYWxpZ24oKTtcbiAqXG4gKiBAY2xhc3MgQWxpZ25NZVxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gb3ZlcmxheSBPdmVybGF5IGVsZW1lbnRcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIENvbmZpZ3VyYWJsZSBvcHRpb25zXG4gKi9cbmZ1bmN0aW9uIEFsaWduTWUob3ZlcmxheSwgb3B0aW9ucykge1xuICAgIHZhciB0aGF0ID0gdGhpcztcblxuICAgIHRoYXQub3ZlcmxheSA9ICQob3ZlcmxheSk7XG4gICAgLy89PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8gQ29uZmlnIE9wdGlvbnNcbiAgICAvLz09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvKipcbiAgICAgKiBAY2ZnIHtIVE1MRWxlbWVudH0gcmVsYXRlVG8gKHJlcXVpcmVkKVxuICAgICAqIFRoZSByZWZlcmVuY2UgZWxlbWVudFxuICAgICAqL1xuICAgIHRoYXQucmVsYXRlVG8gPSAkKG9wdGlvbnMucmVsYXRlVG8pIHx8IG51bGw7XG4gICAgLyoqXG4gICAgICogQGNmZyB7SFRNTEVsZW1lbnR9IHJlbGF0ZVRvXG4gICAgICogVGhlIHJlZmVyZW5jZSBlbGVtZW50XG4gICAgICovXG4gICAgdGhhdC5jb25zdHJhaW5CeSA9ICQob3B0aW9ucy5jb25zdHJhaW5CeSkgfHwgbnVsbDtcbiAgICAvKipcbiAgICAgKiBAY2ZnIHtIVE1MRWxlbWVudH0gW3NraXBWaWV3cG9ydD10cnVlXVxuICAgICAqIElnbm9yZSB3aW5kb3cgYXMgYW5vdGhlciBjb25zdHJhaW4gZWxlbWVudFxuICAgICAqL1xuICAgIHRoYXQuc2tpcFZpZXdwb3J0ID0gKG9wdGlvbnMuc2tpcFZpZXdwb3J0ID09PSBmYWxzZSkgPyBmYWxzZSA6IHRydWU7XG5cbiAgICAvLyBTdG9wIGlmIG92ZXJsYXkgb3Igb3B0aW9ucy5yZWxhdGVkVG8gYXJlbnQgcHJvdmlkZWRcbiAgICBpZiAoIXRoYXQub3ZlcmxheSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2BvdmVybGF5YCBlbGVtZW50IGlzIHJlcXVpcmVkJyk7XG4gICAgfVxuICAgIGlmICghdGhhdC5yZWxhdGVUbykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ByZWxhdGVUb2Agb3B0aW9uIGlzIHJlcXVpcmVkJyk7XG4gICAgfVxufVxuXG52YXIgX2dldE1heCxcbiAgICBfZ2V0UG9pbnRzLFxuICAgIF9saXN0UG9zaXRpb25zLFxuICAgIF9zZXRDb25zdHJhaW5CeVZpZXdwb3J0O1xuXG4vLyBSZXBsYWNlbWVudCBmb3IgXy5tYXhcbl9nZXRNYXggPSBmdW5jdGlvbiAob2JqLCBhdHRyKSB7XG4gICAgdmFyIG1heFZhbHVlID0gMCxcbiAgICAgICAgbWF4SXRlbSxcbiAgICAgICAgaSwgbztcblxuICAgIGZvciAoaSBpbiBvYmopIHtcbiAgICAgICAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShpKSkge1xuICAgICAgICAgICAgbyA9IG9ialtpXTtcbiAgICAgICAgICAgIGlmIChvW2F0dHJdID4gbWF4VmFsdWUpIHtcbiAgICAgICAgICAgICAgICBtYXhWYWx1ZSA9IG9bYXR0cl07XG4gICAgICAgICAgICAgICAgbWF4SXRlbSA9IG87XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbWF4SXRlbTtcbn07XG5cbi8vIEdldCBjb29yZGluYXRlcyBhbmQgZGltZW5zaW9uIG9mIGFuIGVsZW1lbnRcbl9nZXRQb2ludHMgPSBmdW5jdGlvbiAoJGVsKSB7XG4gICAgdmFyIG9mZnNldCA9ICRlbC5vZmZzZXQoKSxcbiAgICAgICAgd2lkdGggPSAkZWwub3V0ZXJXaWR0aCgpLFxuICAgICAgICBoZWlnaHQgPSAkZWwub3V0ZXJIZWlnaHQoKTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQgICA6IG9mZnNldC5sZWZ0LFxuICAgICAgICB0b3AgICAgOiBvZmZzZXQudG9wLFxuICAgICAgICByaWdodCAgOiBvZmZzZXQubGVmdCArIHdpZHRoLFxuICAgICAgICBib3R0b20gOiBvZmZzZXQudG9wICsgaGVpZ2h0LFxuICAgICAgICB3aWR0aCAgOiB3aWR0aCxcbiAgICAgICAgaGVpZ2h0IDogaGVpZ2h0XG4gICAgfTtcbn07XG5cbi8vIExpc3QgYWxsIHBvc3NpYmxlIFhZIGNvb3JkaW5kYXRlc1xuX2xpc3RQb3NpdGlvbnMgPSBmdW5jdGlvbiAob3ZlcmxheURhdGEsIHJlbGF0ZVRvRGF0YSkge1xuICAgIHZhciBjZW50ZXIgPSByZWxhdGVUb0RhdGEubGVmdCArIChyZWxhdGVUb0RhdGEud2lkdGggLyAyKSAtIChvdmVybGF5RGF0YS53aWR0aCAvIDIpO1xuXG4gICAgcmV0dXJuIFtcbiAgICAgICAgLy8gbGJsdCBbJ2xlZnQnLCAnYm90dG9tJ10sIFsnbGVmdCcsICd0b3AnXVxuICAgICAgICB7bGVmdDogcmVsYXRlVG9EYXRhLmxlZnQsIHRvcDogcmVsYXRlVG9EYXRhLnRvcCAtIG92ZXJsYXlEYXRhLmhlaWdodCwgbmFtZTogJ2xibHQnfSxcbiAgICAgICAgLy8gY2JjdCBbJ2NlbnRlcicsICdib3R0b20nXSwgWydjZW50ZXInLCAndG9wJ11cbiAgICAgICAgLy8ge2xlZnQ6IGNlbnRlciwgdG9wOiByZWxhdGVUb0RhdGEudG9wIC0gb3ZlcmxheURhdGEuaGVpZ2h0LCBuYW1lOiAnY2JjdCd9LFxuICAgICAgICAvLyByYnJ0IFsncmlnaHQnLCAnYm90dG9tJ10sIFsncmlnaHQnLCAndG9wJ11cbiAgICAgICAge2xlZnQ6IHJlbGF0ZVRvRGF0YS5yaWdodCAtIG92ZXJsYXlEYXRhLndpZHRoLCB0b3A6IHJlbGF0ZVRvRGF0YS50b3AgLSBvdmVybGF5RGF0YS5oZWlnaHQsIG5hbWU6ICdyYnJ0J30sXG5cbiAgICAgICAgLy8gbHRydCBbJ2xlZnQnLCAndG9wJ10sIFsncmlnaHQnLCAndG9wJ11cbiAgICAgICAge2xlZnQ6IHJlbGF0ZVRvRGF0YS5yaWdodCwgdG9wOiByZWxhdGVUb0RhdGEudG9wLCBuYW1lOiAnbHRydCd9LFxuICAgICAgICAvLyBsYnJiIFsnbGVmdCcsICdib3R0b20nXSwgWydyaWdodCcsICdib3R0b20nXVxuICAgICAgICB7bGVmdDogcmVsYXRlVG9EYXRhLnJpZ2h0LCB0b3A6IHJlbGF0ZVRvRGF0YS5ib3R0b20gLSBvdmVybGF5RGF0YS5oZWlnaHQsIG5hbWU6ICdsYnJiJ30sXG5cbiAgICAgICAgLy8gcnRyYiBbJ3JpZ2h0JywgJ3RvcCddLCBbJ3JpZ2h0JywgJ2JvdHRvbSddXG4gICAgICAgIHtsZWZ0OiByZWxhdGVUb0RhdGEucmlnaHQgLSBvdmVybGF5RGF0YS53aWR0aCwgdG9wOiByZWxhdGVUb0RhdGEuYm90dG9tLCBuYW1lOiAncnRyYid9LFxuICAgICAgICAvLyBjdGNiIFsnY2VudGVyJywgJ3RvcCddLCBbJ2NlbnRlcicsICdib3R0b20nXVxuICAgICAgICAvLyB7bGVmdDogY2VudGVyLCB0b3A6IHJlbGF0ZVRvRGF0YS5ib3R0b20sIG5hbWU6ICdjdGNiJ30sXG4gICAgICAgIC8vIGx0bGIgWydsZWZ0JywgJ3RvcCddLCBbJ2xlZnQnLCAnYm90dG9tJ11cbiAgICAgICAge2xlZnQ6IHJlbGF0ZVRvRGF0YS5sZWZ0LCB0b3A6IHJlbGF0ZVRvRGF0YS5ib3R0b20sIG5hbWU6ICdsdGxiJ30sXG5cbiAgICAgICAgLy8gcmJsYiBbJ3JpZ2h0JywgJ2JvdHRvbSddLCBbJ2xlZnQnLCAnYm90dG9tJ11cbiAgICAgICAge2xlZnQ6IHJlbGF0ZVRvRGF0YS5sZWZ0IC0gb3ZlcmxheURhdGEud2lkdGgsIHRvcDogcmVsYXRlVG9EYXRhLmJvdHRvbSAtIG92ZXJsYXlEYXRhLmhlaWdodCwgbmFtZTogJ3JibGInfSxcbiAgICAgICAgLy8gcnRsdCBbJ3JpZ2h0JywgJ3RvcCddLCBbJ2xlZnQnLCAndG9wJ11cbiAgICAgICAge2xlZnQ6IHJlbGF0ZVRvRGF0YS5sZWZ0IC0gb3ZlcmxheURhdGEud2lkdGgsIHRvcDogcmVsYXRlVG9EYXRhLnRvcCwgbmFtZTogJ3J0bHQnfVxuICAgIF07XG59O1xuXG4vLyBUYWtlIGN1cnJlbnQgdmlld3BvcnQvd2luZG93IGFzIGNvbnN0cmFpbi5cbl9zZXRDb25zdHJhaW5CeVZpZXdwb3J0ID0gZnVuY3Rpb24gKGNvbnN0cmFpbkJ5RGF0YSkge1xuICAgIHZhciAkd2luZG93ID0gJCh3aW5kb3cpLFxuICAgICAgICB0b3Btb3N0ID0gJHdpbmRvdy5zY3JvbGxUb3AoKSxcbiAgICAgICAgYm90dG9tbW9zdCA9IHRvcG1vc3QgKyAkd2luZG93LmhlaWdodCgpO1xuXG4gICAgaWYgKHRvcG1vc3QgPiBjb25zdHJhaW5CeURhdGEpIHtcbiAgICAgICAgY29uc3RyYWluQnlEYXRhLnRvcCA9IHRvcG1vc3Q7XG4gICAgfVxuICAgIGlmIChib3R0b21tb3N0IDwgY29uc3RyYWluQnlEYXRhLmJvdHRvbSkge1xuICAgICAgICBjb25zdHJhaW5CeURhdGEuYm90dG9tID0gYm90dG9tbW9zdDtcbiAgICAgICAgY29uc3RyYWluQnlEYXRhLmhlaWdodCA9IGJvdHRvbW1vc3QgLSB0b3Btb3N0O1xuICAgIH1cbiAgICByZXR1cm4gY29uc3RyYWluQnlEYXRhO1xufTtcblxuLyoqXG4gKiBBbGlnbiBvdmVybGF5IGF1dG9tYXRpY2FsbHlcbiAqXG4gKiBAbWV0aG9kIGFsaWduXG4gKiBAcmV0dXJuIHtBcnJheX0gVGhlIGJlc3QgWFkgY29vcmRpbmF0ZXNcbiAqL1xuQWxpZ25NZS5wcm90b3R5cGUuYWxpZ24gPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICBvdmVybGF5ID0gdGhhdC5vdmVybGF5LFxuICAgICAgICBvdmVybGF5RGF0YSA9IF9nZXRQb2ludHMob3ZlcmxheSksXG4gICAgICAgIHJlbGF0ZVRvRGF0YSA9IF9nZXRQb2ludHModGhhdC5yZWxhdGVUbyksXG4gICAgICAgIGNvbnN0cmFpbkJ5RGF0YSA9IF9nZXRQb2ludHModGhhdC5jb25zdHJhaW5CeSksXG4gICAgICAgIHBvc2l0aW9ucyA9IF9saXN0UG9zaXRpb25zKG92ZXJsYXlEYXRhLCByZWxhdGVUb0RhdGEpLCAvLyBBbGwgcG9zc2libGUgcG9zaXRpb25zXG4gICAgICAgIGhhc0NvbnRhaW4gPSBmYWxzZSwgLy8gSW5kaWNhdGVzIGlmIGFueSBwb3NpdGlvbnMgYXJlIGZ1bGx5IGNvbnRhaW5lZCBieSBjb25zdHJhaW4gZWxlbWVudFxuICAgICAgICBiZXN0UG9zID0ge30sIC8vIFJldHVybiB2YWx1ZVxuICAgICAgICBwb3MsIGk7IC8vIEZvciBJdGVyYXRpb25cblxuICAgIC8vIENvbnN0cmFpbiBieSB2aWV3cG9ydFxuICAgIGlmICghdGhhdC5za2lwVmlld3BvcnQpIHtcbiAgICAgICAgX3NldENvbnN0cmFpbkJ5Vmlld3BvcnQoY29uc3RyYWluQnlEYXRhKTtcbiAgICB9XG5cbiAgICBmb3IgKGkgaW4gcG9zaXRpb25zKSB7XG4gICAgICAgIGlmIChwb3NpdGlvbnMuaGFzT3duUHJvcGVydHkoaSkpIHtcbiAgICAgICAgICAgIHBvcyA9IHBvc2l0aW9uc1tpXTtcbiAgICAgICAgICAgIHBvcy5yaWdodCA9IHBvcy5sZWZ0ICsgb3ZlcmxheURhdGEud2lkdGg7XG4gICAgICAgICAgICBwb3MuYm90dG9tID0gcG9zLnRvcCArIG92ZXJsYXlEYXRhLmhlaWdodDtcbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICBwb3MubGVmdCA+PSBjb25zdHJhaW5CeURhdGEubGVmdCAmJlxuICAgICAgICAgICAgICAgIHBvcy50b3AgPj0gY29uc3RyYWluQnlEYXRhLnRvcCAmJlxuICAgICAgICAgICAgICAgIHBvcy5yaWdodCA8PSBjb25zdHJhaW5CeURhdGEucmlnaHQgJiZcbiAgICAgICAgICAgICAgICBwb3MuYm90dG9tIDw9IGNvbnN0cmFpbkJ5RGF0YS5ib3R0b21cbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIC8vIEluc2lkZSBkaXN0YW5jZS4gVGhlIG1vcmUgdGhlIGJldHRlci5cbiAgICAgICAgICAgICAgICAvLyA0IGRpc3RhbmNlcyB0byBib3JkZXIgb2YgY29uc3RyYWluXG4gICAgICAgICAgICAgICAgcG9zLmluRGlzdGFuY2UgPSBNYXRoLm1pbi5hcHBseShudWxsLCBbXG4gICAgICAgICAgICAgICAgICAgIHBvcy50b3AgLSBjb25zdHJhaW5CeURhdGEudG9wLFxuICAgICAgICAgICAgICAgICAgICBjb25zdHJhaW5CeURhdGEucmlnaHQgLSBwb3MubGVmdCArIG92ZXJsYXlEYXRhLndpZHRoLFxuICAgICAgICAgICAgICAgICAgICBjb25zdHJhaW5CeURhdGEuYm90dG9tIC0gcG9zLnRvcCArIG92ZXJsYXlEYXRhLmhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgcG9zLmxlZnQgLSBjb25zdHJhaW5CeURhdGEubGVmdFxuICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgIC8vIFVwZGF0ZSBmbGFnXG4gICAgICAgICAgICAgICAgaGFzQ29udGFpbiA9IHRydWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIFRoZSBtb3JlIG92ZXJsYXAgdGhlIGJldHRlclxuICAgICAgICAgICAgICAgIHBvcy5vdmVybGFwU2l6ZSA9XG4gICAgICAgICAgICAgICAgICAgIChNYXRoLm1pbihwb3MucmlnaHQsIGNvbnN0cmFpbkJ5RGF0YS5yaWdodCkgLSBNYXRoLm1heChwb3MubGVmdCwgY29uc3RyYWluQnlEYXRhLmxlZnQpKSAqXG4gICAgICAgICAgICAgICAgICAgIChNYXRoLm1pbihwb3MuYm90dG9tLCBjb25zdHJhaW5CeURhdGEuYm90dG9tKSAtIE1hdGgubWF4KHBvcy50b3AsIGNvbnN0cmFpbkJ5RGF0YS50b3ApKSA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBiZXN0UG9zID0gKGhhc0NvbnRhaW4pID8gX2dldE1heChwb3NpdGlvbnMsICdpbkRpc3RhbmNlJykgOiBfZ2V0TWF4KHBvc2l0aW9ucywgJ292ZXJsYXBTaXplJyk7XG4gICAgb3ZlcmxheS5vZmZzZXQoYmVzdFBvcyk7XG5cbiAgICByZXR1cm4gYmVzdFBvcztcbn07XG5cbi8vaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiBleHBvcnRzKSB7IC8vIENvbW1vbkpTXG5tb2R1bGUuZXhwb3J0cyA9IEFsaWduTWU7XG4vL30gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7IC8vIEFNRFxuICAgIC8vZGVmaW5lKFsnZXhwb3J0cyddLCBBbGlnbk1lKTtcbi8vfVxuXG5pZiAod2luZG93LlN0YWNrbGEpIHsgLy8gVmFuaWxsYSBKU1xuICAgIHdpbmRvdy5TdGFja2xhLkFsaWduTWUgPSBBbGlnbk1lO1xufSBlbHNlIHtcbiAgICB3aW5kb3cuQWxpZ25NZSA9IEFsaWduTWU7XG59XG5cbiJdfQ==

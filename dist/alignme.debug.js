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

//if (window.Stackla) { // Vanilla JS
    //window.Stackla.AlignMe = AlignMe;
//} else {
    //window.AlignMe = AlignMe;
//}

//if (typeof exports === 'object' && exports) { // CommonJS
//} else if (typeof define === 'function' && define.amd) { // AMD
    //define(['exports'], AlignMe);
//}
module.exports = AlignMe;


},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYWxpZ25tZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKmdsb2JhbCB3aW5kb3csICQsIGRlZmluZSwgZG9jdW1lbnQgKi9cbi8qKlxuICogQSBKYXZhU2NyaXB0IHV0aWxpdHkgd2hpY2ggYXV0b21hdGljYWxseSBhbGlnbnMgcG9zaXRpb24gb2YgYW4gb3ZlcmxheS5cbiAqXG4gKiAgICAgIEBleGFtcGxlXG4gKiAgICAgIHZhciBhbGlnbk1lID0gbmV3IEFsaWduTWUoJG92ZXJsYXksIHtcbiAqICAgICAgICAgIHJlbGF0ZVRvOiAnLmRyYWdnYWJsZScsXG4gKiAgICAgICAgICBjb25zdHJhaW5CeTogJy5wYXJlbnQnLFxuICogICAgICAgICAgc2tpcFZpZXdwb3J0OiBmYWxzZVxuICogICAgICB9KTtcbiAqICAgICAgYWxpZ25NZS5hbGlnbigpO1xuICpcbiAqIEBjbGFzcyBBbGlnbk1lXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBvdmVybGF5IE92ZXJsYXkgZWxlbWVudFxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgQ29uZmlndXJhYmxlIG9wdGlvbnNcbiAqL1xuXG5mdW5jdGlvbiBBbGlnbk1lKG92ZXJsYXksIG9wdGlvbnMpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG5cbiAgICB0aGF0Lm92ZXJsYXkgPSAkKG92ZXJsYXkpO1xuICAgIC8vPT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIENvbmZpZyBPcHRpb25zXG4gICAgLy89PT09PT09PT09PT09PT09PT09PT09XG4gICAgLyoqXG4gICAgICogQGNmZyB7SFRNTEVsZW1lbnR9IHJlbGF0ZVRvIChyZXF1aXJlZClcbiAgICAgKiBUaGUgcmVmZXJlbmNlIGVsZW1lbnRcbiAgICAgKi9cbiAgICB0aGF0LnJlbGF0ZVRvID0gJChvcHRpb25zLnJlbGF0ZVRvKSB8fCBudWxsO1xuICAgIC8qKlxuICAgICAqIEBjZmcge0hUTUxFbGVtZW50fSByZWxhdGVUb1xuICAgICAqIFRoZSByZWZlcmVuY2UgZWxlbWVudFxuICAgICAqL1xuICAgIHRoYXQuY29uc3RyYWluQnkgPSAkKG9wdGlvbnMuY29uc3RyYWluQnkpIHx8IG51bGw7XG4gICAgLyoqXG4gICAgICogQGNmZyB7SFRNTEVsZW1lbnR9IFtza2lwVmlld3BvcnQ9dHJ1ZV1cbiAgICAgKiBJZ25vcmUgd2luZG93IGFzIGFub3RoZXIgY29uc3RyYWluIGVsZW1lbnRcbiAgICAgKi9cbiAgICB0aGF0LnNraXBWaWV3cG9ydCA9IChvcHRpb25zLnNraXBWaWV3cG9ydCA9PT0gZmFsc2UpID8gZmFsc2UgOiB0cnVlO1xuXG4gICAgLy8gU3RvcCBpZiBvdmVybGF5IG9yIG9wdGlvbnMucmVsYXRlZFRvIGFyZW50IHByb3ZpZGVkXG4gICAgaWYgKCF0aGF0Lm92ZXJsYXkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdgb3ZlcmxheWAgZWxlbWVudCBpcyByZXF1aXJlZCcpO1xuICAgIH1cbiAgICBpZiAoIXRoYXQucmVsYXRlVG8pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdgcmVsYXRlVG9gIG9wdGlvbiBpcyByZXF1aXJlZCcpO1xuICAgIH1cbn1cblxudmFyIF9nZXRNYXgsXG4gICAgX2dldFBvaW50cyxcbiAgICBfbGlzdFBvc2l0aW9ucyxcbiAgICBfc2V0Q29uc3RyYWluQnlWaWV3cG9ydDtcblxuLy8gUmVwbGFjZW1lbnQgZm9yIF8ubWF4XG5fZ2V0TWF4ID0gZnVuY3Rpb24gKG9iaiwgYXR0cikge1xuICAgIHZhciBtYXhWYWx1ZSA9IDAsXG4gICAgICAgIG1heEl0ZW0sXG4gICAgICAgIGksIG87XG5cbiAgICBmb3IgKGkgaW4gb2JqKSB7XG4gICAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkoaSkpIHtcbiAgICAgICAgICAgIG8gPSBvYmpbaV07XG4gICAgICAgICAgICBpZiAob1thdHRyXSA+IG1heFZhbHVlKSB7XG4gICAgICAgICAgICAgICAgbWF4VmFsdWUgPSBvW2F0dHJdO1xuICAgICAgICAgICAgICAgIG1heEl0ZW0gPSBvO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG1heEl0ZW07XG59O1xuXG4vLyBHZXQgY29vcmRpbmF0ZXMgYW5kIGRpbWVuc2lvbiBvZiBhbiBlbGVtZW50XG5fZ2V0UG9pbnRzID0gZnVuY3Rpb24gKCRlbCkge1xuICAgIHZhciBvZmZzZXQgPSAkZWwub2Zmc2V0KCksXG4gICAgICAgIHdpZHRoID0gJGVsLm91dGVyV2lkdGgoKSxcbiAgICAgICAgaGVpZ2h0ID0gJGVsLm91dGVySGVpZ2h0KCk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0ICAgOiBvZmZzZXQubGVmdCxcbiAgICAgICAgdG9wICAgIDogb2Zmc2V0LnRvcCxcbiAgICAgICAgcmlnaHQgIDogb2Zmc2V0LmxlZnQgKyB3aWR0aCxcbiAgICAgICAgYm90dG9tIDogb2Zmc2V0LnRvcCArIGhlaWdodCxcbiAgICAgICAgd2lkdGggIDogd2lkdGgsXG4gICAgICAgIGhlaWdodCA6IGhlaWdodFxuICAgIH07XG59O1xuXG4vLyBMaXN0IGFsbCBwb3NzaWJsZSBYWSBjb29yZGluZGF0ZXNcbl9saXN0UG9zaXRpb25zID0gZnVuY3Rpb24gKG92ZXJsYXlEYXRhLCByZWxhdGVUb0RhdGEpIHtcbiAgICB2YXIgY2VudGVyID0gcmVsYXRlVG9EYXRhLmxlZnQgKyAocmVsYXRlVG9EYXRhLndpZHRoIC8gMikgLSAob3ZlcmxheURhdGEud2lkdGggLyAyKTtcblxuICAgIHJldHVybiBbXG4gICAgICAgIC8vIGxibHQgWydsZWZ0JywgJ2JvdHRvbSddLCBbJ2xlZnQnLCAndG9wJ11cbiAgICAgICAge2xlZnQ6IHJlbGF0ZVRvRGF0YS5sZWZ0LCB0b3A6IHJlbGF0ZVRvRGF0YS50b3AgLSBvdmVybGF5RGF0YS5oZWlnaHQsIG5hbWU6ICdsYmx0J30sXG4gICAgICAgIC8vIGNiY3QgWydjZW50ZXInLCAnYm90dG9tJ10sIFsnY2VudGVyJywgJ3RvcCddXG4gICAgICAgIC8vIHtsZWZ0OiBjZW50ZXIsIHRvcDogcmVsYXRlVG9EYXRhLnRvcCAtIG92ZXJsYXlEYXRhLmhlaWdodCwgbmFtZTogJ2NiY3QnfSxcbiAgICAgICAgLy8gcmJydCBbJ3JpZ2h0JywgJ2JvdHRvbSddLCBbJ3JpZ2h0JywgJ3RvcCddXG4gICAgICAgIHtsZWZ0OiByZWxhdGVUb0RhdGEucmlnaHQgLSBvdmVybGF5RGF0YS53aWR0aCwgdG9wOiByZWxhdGVUb0RhdGEudG9wIC0gb3ZlcmxheURhdGEuaGVpZ2h0LCBuYW1lOiAncmJydCd9LFxuXG4gICAgICAgIC8vIGx0cnQgWydsZWZ0JywgJ3RvcCddLCBbJ3JpZ2h0JywgJ3RvcCddXG4gICAgICAgIHtsZWZ0OiByZWxhdGVUb0RhdGEucmlnaHQsIHRvcDogcmVsYXRlVG9EYXRhLnRvcCwgbmFtZTogJ2x0cnQnfSxcbiAgICAgICAgLy8gbGJyYiBbJ2xlZnQnLCAnYm90dG9tJ10sIFsncmlnaHQnLCAnYm90dG9tJ11cbiAgICAgICAge2xlZnQ6IHJlbGF0ZVRvRGF0YS5yaWdodCwgdG9wOiByZWxhdGVUb0RhdGEuYm90dG9tIC0gb3ZlcmxheURhdGEuaGVpZ2h0LCBuYW1lOiAnbGJyYid9LFxuXG4gICAgICAgIC8vIHJ0cmIgWydyaWdodCcsICd0b3AnXSwgWydyaWdodCcsICdib3R0b20nXVxuICAgICAgICB7bGVmdDogcmVsYXRlVG9EYXRhLnJpZ2h0IC0gb3ZlcmxheURhdGEud2lkdGgsIHRvcDogcmVsYXRlVG9EYXRhLmJvdHRvbSwgbmFtZTogJ3J0cmInfSxcbiAgICAgICAgLy8gY3RjYiBbJ2NlbnRlcicsICd0b3AnXSwgWydjZW50ZXInLCAnYm90dG9tJ11cbiAgICAgICAgLy8ge2xlZnQ6IGNlbnRlciwgdG9wOiByZWxhdGVUb0RhdGEuYm90dG9tLCBuYW1lOiAnY3RjYid9LFxuICAgICAgICAvLyBsdGxiIFsnbGVmdCcsICd0b3AnXSwgWydsZWZ0JywgJ2JvdHRvbSddXG4gICAgICAgIHtsZWZ0OiByZWxhdGVUb0RhdGEubGVmdCwgdG9wOiByZWxhdGVUb0RhdGEuYm90dG9tLCBuYW1lOiAnbHRsYid9LFxuXG4gICAgICAgIC8vIHJibGIgWydyaWdodCcsICdib3R0b20nXSwgWydsZWZ0JywgJ2JvdHRvbSddXG4gICAgICAgIHtsZWZ0OiByZWxhdGVUb0RhdGEubGVmdCAtIG92ZXJsYXlEYXRhLndpZHRoLCB0b3A6IHJlbGF0ZVRvRGF0YS5ib3R0b20gLSBvdmVybGF5RGF0YS5oZWlnaHQsIG5hbWU6ICdyYmxiJ30sXG4gICAgICAgIC8vIHJ0bHQgWydyaWdodCcsICd0b3AnXSwgWydsZWZ0JywgJ3RvcCddXG4gICAgICAgIHtsZWZ0OiByZWxhdGVUb0RhdGEubGVmdCAtIG92ZXJsYXlEYXRhLndpZHRoLCB0b3A6IHJlbGF0ZVRvRGF0YS50b3AsIG5hbWU6ICdydGx0J31cbiAgICBdO1xufTtcblxuLy8gVGFrZSBjdXJyZW50IHZpZXdwb3J0L3dpbmRvdyBhcyBjb25zdHJhaW4uXG5fc2V0Q29uc3RyYWluQnlWaWV3cG9ydCA9IGZ1bmN0aW9uIChjb25zdHJhaW5CeURhdGEpIHtcbiAgICB2YXIgJHdpbmRvdyA9ICQod2luZG93KSxcbiAgICAgICAgdG9wbW9zdCA9ICR3aW5kb3cuc2Nyb2xsVG9wKCksXG4gICAgICAgIGJvdHRvbW1vc3QgPSB0b3Btb3N0ICsgJHdpbmRvdy5oZWlnaHQoKTtcblxuICAgIGlmICh0b3Btb3N0ID4gY29uc3RyYWluQnlEYXRhKSB7XG4gICAgICAgIGNvbnN0cmFpbkJ5RGF0YS50b3AgPSB0b3Btb3N0O1xuICAgIH1cbiAgICBpZiAoYm90dG9tbW9zdCA8IGNvbnN0cmFpbkJ5RGF0YS5ib3R0b20pIHtcbiAgICAgICAgY29uc3RyYWluQnlEYXRhLmJvdHRvbSA9IGJvdHRvbW1vc3Q7XG4gICAgICAgIGNvbnN0cmFpbkJ5RGF0YS5oZWlnaHQgPSBib3R0b21tb3N0IC0gdG9wbW9zdDtcbiAgICB9XG4gICAgcmV0dXJuIGNvbnN0cmFpbkJ5RGF0YTtcbn07XG5cbi8qKlxuICogQWxpZ24gb3ZlcmxheSBhdXRvbWF0aWNhbGx5XG4gKlxuICogQG1ldGhvZCBhbGlnblxuICogQHJldHVybiB7QXJyYXl9IFRoZSBiZXN0IFhZIGNvb3JkaW5hdGVzXG4gKi9cbkFsaWduTWUucHJvdG90eXBlLmFsaWduID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgb3ZlcmxheSA9IHRoYXQub3ZlcmxheSxcbiAgICAgICAgb3ZlcmxheURhdGEgPSBfZ2V0UG9pbnRzKG92ZXJsYXkpLFxuICAgICAgICByZWxhdGVUb0RhdGEgPSBfZ2V0UG9pbnRzKHRoYXQucmVsYXRlVG8pLFxuICAgICAgICBjb25zdHJhaW5CeURhdGEgPSBfZ2V0UG9pbnRzKHRoYXQuY29uc3RyYWluQnkpLFxuICAgICAgICBwb3NpdGlvbnMgPSBfbGlzdFBvc2l0aW9ucyhvdmVybGF5RGF0YSwgcmVsYXRlVG9EYXRhKSwgLy8gQWxsIHBvc3NpYmxlIHBvc2l0aW9uc1xuICAgICAgICBoYXNDb250YWluID0gZmFsc2UsIC8vIEluZGljYXRlcyBpZiBhbnkgcG9zaXRpb25zIGFyZSBmdWxseSBjb250YWluZWQgYnkgY29uc3RyYWluIGVsZW1lbnRcbiAgICAgICAgYmVzdFBvcyA9IHt9LCAvLyBSZXR1cm4gdmFsdWVcbiAgICAgICAgcG9zLCBpOyAvLyBGb3IgSXRlcmF0aW9uXG5cbiAgICAvLyBDb25zdHJhaW4gYnkgdmlld3BvcnRcbiAgICBpZiAoIXRoYXQuc2tpcFZpZXdwb3J0KSB7XG4gICAgICAgIF9zZXRDb25zdHJhaW5CeVZpZXdwb3J0KGNvbnN0cmFpbkJ5RGF0YSk7XG4gICAgfVxuXG4gICAgZm9yIChpIGluIHBvc2l0aW9ucykge1xuICAgICAgICBpZiAocG9zaXRpb25zLmhhc093blByb3BlcnR5KGkpKSB7XG4gICAgICAgICAgICBwb3MgPSBwb3NpdGlvbnNbaV07XG4gICAgICAgICAgICBwb3MucmlnaHQgPSBwb3MubGVmdCArIG92ZXJsYXlEYXRhLndpZHRoO1xuICAgICAgICAgICAgcG9zLmJvdHRvbSA9IHBvcy50b3AgKyBvdmVybGF5RGF0YS5oZWlnaHQ7XG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgcG9zLmxlZnQgPj0gY29uc3RyYWluQnlEYXRhLmxlZnQgJiZcbiAgICAgICAgICAgICAgICBwb3MudG9wID49IGNvbnN0cmFpbkJ5RGF0YS50b3AgJiZcbiAgICAgICAgICAgICAgICBwb3MucmlnaHQgPD0gY29uc3RyYWluQnlEYXRhLnJpZ2h0ICYmXG4gICAgICAgICAgICAgICAgcG9zLmJvdHRvbSA8PSBjb25zdHJhaW5CeURhdGEuYm90dG9tXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAvLyBJbnNpZGUgZGlzdGFuY2UuIFRoZSBtb3JlIHRoZSBiZXR0ZXIuXG4gICAgICAgICAgICAgICAgLy8gNCBkaXN0YW5jZXMgdG8gYm9yZGVyIG9mIGNvbnN0cmFpblxuICAgICAgICAgICAgICAgIHBvcy5pbkRpc3RhbmNlID0gTWF0aC5taW4uYXBwbHkobnVsbCwgW1xuICAgICAgICAgICAgICAgICAgICBwb3MudG9wIC0gY29uc3RyYWluQnlEYXRhLnRvcCxcbiAgICAgICAgICAgICAgICAgICAgY29uc3RyYWluQnlEYXRhLnJpZ2h0IC0gcG9zLmxlZnQgKyBvdmVybGF5RGF0YS53aWR0aCxcbiAgICAgICAgICAgICAgICAgICAgY29uc3RyYWluQnlEYXRhLmJvdHRvbSAtIHBvcy50b3AgKyBvdmVybGF5RGF0YS5oZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgIHBvcy5sZWZ0IC0gY29uc3RyYWluQnlEYXRhLmxlZnRcbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICAvLyBVcGRhdGUgZmxhZ1xuICAgICAgICAgICAgICAgIGhhc0NvbnRhaW4gPSB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBUaGUgbW9yZSBvdmVybGFwIHRoZSBiZXR0ZXJcbiAgICAgICAgICAgICAgICBwb3Mub3ZlcmxhcFNpemUgPVxuICAgICAgICAgICAgICAgICAgICAoTWF0aC5taW4ocG9zLnJpZ2h0LCBjb25zdHJhaW5CeURhdGEucmlnaHQpIC0gTWF0aC5tYXgocG9zLmxlZnQsIGNvbnN0cmFpbkJ5RGF0YS5sZWZ0KSkgKlxuICAgICAgICAgICAgICAgICAgICAoTWF0aC5taW4ocG9zLmJvdHRvbSwgY29uc3RyYWluQnlEYXRhLmJvdHRvbSkgLSBNYXRoLm1heChwb3MudG9wLCBjb25zdHJhaW5CeURhdGEudG9wKSkgO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgYmVzdFBvcyA9IChoYXNDb250YWluKSA/IF9nZXRNYXgocG9zaXRpb25zLCAnaW5EaXN0YW5jZScpIDogX2dldE1heChwb3NpdGlvbnMsICdvdmVybGFwU2l6ZScpO1xuICAgIG92ZXJsYXkub2Zmc2V0KGJlc3RQb3MpO1xuXG4gICAgcmV0dXJuIGJlc3RQb3M7XG59O1xuXG4vL2lmICh3aW5kb3cuU3RhY2tsYSkgeyAvLyBWYW5pbGxhIEpTXG4gICAgLy93aW5kb3cuU3RhY2tsYS5BbGlnbk1lID0gQWxpZ25NZTtcbi8vfSBlbHNlIHtcbiAgICAvL3dpbmRvdy5BbGlnbk1lID0gQWxpZ25NZTtcbi8vfVxuXG4vL2lmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgZXhwb3J0cykgeyAvLyBDb21tb25KU1xuLy99IGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkgeyAvLyBBTURcbiAgICAvL2RlZmluZShbJ2V4cG9ydHMnXSwgQWxpZ25NZSk7XG4vL31cbm1vZHVsZS5leHBvcnRzID0gQWxpZ25NZTtcblxuIl19

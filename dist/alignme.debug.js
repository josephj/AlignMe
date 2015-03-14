// DON'T MODIFY THIS FILE!
// MODIFY ITS SOURCE FILE!
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*global window, $, define, document */
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

var getMax = function (obj, attr) {
    var max = 0,
        maxItem,
        i, o;

    for (i in obj) {
        if (obj.hasOwnProperty(i)) {
            o = obj[i];
            if (o[attr] > max) {
                max = o[attr];
                maxItem = o;
            }
        }
    }
    return maxItem;
};

var proto = {
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
            bestPos,
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
            bottommost,
            i, distances;

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

        for (i in positions) {
            if (positions.hasOwnProperty(i)) {
                pos = positions[i];
                // 4 distances to border of constrain
                distances = [
                    pos.top - constrainByData.top,
                    constrainByData.right - pos.left + overlayData.width,
                    constrainByData.bottom - pos.top + overlayData.height,
                    pos.left - constrainByData.left
                ];
                pos.right = pos.left + overlayData.width;
                pos.bottom = pos.top + overlayData.height;
                if (
                    pos.left >= constrainByData.left &&
                    pos.top >= constrainByData.top &&
                    pos.right <= constrainByData.right &&
                    pos.bottom <= constrainByData.bottom
                ) {
                    hasBest = true;
                    // Inside distance. The more the better.
                    pos.inDistance = Math.min.apply(null, distances);
                } else {
                    pos.distances = distances;
                    // The more overlap the better
                    pos.overlapSize =
                        (Math.min(pos.right, constrainByData.right) - Math.max(pos.left, constrainByData.left)) *
                        (Math.min(pos.bottom, constrainByData.bottom) - Math.max(pos.top, constrainByData.top)) ;
                }
            }
        }

        bestPos = (hasBest) ? getMax(positions, 'inDistance') : getMax(positions, 'overlapSize');
        overlay.offset(bestPos);
    }
};

$.extend(AlignMe.prototype, proto);

if (typeof exports === 'object' && exports) { // CommonJS
    module.exports = AlignMe;
} else if (typeof define === 'function' && define.amd) { // AMD
    define(['exports'], AlignMe);
}

if (window.Stackla) { // Vanilla JS
    window.Stackla.AlignMe = AlignMe;
} else {
    window.AlignMe = AlignMe;
}


},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYWxpZ25tZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKmdsb2JhbCB3aW5kb3csICQsIGRlZmluZSwgZG9jdW1lbnQgKi9cbmZ1bmN0aW9uIEFsaWduTWUob3ZlcmxheSwgb3B0aW9ucykge1xuICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAvLyBDb25maWd1cmFibGUgQXR0cmlidXRlc1xuICAgIHRoYXQub3ZlcmxheSAgICAgPSAkKG92ZXJsYXkpO1xuICAgIHRoYXQucmVsYXRlVG8gICAgPSAkKG9wdGlvbnMucmVsYXRlVG8pIHx8IG51bGw7XG4gICAgdGhhdC5jb25zdHJhaW5CeSA9ICQob3B0aW9ucy5jb25zdHJhaW5CeSkgfHwgbnVsbDtcbiAgICB0aGF0LnNraXBWaWV3cG9ydCA9IChvcHRpb25zLnNraXBWaWV3cG9ydCA9PT0gZmFsc2UpID8gZmFsc2UgOiB0cnVlO1xuICAgIGlmICghdGhhdC5vdmVybGF5KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignYGVsYCBlbGVtZW50IGlzIHJlcXVpcmVkJyk7XG4gICAgfVxuICAgIGlmICghdGhhdC5yZWxhdGVUbykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ByZWxhdGVUb2Agb3B0aW9uIGlzIHJlcXVpcmVkJyk7XG4gICAgfVxufVxuXG52YXIgZ2V0TWF4ID0gZnVuY3Rpb24gKG9iaiwgYXR0cikge1xuICAgIHZhciBtYXggPSAwLFxuICAgICAgICBtYXhJdGVtLFxuICAgICAgICBpLCBvO1xuXG4gICAgZm9yIChpIGluIG9iaikge1xuICAgICAgICBpZiAob2JqLmhhc093blByb3BlcnR5KGkpKSB7XG4gICAgICAgICAgICBvID0gb2JqW2ldO1xuICAgICAgICAgICAgaWYgKG9bYXR0cl0gPiBtYXgpIHtcbiAgICAgICAgICAgICAgICBtYXggPSBvW2F0dHJdO1xuICAgICAgICAgICAgICAgIG1heEl0ZW0gPSBvO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBtYXhJdGVtO1xufTtcblxudmFyIHByb3RvID0ge1xuICAgIGdldFBvaW50czogZnVuY3Rpb24gKCRlbCkge1xuICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICBvZmZzZXQgPSAkZWwub2Zmc2V0KCksXG4gICAgICAgICAgICB3aWR0aCA9ICRlbC5vdXRlcldpZHRoKCksXG4gICAgICAgICAgICBoZWlnaHQgPSAkZWwub3V0ZXJIZWlnaHQoKTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbGVmdCAgIDogb2Zmc2V0LmxlZnQsXG4gICAgICAgICAgICB0b3AgICAgOiBvZmZzZXQudG9wLFxuICAgICAgICAgICAgcmlnaHQgIDogb2Zmc2V0LmxlZnQgKyB3aWR0aCxcbiAgICAgICAgICAgIGJvdHRvbSA6IG9mZnNldC50b3AgKyBoZWlnaHQsXG4gICAgICAgICAgICB3aWR0aCAgOiB3aWR0aCxcbiAgICAgICAgICAgIGhlaWdodCA6IGhlaWdodFxuICAgICAgICB9O1xuICAgIH0sXG4gICAgZ2V0UG9zaXRpb25zOiBmdW5jdGlvbiAob3ZlcmxheURhdGEsIHJlbGF0ZVRvRGF0YSkge1xuICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICBjZW50ZXIgPSByZWxhdGVUb0RhdGEubGVmdCArIChyZWxhdGVUb0RhdGEud2lkdGggLyAyKSAtIChvdmVybGF5RGF0YS53aWR0aCAvIDIpO1xuXG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAvLyBsYmx0IFsnbGVmdCcsICdib3R0b20nXSwgWydsZWZ0JywgJ3RvcCddXG4gICAgICAgICAgICB7bGVmdDogcmVsYXRlVG9EYXRhLmxlZnQsIHRvcDogcmVsYXRlVG9EYXRhLnRvcCAtIG92ZXJsYXlEYXRhLmhlaWdodCwgbmFtZTogJ2xibHQnfSxcbiAgICAgICAgICAgIC8vIGNiY3QgWydjZW50ZXInLCAnYm90dG9tJ10sIFsnY2VudGVyJywgJ3RvcCddXG4gICAgICAgICAgICAvLyB7bGVmdDogY2VudGVyLCB0b3A6IHJlbGF0ZVRvRGF0YS50b3AgLSBvdmVybGF5RGF0YS5oZWlnaHQsIG5hbWU6ICdjYmN0J30sIC8vIFRPRE9cbiAgICAgICAgICAgIC8vIHJicnQgWydyaWdodCcsICdib3R0b20nXSwgWydyaWdodCcsICd0b3AnXVxuICAgICAgICAgICAge2xlZnQ6IHJlbGF0ZVRvRGF0YS5yaWdodCAtIG92ZXJsYXlEYXRhLndpZHRoLCB0b3A6IHJlbGF0ZVRvRGF0YS50b3AgLSBvdmVybGF5RGF0YS5oZWlnaHQsIG5hbWU6ICdyYnJ0J30sXG5cbiAgICAgICAgICAgIC8vIGx0cnQgWydsZWZ0JywgJ3RvcCddLCBbJ3JpZ2h0JywgJ3RvcCddXG4gICAgICAgICAgICB7bGVmdDogcmVsYXRlVG9EYXRhLnJpZ2h0LCB0b3A6IHJlbGF0ZVRvRGF0YS50b3AsIG5hbWU6ICdsdHJ0J30sXG4gICAgICAgICAgICAvLyBsYnJiIFsnbGVmdCcsICdib3R0b20nXSwgWydyaWdodCcsICdib3R0b20nXVxuICAgICAgICAgICAge2xlZnQ6IHJlbGF0ZVRvRGF0YS5yaWdodCwgdG9wOiByZWxhdGVUb0RhdGEuYm90dG9tIC0gb3ZlcmxheURhdGEuaGVpZ2h0LCBuYW1lOiAnbGJyYid9LFxuXG4gICAgICAgICAgICAvLyBydHJiIFsncmlnaHQnLCAndG9wJ10sIFsncmlnaHQnLCAnYm90dG9tJ11cbiAgICAgICAgICAgIHtsZWZ0OiByZWxhdGVUb0RhdGEucmlnaHQgLSBvdmVybGF5RGF0YS53aWR0aCwgdG9wOiByZWxhdGVUb0RhdGEuYm90dG9tLCBuYW1lOiAncnRyYid9LFxuICAgICAgICAgICAgLy8gY3RjYiBbJ2NlbnRlcicsICd0b3AnXSwgWydjZW50ZXInLCAnYm90dG9tJ11cbiAgICAgICAgICAgIC8vIHtsZWZ0OiBjZW50ZXIsIHRvcDogcmVsYXRlVG9EYXRhLmJvdHRvbSwgbmFtZTogJ2N0Y2InfSwgLy8gVE9ET1xuICAgICAgICAgICAgLy8gbHRsYiBbJ2xlZnQnLCAndG9wJ10sIFsnbGVmdCcsICdib3R0b20nXVxuICAgICAgICAgICAge2xlZnQ6IHJlbGF0ZVRvRGF0YS5sZWZ0LCB0b3A6IHJlbGF0ZVRvRGF0YS5ib3R0b20sIG5hbWU6ICdsdGxiJ30sXG5cbiAgICAgICAgICAgIC8vIHJibGIgWydyaWdodCcsICdib3R0b20nXSwgWydsZWZ0JywgJ2JvdHRvbSddXG4gICAgICAgICAgICB7bGVmdDogcmVsYXRlVG9EYXRhLmxlZnQgLSBvdmVybGF5RGF0YS53aWR0aCwgdG9wOiByZWxhdGVUb0RhdGEuYm90dG9tIC0gb3ZlcmxheURhdGEuaGVpZ2h0LCBuYW1lOiAncmJsYid9LFxuICAgICAgICAgICAgLy8gcnRsdCBbJ3JpZ2h0JywgJ3RvcCddLCBbJ2xlZnQnLCAndG9wJ11cbiAgICAgICAgICAgIHtsZWZ0OiByZWxhdGVUb0RhdGEubGVmdCAtIG92ZXJsYXlEYXRhLndpZHRoLCB0b3A6IHJlbGF0ZVRvRGF0YS50b3AsIG5hbWU6ICdydGx0J31cbiAgICAgICAgXTtcbiAgICB9LFxuICAgIGFsaWduOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgIGhhc0Jlc3QgPSBmYWxzZSxcbiAgICAgICAgICAgIGJlc3RQb3MsXG4gICAgICAgICAgICBwb3MsXG4gICAgICAgICAgICBwb3NpdGlvbnMsXG4gICAgICAgICAgICBvdmVybGF5ID0gdGhhdC5vdmVybGF5LFxuICAgICAgICAgICAgcmVsYXRlVG8gPSB0aGF0LnJlbGF0ZVRvLFxuICAgICAgICAgICAgY29uc3RyYWluQnkgPSB0aGF0LmNvbnN0cmFpbkJ5LFxuICAgICAgICAgICAgLy8gT3ZlcmxheVxuICAgICAgICAgICAgb3ZlcmxheURhdGEgPSB0aGF0LmdldFBvaW50cyhvdmVybGF5KSxcbiAgICAgICAgICAgIHJlbGF0ZVRvRGF0YSA9IHRoYXQuZ2V0UG9pbnRzKHJlbGF0ZVRvKSxcbiAgICAgICAgICAgIGNvbnN0cmFpbkJ5RGF0YSA9IHRoYXQuZ2V0UG9pbnRzKGNvbnN0cmFpbkJ5KSxcbiAgICAgICAgICAgIC8vIENvbnN0cmFpbiBieSB2aWV3cG9ydFxuICAgICAgICAgICAgJHdpbmRvdyxcbiAgICAgICAgICAgIHRvcG1vc3QsXG4gICAgICAgICAgICBib3R0b21tb3N0LFxuICAgICAgICAgICAgaSwgZGlzdGFuY2VzO1xuXG4gICAgICAgIC8vIEdldCBhbGwgcG9zc2libGUgcG9zaXRpb25zXG4gICAgICAgIHBvc2l0aW9ucyA9IHRoYXQuZ2V0UG9zaXRpb25zKG92ZXJsYXlEYXRhLCByZWxhdGVUb0RhdGEpO1xuXG4gICAgICAgIGlmICghdGhhdC5za2lwVmlld3BvcnQpIHtcbiAgICAgICAgICAgICR3aW5kb3cgPSAkKHdpbmRvdyk7XG4gICAgICAgICAgICB0b3Btb3N0ID0gJHdpbmRvdy5zY3JvbGxUb3AoKTtcbiAgICAgICAgICAgIGJvdHRvbW1vc3QgPSB0b3Btb3N0ICsgJHdpbmRvdy5oZWlnaHQoKTtcbiAgICAgICAgICAgIGlmICh0b3Btb3N0ID4gY29uc3RyYWluQnlEYXRhKSB7XG4gICAgICAgICAgICAgICAgY29uc3RyYWluQnlEYXRhLnRvcCA9IHRvcG1vc3Q7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYm90dG9tbW9zdCA8IGNvbnN0cmFpbkJ5RGF0YS5ib3R0b20pIHtcbiAgICAgICAgICAgICAgICBjb25zdHJhaW5CeURhdGEuYm90dG9tID0gYm90dG9tbW9zdDtcbiAgICAgICAgICAgICAgICBjb25zdHJhaW5CeURhdGEuaGVpZ2h0ID0gYm90dG9tbW9zdCAtIHRvcG1vc3Q7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGkgaW4gcG9zaXRpb25zKSB7XG4gICAgICAgICAgICBpZiAocG9zaXRpb25zLmhhc093blByb3BlcnR5KGkpKSB7XG4gICAgICAgICAgICAgICAgcG9zID0gcG9zaXRpb25zW2ldO1xuICAgICAgICAgICAgICAgIC8vIDQgZGlzdGFuY2VzIHRvIGJvcmRlciBvZiBjb25zdHJhaW5cbiAgICAgICAgICAgICAgICBkaXN0YW5jZXMgPSBbXG4gICAgICAgICAgICAgICAgICAgIHBvcy50b3AgLSBjb25zdHJhaW5CeURhdGEudG9wLFxuICAgICAgICAgICAgICAgICAgICBjb25zdHJhaW5CeURhdGEucmlnaHQgLSBwb3MubGVmdCArIG92ZXJsYXlEYXRhLndpZHRoLFxuICAgICAgICAgICAgICAgICAgICBjb25zdHJhaW5CeURhdGEuYm90dG9tIC0gcG9zLnRvcCArIG92ZXJsYXlEYXRhLmhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgcG9zLmxlZnQgLSBjb25zdHJhaW5CeURhdGEubGVmdFxuICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgICAgcG9zLnJpZ2h0ID0gcG9zLmxlZnQgKyBvdmVybGF5RGF0YS53aWR0aDtcbiAgICAgICAgICAgICAgICBwb3MuYm90dG9tID0gcG9zLnRvcCArIG92ZXJsYXlEYXRhLmhlaWdodDtcbiAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgIHBvcy5sZWZ0ID49IGNvbnN0cmFpbkJ5RGF0YS5sZWZ0ICYmXG4gICAgICAgICAgICAgICAgICAgIHBvcy50b3AgPj0gY29uc3RyYWluQnlEYXRhLnRvcCAmJlxuICAgICAgICAgICAgICAgICAgICBwb3MucmlnaHQgPD0gY29uc3RyYWluQnlEYXRhLnJpZ2h0ICYmXG4gICAgICAgICAgICAgICAgICAgIHBvcy5ib3R0b20gPD0gY29uc3RyYWluQnlEYXRhLmJvdHRvbVxuICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICBoYXNCZXN0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgLy8gSW5zaWRlIGRpc3RhbmNlLiBUaGUgbW9yZSB0aGUgYmV0dGVyLlxuICAgICAgICAgICAgICAgICAgICBwb3MuaW5EaXN0YW5jZSA9IE1hdGgubWluLmFwcGx5KG51bGwsIGRpc3RhbmNlcyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcG9zLmRpc3RhbmNlcyA9IGRpc3RhbmNlcztcbiAgICAgICAgICAgICAgICAgICAgLy8gVGhlIG1vcmUgb3ZlcmxhcCB0aGUgYmV0dGVyXG4gICAgICAgICAgICAgICAgICAgIHBvcy5vdmVybGFwU2l6ZSA9XG4gICAgICAgICAgICAgICAgICAgICAgICAoTWF0aC5taW4ocG9zLnJpZ2h0LCBjb25zdHJhaW5CeURhdGEucmlnaHQpIC0gTWF0aC5tYXgocG9zLmxlZnQsIGNvbnN0cmFpbkJ5RGF0YS5sZWZ0KSkgKlxuICAgICAgICAgICAgICAgICAgICAgICAgKE1hdGgubWluKHBvcy5ib3R0b20sIGNvbnN0cmFpbkJ5RGF0YS5ib3R0b20pIC0gTWF0aC5tYXgocG9zLnRvcCwgY29uc3RyYWluQnlEYXRhLnRvcCkpIDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBiZXN0UG9zID0gKGhhc0Jlc3QpID8gZ2V0TWF4KHBvc2l0aW9ucywgJ2luRGlzdGFuY2UnKSA6IGdldE1heChwb3NpdGlvbnMsICdvdmVybGFwU2l6ZScpO1xuICAgICAgICBvdmVybGF5Lm9mZnNldChiZXN0UG9zKTtcbiAgICB9XG59O1xuXG4kLmV4dGVuZChBbGlnbk1lLnByb3RvdHlwZSwgcHJvdG8pO1xuXG5pZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIGV4cG9ydHMpIHsgLy8gQ29tbW9uSlNcbiAgICBtb2R1bGUuZXhwb3J0cyA9IEFsaWduTWU7XG59IGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkgeyAvLyBBTURcbiAgICBkZWZpbmUoWydleHBvcnRzJ10sIEFsaWduTWUpO1xufVxuXG5pZiAod2luZG93LlN0YWNrbGEpIHsgLy8gVmFuaWxsYSBKU1xuICAgIHdpbmRvdy5TdGFja2xhLkFsaWduTWUgPSBBbGlnbk1lO1xufSBlbHNlIHtcbiAgICB3aW5kb3cuQWxpZ25NZSA9IEFsaWduTWU7XG59XG5cbiJdfQ==

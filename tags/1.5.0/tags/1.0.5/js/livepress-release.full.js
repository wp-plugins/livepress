/*! livepress -v1.0.5
 * http://livepress.com/
 * Copyright (c) 2013 LivePress, Inc.
 */
var Livepress = Livepress || {};

/**
 * Returns object or {} depending if it exists
 * @param object
 */
Livepress.ensureExists = function (object) {
	if (object === undefined) {
		object = {};
	}
	return object;
};

/***************** Utility functions *****************/

// Prevent extra calls to console.log from throwing errors when the console is closed.
var console = console || { log: function () { } };

/*
 * Parse strings date representations into a real timestamp.
 */
String.prototype.parseGMT = function (format) {
	var date = this,
		formatString = format || "h:i:s a",
		parsed,
		timestamp;

	parsed = Date.parse(date.replace(/-/gi, "/"), "Y/m/d H:i:s");
	timestamp = new Date(parsed);

	// fallback to original value when invalid date
	if (timestamp.toString() === "Invalid Date") {
		return this.toString();
	}

	timestamp = timestamp.format(formatString);
	return timestamp;
};

/*
 * Needed for the post update
 */
String.prototype.replaceAll = function (from, to) {
	var str = this;
	str = str.split(from).join(to);
	return str;
};
jQuery.fn.getBg = function () {
	var $this = jQuery(this),
		actual_bg, newBackground, color;
	actual_bg = $this.css('background-color');
	if (actual_bg !== 'transparent' && actual_bg !== 'rgba(0, 0, 0, 0)' && actual_bg !== undefined) {
		return actual_bg;
	}

	newBackground = this.parents().filter(function () {
		//return $(this).css('background-color').length > 0;
		color = $this.css('background-color');
		return color !== 'transparent' && color !== 'rgba(0, 0, 0, 0)';
	}).eq(0).css('background-color');

	if (!newBackground) {
		$this.css('background-color', '#ffffff');
	} else {
		$this.css('background-color', newBackground);
	}
};

jQuery.extend({
	getUrlVars:function (loc) {
		var vars = [], hash;
		var href = (loc.href || window.location.href);
		var hashes = href.slice(href.indexOf('?') + 1).split('&');
		for (var i = 0; i < hashes.length; i++) {
			hash = hashes[i].split('=');
			vars.push(hash[0]);
			vars[hash[0]] = hash[1];
		}
		return vars;
	},
	getUrlVar: function (name, loc) {
		return jQuery.getUrlVars(loc || false)[name];
	}
});

jQuery.fn.outerHTML = function (s) {
	return (s) ? this.before(s).remove() : jQuery("<div>").append(this.eq(0).clone()).html();
};

jQuery.fn.autolink = function () {
	return this.each(function () {
		var re = new RegExp('((http|https|ftp)://[\\w?=&./-;#~%-]+(?![\\w\\s?&./;#~%"=-]*>))', "g");
		jQuery(this).html(jQuery(this).html().replace(re, '<a href="$1">$1</a> '));
	});
};

if (typeof document.activeElement === 'undefined') {
	jQuery(document)
		.focusin(function (e) {
			document.activeElement = e.target;
		})
		.focusout(function () {
			document.activeElement = null;
		});
}
jQuery.extend(jQuery.expr[':'], {
	focus:function (element) {
		return element === document.activeElement;
	}
});
Date.prototype.format = function (format) {
	var i, curChar,
		returnStr = '',
		replace = Date.replaceChars;
	for (i = 0; i < format.length; i++) {
		curChar = format.charAt(i);
		if (replace[curChar]) {
			returnStr += replace[curChar].call(this);
		} else {
			returnStr += curChar;
		}
	}
	return returnStr;
};
Date.replaceChars = {
	shortMonths:['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
	longMonths: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
	shortDays:  ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
	longDays:   ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
	d:          function () {
		return (this.getDate() < 10 ? '0' : '') + this.getDate();
	},
	D:          function () {
		return Date.replaceChars.shortDays[this.getDay()];
	},
	j:          function () {
		return this.getDate();
	},
	l:          function () {
		return Date.replaceChars.longDays[this.getDay()];
	},
	N:          function () {
		return this.getDay() + 1;
	},
	S:          function () {
		return (this.getDate() % 10 === 1 && this.getDate() !== 11 ? 'st' : (this.getDate() % 10 === 2 && this.getDate() !== 12 ? 'nd' : (this.getDate() % 10 === 3 && this.getDate() !== 13 ? 'rd' : 'th')));
	},
	w:          function () {
		return this.getDay();
	},
	z:          function () {
		return "Not Yet Supported";
	},
	W:          function () {
		return "Not Yet Supported";
	},
	F:          function () {
		return Date.replaceChars.longMonths[this.getMonth()];
	},
	m:          function () {
		return (this.getMonth() < 9 ? '0' : '') + (this.getMonth() + 1);
	},
	M:          function () {
		return Date.replaceChars.shortMonths[this.getMonth()];
	},
	n:          function () {
		return this.getMonth() + 1;
	},
	t:          function () {
		return "Not Yet Supported";
	},
	L:          function () {
		return (((this.getFullYear() % 4 === 0) && (this.getFullYear() % 100 !== 0)) || (this.getFullYear() % 400 === 0)) ? '1' : '0';
	},
	o:          function () {
		return "Not Supported";
	},
	Y:          function () {
		return this.getFullYear();
	},
	y:          function () {
		return ('' + this.getFullYear()).substr(2);
	},
	a:          function () {
		return this.getHours() < 12 ? 'am' : 'pm';
	},
	A:          function () {
		return this.getHours() < 12 ? 'AM' : 'PM';
	},
	B:          function () {
		return "Not Yet Supported";
	},
	g:          function () {
		return this.getHours() % 12 || 12;
	},
	G:          function () {
		return this.getHours();
	},
	h:          function () {
		return ((this.getHours() % 12 || 12) < 10 ? '0' : '') + (this.getHours() % 12 || 12);
	},
	H:          function () {
		return (this.getHours() < 10 ? '0' : '') + this.getHours();
	},
	i:          function () {
		return (this.getMinutes() < 10 ? '0' : '') + this.getMinutes();
	},
	s:          function () {
		return (this.getSeconds() < 10 ? '0' : '') + this.getSeconds();
	},
	e:          function () {
		return "Not Yet Supported";
	},
	I:          function () {
		return "Not Supported";
	},
	O:          function () {
		return ( -this.getTimezoneOffset() < 0 ? '-' : '+') + (Math.abs(this.getTimezoneOffset() / 60) < 10 ? '0' : '') + (Math.abs(this.getTimezoneOffset() / 60)) + '00';
	},
	P:          function () {
		return ( -this.getTimezoneOffset() < 0 ? '-' : '+') + (Math.abs(this.getTimezoneOffset() / 60) < 10 ? '0' : '') + (Math.abs(this.getTimezoneOffset() / 60)) + ':' + (Math.abs(this.getTimezoneOffset() % 60) < 10 ? '0' : '') + (Math.abs(this.getTimezoneOffset() % 60));
	},
	T:          function () {
		var result, m;
		m = this.getMonth();
		this.setMonth(0);
		/*jslint regexp:false*/
		result = this.toTimeString().replace(/^.+ \(?([^\)]+)\)?$/, '$1');
		/*jslint regexp:true*/
		this.setMonth(m);
		return result;
	},
	Z:          function () {
		return -this.getTimezoneOffset() * 60;
	},
	c:          function () {
		return this.format("Y-m-d") + "T" + this.format("H:i:sP");
	},
	r:          function () {
		return this.toString();
	},
	U:          function () {
		return this.getTime() / 1000;
	}
};
(function ($) {

	var both = function (val) {
		return typeof val === 'object' ? val : { top:val, left:val };
	};

	var $scrollTo = $.scrollTo = function (target, duration, settings) {
		$(window).scrollTo(target, duration, settings);
	};

	$scrollTo.defaults = {
		axis:    'xy',
		duration:parseFloat($.fn.jquery) >= 1.3 ? 0 : 1
	};

	// Returns the element that needs to be animated to scroll the window.
	// Kept for backwards compatibility (specially for localScroll & serialScroll)
	$scrollTo.window = function (scope) {
		return $(window)._scrollable();
	};

	// Hack, hack, hack :)
	// Returns the real elements to scroll (supports window/iframes, documents and regular nodes)
	$.fn._scrollable = function () {
		return this.map(function () {
			var elem = this,
				isWin = !elem.nodeName || $.inArray(elem.nodeName.toLowerCase(), ['iframe', '#document', 'html', 'body']) !== -1;

			if (!isWin) {
				return elem;
			}

			var doc = (elem.contentWindow || elem).document || elem.ownerDocument || elem;

			return $.browser.safari || doc.compatMode === 'BackCompat' ?
				doc.body :
				doc.documentElement;
		});
	};

	$.fn.scrollTo = function (target, duration, settings) {
		if (typeof duration === 'object') {
			settings = duration;
			duration = 0;
		}
		if (typeof settings === 'function') {
			settings = { onAfter:settings };
		}

		if (target === 'max') {
			target = 9e9;
		}

		settings = $.extend({}, $scrollTo.defaults, settings);
		// Speed is still recognized for backwards compatibility
		duration = duration || settings.speed || settings.duration;
		// Make sure the settings are given right
		settings.queue = settings.queue && settings.axis.length > 1;

		if (settings.queue) {
			// Let's keep the overall duration
			duration /= 2;
		}
		settings.offset = both(settings.offset);
		settings.over = both(settings.over);

		return this._scrollable().each(function () {
			var elem = this,
				$elem = $(elem),
				targ = target, toff, attr = {},
				win = $elem.is('html,body');

			var animate = function (callback) {
				$elem.animate(attr, duration, settings.easing, callback && function () {
					callback.call(this, target, settings);
				});
			};

			if ((typeof targ === 'number' || typeof targ === 'string') &&
				// A number will pass the regex
				( /^([\-+]=)?\d+(\.\d+)?(px|%)?$/.test(targ) )) {
				targ = both(targ);
				// We are done
			} else {
				if (typeof targ === 'number' || typeof targ === 'string') {
					// Relative selector, no break!
					targ = $(targ, this);
				}
				// DOMElement / jQuery
				if (targ.is || targ.style) {
					// Get the real position of the target
					toff = (targ = $(targ)).offset();
				}
			}
			$.each(settings.axis.split(''), function (i, axis) {
				var Pos = axis === 'x' ? 'Left' : 'Top',
					pos = Pos.toLowerCase(),
					key = 'scroll' + Pos,
					old = elem[key],
					max = $scrollTo.max(elem, axis);

				if (toff) {// jQuery / DOMElement
					attr[key] = toff[pos] + ( win ? 0 : old - $elem.offset()[pos] );

					// If it's a dom element, reduce the margin
					if (settings.margin) {
						attr[key] -= parseInt(targ.css('margin' + Pos), 10) || 0;
						attr[key] -= parseInt(targ.css('border' + Pos + 'Width'), 10) || 0;
					}

					attr[key] += settings.offset[pos] || 0;

					if (settings.over[pos]) {
						// Scroll to a fraction of its width/height
						attr[key] += targ[axis === 'x' ? 'width' : 'height']() * settings.over[pos];
					}
				} else {
					var val = targ[pos];
					// Handle percentage values
					attr[key] = val.slice && val.slice(-1) === '%' ?
						parseFloat(val) / 100 * max
						: val;
				}

				// Number or 'number'
				if (/^\d+$/.test(attr[key])) {
					// Check the limits
					attr[key] = attr[key] <= 0 ? 0 : Math.min(attr[key], max);
				}

				// Queueing axes
				if (!i && settings.queue) {
					// Don't waste time animating, if there's no need.
					if (old !== attr[key]) {
						// Intermediate animation
						animate(settings.onAfterFirst);
					}
					// Don't animate this axis again in the next iteration.
					delete attr[key];
				}
			});

			animate(settings.onAfter);

		}).end();
	};

	// Max scrolling position, works on quirks mode
	// It only fails (not too badly) on IE, quirks mode.
	$scrollTo.max = function (elem, axis) {
		var Dim = axis === 'x' ? 'Width' : 'Height',
			scroll = 'scroll' + Dim;

		if (!$(elem).is('html,body')) {
			return elem[scroll] - $(elem)[Dim.toLowerCase()]();
		}

		var size = 'client' + Dim,
			html = elem.ownerDocument.documentElement,
			body = elem.ownerDocument.body;

		return Math.max(html[scroll], body[scroll]) - Math.min(html[size], body[size]);

	};

}(jQuery));
(function (jQuery) {

	// Some named colors to work with
	// From Interface by Stefan Petre
	// http://interface.eyecon.ro/

	var colors = {
		aqua:          [0, 255, 255],
		azure:         [240, 255, 255],
		beige:         [245, 245, 220],
		black:         [0, 0, 0],
		blue:          [0, 0, 255],
		brown:         [165, 42, 42],
		cyan:          [0, 255, 255],
		darkblue:      [0, 0, 139],
		darkcyan:      [0, 139, 139],
		darkgrey:      [169, 169, 169],
		darkgreen:     [0, 100, 0],
		darkkhaki:     [189, 183, 107],
		darkmagenta:   [139, 0, 139],
		darkolivegreen:[85, 107, 47],
		darkorange:    [255, 140, 0],
		darkorchid:    [153, 50, 204],
		darkred:       [139, 0, 0],
		darksalmon:    [233, 150, 122],
		darkviolet:    [148, 0, 211],
		fuchsia:       [255, 0, 255],
		gold:          [255, 215, 0],
		green:         [0, 128, 0],
		indigo:        [75, 0, 130],
		khaki:         [240, 230, 140],
		lightblue:     [173, 216, 230],
		lightcyan:     [224, 255, 255],
		lightgreen:    [144, 238, 144],
		lightgrey:     [211, 211, 211],
		lightpink:     [255, 182, 193],
		lightyellow:   [255, 255, 224],
		lime:          [0, 255, 0],
		magenta:       [255, 0, 255],
		maroon:        [128, 0, 0],
		navy:          [0, 0, 128],
		olive:         [128, 128, 0],
		orange:        [255, 165, 0],
		pink:          [255, 192, 203],
		purple:        [128, 0, 128],
		violet:        [128, 0, 128],
		red:           [255, 0, 0],
		silver:        [192, 192, 192],
		white:         [255, 255, 255],
		yellow:        [255, 255, 0]
	};

	// Color Conversion functions from highlightFade
	// By Blair Mitchelmore
	// http://jquery.offput.ca/highlightFade/

	// Parse strings looking for color tuples [255,255,255]
	var getRGB = function (color) {
		var result;

		// Check if we're already dealing with an array of colors
		if (color && color.constructor === Array && color.length === 3) {
			return color;
		}

		// Look for rgb(num,num,num)
		if ((result = /rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(color))) {
			return [parseInt(result[1], 10), parseInt(result[2], 10), parseInt(result[3], 10)];
		}

		// Look for rgb(num%,num%,num%)
		if ((result = /rgb\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*\)/.exec(color))) {
			return [parseFloat(result[1]) * 2.55, parseFloat(result[2]) * 2.55, parseFloat(result[3]) * 2.55];
		}

		// Look for #a0b1c2
		if ((result = /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(color))) {
			return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)];
		}

		// Look for #fff
		if ((result = /#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(color))) {
			return [parseInt(result[1] + result[1], 16), parseInt(result[2] + result[2], 16), parseInt(result[3] + result[3], 16)];
		}

		// Otherwise, we're most likely dealing with a named color
		return colors[jQuery.trim(color).toLowerCase()];
	};

	var getColor = function (elem, attr) {
		var color;

		do {
			color = jQuery.curCSS(elem, attr);

			// Keep going until we find an element that has color, or we hit the body
			if (color !== '' && color !== 'transparent' || jQuery.nodeName(elem, "body")) {
				break;
			}

			attr = "backgroundColor";
		} while ((elem = elem.parentNode));

		return getRGB(color);
	};

	// We override the animation for all of these color styles
	jQuery.each(['backgroundColor', 'borderBottomColor', 'borderLeftColor', 'borderRightColor', 'borderTopColor', 'color', 'outlineColor'], function (i, attr) {
		jQuery.fx.step[attr] = function (fx) {
			if (fx.start === undefined) {
				fx.start = getColor(fx.elem, attr);
				fx.end = getRGB(fx.end);
			}

			fx.elem.style[attr] = "rgb(" + [
				Math.max(Math.min(parseInt((fx.pos * (fx.end[0] - fx.start[0])) + fx.start[0], 10), 255), 0),
				Math.max(Math.min(parseInt((fx.pos * (fx.end[1] - fx.start[1])) + fx.start[1], 10), 255), 0),
				Math.max(Math.min(parseInt((fx.pos * (fx.end[2] - fx.start[2])) + fx.start[2], 10), 255), 0)
			].join(",") + ")";
		};
	});

}(jQuery));
/*global window, jQuery, console, alert */
(function($) {
	$.gritter = {};

	$.gritter.options = {
		fade_in_speed: 'fast',
		fade_out_speed: 500,
		time: 1000
	};
	var Gritter = {
		fade_in_speed: '',
		fade_out_speed: '',
		time: '',
		_custom_timer: 0,
		_item_count: 0,
		_is_setup: 0,
		_tpl_control: '<div class = "gritter-control"><div class ="gritter-scroll">Scroll to Comment</div><div class ="gritter-settings"></div><div class="gritter-close"></div></div>',
		_tpl_item: '<div id="gritter-item-[[number]]" class="gritter-item-wrapper gritter-item [[item_class]] [[class_name]] [[comment_container_id]]" style="display:none"><div class="gritter-top"></div><div class="gritter-inner"><div class = "gritter-control"><div class ="gritter-scroll">Scroll to Comment</div><div class ="gritter-settings"></div><div class="gritter-close"></div></div>[[image]]<span class="gritter-title">[[username]]</span><div class="lp-date">[[date]]</div><p>[[text]]</p>[[comments]]<div class="bubble-point"></div></div><div class="gritter-bot"></div></div>',
		_tpl_wrap: '<div id="gritter-notice-wrapper"></div>',
		add: function(params) {
			//if (!params.title || ! params.text) {
				/*throw'You need to fill out the first 2 params: "title" and "text"';*/
			//}
			if (!params.title) {
				params.title = "";
			}
			if (!params.text) {
				params.text = "";
			}
			if (!this._is_setup) {
				this._runSetup();
			}
			var user = params.title,
			commentContainerId = params.commentContainerId,
			text = params.text,
			date = params.date,
			image = params.image,
			comments = params.comments || '',
			sticky = params.sticky || false,
			item_class = params.class_name || '',
			time_alive = params.time || '';
			this._verifyWrapper();
			this._item_count+=1;
			var number = this._item_count,
			tmp = this._tpl_item;
			$(['before_open', 'after_open', 'before_close', 'after_close']).each(function(i, val) {
				Gritter['_' + val + '_' + number] = ($.isFunction(params[val])) ? params[val] : function() {};
			});
			this._custom_timer = 0;
			if (time_alive) {
				this._custom_timer = time_alive;
			}
			if (image === undefined) {
				image = '';
			}
			var image_str = (!image) ? '' : '<img src="' + image + '" class="gritter-image" />',
				class_name = (!image) ? 'gritter-without-image' : 'gritter-with-image';
			tmp = this._str_replace(['[[username]]', '[[text]]', '[[date]]', '[[image]]', '[[number]]', '[[class_name]]', '[[item_class]]', '[[comments]]', '[[comment_container_id]]'], [user, text, date, image_str, this._item_count, class_name, item_class, comments, commentContainerId], tmp);
			this['_before_open_' + number]();
			$('#gritter-notice-wrapper').prepend(tmp);
			var item = $('#gritter-item-' + this._item_count);
			var scrollDiv = $(item.find(".gritter-scroll"));

			/* handle scroll to comment in gritter bubble
  * use passed callback if any. Used on pages where dynamic appearing of
  * comments is turned off. See ui-controller.js comment_update function.
  */
			if (jQuery.isFunction(params.scrollToCallback)) {
				scrollDiv.bind('click', params.scrollToCallback);
				if (params.scrollToText) {
					scrollDiv.text(params.scrollToText);
				}
			} else {
				scrollDiv.bind('click', function(e) {
					var div = jQuery(jQuery(e.target).parents(".gritter-item-wrapper")[0]);
					var classList = div.attr('class').split(/\s+/);

					// looking for class with id of comment it refers to
					jQuery.each(classList, function(index, item) {
						var commentId = item.match(/comment\-/);
						if (commentId !== null) {
							jQuery.scrollTo(jQuery("#" + item), 900);
							return;
						}
					});
				});
			}

			item.fadeIn(this.fade_in_speed, function() {
				Gritter['_after_open_' + number]($(this));
			});
			if (!sticky) {
				this._setFadeTimer(item, number);
			}
			$(item).bind('mouseenter mouseleave', function(event) {
				if (event.type === 'mouseenter') {
					if (!sticky) {
						Gritter._restoreItemIfFading($(this), number);
					}
				}

				else {
					if (!sticky) {
						Gritter._setFadeTimer($(this), number);
					}
				}
				Gritter._hoverState($(this), event.type);
			});
			return number;
		},
		_countRemoveWrapper: function(unique_id, e) {
			e.remove();
			this['_after_close_' + unique_id](e);
			if ($('.gritter-item-wrapper').length === 0) {
				$('#gritter-notice-wrapper').remove();
			}
		},
		_fade: function(e, unique_id, params, unbind_events) {
			params = params || {};
			var fade = (typeof(params.fade) !== 'undefined') ? params.fade: true,
				fade_out_speed = params.speed || this.fade_out_speed;
			this['_before_close_' + unique_id](e);
			if (unbind_events) {
				e.unbind('mouseenter mouseleave');
			}
			if (fade) {
				e.animate({	opacity: 0 }, fade_out_speed, function() {
					e.animate({ height: 0 }, 300, function() {
						Gritter._countRemoveWrapper(unique_id, e);
					});
				});
			}
			else {
				this._countRemoveWrapper(unique_id, e);
			}
		},
		_hoverState: function(e, type) {
			if (type === 'mouseenter') {
				e.addClass('hover');
				var control = e.find('.gritter-control');
				control.show();
				e.find('.gritter-close').click(function() {
					var unique_id = e.attr('id').split('-')[2];
					Gritter.removeSpecific(unique_id, {},
					e, true);
				});
			}
			else {
				e.removeClass('hover');
				e.find('.gritter-control').hide();
			}
		},
		removeSpecific: function(unique_id, params, e, unbind_events) {
			if (!e) {
				e = $('#gritter-item-' + unique_id);
			}
			this._fade(e, unique_id, params || {},
			unbind_events);
		},
		_restoreItemIfFading: function(e, unique_id) {
			clearTimeout(this['_int_id_' + unique_id]);
			e.stop().css({
				opacity: ''
			});
		},
		_runSetup: function() {
			var opt;
			for (opt in $.gritter.options) {
				if ($.gritter.options.hasOwnProperty(opt)) {
					this[opt] = $.gritter.options[opt];
				}
			}
			this._is_setup = 1;
		},
		_setFadeTimer: function(e, unique_id) {
			var timer_str = (this._custom_timer) ? this._custom_timer: this.time;
			this['_int_id_' + unique_id] = setTimeout(function() {
				Gritter._fade(e, unique_id);
			},
			timer_str);
		},
		stop: function(params) {
			var before_close = ($.isFunction(params.before_close)) ? params.before_close: function() {};

			var after_close = ($.isFunction(params.after_close)) ? params.after_close: function() {};

			var wrap = $('#gritter-notice-wrapper');
			before_close(wrap);
			wrap.fadeOut(function() {
				$(this).remove();
				after_close();
			});
		},
		_str_replace: function(search, replace, subject, count) {
			var i = 0,
			j = 0,
			temp = '',
			repl = '',
			sl = 0,
			fl = 0,
			f = [].concat(search),
			r = [].concat(replace),
			s = subject,
			ra = r instanceof Array,
			sa = s instanceof Array;
			s = [].concat(s);
			if (count) {
				this.window[count] = 0;
			}
			for (i = 0, sl = s.length; i < sl; i++) {
				if (s[i] === '') {
					continue;
				}
				for (j = 0, fl = f.length; j < fl; j++) {
					temp = s[i] + '';
					repl = ra ? (r[j] !== undefined ? r[j] : '') : r[0];
					s[i] = (temp).split(f[j]).join(repl);
					if (count && s[i] !== temp) {
						this.window[count] += (temp.length - s[i].length) / f[j].length;
					}
				}
			}
			return sa ? s: s[0];
		},
		_verifyWrapper: function() {
			if ($('#gritter-notice-wrapper').length === 0) {
				$('body').append(this._tpl_wrap);
			}
		}
	};
	$.gritter.add = function(params) {
		try {
			return Gritter.add(params || {});
		} catch(e) {
			var err = 'Gritter Error: ' + e;
			if(typeof(console) !== 'undefined' && console.error) {
				console.error(err, params);
			} else {
			   alert(err);
			}
		}
	};
	$.gritter.remove = function(id, params) {
		Gritter.removeSpecific(id, params || {});
	};
	$.gritter.removeAll = function(params) {
		Gritter.stop(params || {});
	};
} (jQuery));


/*jslint white: false, onevar: false, browser: true */
/*global window, jQuery, console */
(function($) {
  var $t;

  var distance = function(date) {
    return (new Date().getTime() - date.getTime());
  };

  var substitute = function(stringOrFunction, value) {
    var string = $.isFunction(stringOrFunction) ? stringOrFunction(value) : stringOrFunction;
    return string.replace(/%d/i, value);
  };

  var inWords = function(date) {
    return $t.inWords(distance(date));
  };

  var prepareData = function(element) {
    element = $(element);
    if (!element.data("timeago")) {
      element.data("timeago", { datetime: $t.datetime(element) });
      var text = $.trim(element.text());
      if (text.length > 0) {
		 element.attr("title", text);
      }
    }
    return element.data("timeago");
  };

  var refresh = function() {
    var data = prepareData(this);
    if (!isNaN(data.datetime)) {
      $(this).text(inWords(data.datetime));
    }
    return this;
  };

  $.timeago = function(timestamp) {
    if (timestamp instanceof Date) {
		return inWords(timestamp);
	}
    else if (typeof timestamp === "string") {
		return inWords($.timeago.parse(timestamp));
	}
    else {
		return inWords($.timeago.datetime(timestamp));
	}
  };
  $t = $.timeago;

  $.extend($.timeago, {
    settings: {
      refreshMillis: 60000,
      allowFuture: false,
      strings: {
        prefixAgo: null,
        prefixFromNow: null,
        suffixAgo: "ago",
        suffixFromNow: "from now",
        ago: null, // DEPRECATED, use suffixAgo
        fromNow: null, // DEPRECATED, use suffixFromNow
        seconds: "less than a minute",
        minute: "about a minute",
        minutes: "%d minutes",
        hour: "about an hour",
        hours: "about %d hours",
        day: "a day",
        days: "%d days",
        month: "about a month",
        months: "%d months",
        year: "about a year",
        years: "%d years"
      }
    },
    inWords: function(distanceMillis) {
      var $l = this.settings.strings;
      var prefix = $l.prefixAgo;
      var suffix = $l.suffixAgo || $l.ago;
      if (this.settings.allowFuture) {
        if (distanceMillis < 0) {
          prefix = $l.prefixFromNow;
          suffix = $l.suffixFromNow || $l.fromNow;
        }
        distanceMillis = Math.abs(distanceMillis);
      }

      var seconds = distanceMillis / 1000;
      var minutes = seconds / 60;
      var hours = minutes / 60;
      var days = hours / 24;
      var years = days / 365;

      var words = seconds < 45 && substitute($l.seconds, Math.round(seconds)) ||
        seconds < 90 && substitute($l.minute, 1) ||
        minutes < 45 && substitute($l.minutes, Math.round(minutes)) ||
        minutes < 90 && substitute($l.hour, 1) ||
        hours < 24 && substitute($l.hours, Math.round(hours)) ||
        hours < 48 && substitute($l.day, 1) ||
        days < 30 && substitute($l.days, Math.floor(days)) ||
        days < 60 && substitute($l.month, 1) ||
        days < 365 && substitute($l.months, Math.floor(days / 30)) ||
        years < 2 && substitute($l.year, 1) ||
        substitute($l.years, Math.floor(years));

      return $.trim([prefix, words, suffix].join(" "));
    },
    parse: function(iso8601) {
      var s = $.trim(iso8601);
      s = s.replace(/-/,"/").replace(/-/,"/");
      s = s.replace(/T/," ").replace(/Z/," UTC");
      s = s.replace(/([\+\-]\d\d)\:?(\d\d)/," $1$2"); // -04:00 -> -0400
      return new Date(s);
    },
    datetime: function(elem) {
      // jQuery's `is()` doesn't play well with HTML5 in IE
      var isTime = $(elem).get(0).tagName.toLowerCase() === "time"; // $(elem).is("time");
      var iso8601 = isTime ? $(elem).attr("datetime") : $(elem).attr("title");
      return $t.parse(iso8601);
    }
  });

  $.fn.timeago = function() {
    var self = this;
    self.each(refresh);

    var $s = $t.settings;
    if ($s.refreshMillis > 0) {
      setInterval(function() { self.each(refresh); }, $s.refreshMillis);
    }
    return self;
  };

  // fix for IE6 suckage
  document.createElement("abbr");
  document.createElement("time");
}(jQuery));

/*global Livepress, console */
Livepress.Ui = {};

Livepress.Ui.View = function (disable_comments) {
	var self = this;

	// LP Bar
	var $livepress = jQuery('#livepress');
	var $commentsCount = $livepress.find('.lp-comments-count');
	var $updatesCount = $livepress.find('.lp-updates-count');
	var $settingsButton = $livepress.find('.lp-settings-button');
	var $lpBarBox = $livepress.find('.lp-bar');
	var $settingsBox = jQuery('#lp-settings');

	this.set_comment_num = function (count) {
		var oldCount = $commentsCount.html();
		$commentsCount.html(parseInt(count, 10));
		if (oldCount !== count) {
			$commentsCount.parent().animate({color:"#ffff66"}, 200).animate({color:"#ffffff"}, 800);
		}
	};

	this.set_live_updates_num = function (count) {
		$updatesCount.html(parseInt(count, 10));
	};

	// Settings Elements
	//$settingsBox.appendTo('body');

	var $exitButton = $settingsBox.find('.lp-settings-close');
	var $settingsTabs = $settingsBox.find('.lp-tab');
	var $settingsPanes = $settingsBox.find('.lp-pane');

	// Settings controls
	var $expandOptionsButton = $settingsBox.find('.lp-button.lp-expand-options');
	var $soundCheckbox = $settingsBox.find('input[name=lp-setting-sound]');
	var $updatesCheckbox = $settingsBox.find('input[name=lp-setting-updates]');
	var $commentsCheckbox = $settingsBox.find('input[name=lp-setting-comments]');
	var $scrollCheckbox = $settingsBox.find('input[name=lp-setting-scroll]');
	var $updateSettingsButton = $settingsBox.find('.lp-button.lp-update-settings');
	var $optionsExtBox = $settingsBox.find('.lp-options-ext');
	var $optionsShortBox = $settingsBox.find('.lp-settings-short');

	if (disable_comments) {
		$lpBarBox.find(".lp-sprite.comments").hide();
		$commentsCount.parent().hide();
		$commentsCheckbox.parent().hide();
	}

	var window_height = function () {
		var de = document.documentElement;
		return self.innerHeight || ( de && de.clientHeight ) || document.body.clientHeight;
	};

	var window_width = function () {
		var de = document.documentElement;
		return self.innerWidth || ( de && de.clientWidth ) || document.body.clientWidth;
	};

	var showSettingsBox = function () {
		var save_window_width = window_width();
		var save_window_height = window_height();
		var barOffset = $lpBarBox.offset();

		$settingsBox.show( 'blind' );
	};

	var hideSettingsBox = function () {
		$settingsBox.hide( 'blind' );
		$optionsShortBox.removeClass('expanded');
	};

	var toggleSettingsBox = function () {
		return $settingsBox.is(':visible') ? hideSettingsBox() : showSettingsBox();
	};

	$settingsButton.click(function () {
		return toggleSettingsBox();
	});
	$exitButton.click(function () {
		return hideSettingsBox();
	});

	var control = function (initial, $checkbox, fOn, fOff) {
		$checkbox.attr('checked', initial).change(function () {
			return $checkbox.is(':checked') ? fOn(1) : fOff(1);
		});
		return initial ? fOn() : fOff();
	};

	this.sound_control = function (init, fOn, fOff) {
		control(init, $soundCheckbox, fOn, fOff);
	};

	this.live_control = function (init, fOn, fOff) {
		control(init, $updatesCheckbox, fOn, fOff);
	};

	this.follow_comments_control = function (init, fOn, fOff) {
		control(init, $commentsCheckbox, fOn, fOff);
	};

	this.scroll_control = function (init, fOn, fOff) {
		control(init, $scrollCheckbox, fOn, fOff);
	};

	// Google Reader handler
	this.add_link_to_greader = function (link) {
		$settingsBox.find('.lp-greader-link').attr("href", link);
	};

	// Im handler
	this.subscribeIm = function (callback) {
		$settingsBox.find('.lp-subscribe .lp-button').click(function () {
			var imType = $settingsBox.find('[name=lp-im-type]').val();
			var userName = $settingsBox.find('[name=lp-im-username]').val();
			callback(userName, imType);
		});
	};

	this.imFeedbackSpin = function (on) {
		$settingsBox.find('.lp-subscribe-im-spin')[ on ? 'show' : 'hide']();
	};

	this.handleImFeedback = function (response, username) {
		var messages = {
			'INVALID_JID':          "Error: [USERNAME] isn't a valid Google Talk account",
			'NOT_IN_ROSTER':        "Error: [USERNAME] wasn't find in jabber client bot roster",
			'NOT_AUTHORIZED':       "[USERNAME] has been authorized",
			'AUTHORIZED':           "[USERNAME] has been authorized",
			'INTERNAL_SERVER_ERROR':"LivePress! error. Try again in a few minutes",
			'AUTHORIZATION_SENT':   'Authorization request sent to [USERNAME]'
		};

		var message = messages[response];

		if (typeof(message) !== 'undefined') {
			message = message.replace("[USERNAME]", username);
		} else {
			message = messages.INTERNAL_SERVER_ERROR;
		}

		if (message.length > 0) {
			this.imFeedbackSpin(false);
			$settingsBox.find('.lp-im-subscription-message').html(message).show();
		}

		//var reset_func = function() {jQuery('#im_following_message').hide();
		//jQuery('#im_following').show(); };
		//setTimeout(reset_func, 5000);
	};

	//
	// Connection status
	//
	var $updatesStatus = $settingsBox.find('.live-updates-status');
	var $counters = $lpBarBox.find('.lp-counter');

	this.connected = function () {
		$updatesStatus.text('ON');
		$counters.removeClass('lp-off').addClass('lp-on');
		$lpBarBox.find('.lp-logo').attr('title', 'Connected');
	};

	this.disconnected = function () {
		$updatesStatus.text('OFF');
		$counters.removeClass('lp-on').addClass('lp-off');
		$lpBarBox.find('.lp-logo').attr('title', 'Not Connected');
	};

	//
	// Live notifications
	//

	var update_gritter_settings_click = function () {
		jQuery('.gritter-settings').click(function () {
			showSettingsBox();
		});
	};

	this.post_alert = function (title, link, author, date) {
		console.log('Post alert', {title:title, link:link, author:author, date:date});

		if (title === undefined && author === undefined && date === undefined) {
			return;
		}

		var container = jQuery("<div>"),
			dateEl = jQuery("<abbr>").attr("class", "timeago").attr("title", date).text(date.replace(/Z/, " UTC"));
		container.append(dateEl).append(" by " + author);
		jQuery.gritter.add({
			title:     '<a href="' + link + '">' + title + '</a>',
			date:      'New Post - ' + container.html(),
			class_name:'new-post',
			time:      7000
		});
		update_gritter_settings_click();
		jQuery("abbr.timeago").timeago();
	};

	this.comment_alert = function (options, date) {
		console.log('Comment alert', options);
		var container = jQuery("<div>");
		var dateEl = jQuery("<abbr>").attr("class", "timeago").attr("title", date).text(date.replace(/Z/, " UTC"));
		container.append(dateEl);
		var defaults = {
			class_name:'comment',
			date:      container.html(),
			time:      7000
		};

		jQuery.gritter.add(jQuery.extend({}, defaults, options));
		jQuery(".gritter-comments .add-comment").click(function () {
			jQuery().scrollTo('#respond, #commentform, #submit', 900);
		});
		update_gritter_settings_click();
		jQuery("abbr.timeago").timeago();
	};

};


Livepress.Ui.UpdateBoxView = function (homepage_mode) {
	if (typeof(homepage_mode) === "undefined") {
		homepage_mode = true;
	}

	var update_box_html = [
		'<div class="update-box-content">',
		'<div class="lp-update-count">',
		'<strong class="lp-update-num">0</strong>',
		'<strong class="lp-update-new-update"> new updates. </strong>',
		'<a href="javascript:location.reload();" class="lp-refresher">Refresh</a> to see <span class="lp-update-it-them">them</span>.',
		'</div>',
		'<div class="lp-balloon">',
		'<img class="lp-close-button" title="Close" />',
		'<ul class="lp-new-posts"></ul>',
		'<a class="lp-more-link" href="javascript:location.reload();">+ more</a>',
		'<div class="lp-balloon-tail">&nbsp;</div>',
		'</div>',
		'</div>',
		'<div class="clear"></div>'
	].join("");

	var update_box_classes = ".livepress lp-update-container";

	var $update_box = jQuery('#lp-update-box');
	$update_box.addClass(update_box_classes);
	$update_box.append(update_box_html);

	var $balloon = $update_box.find('.lp-balloon');

	var $new_posts_list = $update_box.find('.lp-new-posts');
	var $more_link = $update_box.find('.lp-more-link');
	var $update_num = $update_box.find('.lp-update-num');
	var $new_update_phrase = $update_box.find('.lp-update-new-update');
	var $it_them = $update_box.find('.lp-update-it-them');
	var $closeButton = $update_box.find('.lp-close-button');

	var counter = 0;

	$closeButton.click(function () {
		$balloon.fadeOut();
	});

	$closeButton.attr('src', Livepress.Config.lp_plugin_url + '/img/lp-settings-close.png');

	function add_to_update_list (li_content) {
		var item = [
			'<li style="display:none;">',
			li_content,
			'</li>'
		].join('');

		counter += 1;

		if (counter > 1) {
			$new_update_phrase.html(" new updates.");
			$it_them.html("them");
		} else {
			$new_update_phrase.html(" new update.");
			$it_them.html("it");
		}

		if (counter > 7) {
			$more_link.slideDown(300);
		} else {
			$new_posts_list.append(item);
			var $item = $new_posts_list.find('li:last');
			$item.show();

			// TODO: make li items slideDown and remain with the bullet
//        if (counter == 1) {
//          $item.show();
//        } else {
//          $item.slideDown(300);
//        }
		}
		$update_num.text(counter);

		if (!$update_box.is(':visible')) {
			$update_box.slideDown(600);
			$update_box.css('display', 'inline-block');
		}
		jQuery("abbr.timeago").timeago();
	}

	this.reposition_balloon = function () {
		$balloon.css('margin-top', -($balloon.height() + 60));
	};

	this.new_post = function (title, link, author, date) {
		if(date===undefined) {
			return;
		}
		var container = jQuery("<div>");
		var dateEl = jQuery("<abbr>").attr("class", "timeago").attr("title", date).text(date.replace(/Z/, " UTC"));
		var linkEl = jQuery("<a></a>").attr("href", link).text('Update: ' + title);
		container.append(dateEl).append(linkEl);
		add_to_update_list(container.html());
		this.reposition_balloon();
	};

	this.post_update = function (content, date) {
		var bestLen = 25, maxLen = 28;
		var container = jQuery("<div>");
		var dateEl = jQuery("<abbr>").attr("class", "timeago").attr("title", date).text(date.replace(/Z/, " UTC"));
		var cutPos = content.indexOf(' ', bestLen);
		if (cutPos === -1) {
			cutPos = content.length;
		}
		if (cutPos > maxLen) {
			cutPos = content.substr(0, cutPos).lastIndexOf(' ');
		}
		if (cutPos === -1 || cutPos > maxLen) {
			cutPos = maxLen;
		}
		var cut = content.substr(0, cutPos) + (cutPos < content.length ? "&hellip;" : "");
		var update = ' Update: <strong>' + cut + '</strong>';
		container.append(dateEl).append(update);

		add_to_update_list(container.html());
	};

	this.clear = function () {
		$more_link.hide();
		$new_posts_list.html("");
		counter = 0;
		$update_num.text("0");
		if ($update_box.is(':visible')) {
			$update_box.slideUp(600);
		}
	};
};

Livepress.Ui.UpdateView = function ($element, post_link, hide_seconds, disable_comment) {
	var update = {};
	var $update_ui;

	var hideBox = function () {
		if ($update_ui) {
			$update_ui.remove();
		}
		$element.removeClass('ui-container');
		$element.removeClass('lp-borders');
		$element.find('lp-pre-update-ui').remove();
	};

	var excerpt = function (limit) {
		var i;
		var filtered = $element.clone();
		filtered.find(".livepress-meta").remove();
		var text = filtered.text();
		text = filtered.text().replace(/\n/g, "");
		text = text.replace(/\s+/, ' ');

		var spaces = []; // Array of indices to space characters
		spaces.push(0);
		for (i = 1; i < text.length; i += 1) {
			if (text.charAt(i) === ' ') {
				spaces.push(i);
			}
		}

		spaces.push(text.length);

		if (text.length > limit) {
			i = 0;
			var rbound = limit;
			// looking for last space index within length limit
			while ((spaces[i] < limit) && (i < spaces.length - 1)) {
				rbound = spaces[i];
				i += 1;
			}

			text = text.substring(0, rbound) + "\u2026";
		}

		return '"' + text + '"';
	};

	if ($update_ui === undefined) {
		update.element = $element;
		update.link = post_link + "#" + $element.attr("id");
		update.shortExcerpt = excerpt(100);
		update.longExcerpt = excerpt(1000);

		var types = ["facebook", "twitter"];
		if (!disable_comment) {
			types.push("comment");
		}
		var buttons = Livepress.Ui.ReactButtons(update, types);

		update.element.append(buttons);
		$update_ui = $element.find('.lp-pre-update-ui');

		if ($element.get(0) === jQuery('.livepress-update').get(0)) {
			$update_ui.addClass('lp-first-update');
		}

		$element.addClass('ui-container');

		if (isFinite(hide_seconds)) {
			setTimeout(function () {
				hideBox();
			}, hide_seconds * 1000);
		} else {
			$update_ui.bind('mouseleave', function () {
				hideBox();
			});
			$update_ui.bind('mouseover', function () {
			});
			$element.bind('mouseleave', function (event) {
				var relTarg = event.relatedTarget || event.fromElement; // IE hack
				if (relTarg.className.indexOf('lp-pre-update-ui') === -1) {
					hideBox();
				}
			});
		}
	}
};

Livepress.Ui.ReactButton = function (type, update) {
	var pub = {};
	var priv = {};
	priv.btnDiv = jQuery("<div>").addClass("lp-pu-ui-feature lp-pu-" + type);

	pub.buttonFor = function (type, update) {
		var button = {};
		button.link = update.link;
		button.type = type;
		priv[type + "Button"](button);
		return button.div;
	};

	priv.constructButtonMarkup = function (text) {
		// sample markup created:
		//    '<div class="lp-pu-like lp-pu-ui-feature">'
		//       '<span class="lp-like-ico lp-pu-ico"></span>'
		//       '<span class="lp-pu-ui-text lp-like-text">Like</span>'
		//    '</div>'
		var btnText = jQuery("<div>").addClass("lp-pu-ui-text lp-" + type + "-text").text(text);
		var btnIcon = jQuery("<div>").addClass("lp-" + type + "-ico lp-pu-ico");
		return priv.btnDiv.append(btnIcon).append(btnText);
	};

	priv.twitterButton = function (button) {
		button.div = priv.constructButtonMarkup("Tweet");
		button.div.click(function () {
			window.open('http://twitter.com/home?status=' + update.shortExcerpt + ' ' + button.link, '_blank');
		});
	};

	priv.facebookButton = function (button) {
		button.div = priv.constructButtonMarkup("Share");
		button.div.click(function () {
			var u = update.link;
			var t = update.shortExcerpt;
			var height = 436;
			var width = 626;
			var left = (screen.width - width) / 2;
			var top = (screen.height - height) / 2;
			var windowParams = 'toolbar=0, status=0, width=' + width + ', height=' + height + ', left=' + left + ', top=' + top;

			window.open('http://www.facebook.com/sharer.php?u=' + encodeURIComponent(u) + '&t=' + encodeURIComponent(t), ' sharer', windowParams);
			return false;
		});
	};

	priv.commentButton = function (button) {
		button.div = priv.constructButtonMarkup("Reply");
		button.div.click(function () {
			var commentInput = jQuery("#comment");
			jQuery().scrollTo(commentInput, 900);
			commentInput.focus();
			var comment = '<blockquote class="lp-update-comment">' + update.shortExcerpt + "\n" + update.link + "</blockquote>\n";
			commentInput.attr('value', comment);
		});
	};

	return pub.buttonFor(type, update);
};

Livepress.Ui.ReactButtons = function (update, types) {
	var container = jQuery("<div>").addClass("lp-pre-update-ui");
	jQuery.each(types, function (i, v) {
		var button = Livepress.Ui.ReactButton(v, update);
		container.append(button);
	});
	return container;
};

/**
 * About this file
 * ---------------
 * This is the fully-commented source version of the SoundManager 2 API,
 * recommended for use during development and testing.
 *
 * See soundmanager2-nodebug-jsmin.js for an optimized build (~10KB with gzip.)
 * http://schillmania.com/projects/soundmanager2/doc/getstarted/#basic-inclusion
 * Alternately, serve this file with gzip for 75% compression savings (~30KB over HTTP.)
 *
 * You may notice <d> and </d> comments in this source; these are delimiters for
 * debug blocks which are removed in the -nodebug builds, further optimizing code size.
 *
 * Also, as you may note: Whoa, reliable cross-platform/device audio support is hard! ;)
 */

(function (window) {

	var soundManager = null;

	/**
	 * The SoundManager constructor.
	 *
	 * @constructor
	 * @param {string} smURL Optional: Path to SWF files
	 * @param {string} smID Optional: The ID to use for the SWF container element
	 * @this {SoundManager}
	 * @return {SoundManager} The new SoundManager instance
	 */

	function SoundManager (smURL, smID) {

		// Top-level configuration options

		this.flashVersion = 8;             // flash build to use (8 or 9.) Some API features require 9.
		this.debugMode = true;             // enable debugging output (console.log() with HTML fallback)
		this.debugFlash = false;           // enable debugging output inside SWF, troubleshoot Flash/browser issues
		this.useConsole = true;            // use console.log() if available (otherwise, writes to #soundmanager-debug element)
		this.consoleOnly = true;           // if console is being used, do not create/write to #soundmanager-debug
		this.waitForWindowLoad = false;    // force SM2 to wait for window.onload() before trying to call soundManager.onload()
		this.bgColor = '#ffffff';          // SWF background color. N/A when wmode = 'transparent'
		this.useHighPerformance = false;   // position:fixed flash movie can help increase js/flash speed, minimize lag
		this.flashPollingInterval = null;  // msec affecting whileplaying/loading callback frequency. If null, default of 50 msec is used.
		this.html5PollingInterval = null;  // msec affecting whileplaying() for HTML5 audio, excluding mobile devices. If null, native HTML5 update events are used.
		this.flashLoadTimeout = 1000;      // msec to wait for flash movie to load before failing (0 = infinity)
		this.wmode = null;                 // flash rendering mode - null, 'transparent', or 'opaque' (last two allow z-index to work)
		this.allowScriptAccess = 'always'; // for scripting the SWF (object/embed property), 'always' or 'sameDomain'
		this.useFlashBlock = false;        // *requires flashblock.css, see demos* - allow recovery from flash blockers. Wait indefinitely and apply timeout CSS to SWF, if applicable.
		this.useHTML5Audio = true;         // use HTML5 Audio() where API is supported (most Safari, Chrome versions), Firefox (no MP3/MP4.) Ideally, transparent vs. Flash API where possible.
		this.html5Test = /^(probably|maybe)$/i; // HTML5 Audio() format support test. Use /^probably$/i; if you want to be more conservative.
		this.preferFlash = true;           // overrides useHTML5audio. if true and flash support present, will try to use flash for MP3/MP4 as needed since HTML5 audio support is still quirky in browsers.
		this.noSWFCache = false;           // if true, appends ?ts={date} to break aggressive SWF caching.

		this.audioFormats = {

			/**
			 * determines HTML5 support + flash requirements.
			 * if no support (via flash and/or HTML5) for a "required" format, SM2 will fail to start.
			 * flash fallback is used for MP3 or MP4 if HTML5 can't play it (or if preferFlash = true)
			 * multiple MIME types may be tested while trying to get a positive canPlayType() response.
			 */

			'mp3':{
				'type':    ['audio/mpeg; codecs="mp3"', 'audio/mpeg', 'audio/mp3', 'audio/MPA', 'audio/mpa-robust'],
				'required':true
			},

			'mp4':{
				'related': ['aac', 'm4a'], // additional formats under the MP4 container
				'type':    ['audio/mp4; codecs="mp4a.40.2"', 'audio/aac', 'audio/x-m4a', 'audio/MP4A-LATM', 'audio/mpeg4-generic'],
				'required':false
			},

			'ogg':{
				'type':    ['audio/ogg; codecs=vorbis'],
				'required':false
			},

			'wav':{
				'type':    ['audio/wav; codecs="1"', 'audio/wav', 'audio/wave', 'audio/x-wav'],
				'required':false
			}

		};

		this.defaultOptions = {

			/**
			 * the default configuration for sound objects made with createSound() and related methods
			 * eg., volume, auto-load behaviour and so forth
			 */

			'autoLoad':       false, // enable automatic loading (otherwise .load() will be called on demand with .play(), the latter being nicer on bandwidth - if you want to .load yourself, you also can)
			'autoPlay':       false, // enable playing of file as soon as possible (much faster if "stream" is true)
			'from':           null, // position to start playback within a sound (msec), default = beginning
			'loops':          1, // how many times to repeat the sound (position will wrap around to 0, setPosition() will break out of loop when >0)
			'onid3':          null, // callback function for "ID3 data is added/available"
			'onload':         null, // callback function for "load finished"
			'whileloading':   null, // callback function for "download progress update" (X of Y bytes received)
			'onplay':         null, // callback for "play" start
			'onpause':        null, // callback for "pause"
			'onresume':       null, // callback for "resume" (pause toggle)
			'whileplaying':   null, // callback during play (position update)
			'onposition':     null, // object containing times and function callbacks for positions of interest
			'onstop':         null, // callback for "user stop"
			'onfailure':      null, // callback function for when playing fails
			'onfinish':       null, // callback function for "sound finished playing"
			'multiShot':      true, // let sounds "restart" or layer on top of each other when played multiple times, rather than one-shot/one at a time
			'multiShotEvents':false, // fire multiple sound events (currently onfinish() only) when multiShot is enabled
			'position':       null, // offset (milliseconds) to seek to within loaded sound data.
			'pan':            0, // "pan" settings, left-to-right, -100 to 100
			'stream':         true, // allows playing before entire file has loaded (recommended)
			'to':             null, // position to end playback within a sound (msec), default = end
			'type':           null, // MIME-like hint for file pattern / canPlay() tests, eg. audio/mp3
			'usePolicyFile':  false, // enable crossdomain.xml request for audio on remote domains (for ID3/waveform access)
			'volume':         100             // self-explanatory. 0-100, the latter being the max.

		};

		this.flash9Options = {

			/**
			 * flash 9-only options,
			 * merged into defaultOptions if flash 9 is being used
			 */

			'isMovieStar':    null, // "MovieStar" MPEG4 audio mode. Null (default) = auto detect MP4, AAC etc. based on URL. true = force on, ignore URL
			'usePeakData':    false, // enable left/right channel peak (level) data
			'useWaveformData':false, // enable sound spectrum (raw waveform data) - NOTE: May increase CPU load.
			'useEQData':      false, // enable sound EQ (frequency spectrum data) - NOTE: May increase CPU load.
			'onbufferchange': null, // callback for "isBuffering" property change
			'ondataerror':    null       // callback for waveform/eq data access error (flash playing audio in other tabs/domains)

		};

		this.movieStarOptions = {

			/**
			 * flash 9.0r115+ MPEG4 audio options,
			 * merged into defaultOptions if flash 9+movieStar mode is enabled
			 */

			'bufferTime':3, // seconds of data to buffer before playback begins (null = flash default of 0.1 seconds - if AAC playback is gappy, try increasing.)
			'serverURL': null, // rtmp: FMS or FMIS server to connect to, required when requesting media via RTMP or one of its variants
			'onconnect': null, // rtmp: callback for connection to flash media server
			'duration':  null          // rtmp: song duration (msec)

		};

		// HTML attributes (id + class names) for the SWF container

		this.movieID = 'sm2-container';
		this.id = (smID || 'sm2movie');

		this.debugID = 'soundmanager-debug';
		this.debugURLParam = /([#?&])debug=1/i;

		// dynamic attributes

		this.versionNumber = 'V2.97a.20120513';
		this.version = null;
		this.movieURL = null;
		this.url = (smURL || null);
		this.altURL = null;
		this.swfLoaded = false;
		this.enabled = false;
		this.oMC = null;
		this.sounds = {};
		this.soundIDs = [];
		this.muted = false;
		this.didFlashBlock = false;
		this.filePattern = null;

		this.filePatterns = {

			'flash8':/\.mp3(\?.*)?$/i,
			'flash9':/\.mp3(\?.*)?$/i

		};

		// support indicators, set at init

		this.features = {

			'buffering':   false,
			'peakData':    false,
			'waveformData':false,
			'eqData':      false,
			'movieStar':   false

		};

		// flash sandbox info, used primarily in troubleshooting

		this.sandbox = {

			// <d>
			'type':       null,
			'types':      {
				'remote':          'remote (domain-based) rules',
				'localWithFile':   'local with file access (no internet access)',
				'localWithNetwork':'local with network (internet access only, no local access)',
				'localTrusted':    'local, trusted (local+internet access)'
			},
			'description':null,
			'noRemote':   null,
			'noLocal':    null
			// </d>

		};

		/**
		 * basic HTML5 Audio() support test
		 * try...catch because of IE 9 "not implemented" nonsense
		 * https://github.com/Modernizr/Modernizr/issues/224
		 */

		this.hasHTML5 = (function () {
			try {
				return (typeof Audio !== 'undefined' && typeof new Audio().canPlayType !== 'undefined');
			} catch (e) {
				return false;
			}
		}());

		/**
		 * format support (html5/flash)
		 * stores canPlayType() results based on audioFormats.
		 * eg. { mp3: boolean, mp4: boolean }
		 * treat as read-only.
		 */

		this.html5 = {
			'usingFlash':null // set if/when flash fallback is needed
		};

		// file type support hash
		this.flash = {};

		// determined at init time
		this.html5Only = false;

		// used for special cases (eg. iPad/iPhone/palm OS?)
		this.ignoreFlash = false;

		/**
		 * a few private internals (OK, a lot. :D)
		 */

		var SMSound,
			_s = this, _flash = null, _sm = 'soundManager', _smc = _sm + '::', _h5 = 'HTML5::', _id, _ua = navigator.userAgent, _win = window, _wl = _win.location.href.toString(), _doc = document, _doNothing, _init, _fV, _on_queue = [], _debugOpen = true, _debugTS, _didAppend = false, _appendSuccess = false, _didInit = false, _disabled = false, _windowLoaded = false, _wDS, _wdCount = 0, _initComplete, _mixin, _addOnEvent, _processOnEvents, _initUserOnload, _delayWaitForEI, _waitForEI, _setVersionInfo, _handleFocus, _strings, _initMovie, _domContentLoaded, _winOnLoad, _didDCLoaded, _getDocument, _createMovie, _catchError, _setPolling, _initDebug, _debugLevels = ['log', 'info', 'warn', 'error'], _defaultFlashVersion = 8, _disableObject, _failSafely, _normalizeMovieURL, _oRemoved = null, _oRemovedHTML = null, _str, _flashBlockHandler, _getSWFCSS, _swfCSS, _toggleDebug, _loopFix, _policyFix, _complain, _idCheck, _waitingForEI = false, _initPending = false, _startTimer, _stopTimer, _timerExecute, _h5TimerCount = 0, _h5IntervalTimer = null, _parseURL,
			_needsFlash = null, _featureCheck, _html5OK, _html5CanPlay, _html5Ext, _html5Unload, _domContentLoadedIE, _testHTML5, _event, _slice = Array.prototype.slice, _useGlobalHTML5Audio = false, _hasFlash, _detectFlash, _badSafariFix, _html5_events, _showSupport,
			_is_iDevice = _ua.match(/(ipad|iphone|ipod)/i), _is_firefox = _ua.match(/firefox/i), _isIE = _ua.match(/msie/i), _isWebkit = _ua.match(/webkit/i), _isSafari = (_ua.match(/safari/i) && !_ua.match(/chrome/i)), _isOpera = (_ua.match(/opera/i)),
			_mobileHTML5 = (_ua.match(/(mobile|pre\/|xoom)/i) || _is_iDevice),
			_isBadSafari = (!_wl.match(/usehtml5audio/i) && !_wl.match(/sm2\-ignorebadua/i) && _isSafari && !_ua.match(/silk/i) && _ua.match(/OS X 10_6_([3-7])/i)), // Safari 4 and 5 (excluding Kindle Fire, "Silk") occasionally fail to load/play HTML5 audio on Snow Leopard 10.6.3 through 10.6.7 due to bug(s) in QuickTime X and/or other underlying frameworks. :/ Confirmed bug. https://bugs.webkit.org/show_bug.cgi?id=32159
			_hasConsole = (typeof console !== 'undefined' && typeof console.log !== 'undefined'), _isFocused = (typeof _doc.hasFocus !== 'undefined' ? _doc.hasFocus() : null), _tryInitOnFocus = (_isSafari && typeof _doc.hasFocus === 'undefined'), _okToDisable = !_tryInitOnFocus, _flashMIME = /(mp3|mp4|mpa)/i,
			_emptyURL = 'about:blank', // safe URL to unload, or load nothing from (flash 8 + most HTML5 UAs)
			_overHTTP = (_doc.location ? _doc.location.protocol.match(/http/i) : null),
			_http = (!_overHTTP ? 'http:/' + '/' : ''),
		// mp3, mp4, aac etc.
			_netStreamMimeTypes = /^\s*audio\/(?:x-)?(?:mpeg4|aac|flv|mov|mp4||m4v|m4a|mp4v|3gp|3g2)\s*(?:$|;)/i,
		// Flash v9.0r115+ "moviestar" formats
			_netStreamTypes = ['mpeg4', 'aac', 'flv', 'mov', 'mp4', 'm4v', 'f4v', 'm4a', 'mp4v', '3gp', '3g2'],
			_netStreamPattern = new RegExp('\\.(' + _netStreamTypes.join('|') + ')(\\?.*)?$', 'i');

		this.mimePattern = /^\s*audio\/(?:x-)?(?:mp(?:eg|3))\s*(?:$|;)/i; // default mp3 set

		// use altURL if not "online"
		this.useAltURL = !_overHTTP;
		this._global_a = null;

		_swfCSS = {

			'swfBox':      'sm2-object-box',
			'swfDefault':  'movieContainer',
			'swfError':    'swf_error', // SWF loaded, but SM2 couldn't start (other error)
			'swfTimedout': 'swf_timedout',
			'swfLoaded':   'swf_loaded',
			'swfUnblocked':'swf_unblocked', // or loaded OK
			'sm2Debug':    'sm2_debug',
			'highPerf':    'high_performance',
			'flashDebug':  'flash_debug'

		};

		if (_mobileHTML5) {

			// prefer HTML5 for mobile + tablet-like devices, probably more reliable vs. flash at this point.
			_s.useHTML5Audio = true;
			_s.preferFlash = false;

			if (_is_iDevice) {
				// by default, use global feature. iOS onfinish() -> next may fail otherwise.
				_s.ignoreFlash = true;
				_useGlobalHTML5Audio = true;
			}

		}

		/**
		 * Public SoundManager API
		 * -----------------------
		 */

		this.ok = function () {

			return (_needsFlash ? (_didInit && !_disabled) : (_s.useHTML5Audio && _s.hasHTML5));

		};

		this.supported = this.ok; // legacy

		this.getMovie = function (smID) {

			// safety net: some old browsers differ on SWF references, possibly related to ExternalInterface / flash version
			return _id(smID) || _doc[smID] || _win[smID];

		};

		/**
		 * Creates a SMSound sound object instance.
		 *
		 * @param {object} oOptions Sound options (at minimum, id and url parameters are required.)
		 * @return {object} SMSound The new SMSound object.
		 */

		this.createSound = function (oOptions, _url) {

			var _cs, _cs_string, thisOptions = null, oSound = null, _tO = null;

			// <d>
			_cs = _sm + '.createSound(): ';
			_cs_string = _cs + _str(!_didInit ? 'notReady' : 'notOK');
			// </d>

			if (!_didInit || !_s.ok()) {
				_complain(_cs_string);
				return false;
			}

			if (typeof _url !== 'undefined') {
				// function overloading in JS! :) ..assume simple createSound(id,url) use case
				oOptions = {
					'id': oOptions,
					'url':_url
				};
			}

			// inherit from defaultOptions
			thisOptions = _mixin(oOptions);

			thisOptions.url = _parseURL(thisOptions.url);

			// local shortcut
			_tO = thisOptions;

			// <d>
			if (_tO.id.toString().charAt(0).match(/^[0-9]$/)) {
				_s._wD(_cs + _str('badID', _tO.id), 2);
			}

			_s._wD(_cs + _tO.id + ' (' + _tO.url + ')', 1);
			// </d>

			if (_idCheck(_tO.id, true)) {
				_s._wD(_cs + _tO.id + ' exists', 1);
				return _s.sounds[_tO.id];
			}

			function make () {

				thisOptions = _loopFix(thisOptions);
				_s.sounds[_tO.id] = new SMSound(_tO);
				_s.soundIDs.push(_tO.id);
				return _s.sounds[_tO.id];

			}

			if (_html5OK(_tO)) {

				oSound = make();
				_s._wD('Loading sound ' + _tO.id + ' via HTML5');
				oSound._setup_html5(_tO);

			} else {

				if (_fV > 8) {
					if (_tO.isMovieStar === null) {
						// attempt to detect MPEG-4 formats
						_tO.isMovieStar = (_tO.serverURL || (_tO.type ? _tO.type.match(_netStreamMimeTypes) : false) || _tO.url.match(_netStreamPattern));
					}
					// <d>
					if (_tO.isMovieStar) {
						_s._wD(_cs + 'using MovieStar handling');
						if (_tO.loops > 1) {
							_wDS('noNSLoop');
						}
					}
					// </d>
				}

				_tO = _policyFix(_tO, _cs);
				oSound = make();

				if (_fV === 8) {
					_flash._createSound(_tO.id, _tO.loops || 1, _tO.usePolicyFile);
				} else {
					_flash._createSound(_tO.id, _tO.url, _tO.usePeakData, _tO.useWaveformData, _tO.useEQData, _tO.isMovieStar, (_tO.isMovieStar ? _tO.bufferTime : false), _tO.loops || 1, _tO.serverURL, _tO.duration || null, _tO.autoPlay, true, _tO.autoLoad, _tO.usePolicyFile);
					if (!_tO.serverURL) {
						// We are connected immediately
						oSound.connected = true;
						if (_tO.onconnect) {
							_tO.onconnect.apply(oSound);
						}
					}
				}

				if (!_tO.serverURL && (_tO.autoLoad || _tO.autoPlay)) {
					// call load for non-rtmp streams
					oSound.load(_tO);
				}

			}

			// rtmp will play in onconnect
			if (!_tO.serverURL && _tO.autoPlay) {
				oSound.play();
			}

			return oSound;

		};

		/**
		 * Destroys a SMSound sound object instance.
		 *
		 * @param {string} sID The ID of the sound to destroy
		 */

		this.destroySound = function (sID, _bFromSound) {

			// explicitly destroy a sound before normal page unload, etc.

			if (!_idCheck(sID)) {
				return false;
			}

			var oS = _s.sounds[sID], i;

			// Disable all callbacks while the sound is being destroyed
			oS._iO = {};

			oS.stop();
			oS.unload();

			for (i = 0; i < _s.soundIDs.length; i++) {
				if (_s.soundIDs[i] === sID) {
					_s.soundIDs.splice(i, 1);
					break;
				}
			}

			if (!_bFromSound) {
				// ignore if being called from SMSound instance
				oS.destruct(true);
			}

			oS = null;
			delete _s.sounds[sID];

			return true;

		};

		/**
		 * Calls the load() method of a SMSound object by ID.
		 *
		 * @param {string} sID The ID of the sound
		 * @param {object} oOptions Optional: Sound options
		 */

		this.load = function (sID, oOptions) {

			if (!_idCheck(sID)) {
				return false;
			}
			return _s.sounds[sID].load(oOptions);

		};

		/**
		 * Calls the unload() method of a SMSound object by ID.
		 *
		 * @param {string} sID The ID of the sound
		 */

		this.unload = function (sID) {

			if (!_idCheck(sID)) {
				return false;
			}
			return _s.sounds[sID].unload();

		};

		/**
		 * Calls the onPosition() method of a SMSound object by ID.
		 *
		 * @param {string} sID The ID of the sound
		 * @param {number} nPosition The position to watch for
		 * @param {function} oMethod The relevant callback to fire
		 * @param {object} oScope Optional: The scope to apply the callback to
		 * @return {SMSound} The SMSound object
		 */

		this.onPosition = function (sID, nPosition, oMethod, oScope) {

			if (!_idCheck(sID)) {
				return false;
			}
			return _s.sounds[sID].onposition(nPosition, oMethod, oScope);

		};

		// legacy/backwards-compability: lower-case method name
		this.onposition = this.onPosition;

		/**
		 * Calls the clearOnPosition() method of a SMSound object by ID.
		 *
		 * @param {string} sID The ID of the sound
		 * @param {number} nPosition The position to watch for
		 * @param {function} oMethod Optional: The relevant callback to fire
		 * @return {SMSound} The SMSound object
		 */

		this.clearOnPosition = function (sID, nPosition, oMethod) {

			if (!_idCheck(sID)) {
				return false;
			}
			return _s.sounds[sID].clearOnPosition(nPosition, oMethod);

		};

		/**
		 * Calls the play() method of a SMSound object by ID.
		 *
		 * @param {string} sID The ID of the sound
		 * @param {object} oOptions Optional: Sound options
		 * @return {SMSound} The SMSound object
		 */

		this.play = function (sID, oOptions) {

			var result = false;

			if (!_didInit || !_s.ok()) {
				_complain(_sm + '.play(): ' + _str(!_didInit ? 'notReady' : 'notOK'));
				return result;
			}

			if (!_idCheck(sID)) {
				if (!(oOptions instanceof Object)) {
					// overloading use case: play('mySound','/path/to/some.mp3');
					oOptions = {
						url:oOptions
					};
				}
				if (oOptions && oOptions.url) {
					// overloading use case, create+play: .play('someID',{url:'/path/to.mp3'});
					_s._wD(_sm + '.play(): attempting to create "' + sID + '"', 1);
					oOptions.id = sID;
					result = _s.createSound(oOptions).play();
				}
				return result;
			}

			return _s.sounds[sID].play(oOptions);

		};

		this.start = this.play; // just for convenience

		/**
		 * Calls the setPosition() method of a SMSound object by ID.
		 *
		 * @param {string} sID The ID of the sound
		 * @param {number} nMsecOffset Position (milliseconds)
		 * @return {SMSound} The SMSound object
		 */

		this.setPosition = function (sID, nMsecOffset) {

			if (!_idCheck(sID)) {
				return false;
			}
			return _s.sounds[sID].setPosition(nMsecOffset);

		};

		/**
		 * Calls the stop() method of a SMSound object by ID.
		 *
		 * @param {string} sID The ID of the sound
		 * @return {SMSound} The SMSound object
		 */

		this.stop = function (sID) {

			if (!_idCheck(sID)) {
				return false;
			}

			_s._wD(_sm + '.stop(' + sID + ')', 1);
			return _s.sounds[sID].stop();

		};

		/**
		 * Stops all currently-playing sounds.
		 */

		this.stopAll = function () {

			var oSound;
			_s._wD(_sm + '.stopAll()', 1);

			for (oSound in _s.sounds) {
				if (_s.sounds.hasOwnProperty(oSound)) {
					// apply only to sound objects
					_s.sounds[oSound].stop();
				}
			}

		};

		/**
		 * Calls the pause() method of a SMSound object by ID.
		 *
		 * @param {string} sID The ID of the sound
		 * @return {SMSound} The SMSound object
		 */

		this.pause = function (sID) {

			if (!_idCheck(sID)) {
				return false;
			}
			return _s.sounds[sID].pause();

		};

		/**
		 * Pauses all currently-playing sounds.
		 */

		this.pauseAll = function () {

			var i;
			for (i = _s.soundIDs.length - 1; i >= 0; i--) {
				_s.sounds[_s.soundIDs[i]].pause();
			}

		};

		/**
		 * Calls the resume() method of a SMSound object by ID.
		 *
		 * @param {string} sID The ID of the sound
		 * @return {SMSound} The SMSound object
		 */

		this.resume = function (sID) {

			if (!_idCheck(sID)) {
				return false;
			}
			return _s.sounds[sID].resume();

		};

		/**
		 * Resumes all currently-paused sounds.
		 */

		this.resumeAll = function () {

			var i;
			for (i = _s.soundIDs.length - 1; i >= 0; i--) {
				_s.sounds[_s.soundIDs[i]].resume();
			}

		};

		/**
		 * Calls the togglePause() method of a SMSound object by ID.
		 *
		 * @param {string} sID The ID of the sound
		 * @return {SMSound} The SMSound object
		 */

		this.togglePause = function (sID) {

			if (!_idCheck(sID)) {
				return false;
			}
			return _s.sounds[sID].togglePause();

		};

		/**
		 * Calls the setPan() method of a SMSound object by ID.
		 *
		 * @param {string} sID The ID of the sound
		 * @param {number} nPan The pan value (-100 to 100)
		 * @return {SMSound} The SMSound object
		 */

		this.setPan = function (sID, nPan) {

			if (!_idCheck(sID)) {
				return false;
			}
			return _s.sounds[sID].setPan(nPan);

		};

		/**
		 * Calls the setVolume() method of a SMSound object by ID.
		 *
		 * @param {string} sID The ID of the sound
		 * @param {number} nVol The volume value (0 to 100)
		 * @return {SMSound} The SMSound object
		 */

		this.setVolume = function (sID, nVol) {

			if (!_idCheck(sID)) {
				return false;
			}
			return _s.sounds[sID].setVolume(nVol);

		};

		/**
		 * Calls the mute() method of either a single SMSound object by ID, or all sound objects.
		 *
		 * @param {string} sID Optional: The ID of the sound (if omitted, all sounds will be used.)
		 */

		this.mute = function (sID) {

			var i = 0;

			if (typeof sID !== 'string') {
				sID = null;
			}

			if (!sID) {
				_s._wD(_sm + '.mute(): Muting all sounds');
				for (i = _s.soundIDs.length - 1; i >= 0; i--) {
					_s.sounds[_s.soundIDs[i]].mute();
				}
				_s.muted = true;
			} else {
				if (!_idCheck(sID)) {
					return false;
				}
				_s._wD(_sm + '.mute(): Muting "' + sID + '"');
				return _s.sounds[sID].mute();
			}

			return true;

		};

		/**
		 * Mutes all sounds.
		 */

		this.muteAll = function () {

			_s.mute();

		};

		/**
		 * Calls the unmute() method of either a single SMSound object by ID, or all sound objects.
		 *
		 * @param {string} sID Optional: The ID of the sound (if omitted, all sounds will be used.)
		 */

		this.unmute = function (sID) {

			var i;

			if (typeof sID !== 'string') {
				sID = null;
			}

			if (!sID) {

				_s._wD(_sm + '.unmute(): Unmuting all sounds');
				for (i = _s.soundIDs.length - 1; i >= 0; i--) {
					_s.sounds[_s.soundIDs[i]].unmute();
				}
				_s.muted = false;

			} else {

				if (!_idCheck(sID)) {
					return false;
				}
				_s._wD(_sm + '.unmute(): Unmuting "' + sID + '"');
				return _s.sounds[sID].unmute();

			}

			return true;

		};

		/**
		 * Unmutes all sounds.
		 */

		this.unmuteAll = function () {

			_s.unmute();

		};

		/**
		 * Calls the toggleMute() method of a SMSound object by ID.
		 *
		 * @param {string} sID The ID of the sound
		 * @return {SMSound} The SMSound object
		 */

		this.toggleMute = function (sID) {

			if (!_idCheck(sID)) {
				return false;
			}
			return _s.sounds[sID].toggleMute();

		};

		/**
		 * Retrieves the memory used by the flash plugin.
		 *
		 * @return {number} The amount of memory in use
		 */

		this.getMemoryUse = function () {

			// flash-only
			var ram = 0;

			if (_flash && _fV !== 8) {
				ram = parseInt(_flash._getMemoryUse(), 10);
			}

			return ram;

		};

		/**
		 * Undocumented: NOPs soundManager and all SMSound objects.
		 */

		this.disable = function (bNoDisable) {

			// destroy all functions
			var i;

			if (typeof bNoDisable === 'undefined') {
				bNoDisable = false;
			}

			if (_disabled) {
				return false;
			}

			_disabled = true;
			_wDS('shutdown', 1);

			for (i = _s.soundIDs.length - 1; i >= 0; i--) {
				_disableObject(_s.sounds[_s.soundIDs[i]]);
			}

			// fire "complete", despite fail
			_initComplete(bNoDisable);
			_event.remove(_win, 'load', _initUserOnload);

			return true;

		};

		/**
		 * Determines playability of a MIME type, eg. 'audio/mp3'.
		 */

		this.canPlayMIME = function (sMIME) {

			var result;

			if (_s.hasHTML5) {
				result = _html5CanPlay({type:sMIME});
			}

			if (!result && _needsFlash) {
				// if flash 9, test netStream (movieStar) types as well.
				result = (sMIME && _s.ok() ? !!((_fV > 8 ? sMIME.match(_netStreamMimeTypes) : null) || sMIME.match(_s.mimePattern)) : null);
			}

			return result;

		};

		/**
		 * Determines playability of a URL based on audio support.
		 *
		 * @param {string} sURL The URL to test
		 * @return {boolean} URL playability
		 */

		this.canPlayURL = function (sURL) {

			var result;

			if (_s.hasHTML5) {
				result = _html5CanPlay({url:sURL});
			}

			if (!result && _needsFlash) {
				result = (sURL && _s.ok() ? !!(sURL.match(_s.filePattern)) : null);
			}

			return result;

		};

		/**
		 * Determines playability of an HTML DOM &lt;a&gt; object (or similar object literal) based on audio support.
		 *
		 * @param {object} oLink an HTML DOM &lt;a&gt; object or object literal including href and/or type attributes
		 * @return {boolean} URL playability
		 */

		this.canPlayLink = function (oLink) {

			if (typeof oLink.type !== 'undefined' && oLink.type) {
				if (_s.canPlayMIME(oLink.type)) {
					return true;
				}
			}

			return _s.canPlayURL(oLink.href);

		};

		/**
		 * Retrieves a SMSound object by ID.
		 *
		 * @param {string} sID The ID of the sound
		 * @return {SMSound} The SMSound object
		 */

		this.getSoundById = function (sID, _suppressDebug) {

			if (!sID) {
				throw new Error(_sm + '.getSoundById(): sID is null/undefined');
			}

			var result = _s.sounds[sID];

			// <d>
			if (!result && !_suppressDebug) {
				_s._wD('"' + sID + '" is an invalid sound ID.', 2);
			}
			// </d>

			return result;

		};

		/**
		 * Queues a callback for execution when SoundManager has successfully initialized.
		 *
		 * @param {function} oMethod The callback method to fire
		 * @param {object} oScope Optional: The scope to apply to the callback
		 */

		this.onready = function (oMethod, oScope) {

			var sType = 'onready',
				result = false;

			if (oMethod && oMethod instanceof Function) {

				// <d>
				if (_didInit) {
					_s._wD(_str('queue', sType));
				}
				// </d>

				if (!oScope) {
					oScope = _win;
				}

				_addOnEvent(sType, oMethod, oScope);
				_processOnEvents();

				result = true;

			} else {

				throw _str('needFunction', sType);

			}

			return result;

		};

		/**
		 * Queues a callback for execution when SoundManager has failed to initialize.
		 *
		 * @param {function} oMethod The callback method to fire
		 * @param {object} oScope Optional: The scope to apply to the callback
		 */

		this.ontimeout = function (oMethod, oScope) {

			var sType = 'ontimeout',
				result = false;

			if (oMethod && oMethod instanceof Function) {

				// <d>
				if (_didInit) {
					_s._wD(_str('queue', sType));
				}
				// </d>

				if (!oScope) {
					oScope = _win;
				}

				_addOnEvent(sType, oMethod, oScope);
				_processOnEvents({type:sType});

				result = true;

			} else {

				throw _str('needFunction', sType);

			}

			return result;

		};

		/**
		 * Writes console.log()-style debug output to a console or in-browser element.
		 * Applies when SoundManager.debugMode = true
		 *
		 * @param {string} sText The console message
		 * @param {string} sType Optional: Log type of 'info', 'warn' or 'error'
		 * @param {object} Optional: The scope to apply to the callback
		 */

		this._writeDebug = function (sText, sType, _bTimestamp) {

			// pseudo-private console.log()-style output
			// <d>

			var sDID = 'soundmanager-debug', o, oItem, sMethod;

			if (!_s.debugMode) {
				return false;
			}

			if (typeof _bTimestamp !== 'undefined' && _bTimestamp) {
				sText = sText + ' | ' + new Date().getTime();
			}

			if (_hasConsole && _s.useConsole) {
				sMethod = _debugLevels[sType];
				if (typeof console[sMethod] !== 'undefined') {
					console[sMethod](sText);
				} else {
					console.log(sText);
				}
				if (_s.consoleOnly) {
					return true;
				}
			}

			try {

				o = _id(sDID);

				if (!o) {
					return false;
				}

				oItem = _doc.createElement('div');

				if (++_wdCount % 2 === 0) {
					oItem.className = 'sm2-alt';
				}

				if (typeof sType === 'undefined') {
					sType = 0;
				} else {
					sType = parseInt(sType, 10);
				}

				oItem.appendChild(_doc.createTextNode(sText));

				if (sType) {
					if (sType >= 2) {
						oItem.style.fontWeight = 'bold';
					}
					if (sType === 3) {
						oItem.style.color = '#ff3333';
					}
				}

				// top-to-bottom
				// o.appendChild(oItem);

				// bottom-to-top
				o.insertBefore(oItem, o.firstChild);

			} catch (e) {
				// oh well
			}

			o = null;
			// </d>

			return true;

		};

		// alias
		this._wD = this._writeDebug;

		/**
		 * Provides debug / state information on all SMSound objects.
		 */

		this._debug = function () {

			// <d>
			var i, j;
			_wDS('currentObj', 1);

			for (i = 0, j = _s.soundIDs.length; i < j; i++) {
				_s.sounds[_s.soundIDs[i]]._debug();
			}
			// </d>

		};

		/**
		 * Restarts and re-initializes the SoundManager instance.
		 */

		this.reboot = function () {

			// attempt to reset and init SM2
			_s._wD(_sm + '.reboot()');

			// <d>
			if (_s.soundIDs.length) {
				_s._wD('Destroying ' + _s.soundIDs.length + ' SMSound objects...');
			}
			// </d>

			var i, j;

			for (i = _s.soundIDs.length - 1; i >= 0; i--) {
				_s.sounds[_s.soundIDs[i]].destruct();
			}

			// trash ze flash

			try {
				if (_isIE) {
					_oRemovedHTML = _flash.innerHTML;
				}
				_oRemoved = _flash.parentNode.removeChild(_flash);
				_s._wD('Flash movie removed.');
			} catch (e) {
				// uh-oh.
				_wDS('badRemove', 2);
			}

			// actually, force recreate of movie.
			_oRemovedHTML = _oRemoved = _needsFlash = null;

			_s.enabled = _didDCLoaded = _didInit = _waitingForEI = _initPending = _didAppend = _appendSuccess = _disabled = _s.swfLoaded = false;
			_s.soundIDs = [];
			_s.sounds = {};
			_flash = null;

			for (i in _on_queue) {
				if (_on_queue.hasOwnProperty(i)) {
					for (j = _on_queue[i].length - 1; j >= 0; j--) {
						_on_queue[i][j].fired = false;
					}
				}
			}

			_s._wD(_sm + ': Rebooting...');
			_win.setTimeout(_s.beginDelayedInit, 20);

		};

		/**
		 * Undocumented: Determines the SM2 flash movie's load progress.
		 *
		 * @return {number or null} Percent loaded, or if invalid/unsupported, null.
		 */

		this.getMoviePercent = function () {

			return (_flash && typeof _flash.PercentLoaded !== 'undefined' ? _flash.PercentLoaded() : null);

		};

		/**
		 * Additional helper for manually invoking SM2's init process after DOM Ready / window.onload().
		 */

		this.beginDelayedInit = function () {

			_windowLoaded = true;
			_domContentLoaded();

			setTimeout(function () {

				if (_initPending) {
					return false;
				}

				_createMovie();
				_initMovie();
				_initPending = true;

				return true;

			}, 20);

			_delayWaitForEI();

		};

		/**
		 * Destroys the SoundManager instance and all SMSound instances.
		 */

		this.destruct = function () {

			_s._wD(_sm + '.destruct()');
			_s.disable(true);

		};

		/**
		 * SMSound() (sound object) constructor
		 * ------------------------------------
		 *
		 * @param {object} oOptions Sound options (id and url are required attributes)
		 * @return {SMSound} The new SMSound object
		 */

		SMSound = function (oOptions) {

			var _t = this, _resetProperties, _add_html5_events, _remove_html5_events, _stop_html5_timer, _start_html5_timer, _attachOnPosition, _onplay_called = false, _onPositionItems = [], _onPositionFired = 0, _detachOnPosition, _applyFromTo, _lastURL = null, _lastHTML5State;

			_lastHTML5State = {
				// tracks duration + position (time)
				duration:null,
				time:    null
			};

			this.sID = oOptions.id;
			this.url = oOptions.url;
			this.options = _mixin(oOptions);

			// per-play-instance-specific options
			this.instanceOptions = this.options;

			// short alias
			this._iO = this.instanceOptions;

			// assign property defaults
			this.pan = this.options.pan;
			this.volume = this.options.volume;

			// whether or not this object is using HTML5
			this.isHTML5 = false;

			// internal HTML5 Audio() object reference
			this._a = null;

			/**
			 * SMSound() public methods
			 * ------------------------
			 */

			this.id3 = {};

			/**
			 * Writes SMSound object parameters to debug console
			 */

			this._debug = function () {

				// <d>
				// pseudo-private console.log()-style output

				if (_s.debugMode) {

					var stuff = null, msg = [], sF, sfBracket, maxLength = 64;

					for (stuff in _t.options) {
						if (_t.options[stuff] !== null) {
							if (_t.options[stuff] instanceof Function) {
								// handle functions specially
								sF = _t.options[stuff].toString();
								// normalize spaces
								sF = sF.replace(/\s\s+/g, ' ');
								sfBracket = sF.indexOf('{');
								msg.push(' ' + stuff + ': {' + sF.substr(sfBracket + 1, (Math.min(Math.max(sF.indexOf('\n') - 1, maxLength), maxLength))).replace(/\n/g, '') + '... }');
							} else {
								msg.push(' ' + stuff + ': ' + _t.options[stuff]);
							}
						}
					}

					_s._wD('SMSound() merged options: {\n' + msg.join(', \n') + '\n}');

				}
				// </d>

			};

			// <d>
			this._debug();
			// </d>

			/**
			 * Begins loading a sound per its *url*.
			 *
			 * @param {object} oOptions Optional: Sound options
			 * @return {SMSound} The SMSound object
			 */

			this.load = function (oOptions) {

				var oS = null, _iO;

				if (typeof oOptions !== 'undefined') {
					_t._iO = _mixin(oOptions, _t.options);
					_t.instanceOptions = _t._iO;
				} else {
					oOptions = _t.options;
					_t._iO = oOptions;
					_t.instanceOptions = _t._iO;
					if (_lastURL && _lastURL !== _t.url) {
						_wDS('manURL');
						_t._iO.url = _t.url;
						_t.url = null;
					}
				}

				if (!_t._iO.url) {
					_t._iO.url = _t.url;
				}

				_t._iO.url = _parseURL(_t._iO.url);

				_s._wD('SMSound.load(): ' + _t._iO.url, 1);

				if (_t._iO.url === _t.url && _t.readyState !== 0 && _t.readyState !== 2) {
					_wDS('onURL', 1);
					// if loaded and an onload() exists, fire immediately.
					if (_t.readyState === 3 && _t._iO.onload) {
						// assume success based on truthy duration.
						_t._iO.onload.apply(_t, [(!!_t.duration)]);
					}
					return _t;
				}

				// local shortcut
				_iO = _t._iO;

				_lastURL = _t.url;
				_t.loaded = false;
				_t.readyState = 1;
				_t.playState = 0;

				// TODO: If switching from HTML5 -> flash (or vice versa), stop currently-playing audio.

				if (_html5OK(_iO)) {

					oS = _t._setup_html5(_iO);

					if (!oS._called_load) {

						_s._wD(_h5 + 'load: ' + _t.sID);
						_t._html5_canplay = false;

						// given explicit load call, try to get whole file.
						// early HTML5 implementation (non-standard)
						_t._a.autobuffer = 'auto';

						// standard
						_t._a.preload = 'auto';

						oS._called_load = true;

						if (_iO.autoPlay) {
							_t.play();
						} else {
							oS.load();
						}

					} else {
						_s._wD(_h5 + 'ignoring request to load again: ' + _t.sID);
					}

				} else {

					try {
						_t.isHTML5 = false;
						_t._iO = _policyFix(_loopFix(_iO));
						// re-assign local shortcut
						_iO = _t._iO;
						if (_fV === 8) {
							_flash._load(_t.sID, _iO.url, _iO.stream, _iO.autoPlay, (_iO.whileloading ? 1 : 0), _iO.loops || 1, _iO.usePolicyFile);
						} else {
							_flash._load(_t.sID, _iO.url, !!(_iO.stream), !!(_iO.autoPlay), _iO.loops || 1, !!(_iO.autoLoad), _iO.usePolicyFile);
						}
					} catch (e) {
						_wDS('smError', 2);
						_debugTS('onload', false);
						_catchError({type:'SMSOUND_LOAD_JS_EXCEPTION', fatal:true});

					}

				}

				return _t;

			};

			/**
			 * Unloads a sound, canceling any open HTTP requests.
			 *
			 * @return {SMSound} The SMSound object
			 */

			this.unload = function () {

				// Flash 8/AS2 can't "close" a stream - fake it by loading an empty URL
				// Flash 9/AS3: Close stream, preventing further load
				// HTML5: Most UAs will use empty URL

				if (_t.readyState !== 0) {

					_s._wD('SMSound.unload(): "' + _t.sID + '"');

					if (!_t.isHTML5) {
						if (_fV === 8) {
							_flash._unload(_t.sID, _emptyURL);
						} else {
							_flash._unload(_t.sID);
						}
					} else {
						_stop_html5_timer();
						if (_t._a) {
							_t._a.pause();
							_html5Unload(_t._a);
						}
					}

					// reset load/status flags
					_resetProperties();

				}

				return _t;

			};

			/**
			 * Unloads and destroys a sound.
			 */

			this.destruct = function (_bFromSM) {

				_s._wD('SMSound.destruct(): "' + _t.sID + '"');

				if (!_t.isHTML5) {

					// kill sound within Flash
					// Disable the onfailure handler
					_t._iO.onfailure = null;
					_flash._destroySound(_t.sID);

				} else {

					_stop_html5_timer();

					if (_t._a) {
						_t._a.pause();
						_html5Unload(_t._a);
						if (!_useGlobalHTML5Audio) {
							_remove_html5_events();
						}
						// break obvious circular reference
						_t._a._t = null;
						_t._a = null;
					}

				}

				if (!_bFromSM) {
					// ensure deletion from controller
					_s.destroySound(_t.sID, true);

				}

			};

			/**
			 * Begins playing a sound.
			 *
			 * @param {object} oOptions Optional: Sound options
			 * @return {SMSound} The SMSound object
			 */

			this.play = function (oOptions, _updatePlayState) {

				var fN, allowMulti, a, onready, startOK,
					exit = null;

				// <d>
				fN = 'SMSound.play(): ';
				// </d>

				// default to true
				_updatePlayState = (_updatePlayState === undefined ? true : _updatePlayState);

				if (!oOptions) {
					oOptions = {};
				}

				_t._iO = _mixin(oOptions, _t._iO);
				_t._iO = _mixin(_t._iO, _t.options);
				_t._iO.url = _parseURL(_t._iO.url);
				_t.instanceOptions = _t._iO;

				// RTMP-only
				if (_t._iO.serverURL && !_t.connected) {
					if (!_t.getAutoPlay()) {
						_s._wD(fN + ' Netstream not connected yet - setting autoPlay');
						_t.setAutoPlay(true);
					}
					// play will be called in _onconnect()
					return _t;
				}

				if (_html5OK(_t._iO)) {
					_t._setup_html5(_t._iO);
					_start_html5_timer();
				}

				if (_t.playState === 1 && !_t.paused) {
					allowMulti = _t._iO.multiShot;
					if (!allowMulti) {
						_s._wD(fN + '"' + _t.sID + '" already playing (one-shot)', 1);
						exit = _t;
					} else {
						_s._wD(fN + '"' + _t.sID + '" already playing (multi-shot)', 1);
					}
				}

				if (exit !== null) {
					return exit;
				}

				if (!_t.loaded) {

					if (_t.readyState === 0) {

						_s._wD(fN + 'Attempting to load "' + _t.sID + '"', 1);

						// try to get this sound playing ASAP
						if (!_t.isHTML5) {
							// assign directly because setAutoPlay() increments the instanceCount
							_t._iO.autoPlay = true;
							_t.load(_t._iO);
						} else if (_is_iDevice) {
							// iOS needs this when recycling sounds, loading a new URL on an existing object.
							_t.load(_t._iO);
						}

					} else if (_t.readyState === 2) {

						_s._wD(fN + 'Could not load "' + _t.sID + '" - exiting', 2);
						exit = _t;

					} else {

						_s._wD(fN + '"' + _t.sID + '" is loading - attempting to play..', 1);

					}

				} else {

					_s._wD(fN + '"' + _t.sID + '"');

				}

				if (exit !== null) {
					return exit;
				}

				if (!_t.isHTML5 && _fV === 9 && _t.position > 0 && _t.position === _t.duration) {
					// flash 9 needs a position reset if play() is called while at the end of a sound.
					_s._wD(fN + '"' + _t.sID + '": Sound at end, resetting to position:0');
					oOptions.position = 0;
				}

				/**
				 * Streams will pause when their buffer is full if they are being loaded.
				 * In this case paused is true, but the song hasn't started playing yet.
				 * If we just call resume() the onplay() callback will never be called.
				 * So only call resume() if the position is > 0.
				 * Another reason is because options like volume won't have been applied yet.
				 */

				if (_t.paused && _t.position && _t.position > 0) {

					// https://gist.github.com/37b17df75cc4d7a90bf6
					_s._wD(fN + '"' + _t.sID + '" is resuming from paused state', 1);
					_t.resume();

				} else {

					_t._iO = _mixin(oOptions, _t._iO);

					// apply from/to parameters, if they exist (and not using RTMP)
					if (_t._iO.from !== null && _t._iO.to !== null && _t.instanceCount === 0 && _t.playState === 0 && !_t._iO.serverURL) {

						onready = function () {
							// sound "canplay" or onload()
							// re-apply from/to to instance options, and start playback
							_t._iO = _mixin(oOptions, _t._iO);
							_t.play(_t._iO);
						};

						// HTML5 needs to at least have "canplay" fired before seeking.
						if (_t.isHTML5 && !_t._html5_canplay) {

							// this hasn't been loaded yet. load it first, and then do this again.
							_s._wD(fN + 'Beginning load of "' + _t.sID + '" for from/to case');

							_t.load({
								_oncanplay:onready
							});

							exit = false;

						} else if (!_t.isHTML5 && !_t.loaded && (!_t.readyState || _t.readyState !== 2)) {

							// to be safe, preload the whole thing in Flash.

							_s._wD(fN + 'Preloading "' + _t.sID + '" for from/to case');

							_t.load({
								onload:onready
							});

							exit = false;

						}

						if (exit !== null) {
							return exit;
						}

						// otherwise, we're ready to go. re-apply local options, and continue

						_t._iO = _applyFromTo();

					}

					_s._wD(fN + '"' + _t.sID + '" is starting to play');

					if (!_t.instanceCount || _t._iO.multiShotEvents || (!_t.isHTML5 && _fV > 8 && !_t.getAutoPlay())) {
						_t.instanceCount++;
					}

					// if first play and onposition parameters exist, apply them now
					if (_t._iO.onposition && _t.playState === 0) {
						_attachOnPosition(_t);
					}

					_t.playState = 1;
					_t.paused = false;

					_t.position = (typeof _t._iO.position !== 'undefined' && !isNaN(_t._iO.position) ? _t._iO.position : 0);

					if (!_t.isHTML5) {
						_t._iO = _policyFix(_loopFix(_t._iO));
					}

					if (_t._iO.onplay && _updatePlayState) {
						_t._iO.onplay.apply(_t);
						_onplay_called = true;
					}

					_t.setVolume(_t._iO.volume, true);
					_t.setPan(_t._iO.pan, true);

					if (!_t.isHTML5) {

						startOK = _flash._start(_t.sID, _t._iO.loops || 1, (_fV === 9 ? _t._iO.position : _t._iO.position / 1000), _t._iO.multiShot);

					} else {

						_start_html5_timer();
						a = _t._setup_html5();
						_t.setPosition(_t._iO.position);
						a.play();

					}

					if (_fV === 9 && !startOK) {
						// edge case: no sound hardware, or 32-channel flash ceiling hit.
						// applies only to Flash 9, non-NetStream/MovieStar sounds.
						// http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/media/Sound.html#play%28%29
						_s._wD(fN + _t.sID + ': No sound hardware, or 32-sound ceiling hit');
						if (_t._iO.onplayerror) {
							_t._iO.onplayerror.apply(_t);
						}
					}

				}

				return _t;

			};

			// just for convenience
			this.start = this.play;

			/**
			 * Stops playing a sound (and optionally, all sounds)
			 *
			 * @param {boolean} bAll Optional: Whether to stop all sounds
			 * @return {SMSound} The SMSound object
			 */

			this.stop = function (bAll) {

				var _iO = _t._iO, _oP;

				if (_t.playState === 1) {

					_t._onbufferchange(0);
					_t._resetOnPosition(0);
					_t.paused = false;

					if (!_t.isHTML5) {
						_t.playState = 0;
					}

					// remove onPosition listeners, if any
					_detachOnPosition();

					// and "to" position, if set
					if (_iO.to) {
						_t.clearOnPosition(_iO.to);
					}

					if (!_t.isHTML5) {

						_flash._stop(_t.sID, bAll);

						// hack for netStream: just unload
						if (_iO.serverURL) {
							_t.unload();
						}

					} else {

						if (_t._a) {

							_oP = _t.position;

							// act like Flash, though
							_t.setPosition(0);

							// hack: reflect old position for onstop() (also like Flash)
							_t.position = _oP;

							// html5 has no stop()
							// NOTE: pausing means iOS requires interaction to resume.
							_t._a.pause();

							_t.playState = 0;

							// and update UI
							_t._onTimer();

							_stop_html5_timer();

						}

					}

					_t.instanceCount = 0;
					_t._iO = {};

					if (_iO.onstop) {
						_iO.onstop.apply(_t);
					}

				}

				return _t;

			};

			/**
			 * Undocumented/internal: Sets autoPlay for RTMP.
			 *
			 * @param {boolean} autoPlay state
			 */

			this.setAutoPlay = function (autoPlay) {

				_s._wD('sound ' + _t.sID + ' turned autoplay ' + (autoPlay ? 'on' : 'off'));
				_t._iO.autoPlay = autoPlay;

				if (!_t.isHTML5) {
					_flash._setAutoPlay(_t.sID, autoPlay);
					if (autoPlay) {
						// only increment the instanceCount if the sound isn't loaded (TODO: verify RTMP)
						if (!_t.instanceCount && _t.readyState === 1) {
							_t.instanceCount++;
							_s._wD('sound ' + _t.sID + ' incremented instance count to ' + _t.instanceCount);
						}
					}
				}

			};

			/**
			 * Undocumented/internal: Returns the autoPlay boolean.
			 *
			 * @return {boolean} The current autoPlay value
			 */

			this.getAutoPlay = function () {

				return _t._iO.autoPlay;

			};

			/**
			 * Sets the position of a sound.
			 *
			 * @param {number} nMsecOffset Position (milliseconds)
			 * @return {SMSound} The SMSound object
			 */

			this.setPosition = function (nMsecOffset) {

				if (nMsecOffset === undefined) {
					nMsecOffset = 0;
				}

				var original_pos,
					position, position1K,
				// Use the duration from the instance options, if we don't have a track duration yet.
				// position >= 0 and <= current available (loaded) duration
					offset = (_t.isHTML5 ? Math.max(nMsecOffset, 0) : Math.min(_t.duration || _t._iO.duration, Math.max(nMsecOffset, 0)));

				original_pos = _t.position;
				_t.position = offset;
				position1K = _t.position / 1000;
				_t._resetOnPosition(_t.position);
				_t._iO.position = offset;

				if (!_t.isHTML5) {

					position = (_fV === 9 ? _t.position : position1K);
					if (_t.readyState && _t.readyState !== 2) {
						// if paused or not playing, will not resume (by playing)
						_flash._setPosition(_t.sID, position, (_t.paused || !_t.playState), _t._iO.multiShot);
					}

				} else if (_t._a) {

					// Set the position in the canplay handler if the sound is not ready yet
					if (_t._html5_canplay) {
						if (_t._a.currentTime !== position1K) {
							/**
							 * DOM/JS errors/exceptions to watch out for:
							 * if seek is beyond (loaded?) position, "DOM exception 11"
							 * "INDEX_SIZE_ERR": DOM exception 1
							 */
							_s._wD('setPosition(' + position1K + '): setting position');
							try {
								_t._a.currentTime = position1K;
								if (_t.playState === 0 || _t.paused) {
									// allow seek without auto-play/resume
									_t._a.pause();
								}
							} catch (e) {
								_s._wD('setPosition(' + position1K + '): setting position failed: ' + e.message, 2);
							}
						}
					} else {
						_s._wD('setPosition(' + position1K + '): delaying, sound not ready');
					}

				}

				if (_t.isHTML5) {
					if (_t.paused) {
						// if paused, refresh UI right away
						// force update
						_t._onTimer(true);
					}
				}

				return _t;

			};

			/**
			 * Pauses sound playback.
			 *
			 * @return {SMSound} The SMSound object
			 */

			this.pause = function (_bCallFlash) {

				if (_t.paused || (_t.playState === 0 && _t.readyState !== 1)) {
					return _t;
				}

				_s._wD('SMSound.pause()');
				_t.paused = true;

				if (!_t.isHTML5) {
					if (_bCallFlash || _bCallFlash === undefined) {
						_flash._pause(_t.sID, _t._iO.multiShot);
					}
				} else {
					_t._setup_html5().pause();
					_stop_html5_timer();
				}

				if (_t._iO.onpause) {
					_t._iO.onpause.apply(_t);
				}

				return _t;

			};

			/**
			 * Resumes sound playback.
			 *
			 * @return {SMSound} The SMSound object
			 */

			/**
			 * When auto-loaded streams pause on buffer full they have a playState of 0.
			 * We need to make sure that the playState is set to 1 when these streams "resume".
			 * When a paused stream is resumed, we need to trigger the onplay() callback if it
			 * hasn't been called already. In this case since the sound is being played for the
			 * first time, I think it's more appropriate to call onplay() rather than onresume().
			 */

			this.resume = function () {

				var _iO = _t._iO;

				if (!_t.paused) {
					return _t;
				}

				_s._wD('SMSound.resume()');
				_t.paused = false;
				_t.playState = 1;

				if (!_t.isHTML5) {
					if (_iO.isMovieStar && !_iO.serverURL) {
						// Bizarre Webkit bug (Chrome reported via 8tracks.com dudes): AAC content paused for 30+ seconds(?) will not resume without a reposition.
						_t.setPosition(_t.position);
					}
					// flash method is toggle-based (pause/resume)
					_flash._pause(_t.sID, _iO.multiShot);
				} else {
					_t._setup_html5().play();
					_start_html5_timer();
				}

				if (!_onplay_called && _iO.onplay) {
					_iO.onplay.apply(_t);
					_onplay_called = true;
				} else if (_iO.onresume) {
					_iO.onresume.apply(_t);
				}

				return _t;

			};

			/**
			 * Toggles sound playback.
			 *
			 * @return {SMSound} The SMSound object
			 */

			this.togglePause = function () {

				_s._wD('SMSound.togglePause()');

				if (_t.playState === 0) {
					_t.play({
						position:(_fV === 9 && !_t.isHTML5 ? _t.position : _t.position / 1000)
					});
					return _t;
				}

				if (_t.paused) {
					_t.resume();
				} else {
					_t.pause();
				}

				return _t;

			};

			/**
			 * Sets the panning (L-R) effect.
			 *
			 * @param {number} nPan The pan value (-100 to 100)
			 * @return {SMSound} The SMSound object
			 */

			this.setPan = function (nPan, bInstanceOnly) {

				if (typeof nPan === 'undefined') {
					nPan = 0;
				}

				if (typeof bInstanceOnly === 'undefined') {
					bInstanceOnly = false;
				}

				if (!_t.isHTML5) {
					_flash._setPan(_t.sID, nPan);
				} // else { no HTML5 pan? }

				_t._iO.pan = nPan;

				if (!bInstanceOnly) {
					_t.pan = nPan;
					_t.options.pan = nPan;
				}

				return _t;

			};

			/**
			 * Sets the volume.
			 *
			 * @param {number} nVol The volume value (0 to 100)
			 * @return {SMSound} The SMSound object
			 */

			this.setVolume = function (nVol, _bInstanceOnly) {

				/**
				 * Note: Setting volume has no effect on iOS "special snowflake" devices.
				 * Hardware volume control overrides software, and volume
				 * will always return 1 per Apple docs. (iOS 4 + 5.)
				 * http://developer.apple.com/library/safari/documentation/AudioVideo/Conceptual/HTML-canvas-guide/AddingSoundtoCanvasAnimations/AddingSoundtoCanvasAnimations.html
				 */

				if (typeof nVol === 'undefined') {
					nVol = 100;
				}

				if (typeof _bInstanceOnly === 'undefined') {
					_bInstanceOnly = false;
				}

				if (!_t.isHTML5) {
					_flash._setVolume(_t.sID, (_s.muted && !_t.muted) || _t.muted ? 0 : nVol);
				} else if (_t._a) {
					// valid range: 0-1
					_t._a.volume = Math.max(0, Math.min(1, nVol / 100));
				}

				_t._iO.volume = nVol;

				if (!_bInstanceOnly) {
					_t.volume = nVol;
					_t.options.volume = nVol;
				}

				return _t;

			};

			/**
			 * Mutes the sound.
			 *
			 * @return {SMSound} The SMSound object
			 */

			this.mute = function () {

				_t.muted = true;

				if (!_t.isHTML5) {
					_flash._setVolume(_t.sID, 0);
				} else if (_t._a) {
					_t._a.muted = true;
				}

				return _t;

			};

			/**
			 * Unmutes the sound.
			 *
			 * @return {SMSound} The SMSound object
			 */

			this.unmute = function () {

				_t.muted = false;
				var hasIO = typeof _t._iO.volume !== 'undefined';

				if (!_t.isHTML5) {
					_flash._setVolume(_t.sID, hasIO ? _t._iO.volume : _t.options.volume);
				} else if (_t._a) {
					_t._a.muted = false;
				}

				return _t;

			};

			/**
			 * Toggles the muted state of a sound.
			 *
			 * @return {SMSound} The SMSound object
			 */

			this.toggleMute = function () {

				return (_t.muted ? _t.unmute() : _t.mute());

			};

			/**
			 * Registers a callback to be fired when a sound reaches a given position during playback.
			 *
			 * @param {number} nPosition The position to watch for
			 * @param {function} oMethod The relevant callback to fire
			 * @param {object} oScope Optional: The scope to apply the callback to
			 * @return {SMSound} The SMSound object
			 */

			this.onPosition = function (nPosition, oMethod, oScope) {

				// TODO: basic dupe checking?

				_onPositionItems.push({
					position:parseInt(nPosition, 10),
					method:  oMethod,
					scope:   (typeof oScope !== 'undefined' ? oScope : _t),
					fired:   false
				});

				return _t;

			};

			// legacy/backwards-compability: lower-case method name
			this.onposition = this.onPosition;

			/**
			 * Removes registered callback(s) from a sound, by position and/or callback.
			 *
			 * @param {number} nPosition The position to clear callback(s) for
			 * @param {function} oMethod Optional: Identify one callback to be removed when multiple listeners exist for one position
			 * @return {SMSound} The SMSound object
			 */

			this.clearOnPosition = function (nPosition, oMethod) {

				var i;

				nPosition = parseInt(nPosition, 10);

				if (isNaN(nPosition)) {
					// safety check
					return false;
				}

				for (i = 0; i < _onPositionItems.length; i++) {

					if (nPosition === _onPositionItems[i].position) {
						// remove this item if no method was specified, or, if the method matches
						if (!oMethod || (oMethod === _onPositionItems[i].method)) {
							if (_onPositionItems[i].fired) {
								// decrement "fired" counter, too
								_onPositionFired--;
							}
							_onPositionItems.splice(i, 1);
						}
					}

				}

			};

			this._processOnPosition = function () {

				var i, item, j = _onPositionItems.length;

				if (!j || !_t.playState || _onPositionFired >= j) {
					return false;
				}

				for (i = j - 1; i >= 0; i--) {
					item = _onPositionItems[i];
					if (!item.fired && _t.position >= item.position) {
						item.fired = true;
						_onPositionFired++;
						item.method.apply(item.scope, [item.position]);
					}
				}

				return true;

			};

			this._resetOnPosition = function (nPosition) {

				// reset "fired" for items interested in this position
				var i, item, j = _onPositionItems.length;

				if (!j) {
					return false;
				}

				for (i = j - 1; i >= 0; i--) {
					item = _onPositionItems[i];
					if (item.fired && nPosition <= item.position) {
						item.fired = false;
						_onPositionFired--;
					}
				}

				return true;

			};

			/**
			 * SMSound() private internals
			 * --------------------------------
			 */

			_applyFromTo = function () {

				var _iO = _t._iO,
					f = _iO.from,
					t = _iO.to,
					start, end;

				end = function () {

					// end has been reached.
					_s._wD(_t.sID + ': "to" time of ' + t + ' reached.');

					// detach listener
					_t.clearOnPosition(t, end);

					// stop should clear this, too
					_t.stop();

				};

				start = function () {

					_s._wD(_t.sID + ': playing "from" ' + f);

					// add listener for end
					if (t !== null && !isNaN(t)) {
						_t.onPosition(t, end);
					}

				};

				if (f !== null && !isNaN(f)) {

					// apply to instance options, guaranteeing correct start position.
					_iO.position = f;

					// multiShot timing can't be tracked, so prevent that.
					_iO.multiShot = false;

					start();

				}

				// return updated instanceOptions including starting position
				return _iO;

			};

			_attachOnPosition = function () {

				var item,
					op = _t._iO.onposition;

				// attach onposition things, if any, now.

				if (op) {

					for (item in op) {
						if (op.hasOwnProperty(item)) {
							_t.onPosition(parseInt(item, 10), op[item]);
						}
					}

				}

			};

			_detachOnPosition = function () {

				var item,
					op = _t._iO.onposition;

				// detach any onposition()-style listeners.

				if (op) {

					for (item in op) {
						if (op.hasOwnProperty(item)) {
							_t.clearOnPosition(parseInt(item, 10));
						}
					}

				}

			};

			_start_html5_timer = function () {

				if (_t.isHTML5) {
					_startTimer(_t);
				}

			};

			_stop_html5_timer = function () {

				if (_t.isHTML5) {
					_stopTimer(_t);
				}

			};

			_resetProperties = function (retainPosition) {

				if (!retainPosition) {
					_onPositionItems = [];
					_onPositionFired = 0;
				}

				_onplay_called = false;

				_t._hasTimer = null;
				_t._a = null;
				_t._html5_canplay = false;
				_t.bytesLoaded = null;
				_t.bytesTotal = null;
				_t.duration = (_t._iO && _t._iO.duration ? _t._iO.duration : null);
				_t.durationEstimate = null;

				// legacy: 1D array
				_t.eqData = [];

				_t.eqData.left = [];
				_t.eqData.right = [];

				_t.failures = 0;
				_t.isBuffering = false;
				_t.instanceOptions = {};
				_t.instanceCount = 0;
				_t.loaded = false;
				_t.metadata = {};

				// 0 = uninitialised, 1 = loading, 2 = failed/error, 3 = loaded/success
				_t.readyState = 0;

				_t.muted = false;
				_t.paused = false;

				_t.peakData = {
					left: 0,
					right:0
				};

				_t.waveformData = {
					left: [],
					right:[]
				};

				_t.playState = 0;
				_t.position = null;

			};

			_resetProperties();

			/**
			 * Pseudo-private SMSound internals
			 * --------------------------------
			 */

			this._onTimer = function (bForce) {

				/**
				 * HTML5-only _whileplaying() etc.
				 * called from both HTML5 native events, and polling/interval-based timers
				 * mimics flash and fires only when time/duration change, so as to be polling-friendly
				 */

				var duration, isNew = false, time, x = {};

				if (_t._hasTimer || bForce) {

					// TODO: May not need to track readyState (1 = loading)

					if (_t._a && (bForce || ((_t.playState > 0 || _t.readyState === 1) && !_t.paused))) {

						duration = _t._get_html5_duration();

						if (duration !== _lastHTML5State.duration) {

							_lastHTML5State.duration = duration;
							_t.duration = duration;
							isNew = true;

						}

						// TODO: investigate why this goes wack if not set/re-set each time.
						_t.durationEstimate = _t.duration;

						time = (_t._a.currentTime * 1000 || 0);

						if (time !== _lastHTML5State.time) {

							_lastHTML5State.time = time;
							isNew = true;

						}

						if (isNew || bForce) {

							_t._whileplaying(time, x, x, x, x);

						}

					}
					/* else {

					 // _s._wD('_onTimer: Warn for "'+_t.sID+'": '+(!_t._a?'Could not find element. ':'')+(_t.playState === 0?'playState bad, 0?':'playState = '+_t.playState+', OK'));

					 return false;

					 }*/

					return isNew;

				}

			};

			this._get_html5_duration = function () {

				var _iO = _t._iO,
					d = (_t._a ? _t._a.duration * 1000 : (_iO ? _iO.duration : undefined)),
					result = (d && !isNaN(d) && d !== Infinity ? d : (_iO ? _iO.duration : null));

				return result;

			};

			this._apply_loop = function (a, nLoops) {

				/**
				 * boolean instead of "loop", for webkit? - spec says string. http://www.w3.org/TR/html-markup/audio.html#audio.attrs.loop
				 * note that loop is either off or infinite under HTML5, unlike Flash which allows arbitrary loop counts to be specified.
				 */

				// <d>
				if (!a.loop && nLoops > 1) {
					_s._wD('Note: Native HTML5 looping is infinite.');
				}
				// </d>

				a.loop = (nLoops > 1 ? 'loop' : '');

			};

			this._setup_html5 = function (oOptions) {

				var _iO = _mixin(_t._iO, oOptions), d = decodeURI,
					_a = _useGlobalHTML5Audio ? _s._global_a : _t._a,
					_dURL = d(_iO.url),
					_oldIO = (_a && _a._t ? _a._t.instanceOptions : null),
					result;

				if (_a) {

					if (_a._t) {

						if (!_useGlobalHTML5Audio && _dURL === d(_lastURL)) {
							// same url, ignore request
							result = _a;
						} else if (_useGlobalHTML5Audio && _oldIO.url === _iO.url && (!_lastURL || (_lastURL === _oldIO.url))) {
							// iOS-type reuse case
							result = _a;
						}

						if (result) {
							_t._apply_loop(_a, _iO.loops);
							return result;
						}

					}

					_s._wD('setting new URL on existing object: ' + _dURL + (_lastURL ? ', old URL: ' + _lastURL : ''));

					/**
					 * "First things first, I, Poppa.." (reset the previous state of the old sound, if playing)
					 * Fixes case with devices that can only play one sound at a time
					 * Otherwise, other sounds in mid-play will be terminated without warning and in a stuck state
					 */

					if (_useGlobalHTML5Audio && _a._t && _a._t.playState && _iO.url !== _oldIO.url) {
						_a._t.stop();
					}

					// reset load/playstate, onPosition etc. if the URL is new.
					// somewhat-tricky object re-use vs. new SMSound object, old vs. new URL comparisons
					_resetProperties((_oldIO.url ? _iO.url === _oldIO.url : (_lastURL ? _lastURL === _iO.url : false)));

					_a.src = _iO.url;
					_t.url = _iO.url;
					_lastURL = _iO.url;
					_a._called_load = false;

				} else {

					_s._wD('creating HTML5 Audio() element with URL: ' + _dURL);
					_a = new Audio(_iO.url);

					_a._called_load = false;

					if (_useGlobalHTML5Audio) {
						_s._global_a = _a;
					}

				}

				_t.isHTML5 = true;

				// store a ref on the track
				_t._a = _a;

				// store a ref on the audio
				_a._t = _t;

				_add_html5_events();

				_t._apply_loop(_a, _iO.loops);

				if (_iO.autoLoad || _iO.autoPlay) {

					_t.load();

				} else {

					// early HTML5 implementation (non-standard)
					_a.autobuffer = false;

					// standard
					_a.preload = 'none';

					if (!_mobileHTML5) {
						// android 2.3 doesn't like load() -> play(). Others do.
						_t.load();
					}

				}

				return _a;

			};

			_add_html5_events = function () {

				if (_t._a._added_events) {
					return false;
				}

				var f;

				function add (oEvt, oFn, bCapture) {
					return _t._a ? _t._a.addEventListener(oEvt, oFn, bCapture || false) : null;
				}

				_s._wD(_h5 + 'adding event listeners: ' + _t.sID);
				_t._a._added_events = true;

				for (f in _html5_events) {
					if (_html5_events.hasOwnProperty(f)) {
						add(f, _html5_events[f]);
					}
				}

				return true;

			};

			_remove_html5_events = function () {

				// Remove event listeners

				var f;

				function remove (oEvt, oFn, bCapture) {
					return (_t._a ? _t._a.removeEventListener(oEvt, oFn, bCapture || false) : null);
				}

				_s._wD(_h5 + 'removing event listeners: ' + _t.sID);
				_t._a._added_events = false;

				for (f in _html5_events) {
					if (_html5_events.hasOwnProperty(f)) {
						remove(f, _html5_events[f]);
					}
				}

			};

			/**
			 * Pseudo-private event internals
			 * ------------------------------
			 */

			this._onload = function (nSuccess) {


				var fN, loadOK = !!(nSuccess);

				// <d>
				fN = 'SMSound._onload(): ';
				_s._wD(fN + '"' + _t.sID + '"' + (loadOK ? ' loaded.' : ' failed to load? - ' + _t.url), (loadOK ? 1 : 2));
				if (!loadOK && !_t.isHTML5) {
					if (_s.sandbox.noRemote === true) {
						_s._wD(fN + _str('noNet'), 1);
					}
					if (_s.sandbox.noLocal === true) {
						_s._wD(fN + _str('noLocal'), 1);
					}
				}
				// </d>

				_t.loaded = loadOK;
				_t.readyState = loadOK ? 3 : 2;
				_t._onbufferchange(0);

				if (_t._iO.onload) {
					_t._iO.onload.apply(_t, [loadOK]);
				}

				return true;

			};

			this._onbufferchange = function (nIsBuffering) {

				if (_t.playState === 0) {
					// ignore if not playing
					return false;
				}

				if ((nIsBuffering && _t.isBuffering) || (!nIsBuffering && !_t.isBuffering)) {
					return false;
				}

				_t.isBuffering = (nIsBuffering === 1);
				if (_t._iO.onbufferchange) {
					_s._wD('SMSound._onbufferchange(): ' + nIsBuffering);
					_t._iO.onbufferchange.apply(_t);
				}

				return true;

			};

			/**
			 * Notify Mobile Safari that user action is required
			 * to continue playing / loading the audio file.
			 */

			this._onsuspend = function () {

				if (_t._iO.onsuspend) {
					_s._wD('SMSound._onsuspend()');
					_t._iO.onsuspend.apply(_t);
				}

				return true;

			};

			/**
			 * flash 9/movieStar + RTMP-only method, should fire only once at most
			 * at this point we just recreate failed sounds rather than trying to reconnect
			 */

			this._onfailure = function (msg, level, code) {

				_t.failures++;
				_s._wD('SMSound._onfailure(): "' + _t.sID + '" count ' + _t.failures);

				if (_t._iO.onfailure && _t.failures === 1) {
					_t._iO.onfailure(_t, msg, level, code);
				} else {
					_s._wD('SMSound._onfailure(): ignoring');
				}

			};

			this._onfinish = function () {

				// store local copy before it gets trashed..
				var _io_onfinish = _t._iO.onfinish;

				_t._onbufferchange(0);
				_t._resetOnPosition(0);

				// reset some state items
				if (_t.instanceCount) {

					_t.instanceCount--;

					if (!_t.instanceCount) {

						// remove onPosition listeners, if any
						_detachOnPosition();

						// reset instance options
						_t.playState = 0;
						_t.paused = false;
						_t.instanceCount = 0;
						_t.instanceOptions = {};
						_t._iO = {};
						_stop_html5_timer();

					}

					if (!_t.instanceCount || _t._iO.multiShotEvents) {
						// fire onfinish for last, or every instance
						if (_io_onfinish) {
							_s._wD('SMSound._onfinish(): "' + _t.sID + '"');
							_io_onfinish.apply(_t);
						}
					}

				}

			};

			this._whileloading = function (nBytesLoaded, nBytesTotal, nDuration, nBufferLength) {

				var _iO = _t._iO;

				_t.bytesLoaded = nBytesLoaded;
				_t.bytesTotal = nBytesTotal;
				_t.duration = Math.floor(nDuration);
				_t.bufferLength = nBufferLength;

				if (!_iO.isMovieStar) {

					if (_iO.duration) {
						// use options, if specified and larger
						_t.durationEstimate = (_t.duration > _iO.duration) ? _t.duration : _iO.duration;
					} else {
						_t.durationEstimate = parseInt((_t.bytesTotal / _t.bytesLoaded) * _t.duration, 10);

					}

					if (_t.durationEstimate === undefined) {
						_t.durationEstimate = _t.duration;
					}

					if (_t.readyState !== 3 && _iO.whileloading) {
						_iO.whileloading.apply(_t);
					}

				} else {

					_t.durationEstimate = _t.duration;
					if (_t.readyState !== 3 && _iO.whileloading) {
						_iO.whileloading.apply(_t);
					}

				}

			};

			this._whileplaying = function (nPosition, oPeakData, oWaveformDataLeft, oWaveformDataRight, oEQData) {

				var _iO = _t._iO,
					eqLeft;

				if (isNaN(nPosition) || nPosition === null) {
					// flash safety net
					return false;
				}

				_t.position = nPosition;
				_t._processOnPosition();

				if (!_t.isHTML5 && _fV > 8) {

					if (_iO.usePeakData && typeof oPeakData !== 'undefined' && oPeakData) {
						_t.peakData = {
							left: oPeakData.leftPeak,
							right:oPeakData.rightPeak
						};
					}

					if (_iO.useWaveformData && typeof oWaveformDataLeft !== 'undefined' && oWaveformDataLeft) {
						_t.waveformData = {
							left: oWaveformDataLeft.split(','),
							right:oWaveformDataRight.split(',')
						};
					}

					if (_iO.useEQData) {
						if (typeof oEQData !== 'undefined' && oEQData && oEQData.leftEQ) {
							eqLeft = oEQData.leftEQ.split(',');
							_t.eqData = eqLeft;
							_t.eqData.left = eqLeft;
							if (typeof oEQData.rightEQ !== 'undefined' && oEQData.rightEQ) {
								_t.eqData.right = oEQData.rightEQ.split(',');
							}
						}
					}

				}

				if (_t.playState === 1) {

					// special case/hack: ensure buffering is false if loading from cache (and not yet started)
					if (!_t.isHTML5 && _fV === 8 && !_t.position && _t.isBuffering) {
						_t._onbufferchange(0);
					}

					if (_iO.whileplaying) {
						// flash may call after actual finish
						_iO.whileplaying.apply(_t);
					}

				}

				return true;

			};

			this._oncaptiondata = function (oData) {

				/**
				 * internal: flash 9 + NetStream (MovieStar/RTMP-only) feature
				 *
				 * @param {object} oData
				 */

				_s._wD('SMSound._oncaptiondata(): "' + this.sID + '" caption data received.');

				_t.captiondata = oData;

				if (_t._iO.oncaptiondata) {
					_t._iO.oncaptiondata.apply(_t);
				}

			};

			this._onmetadata = function (oMDProps, oMDData) {

				/**
				 * internal: flash 9 + NetStream (MovieStar/RTMP-only) feature
				 * RTMP may include song title, MovieStar content may include encoding info
				 *
				 * @param {array} oMDProps (names)
				 * @param {array} oMDData (values)
				 */

				_s._wD('SMSound._onmetadata(): "' + this.sID + '" metadata received.');

				var oData = {}, i, j;

				for (i = 0, j = oMDProps.length; i < j; i++) {
					oData[oMDProps[i]] = oMDData[i];
				}
				_t.metadata = oData;

				if (_t._iO.onmetadata) {
					_t._iO.onmetadata.apply(_t);
				}

			};

			this._onid3 = function (oID3Props, oID3Data) {

				/**
				 * internal: flash 8 + flash 9 ID3 feature
				 * may include artist, song title etc.
				 *
				 * @param {array} oID3Props (names)
				 * @param {array} oID3Data (values)
				 */

				_s._wD('SMSound._onid3(): "' + this.sID + '" ID3 data received.');

				var oData = [], i, j;

				for (i = 0, j = oID3Props.length; i < j; i++) {
					oData[oID3Props[i]] = oID3Data[i];
				}
				_t.id3 = _mixin(_t.id3, oData);

				if (_t._iO.onid3) {
					_t._iO.onid3.apply(_t);
				}

			};

			// flash/RTMP-only

			this._onconnect = function (bSuccess) {

				bSuccess = (bSuccess === 1);
				_s._wD('SMSound._onconnect(): "' + _t.sID + '"' + (bSuccess ? ' connected.' : ' failed to connect? - ' + _t.url), (bSuccess ? 1 : 2));
				_t.connected = bSuccess;

				if (bSuccess) {

					_t.failures = 0;

					if (_idCheck(_t.sID)) {
						if (_t.getAutoPlay()) {
							// only update the play state if auto playing
							_t.play(undefined, _t.getAutoPlay());
						} else if (_t._iO.autoLoad) {
							_t.load();
						}
					}

					if (_t._iO.onconnect) {
						_t._iO.onconnect.apply(_t, [bSuccess]);
					}

				}

			};

			this._ondataerror = function (sError) {

				// flash 9 wave/eq data handler
				// hack: called at start, and end from flash at/after onfinish()
				if (_t.playState > 0) {
					_s._wD('SMSound._ondataerror(): ' + sError);
					if (_t._iO.ondataerror) {
						_t._iO.ondataerror.apply(_t);
					}
				}

			};

		}; // SMSound()

		/**
		 * Private SoundManager internals
		 * ------------------------------
		 */

		_getDocument = function () {

			return (_doc.body || _doc._docElement || _doc.getElementsByTagName('div')[0]);

		};

		_id = function (sID) {

			return _doc.getElementById(sID);

		};

		_mixin = function (oMain, oAdd) {

			// non-destructive merge
			var o1 = {}, i, o2, o;

			// clone c1
			for (i in oMain) {
				if (oMain.hasOwnProperty(i)) {
					o1[i] = oMain[i];
				}
			}

			o2 = (typeof oAdd === 'undefined' ? _s.defaultOptions : oAdd);
			for (o in o2) {
				if (o2.hasOwnProperty(o) && typeof o1[o] === 'undefined') {
					o1[o] = o2[o];
				}
			}
			return o1;

		};

		_event = (function () {

			var old = (_win.attachEvent),
				evt = {
					add:   (old ? 'attachEvent' : 'addEventListener'),
					remove:(old ? 'detachEvent' : 'removeEventListener')
				};

			function getArgs (oArgs) {

				var args = _slice.call(oArgs), len = args.length;

				if (old) {
					// prefix
					args[1] = 'on' + args[1];
					if (len > 3) {
						// no capture
						args.pop();
					}
				} else if (len === 3) {
					args.push(false);
				}

				return args;

			}

			function apply (args, sType) {

				var element = args.shift(),
					method = [evt[sType]];

				if (old) {
					element[method](args[0], args[1]);
				} else {
					element[method].apply(element, args);
				}

			}

			function add () {

				apply(getArgs(arguments), 'add');

			}

			function remove () {

				apply(getArgs(arguments), 'remove');

			}

			return {
				'add':   add,
				'remove':remove
			};

		}());

		/**
		 * Internal HTML5 event handling
		 * -----------------------------
		 */

		function _html5_event (oFn) {

			// wrap html5 event handlers so we don't call them on destroyed sounds

			return function (e) {

				var t = this._t,
					result;

				if (!t || !t._a) {
					// <d>
					if (t && t.sID) {
						_s._wD(_h5 + 'ignoring ' + e.type + ': ' + t.sID);
					} else {
						_s._wD(_h5 + 'ignoring ' + e.type);
					}
					// </d>
					result = null;
				} else {
					result = oFn.call(this, e);
				}

				return result;

			};

		}

		_html5_events = {

			// HTML5 event-name-to-handler map

			abort:_html5_event(function () {

				_s._wD(_h5 + 'abort: ' + this._t.sID);

			}),

			// enough has loaded to play

			canplay:_html5_event(function () {

				var t = this._t,
					position1K;

				if (t._html5_canplay) {
					// this event has already fired. ignore.
					return true;
				}

				t._html5_canplay = true;
				_s._wD(_h5 + 'canplay: ' + t.sID + ', ' + t.url);
				t._onbufferchange(0);
				position1K = (!isNaN(t.position) ? t.position / 1000 : null);

				// set the position if position was set before the sound loaded
				if (t.position && this.currentTime !== position1K) {
					_s._wD(_h5 + 'canplay: setting position to ' + position1K);
					try {
						this.currentTime = position1K;
					} catch (ee) {
						_s._wD(_h5 + 'setting position failed: ' + ee.message, 2);
					}
				}

				// hack for HTML5 from/to case
				if (t._iO._oncanplay) {
					t._iO._oncanplay();
				}

			}),

			load:_html5_event(function () {

				var t = this._t;

				if (!t.loaded) {
					t._onbufferchange(0);
					// should be 1, and the same
					t._whileloading(t.bytesTotal, t.bytesTotal, t._get_html5_duration());
					t._onload(true);
				}

			}),

			// TODO: Reserved for potential use
			/*
			 emptied: _html5_event(function() {

			 _s._wD(_h5+'emptied: '+this._t.sID);

			 }),
			 */

			ended:_html5_event(function () {

				var t = this._t;

				_s._wD(_h5 + 'ended: ' + t.sID);
				t._onfinish();

			}),

			error:_html5_event(function () {

				_s._wD(_h5 + 'error: ' + this.error.code);
				// call load with error state?
				this._t._onload(false);

			}),

			loadeddata:_html5_event(function () {

				var t = this._t,
				// at least 1 byte, so math works
					bytesTotal = t.bytesTotal || 1;

				_s._wD(_h5 + 'loadeddata: ' + this._t.sID);

				// safari seems to nicely report progress events, eventually totalling 100%
				if (!t._loaded && !_isSafari) {
					t.duration = t._get_html5_duration();
					// fire whileloading() with 100% values
					t._whileloading(bytesTotal, bytesTotal, t._get_html5_duration());
					t._onload(true);
				}

			}),

			loadedmetadata:_html5_event(function () {

				_s._wD(_h5 + 'loadedmetadata: ' + this._t.sID);

			}),

			loadstart:_html5_event(function () {

				_s._wD(_h5 + 'loadstart: ' + this._t.sID);
				// assume buffering at first
				this._t._onbufferchange(1);

			}),

			play:_html5_event(function () {

				_s._wD(_h5 + 'play: ' + this._t.sID + ', ' + this._t.url);
				// once play starts, no buffering
				this._t._onbufferchange(0);

			}),

			playing:_html5_event(function () {

				_s._wD(_h5 + 'playing: ' + this._t.sID);

				// once play starts, no buffering
				this._t._onbufferchange(0);

			}),

			progress:_html5_event(function (e) {

				var t = this._t,
					i, j, str, buffered = 0,
					isProgress = (e.type === 'progress'),
					ranges = e.target.buffered,
				// firefox 3.6 implements e.loaded/total (bytes)
					loaded = (e.loaded || 0),
					total = (e.total || 1);

				if (t.loaded) {
					return false;
				}

				if (ranges && ranges.length) {

					// if loaded is 0, try TimeRanges implementation as % of load
					// https://developer.mozilla.org/en/DOM/TimeRanges

					for (i = ranges.length - 1; i >= 0; i--) {
						buffered = (ranges.end(i) - ranges.start(i));
					}

					// linear case, buffer sum; does not account for seeking and HTTP partials / byte ranges
					loaded = buffered / e.target.duration;

					// <d>
					if (isProgress && ranges.length > 1) {
						str = [];
						j = ranges.length;
						for (i = 0; i < j; i++) {
							str.push(e.target.buffered.start(i) + '-' + e.target.buffered.end(i));
						}
						_s._wD(_h5 + 'progress: timeRanges: ' + str.join(', '));
					}

					if (isProgress && !isNaN(loaded)) {
						_s._wD(_h5 + 'progress: ' + t.sID + ': ' + Math.floor(loaded * 100) + '% loaded');
					}
					// </d>

				}

				if (!isNaN(loaded)) {

					// if progress, likely not buffering
					t._onbufferchange(0);
					t._whileloading(loaded, total, t._get_html5_duration());
					if (loaded && total && loaded === total) {
						// in case "onload" doesn't fire (eg. gecko 1.9.2)
						_html5_events.load.call(this, e);
					}

				}

			}),

			ratechange:_html5_event(function () {

				_s._wD(_h5 + 'ratechange: ' + this._t.sID);

			}),

			suspend:_html5_event(function (e) {

				// download paused/stopped, may have finished (eg. onload)
				var t = this._t;

				_s._wD(_h5 + 'suspend: ' + t.sID);
				_html5_events.progress.call(this, e);
				t._onsuspend();

			}),

			stalled:_html5_event(function () {

				_s._wD(_h5 + 'stalled: ' + this._t.sID);

			}),

			timeupdate:_html5_event(function () {

				this._t._onTimer();

			}),

			waiting:_html5_event(function () {

				var t = this._t;

				// see also: seeking
				_s._wD(_h5 + 'waiting: ' + t.sID);

				// playback faster than download rate, etc.
				t._onbufferchange(1);

			})

		};

		_html5OK = function (iO) {

			// Use type, if specified. If HTML5-only mode, no other options, so just give 'er
			return (!iO.serverURL && (iO.type ? _html5CanPlay({type:iO.type}) : _html5CanPlay({url:iO.url}) || _s.html5Only));

		};

		_html5Unload = function (oAudio) {

			/**
			 * Internal method: Unload media, and cancel any current/pending network requests.
			 * Firefox can load an empty URL, which allegedly destroys the decoder and stops the download.
			 * https://developer.mozilla.org/En/Using_audio_and_video_in_Firefox#Stopping_the_download_of_media
			 * Other UA behaviour is unclear, so everyone else gets an about:blank-style URL.
			 */

			if (oAudio) {
				// Firefox likes '' for unload, most other UAs don't and fail to unload.
				oAudio.src = (_is_firefox ? '' : _emptyURL);
			}

		};

		_html5CanPlay = function (o) {

			/**
			 * Try to find MIME, test and return truthiness
			 * o = {
     *  url: '/path/to/an.mp3',
     *  type: 'audio/mp3'
     * }
			 */

			if (!_s.useHTML5Audio || !_s.hasHTML5) {
				return false;
			}

			var url = (o.url || null),
				mime = (o.type || null),
				aF = _s.audioFormats,
				result,
				offset,
				fileExt,
				item;

			function preferFlashCheck (kind) {

				// whether flash should play a given type
				return (_s.preferFlash && _hasFlash && !_s.ignoreFlash && (typeof _s.flash[kind] !== 'undefined' && _s.flash[kind]));

			}

			// account for known cases like audio/mp3

			if (mime && typeof _s.html5[mime] !== 'undefined') {
				return (_s.html5[mime] && !preferFlashCheck(mime));
			}

			if (!_html5Ext) {
				_html5Ext = [];
				for (item in aF) {
					if (aF.hasOwnProperty(item)) {
						_html5Ext.push(item);
						if (aF[item].related) {
							_html5Ext = _html5Ext.concat(aF[item].related);
						}
					}
				}
				_html5Ext = new RegExp('\\.(' + _html5Ext.join('|') + ')(\\?.*)?$', 'i');
			}

			// TODO: Strip URL queries, etc.
			fileExt = (url ? url.toLowerCase().match(_html5Ext) : null);

			if (!fileExt || !fileExt.length) {
				if (!mime) {
					result = false;
				} else {
					// audio/mp3 -> mp3, result should be known
					offset = mime.indexOf(';');
					// strip "audio/X; codecs.."
					fileExt = (offset !== -1 ? mime.substr(0, offset) : mime).substr(6);
				}
			} else {
				// match the raw extension name - "mp3", for example
				fileExt = fileExt[1];
			}

			if (fileExt && typeof _s.html5[fileExt] !== 'undefined') {
				// result known
				result = (_s.html5[fileExt] && !preferFlashCheck(fileExt));
			} else {
				mime = 'audio/' + fileExt;
				result = _s.html5.canPlayType({type:mime});
				_s.html5[fileExt] = result;
				// _s._wD('canPlayType, found result: '+result);
				result = (result && _s.html5[mime] && !preferFlashCheck(mime));
			}

			return result;

		};

		_testHTML5 = function () {

			if (!_s.useHTML5Audio || typeof Audio === 'undefined') {
				return false;
			}

			// double-whammy: Opera 9.64 throws WRONG_ARGUMENTS_ERR if no parameter passed to Audio(), and Webkit + iOS happily tries to load "null" as a URL. :/
			var a = (typeof Audio !== 'undefined' ? (_isOpera ? new Audio(null) : new Audio()) : null),
				item, support = {}, aF, i;

			function _cp (m) {

				var canPlay, i, j,
					result = false,
					isOK = false;

				if (!a || typeof a.canPlayType !== 'function') {
					return result;
				}

				if (m instanceof Array) {
					// iterate through all mime types, return any successes
					for (i = 0, j = m.length; i < j && !isOK; i++) {
						if (_s.html5[m[i]] || a.canPlayType(m[i]).match(_s.html5Test)) {
							isOK = true;
							_s.html5[m[i]] = true;
							// if flash can play and preferred, also mark it for use.
							_s.flash[m[i]] = !!(_s.preferFlash && _hasFlash && m[i].match(_flashMIME));
						}
					}
					result = isOK;
				} else {
					canPlay = (a && typeof a.canPlayType === 'function' ? a.canPlayType(m) : false);
					result = !!(canPlay && (canPlay.match(_s.html5Test)));
				}

				return result;

			}

			// test all registered formats + codecs

			aF = _s.audioFormats;

			for (item in aF) {
				if (aF.hasOwnProperty(item)) {
					support[item] = _cp(aF[item].type);

					// write back generic type too, eg. audio/mp3
					support['audio/' + item] = support[item];

					// assign flash
					if (_s.preferFlash && !_s.ignoreFlash && item.match(_flashMIME)) {
						_s.flash[item] = true;
					} else {
						_s.flash[item] = false;
					}

					// assign result to related formats, too
					if (aF[item] && aF[item].related) {
						for (i = aF[item].related.length - 1; i >= 0; i--) {
							// eg. audio/m4a
							support['audio/' + aF[item].related[i]] = support[item];
							_s.html5[aF[item].related[i]] = support[item];
							_s.flash[aF[item].related[i]] = support[item];
						}
					}
				}
			}

			support.canPlayType = (a ? _cp : null);
			_s.html5 = _mixin(_s.html5, support);

			return true;

		};

		_strings = {

			// <d>
			notReady:     'Not loaded yet - wait for soundManager.onload()/onready()',
			notOK:        'Audio support is not available.',
			domError:     _smc + 'createMovie(): appendChild/innerHTML call failed. DOM not ready or other error.',
			spcWmode:     _smc + 'createMovie(): Removing wmode, preventing known SWF loading issue(s)',
			swf404:       _sm + ': Verify that %s is a valid path.',
			tryDebug:     'Try ' + _sm + '.debugFlash = true for more security details (output goes to SWF.)',
			checkSWF:     'See SWF output for more debug info.',
			localFail:    _sm + ': Non-HTTP page (' + _doc.location.protocol + ' URL?) Review Flash player security settings for this special case:\nhttp://www.macromedia.com/support/documentation/en/flashplayer/help/settings_manager04.html\nMay need to add/allow path, eg. c:/sm2/ or /users/me/sm2/',
			waitFocus:    _sm + ': Special case: Waiting for focus-related event..',
			waitImpatient:_sm + ': Getting impatient, still waiting for Flash%s...',
			waitForever:  _sm + ': Waiting indefinitely for Flash (will recover if unblocked)...',
			needFunction: _sm + ': Function object expected for %s',
			badID:        'Warning: Sound ID "%s" should be a string, starting with a non-numeric character',
			currentObj:   '--- ' + _sm + '._debug(): Current sound objects ---',
			waitEI:       _smc + 'initMovie(): Waiting for ExternalInterface call from Flash..',
			waitOnload:   _sm + ': Waiting for window.onload()',
			docLoaded:    _sm + ': Document already loaded',
			onload:       _smc + 'initComplete(): calling soundManager.onload()',
			onloadOK:     _sm + '.onload() complete',
			init:         _smc + 'init()',
			didInit:      _smc + 'init(): Already called?',
			flashJS:      _sm + ': Attempting to call Flash from JS..',
			secNote:      'Flash security note: Network/internet URLs will not load due to security restrictions. Access can be configured via Flash Player Global Security Settings Page: http://www.macromedia.com/support/documentation/en/flashplayer/help/settings_manager04.html',
			badRemove:    'Warning: Failed to remove flash movie.',
			shutdown:     _sm + '.disable(): Shutting down',
			queue:        _sm + ': Queueing %s handler',
			smFail:       _sm + ': Failed to initialise.',
			smError:      'SMSound.load(): Exception: JS-Flash communication failed, or JS error.',
			fbTimeout:    'No flash response, applying .' + _swfCSS.swfTimedout + ' CSS..',
			fbLoaded:     'Flash loaded',
			fbHandler:    _smc + 'flashBlockHandler()',
			manURL:       'SMSound.load(): Using manually-assigned URL',
			onURL:        _sm + '.load(): current URL already assigned.',
			badFV:        _sm + '.flashVersion must be 8 or 9. "%s" is invalid. Reverting to %s.',
			as2loop:      'Note: Setting stream:false so looping can work (flash 8 limitation)',
			noNSLoop:     'Note: Looping not implemented for MovieStar formats',
			needfl9:      'Note: Switching to flash 9, required for MP4 formats.',
			mfTimeout:    'Setting flashLoadTimeout = 0 (infinite) for off-screen, mobile flash case',
			mfOn:         'mobileFlash::enabling on-screen flash repositioning',
			policy:       'Enabling usePolicyFile for data access'
			// </d>

		};

		_str = function () {

			// internal string replace helper.
			// arguments: o [,items to replace]
			// <d>

			// real array, please
			var args = _slice.call(arguments),

			// first arg
				o = args.shift(),

				str = (_strings && _strings[o] ? _strings[o] : ''), i, j;
			if (str && args && args.length) {
				for (i = 0, j = args.length; i < j; i++) {
					str = str.replace('%s', args[i]);
				}
			}

			return str;
			// </d>

		};

		_loopFix = function (sOpt) {

			// flash 8 requires stream = false for looping to work
			if (_fV === 8 && sOpt.loops > 1 && sOpt.stream) {
				_wDS('as2loop');
				sOpt.stream = false;
			}

			return sOpt;

		};

		_policyFix = function (sOpt, sPre) {

			if (sOpt && !sOpt.usePolicyFile && (sOpt.onid3 || sOpt.usePeakData || sOpt.useWaveformData || sOpt.useEQData)) {
				_s._wD((sPre || '') + _str('policy'));
				sOpt.usePolicyFile = true;
			}

			return sOpt;

		};

		_complain = function (sMsg) {

			// <d>
			if (typeof console !== 'undefined' && typeof console.warn !== 'undefined') {
				console.warn(sMsg);
			} else {
				_s._wD(sMsg);
			}
			// </d>

		};

		_doNothing = function () {

			return false;

		};

		_disableObject = function (o) {

			var oProp;

			for (oProp in o) {
				if (o.hasOwnProperty(oProp) && typeof o[oProp] === 'function') {
					o[oProp] = _doNothing;
				}
			}

			oProp = null;

		};

		_failSafely = function (bNoDisable) {

			// general failure exception handler

			if (typeof bNoDisable === 'undefined') {
				bNoDisable = false;
			}

			if (_disabled || bNoDisable) {
				_wDS('smFail', 2);
				_s.disable(bNoDisable);
			}

		};

		_normalizeMovieURL = function (smURL) {

			var urlParams = null, url;

			if (smURL) {
				if (smURL.match(/\.swf(\?.*)?$/i)) {
					urlParams = smURL.substr(smURL.toLowerCase().lastIndexOf('.swf?') + 4);
					if (urlParams) {
						// assume user knows what they're doing
						return smURL;
					}
				} else if (smURL.lastIndexOf('/') !== smURL.length - 1) {
					// append trailing slash, if needed
					smURL += '/';
				}
			}

			url = (smURL && smURL.lastIndexOf('/') !== -1 ? smURL.substr(0, smURL.lastIndexOf('/') + 1) : './') + _s.movieURL;

			if (_s.noSWFCache) {
				url += ('?ts=' + new Date().getTime());
			}

			return url;

		};

		_setVersionInfo = function () {

			// short-hand for internal use

			_fV = parseInt(_s.flashVersion, 10);

			if (_fV !== 8 && _fV !== 9) {
				_s._wD(_str('badFV', _fV, _defaultFlashVersion));
				_s.flashVersion = _fV = _defaultFlashVersion;
			}

			// debug flash movie, if applicable

			var isDebug = (_s.debugMode || _s.debugFlash ? '_debug.swf' : '.swf');

			if (_s.useHTML5Audio && !_s.html5Only && _s.audioFormats.mp4.required && _fV < 9) {
				_s._wD(_str('needfl9'));
				_s.flashVersion = _fV = 9;
			}

			_s.version = _s.versionNumber + (_s.html5Only ? ' (HTML5-only mode)' : (_fV === 9 ? ' (AS3/Flash 9)' : ' (AS2/Flash 8)'));

			// set up default options
			if (_fV > 8) {
				// +flash 9 base options
				_s.defaultOptions = _mixin(_s.defaultOptions, _s.flash9Options);
				_s.features.buffering = true;
				// +moviestar support
				_s.defaultOptions = _mixin(_s.defaultOptions, _s.movieStarOptions);
				_s.filePatterns.flash9 = new RegExp('\\.(mp3|' + _netStreamTypes.join('|') + ')(\\?.*)?$', 'i');
				_s.features.movieStar = true;
			} else {
				_s.features.movieStar = false;
			}

			// regExp for flash canPlay(), etc.
			_s.filePattern = _s.filePatterns[(_fV !== 8 ? 'flash9' : 'flash8')];

			// if applicable, use _debug versions of SWFs
			_s.movieURL = (_fV === 8 ? 'soundmanager2.swf' : 'soundmanager2_flash9.swf').replace('.swf', isDebug);

			_s.features.peakData = _s.features.waveformData = _s.features.eqData = (_fV > 8);

		};

		_setPolling = function (bPolling, bHighPerformance) {

			if (!_flash) {
				return false;
			}

			_flash._setPolling(bPolling, bHighPerformance);

		};

		_initDebug = function () {

			// starts debug mode, creating output <div> for UAs without console object

			// allow force of debug mode via URL
			if (_s.debugURLParam.test(_wl)) {
				_s.debugMode = true;
			}

			// <d>
			if (_id(_s.debugID)) {
				return false;
			}

			var oD, oDebug, oTarget, oToggle, tmp;

			if (_s.debugMode && !_id(_s.debugID) && (!_hasConsole || !_s.useConsole || !_s.consoleOnly)) {

				oD = _doc.createElement('div');
				oD.id = _s.debugID + '-toggle';

				oToggle = {
					'position':  'fixed',
					'bottom':    '0px',
					'right':     '0px',
					'width':     '1.2em',
					'height':    '1.2em',
					'lineHeight':'1.2em',
					'margin':    '2px',
					'textAlign': 'center',
					'border':    '1px solid #999',
					'cursor':    'pointer',
					'background':'#fff',
					'color':     '#333',
					'zIndex':    10001
				};

				oD.appendChild(_doc.createTextNode('-'));
				oD.onclick = _toggleDebug;
				oD.title = 'Toggle SM2 debug console';

				if (_ua.match(/msie 6/i)) {
					oD.style.position = 'absolute';
					oD.style.cursor = 'hand';
				}

				for (tmp in oToggle) {
					if (oToggle.hasOwnProperty(tmp)) {
						oD.style[tmp] = oToggle[tmp];
					}
				}

				oDebug = _doc.createElement('div');
				oDebug.id = _s.debugID;
				oDebug.style.display = (_s.debugMode ? 'block' : 'none');

				if (_s.debugMode && !_id(oD.id)) {
					try {
						oTarget = _getDocument();
						oTarget.appendChild(oD);
					} catch (e2) {
						throw new Error(_str('domError') + ' \n' + e2.toString());
					}
					oTarget.appendChild(oDebug);
				}

			}

			oTarget = null;
			// </d>

		};

		_idCheck = this.getSoundById;

		// <d>
		_wDS = function (o, errorLevel) {

			return (!o ? '' : _s._wD(_str(o), errorLevel));

		};

		// last-resort debugging option

		if (_wl.indexOf('sm2-debug=alert') + 1 && _s.debugMode) {
			_s._wD = function (sText) {
				window.alert(sText);
			};
		}

		_toggleDebug = function () {

			var o = _id(_s.debugID),
				oT = _id(_s.debugID + '-toggle');

			if (!o) {
				return false;
			}

			if (_debugOpen) {
				// minimize
				oT.innerHTML = '+';
				o.style.display = 'none';
			} else {
				oT.innerHTML = '-';
				o.style.display = 'block';
			}

			_debugOpen = !_debugOpen;

		};

		_debugTS = function (sEventType, bSuccess, sMessage) {

			// troubleshooter debug hooks

			if (typeof sm2Debugger !== 'undefined') {
				try {
					sm2Debugger.handleEvent(sEventType, bSuccess, sMessage);
				} catch (e) {
					// oh well
				}
			}

			return true;

		};
		// </d>

		_getSWFCSS = function () {

			var css = [];

			if (_s.debugMode) {
				css.push(_swfCSS.sm2Debug);
			}

			if (_s.debugFlash) {
				css.push(_swfCSS.flashDebug);
			}

			if (_s.useHighPerformance) {
				css.push(_swfCSS.highPerf);
			}

			return css.join(' ');

		};

		_flashBlockHandler = function () {

			// *possible* flash block situation.

			var name = _str('fbHandler'),
				p = _s.getMoviePercent(),
				css = _swfCSS,
				error = {type:'FLASHBLOCK'};

			if (_s.html5Only) {
				return false;
			}

			if (!_s.ok()) {

				if (_needsFlash) {
					// make the movie more visible, so user can fix
					_s.oMC.className = _getSWFCSS() + ' ' + css.swfDefault + ' ' + (p === null ? css.swfTimedout : css.swfError);
					_s._wD(name + ': ' + _str('fbTimeout') + (p ? ' (' + _str('fbLoaded') + ')' : ''));
				}

				_s.didFlashBlock = true;

				// fire onready(), complain lightly
				_processOnEvents({type:'ontimeout', ignoreInit:true, error:error});
				_catchError(error);

			} else {

				// SM2 loaded OK (or recovered)

				// <d>
				if (_s.didFlashBlock) {
					_s._wD(name + ': Unblocked');
				}
				// </d>

				if (_s.oMC) {
					_s.oMC.className = [_getSWFCSS(), css.swfDefault, css.swfLoaded + (_s.didFlashBlock ? ' ' + css.swfUnblocked : '')].join(' ');
				}

			}

		};

		_addOnEvent = function (sType, oMethod, oScope) {

			if (typeof _on_queue[sType] === 'undefined') {
				_on_queue[sType] = [];
			}

			_on_queue[sType].push({
				'method':oMethod,
				'scope': (oScope || null),
				'fired': false
			});

		};

		_processOnEvents = function (oOptions) {

			// if unspecified, assume OK/error

			if (!oOptions) {
				oOptions = {
					type:(_s.ok() ? 'onready' : 'ontimeout')
				};
			}

			if (!_didInit && oOptions && !oOptions.ignoreInit) {
				// not ready yet.
				return false;
			}

			if (oOptions.type === 'ontimeout' && (_s.ok() || (_disabled && !oOptions.ignoreInit))) {
				// invalid case
				return false;
			}

			var status = {
					success:(oOptions && oOptions.ignoreInit ? _s.ok() : !_disabled)
				},

			// queue specified by type, or none
				srcQueue = (oOptions && oOptions.type ? _on_queue[oOptions.type] || [] : []),

				queue = [], i, j,
				args = [status],
				canRetry = (_needsFlash && _s.useFlashBlock && !_s.ok());

			if (oOptions.error) {
				args[0].error = oOptions.error;
			}

			for (i = 0, j = srcQueue.length; i < j; i++) {
				if (srcQueue[i].fired !== true) {
					queue.push(srcQueue[i]);
				}
			}

			if (queue.length) {
				_s._wD(_sm + ': Firing ' + queue.length + ' ' + oOptions.type + '() item' + (queue.length === 1 ? '' : 's'));
				for (i = 0, j = queue.length; i < j; i++) {
					if (queue[i].scope) {
						queue[i].method.apply(queue[i].scope, args);
					} else {
						queue[i].method.apply(this, args);
					}
					if (!canRetry) {
						// flashblock case doesn't count here
						queue[i].fired = true;
					}
				}
			}

			return true;

		};

		_initUserOnload = function () {

			_win.setTimeout(function () {

				if (_s.useFlashBlock) {
					_flashBlockHandler();
				}

				_processOnEvents();

				// call user-defined "onload", scoped to window

				if (_s.onload instanceof Function) {
					_wDS('onload', 1);
					_s.onload.apply(_win);
					_wDS('onloadOK', 1);
				}

				if (_s.waitForWindowLoad) {
					_event.add(_win, 'load', _initUserOnload);
				}

			}, 1);

		};

		_detectFlash = function () {

			// hat tip: Flash Detect library (BSD, (C) 2007) by Carl "DocYes" S. Yestrau - http://featureblend.com/javascript-flash-detection-library.html / http://featureblend.com/license.txt

			if (_hasFlash !== undefined) {
				// this work has already been done.
				return _hasFlash;
			}

			var hasPlugin = false, n = navigator, nP = n.plugins, obj, type, types, AX = _win.ActiveXObject;

			if (nP && nP.length) {
				type = 'application/x-shockwave-flash';
				types = n.mimeTypes;
				if (types && types[type] && types[type].enabledPlugin && types[type].enabledPlugin.description) {
					hasPlugin = true;
				}
			} else if (typeof AX !== 'undefined') {
				try {
					obj = new AX('ShockwaveFlash.ShockwaveFlash');
				} catch (e) {
					// oh well
				}
				hasPlugin = (!!obj);
			}

			_hasFlash = hasPlugin;

			return hasPlugin;

		};

		_featureCheck = function () {

			var needsFlash,
				item,
				result = true,
			// iPhone <= 3.1 has broken HTML5 audio(), but firmware 3.2 (original iPad) + iOS4 works.
				isSpecial = (_is_iDevice && !!(_ua.match(/os (1|2|3_0|3_1)/i)));

			if (isSpecial) {

				// has Audio(), but is broken; let it load links directly.
				_s.hasHTML5 = false;

				// ignore flash case, however
				_s.html5Only = true;

				if (_s.oMC) {
					_s.oMC.style.display = 'none';
				}

				result = false;

			} else {

				if (_s.useHTML5Audio) {

					if (!_s.html5 || !_s.html5.canPlayType) {
						_s._wD('SoundManager: No HTML5 Audio() support detected.');
						_s.hasHTML5 = false;
					} else {
						_s.hasHTML5 = true;
					}

					// <d>
					if (_isBadSafari) {
						_s._wD(_smc + 'Note: Buggy HTML5 Audio in Safari on this OS X release, see https://bugs.webkit.org/show_bug.cgi?id=32159 - ' + (!_hasFlash ? ' would use flash fallback for MP3/MP4, but none detected.' : 'will use flash fallback for MP3/MP4, if available'), 1);
					}
					// </d>

				}

			}

			if (_s.useHTML5Audio && _s.hasHTML5) {

				for (item in _s.audioFormats) {
					if (_s.audioFormats.hasOwnProperty(item)) {
						if ((_s.audioFormats[item].required && !_s.html5.canPlayType(_s.audioFormats[item].type)) || _s.flash[item] || _s.flash[_s.audioFormats[item].type]) {
							// flash may be required, or preferred for this format
							needsFlash = true;
						}
					}
				}

			}

			// sanity check..
			if (_s.ignoreFlash) {
				needsFlash = false;
			}

			_s.html5Only = (_s.hasHTML5 && _s.useHTML5Audio && !needsFlash);

			return (!_s.html5Only);

		};

		_parseURL = function (url) {

			/**
			 * Internal: Finds and returns the first playable URL (or failing that, the first URL.)
			 * @param {string or array} url A single URL string, OR, an array of URL strings or {url:'/path/to/resource', type:'audio/mp3'} objects.
			 */

			var i, j, urlResult = 0, result;

			if (url instanceof Array) {

				// find the first good one
				for (i = 0, j = url.length; i < j; i++) {

					if (url[i] instanceof Object) {
						// MIME check
						if (_s.canPlayMIME(url[i].type)) {
							urlResult = i;
							break;
						}

					} else if (_s.canPlayURL(url[i])) {
						// URL string check
						urlResult = i;
						break;
					}

				}

				// normalize to string
				if (url[urlResult].url) {
					url[urlResult] = url[urlResult].url;
				}

				result = url[urlResult];

			} else {

				// single URL case
				result = url;

			}

			return result;

		};


		_startTimer = function (oSound) {

			/**
			 * attach a timer to this sound, and start an interval if needed
			 */

			if (!oSound._hasTimer) {

				oSound._hasTimer = true;

				if (!_mobileHTML5 && _s.html5PollingInterval) {

					if (_h5IntervalTimer === null && _h5TimerCount === 0) {

						_h5IntervalTimer = window.setInterval(_timerExecute, _s.html5PollingInterval);

					}

					_h5TimerCount++;

				}

			}

		};

		_stopTimer = function (oSound) {

			/**
			 * detach a timer
			 */

			if (oSound._hasTimer) {

				oSound._hasTimer = false;

				if (!_mobileHTML5 && _s.html5PollingInterval) {

					// interval will stop itself at next execution.

					_h5TimerCount--;

				}

			}

		};

		_timerExecute = function () {

			/**
			 * manual polling for HTML5 progress events, ie., whileplaying() (can achieve greater precision than conservative default HTML5 interval)
			 */

			var i;

			if (_h5IntervalTimer !== null && !_h5TimerCount) {

				// no active timers, stop polling interval.

				window.clearInterval(_h5IntervalTimer);

				_h5IntervalTimer = null;

				return false;

			}

			// check all HTML5 sounds with timers

			for (i = _s.soundIDs.length - 1; i >= 0; i--) {

				if (_s.sounds[_s.soundIDs[i]].isHTML5 && _s.sounds[_s.soundIDs[i]]._hasTimer) {

					_s.sounds[_s.soundIDs[i]]._onTimer();

				}

			}

		};

		_catchError = function (options) {

			options = (typeof options !== 'undefined' ? options : {});

			if (_s.onerror instanceof Function) {
				_s.onerror.apply(_win, [
					{type:(typeof options.type !== 'undefined' ? options.type : null)}
				]);
			}

			if (typeof options.fatal !== 'undefined' && options.fatal) {
				_s.disable();
			}

		};

		_badSafariFix = function () {

			// special case: "bad" Safari (OS X 10.3 - 10.7) must fall back to flash for MP3/MP4
			if (!_isBadSafari || !_detectFlash()) {
				// doesn't apply
				return false;
			}

			var aF = _s.audioFormats, i, item;

			for (item in aF) {
				if (aF.hasOwnProperty(item)) {
					if (item === 'mp3' || item === 'mp4') {
						_s._wD(_sm + ': Using flash fallback for ' + item + ' format');
						_s.html5[item] = false;
						// assign result to related formats, too
						if (aF[item] && aF[item].related) {
							for (i = aF[item].related.length - 1; i >= 0; i--) {
								_s.html5[aF[item].related[i]] = false;
							}
						}
					}
				}
			}

		};

		/**
		 * Pseudo-private flash/ExternalInterface methods
		 * ----------------------------------------------
		 */

		this._setSandboxType = function (sandboxType) {

			// <d>
			var sb = _s.sandbox;

			sb.type = sandboxType;
			sb.description = sb.types[(typeof sb.types[sandboxType] !== 'undefined' ? sandboxType : 'unknown')];

			_s._wD('Flash security sandbox type: ' + sb.type);

			if (sb.type === 'localWithFile') {

				sb.noRemote = true;
				sb.noLocal = false;
				_wDS('secNote', 2);

			} else if (sb.type === 'localWithNetwork') {

				sb.noRemote = false;
				sb.noLocal = true;

			} else if (sb.type === 'localTrusted') {

				sb.noRemote = false;
				sb.noLocal = false;

			}
			// </d>

		};

		this._externalInterfaceOK = function (flashDate, swfVersion) {

			// flash callback confirming flash loaded, EI working etc.
			// flashDate = approx. timing/delay info for JS/flash bridge
			// swfVersion: SWF build string

			if (_s.swfLoaded) {
				return false;
			}

			var e, eiTime = new Date().getTime();

			_s._wD(_smc + 'externalInterfaceOK()' + (flashDate ? ' (~' + (eiTime - flashDate) + ' ms)' : ''));
			_debugTS('swf', true);
			_debugTS('flashtojs', true);
			_s.swfLoaded = true;
			_tryInitOnFocus = false;

			if (_isBadSafari) {
				_badSafariFix();
			}

			// complain if JS + SWF build/version strings don't match, excluding +DEV builds
			// <d>
			if (!swfVersion || swfVersion.replace(/\+dev/i, '') !== _s.versionNumber.replace(/\+dev/i, '')) {

				e = _sm + ': Fatal: JavaScript file build "' + _s.versionNumber + '" does not match Flash SWF build "' + swfVersion + '" at ' + _s.url + '. Ensure both are up-to-date.';

				// escape flash -> JS stack so this error fires in window.
				setTimeout(function versionMismatch () {
					throw new Error(e);
				}, 0);

				// exit, init will fail with timeout
				return false;

			}
			// </d>

			if (_isIE) {
				// IE needs a timeout OR delay until window.onload - may need TODO: investigating
				setTimeout(_init, 100);
			} else {
				_init();
			}

		};

		/**
		 * Private initialization helpers
		 * ------------------------------
		 */

		_createMovie = function (smID, smURL) {

			if (_didAppend && _appendSuccess) {
				// ignore if already succeeded
				return false;
			}

			function _initMsg () {
				_s._wD('-- SoundManager 2 ' + _s.version + (!_s.html5Only && _s.useHTML5Audio ? (_s.hasHTML5 ? ' + HTML5 audio' : ', no HTML5 audio support') : '') + (!_s.html5Only ? (_s.useHighPerformance ? ', high performance mode, ' : ', ') + (( _s.flashPollingInterval ? 'custom (' + _s.flashPollingInterval + 'ms)' : 'normal') + ' polling') + (_s.wmode ? ', wmode: ' + _s.wmode : '') + (_s.debugFlash ? ', flash debug mode' : '') + (_s.useFlashBlock ? ', flashBlock mode' : '') : '') + ' --', 1);
			}

			if (_s.html5Only) {

				// 100% HTML5 mode
				_setVersionInfo();

				_initMsg();
				_s.oMC = _id(_s.movieID);
				_init();

				// prevent multiple init attempts
				_didAppend = true;

				_appendSuccess = true;

				return false;

			}

			// flash path
			var remoteURL = (smURL || _s.url),
				localURL = (_s.altURL || remoteURL),
				swfTitle = 'JS/Flash audio component (SoundManager 2)',
				oEmbed, oMovie, oTarget = _getDocument(), tmp, movieHTML, oEl, extraClass = _getSWFCSS(),
				s, x, sClass, isRTL = null,
				html = _doc.getElementsByTagName('html')[0];

			isRTL = (html && html.dir && html.dir.match(/rtl/i));
			smID = (typeof smID === 'undefined' ? _s.id : smID);

			function param (name, value) {
				return '<param name="' + name + '" value="' + value + '" />';
			}

			// safety check for legacy (change to Flash 9 URL)
			_setVersionInfo();
			_s.url = _normalizeMovieURL(_overHTTP ? remoteURL : localURL);
			smURL = _s.url;

			_s.wmode = (!_s.wmode && _s.useHighPerformance ? 'transparent' : _s.wmode);

			if (_s.wmode !== null && (_ua.match(/msie 8/i) || (!_isIE && !_s.useHighPerformance)) && navigator.platform.match(/win32|win64/i)) {
				/**
				 * extra-special case: movie doesn't load until scrolled into view when using wmode = anything but 'window' here
				 * does not apply when using high performance (position:fixed means on-screen), OR infinite flash load timeout
				 * wmode breaks IE 8 on Vista + Win7 too in some cases, as of January 2011 (?)
				 */
				_wDS('spcWmode');
				_s.wmode = null;
			}

			oEmbed = {
				'name':             smID,
				'id':               smID,
				'src':              smURL,
				'quality':          'high',
				'allowScriptAccess':_s.allowScriptAccess,
				'bgcolor':          _s.bgColor,
				'pluginspage':      _http + 'www.macromedia.com/go/getflashplayer',
				'title':            swfTitle,
				'type':             'application/x-shockwave-flash',
				'wmode':            _s.wmode,
				// http://help.adobe.com/en_US/as3/mobile/WS4bebcd66a74275c36cfb8137124318eebc6-7ffd.html
				'hasPriority':      'true'
			};

			if (_s.debugFlash) {
				oEmbed.FlashVars = 'debug=1';
			}

			if (!_s.wmode) {
				// don't write empty attribute
				delete oEmbed.wmode;
			}

			if (_isIE) {

				// IE is "special".
				oMovie = _doc.createElement('div');
				movieHTML = [
					'<object id="' + smID + '" data="' + smURL + '" type="' + oEmbed.type + '" title="' + oEmbed.title + '" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="' + _http + 'download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,40,0">',
					param('movie', smURL),
					param('AllowScriptAccess', _s.allowScriptAccess),
					param('quality', oEmbed.quality),
					(_s.wmode ? param('wmode', _s.wmode) : ''),
					param('bgcolor', _s.bgColor),
					param('hasPriority', 'true'),
					(_s.debugFlash ? param('FlashVars', oEmbed.FlashVars) : ''),
					'</object>'
				].join('');

			} else {

				oMovie = _doc.createElement('embed');
				for (tmp in oEmbed) {
					if (oEmbed.hasOwnProperty(tmp)) {
						oMovie.setAttribute(tmp, oEmbed[tmp]);
					}
				}

			}

			_initDebug();
			extraClass = _getSWFCSS();
			oTarget = _getDocument();

			if (oTarget) {

				_s.oMC = (_id(_s.movieID) || _doc.createElement('div'));

				if (!_s.oMC.id) {

					_s.oMC.id = _s.movieID;
					_s.oMC.className = _swfCSS.swfDefault + ' ' + extraClass;
					s = null;
					oEl = null;

					if (!_s.useFlashBlock) {
						if (_s.useHighPerformance) {
							// on-screen at all times
							s = {
								'position':'fixed',
								'width':   '8px',
								'height':  '8px',
								// >= 6px for flash to run fast, >= 8px to start up under Firefox/win32 in some cases. odd? yes.
								'bottom':  '0px',
								'left':    '0px',
								'overflow':'hidden'
							};
						} else {
							// hide off-screen, lower priority
							s = {
								'position':'absolute',
								'width':   '6px',
								'height':  '6px',
								'top':     '-9999px',
								'left':    '-9999px'
							};
							if (isRTL) {
								s.left = Math.abs(parseInt(s.left, 10)) + 'px';
							}
						}
					}

					if (_isWebkit) {
						// soundcloud-reported render/crash fix, safari 5
						_s.oMC.style.zIndex = 10000;
					}

					if (!_s.debugFlash) {
						for (x in s) {
							if (s.hasOwnProperty(x)) {
								_s.oMC.style[x] = s[x];
							}
						}
					}

					try {
						if (!_isIE) {
							_s.oMC.appendChild(oMovie);
						}
						oTarget.appendChild(_s.oMC);
						if (_isIE) {
							oEl = _s.oMC.appendChild(_doc.createElement('div'));
							oEl.className = _swfCSS.swfBox;
							oEl.innerHTML = movieHTML;
						}
						_appendSuccess = true;
					} catch (e) {
						throw new Error(_str('domError') + ' \n' + e.toString());
					}

				} else {

					// SM2 container is already in the document (eg. flashblock use case)
					sClass = _s.oMC.className;
					_s.oMC.className = (sClass ? sClass + ' ' : _swfCSS.swfDefault) + (extraClass ? ' ' + extraClass : '');
					_s.oMC.appendChild(oMovie);
					if (_isIE) {
						oEl = _s.oMC.appendChild(_doc.createElement('div'));
						oEl.className = _swfCSS.swfBox;
						oEl.innerHTML = movieHTML;
					}
					_appendSuccess = true;

				}

			}

			_didAppend = true;
			_initMsg();
			_s._wD(_smc + 'createMovie(): Trying to load ' + smURL + (!_overHTTP && _s.altURL ? ' (alternate URL)' : ''), 1);

			return true;

		};

		_initMovie = function () {

			if (_s.html5Only) {
				_createMovie();
				return false;
			}

			// attempt to get, or create, movie
			// may already exist
			if (_flash) {
				return false;
			}

			// inline markup case
			_flash = _s.getMovie(_s.id);

			if (!_flash) {
				if (!_oRemoved) {
					// try to create
					_createMovie(_s.id, _s.url);
				} else {
					// try to re-append removed movie after reboot()
					if (!_isIE) {
						_s.oMC.appendChild(_oRemoved);
					} else {
						_s.oMC.innerHTML = _oRemovedHTML;
					}
					_oRemoved = null;
					_didAppend = true;
				}
				_flash = _s.getMovie(_s.id);
			}

			// <d>
			if (_flash) {
				_wDS('waitEI');
			}
			// </d>

			if (_s.oninitmovie instanceof Function) {
				setTimeout(_s.oninitmovie, 1);
			}

			return true;

		};

		_delayWaitForEI = function () {

			setTimeout(_waitForEI, 1000);

		};

		_waitForEI = function () {

			if (_waitingForEI) {
				return false;
			}

			_waitingForEI = true;
			_event.remove(_win, 'load', _delayWaitForEI);

			if (_tryInitOnFocus && !_isFocused) {
				// giant Safari 3.1 hack - assume mousemove = focus given lack of focus event
				_wDS('waitFocus');
				return false;
			}

			var p;
			if (!_didInit) {
				p = _s.getMoviePercent();
				_s._wD(_str('waitImpatient', (p === 100 ? ' (SWF loaded)' : (p > 0 ? ' (SWF ' + p + '% loaded)' : ''))));
			}

			setTimeout(function () {

				p = _s.getMoviePercent();

				// <d>
				if (!_didInit) {
					_s._wD(_sm + ': No Flash response within expected time.\nLikely causes: ' + (p === 0 ? 'Loading ' + _s.movieURL + ' may have failed (and/or Flash ' + _fV + '+ not present?), ' : '') + 'Flash blocked or JS-Flash security error.' + (_s.debugFlash ? ' ' + _str('checkSWF') : ''), 2);
					if (!_overHTTP && p) {
						_wDS('localFail', 2);
						if (!_s.debugFlash) {
							_wDS('tryDebug', 2);
						}
					}
					if (p === 0) {
						// if 0 (not null), probably a 404.
						_s._wD(_str('swf404', _s.url));
					}
					_debugTS('flashtojs', false, ': Timed out' + _overHTTP ? ' (Check flash security or flash blockers)' : ' (No plugin/missing SWF?)');
				}
				// </d>

				// give up / time-out, depending

				if (!_didInit && _okToDisable) {
					if (p === null) {
						// SWF failed. Maybe blocked.
						if (_s.useFlashBlock || _s.flashLoadTimeout === 0) {
							if (_s.useFlashBlock) {
								_flashBlockHandler();
							}
							_wDS('waitForever');
						} else {
							// old SM2 behaviour, simply fail
							_failSafely(true);
						}
					} else {
						// flash loaded? Shouldn't be a blocking issue, then.
						if (_s.flashLoadTimeout === 0) {
							_wDS('waitForever');
						} else {
							_failSafely(true);
						}
					}
				}

			}, _s.flashLoadTimeout);

		};

		_handleFocus = function () {

			function cleanup () {
				_event.remove(_win, 'focus', _handleFocus);
				_event.remove(_win, 'load', _handleFocus);
			}

			if (_isFocused || !_tryInitOnFocus) {
				cleanup();
				return true;
			}

			_okToDisable = true;
			_isFocused = true;
			_s._wD(_smc + 'handleFocus()');

			if (_isSafari && _tryInitOnFocus) {
				_event.remove(_win, 'mousemove', _handleFocus);
			}

			// allow init to restart
			_waitingForEI = false;

			cleanup();
			return true;

		};

		_showSupport = function () {

			var item, tests = [];

			if (_s.useHTML5Audio && _s.hasHTML5) {
				for (item in _s.audioFormats) {
					if (_s.audioFormats.hasOwnProperty(item)) {
						tests.push(item + ': ' + _s.html5[item] + (!_s.html5[item] && _hasFlash && _s.flash[item] ? ' (using flash)' : (_s.preferFlash && _s.flash[item] && _hasFlash ? ' (preferring flash)' : (!_s.html5[item] ? ' (' + (_s.audioFormats[item].required ? 'required, ' : '') + 'and no flash support)' : ''))));
					}
				}
				_s._wD('-- SoundManager 2: HTML5 support tests (' + _s.html5Test + '): ' + tests.join(', ') + ' --', 1);
			}

		};

		_initComplete = function (bNoDisable) {

			if (_didInit) {
				return false;
			}

			if (_s.html5Only) {
				// all good.
				_s._wD('-- SoundManager 2: loaded --');
				_didInit = true;
				_initUserOnload();
				_debugTS('onload', true);
				return true;
			}

			var wasTimeout = (_s.useFlashBlock && _s.flashLoadTimeout && !_s.getMoviePercent()),
				result = true,
				error;

			if (!wasTimeout) {
				_didInit = true;
				if (_disabled) {
					error = {type:(!_hasFlash && _needsFlash ? 'NO_FLASH' : 'INIT_TIMEOUT')};
				}
			}

			_s._wD('-- SoundManager 2 ' + (_disabled ? 'failed to load' : 'loaded') + ' (' + (_disabled ? 'security/load error' : 'OK') + ') --', 1);

			if (_disabled || bNoDisable) {
				if (_s.useFlashBlock && _s.oMC) {
					_s.oMC.className = _getSWFCSS() + ' ' + (_s.getMoviePercent() === null ? _swfCSS.swfTimedout : _swfCSS.swfError);
				}
				_processOnEvents({type:'ontimeout', error:error});
				_debugTS('onload', false);
				_catchError(error);
				result = false;
			} else {
				_debugTS('onload', true);
			}

			if (_s.waitForWindowLoad && !_windowLoaded) {
				_wDS('waitOnload');
				_event.add(_win, 'load', _initUserOnload);
			} else {
				// <d>
				if (_s.waitForWindowLoad && _windowLoaded) {
					_wDS('docLoaded');
				}
				// </d>
				_initUserOnload();
			}

			return result;

		};

		_init = function () {

			_wDS('init');

			// called after onload()

			if (_didInit) {
				_wDS('didInit');
				return false;
			}

			function _cleanup () {
				_event.remove(_win, 'load', _s.beginDelayedInit);
			}

			if (_s.html5Only) {
				if (!_didInit) {
					// we don't need no steenking flash!
					_cleanup();
					_s.enabled = true;
					_initComplete();
				}
				return true;
			}

			// flash path
			_initMovie();

			try {

				_wDS('flashJS');

				// attempt to talk to Flash
				_flash._externalInterfaceTest(false);

				// apply user-specified polling interval, OR, if "high performance" set, faster vs. default polling
				// (determines frequency of whileloading/whileplaying callbacks, effectively driving UI framerates)
				_setPolling(true, (_s.flashPollingInterval || (_s.useHighPerformance ? 10 : 50)));

				if (!_s.debugMode) {
					// stop the SWF from making debug output calls to JS
					_flash._disableDebug();
				}

				_s.enabled = true;
				_debugTS('jstoflash', true);

				if (!_s.html5Only) {
					// prevent browser from showing cached page state (or rather, restoring "suspended" page state) via back button, because flash may be dead
					// http://www.webkit.org/blog/516/webkit-page-cache-ii-the-unload-event/
					_event.add(_win, 'unload', _doNothing);
				}

			} catch (e) {

				_s._wD('js/flash exception: ' + e.toString());
				_debugTS('jstoflash', false);
				_catchError({type:'JS_TO_FLASH_EXCEPTION', fatal:true});
				// don't disable, for reboot()
				_failSafely(true);
				_initComplete();

				return false;

			}

			_initComplete();

			// disconnect events
			_cleanup();

			return true;

		};

		_domContentLoaded = function () {

			if (_didDCLoaded) {
				return false;
			}

			_didDCLoaded = true;
			_initDebug();

			/**
			 * Temporary feature: allow force of HTML5 via URL params: sm2-usehtml5audio=0 or 1
			 * Ditto for sm2-preferFlash, too.
			 */
				// <d>
			(function () {

				var a = 'sm2-usehtml5audio=', l = _wl.toLowerCase(), b = null,
					a2 = 'sm2-preferflash=', b2 = null, hasCon = (typeof console !== 'undefined' && typeof console.log !== 'undefined');

				if (l.indexOf(a) !== -1) {
					b = (l.charAt(l.indexOf(a) + a.length) === '1');
					if (hasCon) {
						console.log((b ? 'Enabling ' : 'Disabling ') + 'useHTML5Audio via URL parameter');
					}
					_s.useHTML5Audio = b;
				}

				if (l.indexOf(a2) !== -1) {
					b2 = (l.charAt(l.indexOf(a2) + a2.length) === '1');
					if (hasCon) {
						console.log((b2 ? 'Enabling ' : 'Disabling ') + 'preferFlash via URL parameter');
					}
					_s.preferFlash = b2;
				}

			}());
			// </d>

			if (!_hasFlash && _s.hasHTML5) {
				_s._wD('SoundManager: No Flash detected' + (!_s.useHTML5Audio ? ', enabling HTML5.' : '. Trying HTML5-only mode.'));
				_s.useHTML5Audio = true;
				// make sure we aren't preferring flash, either
				// TODO: preferFlash should not matter if flash is not installed. Currently, stuff breaks without the below tweak.
				_s.preferFlash = false;
			}

			_testHTML5();
			_s.html5.usingFlash = _featureCheck();
			_needsFlash = _s.html5.usingFlash;
			_showSupport();

			if (!_hasFlash && _needsFlash) {
				_s._wD('SoundManager: Fatal error: Flash is needed to play some required formats, but is not available.');
				// TODO: Fatal here vs. timeout approach, etc.
				// hack: fail sooner.
				_s.flashLoadTimeout = 1;
			}

			if (_doc.removeEventListener) {
				_doc.removeEventListener('DOMContentLoaded', _domContentLoaded, false);
			}

			_initMovie();
			return true;

		};

		_domContentLoadedIE = function () {

			if (_doc.readyState === 'complete') {
				_domContentLoaded();
				_doc.detachEvent('onreadystatechange', _domContentLoadedIE);
			}

			return true;

		};

		_winOnLoad = function () {
			// catch edge case of _initComplete() firing after window.load()
			_windowLoaded = true;
			_event.remove(_win, 'load', _winOnLoad);
		};

		// sniff up-front
		_detectFlash();

		// focus and window load, init (primarily flash-driven)
		_event.add(_win, 'focus', _handleFocus);
		_event.add(_win, 'load', _handleFocus);
		_event.add(_win, 'load', _delayWaitForEI);
		_event.add(_win, 'load', _winOnLoad);


		if (_isSafari && _tryInitOnFocus) {
			// massive Safari 3.1 focus detection hack
			_event.add(_win, 'mousemove', _handleFocus);
		}

		if (_doc.addEventListener) {

			_doc.addEventListener('DOMContentLoaded', _domContentLoaded, false);

		} else if (_doc.attachEvent) {

			_doc.attachEvent('onreadystatechange', _domContentLoadedIE);

		} else {

			// no add/attachevent support - safe to assume no JS -> Flash either
			_debugTS('onload', false);
			_catchError({type:'NO_DOM2_EVENTS', fatal:true});

		}

		if (_doc.readyState === 'complete') {
			// DOMReady has already happened.
			setTimeout(_domContentLoaded, 100);
		}

	} // SoundManager()

// SM2_DEFER details: http://www.schillmania.com/projects/soundmanager2/doc/getstarted/#lazy-loading

	if (typeof SM2_DEFER === 'undefined' || !SM2_DEFER) {
		soundManager = new SoundManager();
	}

	/**
	 * SoundManager public interfaces
	 * ------------------------------
	 */

	window.SoundManager = SoundManager; // constructor
	window.soundManager = soundManager; // public API, flash callbacks etc.

}(window));
/*global Livepress, soundManager, console */
Livepress.sounds = (function () {
	var soundsBasePath = 'http://static2.photophlow.com/photophlow/sounds/jerome/';
	var soundOn = true;

	soundManager.debugMode = false;
	soundManager.useFlashBlock = true;
	soundManager.url = Livepress.Config.lp_plugin_url + "/swf/";
	soundManager.useHTML5Audio = true;
	soundManager.flashLoadTimeout = 5000;
	soundManager.useFlashBlock = true;
	soundManager.useHighPerformance = true;

	var soundFiles = {
		commentAdded:              "vibes_04-04LR_02-01.mp3",
		firstComment:              "vibes_04-04LR_02-01.mp3",
		commentReplyToUserReceived:'vibes-short_09-08.mp3',
		commented:                 'vibes_04-04LR_02-01.mp3',
		newPost:                   'piano_w-pad_01-17M_01.mp3',
		postUpdated:               'piano_w-pad_01-16M_01-01.mp3'
	};

	// Hack to fail-safe when there is a problem playing the sounds
	var stubSound = { play:function () {
	} };

	var sounds = {}, soundName;
	for (soundName in soundFiles) {
		if (soundFiles.hasOwnProperty(soundName) && typeof(soundFiles[soundName]) === "string") {
			sounds[soundName] = stubSound;
		}
	}

	sounds.on = function () {
		soundOn = true;
	};

	sounds.off = function () {
		soundOn = false;
	};

	var LpSound = function (soundName, fileName) {
		var sound = soundManager.createSound({
			id: soundName,
			url:soundsBasePath + fileName
		});
		this.load = function () {
			sound.load();
		};
		this.play = function () {
			if (soundOn) {
				sound.play();
			}
		};
	};

	var createSounds = function () {
		var soundName;
		for (soundName in soundFiles) {
			if (soundFiles.hasOwnProperty(soundName) && typeof(soundFiles[soundName]) === "string") {
				sounds[soundName] = new LpSound(soundName, soundFiles[soundName]);
			}
		}
	};

	function loadSounds () {
		var soundName;
		for (soundName in soundFiles) {
			if (soundFiles.hasOwnProperty(soundName) && typeof(soundFiles[soundName].load) === "function") {
				sounds[soundName].load();
			}
		}
	}

	soundManager.onload = createSounds;

	sounds.load = function () {
		if (soundManager.supported()) {
			loadSounds();
		} else {
			soundManager.onload = function () {
				createSounds();
				loadSounds();
			};
		}
	};

	soundManager.onerror = function () {
		// time-out, no flash, weird Chrome load issue perhaps.. is user using Chrome?
		// let's try re-starting and see if it works. If not, no loss.
		soundManager.flashLoadTimeout = 0; // wait forever for flash this time..
		setTimeout(soundManager.reboot, 20); // and restart SM2 init process
		setTimeout(function () { // after 1.5 seconds..
			if (!soundManager.supported()) {
				// No luck, no sound - give up, etc.
				console.log('Sound manager error!');
			}
		}, 1500);
	};

	return sounds;
}());
/**
 * Global object that controls scrolling not directly requested by user.
 * If focus is on an element that has the class lp-no-scroll scroll will
 * be disabled.
 */
(function () {
	var Scroller = function () {
		var temporary_disabled = false;

		this.settings_enabled = false;

		jQuery('input:text, textarea')
			.on('focusin', function (e) {
				temporary_disabled = true;
			})
			.on('focusout', function (e) {
				temporary_disabled = false;
			});

		this.shouldScroll = function () {
			return this.settings_enabled && !temporary_disabled;
		};
	};

	Livepress.Scroll = new Scroller();
}());
/*jslint plusplus:true, vars:true */

Livepress.DOMManipulator = function (containerId, custom_background_color) {
	this.custom_background_color = custom_background_color;

	if (typeof containerId === "string") {
		this.containerJQueryElement = jQuery(containerId);
	} else {
		this.containerJQueryElement = containerId;
	}
	this.containerElement = this.containerJQueryElement[0];
	this.cleaned_ws = false;
};

Livepress.DOMManipulator.prototype = {
	debug: false,

	log: function () {
		if (this.debug) {
			console.log.apply(console, arguments);
		}
	},

	/**
	 *
	 * @param operations
	 * @param options     Can have two options - effects_display, custom_scroll_class
	 */
	update: function (operations, options) {
		options = options || {};

		this.log('Livepress.DOMManipulator.update begin.');
		this.clean_updates();

		this.apply_changes(operations, options);

		// Clean the updates after 1,5s
		var self = this;
		setTimeout(function () {
			self.clean_updates();
		}, 1500);

		this.log('Livepress.DOMManipulator.update end.');
	},

	selector: function (partial) {
		return this.containerJQueryElement.find(partial);
	},

	selectors: function () {
		if (arguments.length === 0) {
			throw 'The method expects arguments.';
		}
		var selector = jQuery.map(arguments, function (partial) {
			return partial;
		});
		return this.containerJQueryElement.find(selector.join(','));
	},

	clean_whitespaces: function () {
		if (this.cleaned_ws) {
			return false;
		}
		this.cleaned_ws = true;

		// Clean whitespace textnodes out of DOM
		var content = this.containerElement;
		this.clean_children_ws(content);

		return true;
	},

	block_elements: function () {
		return { /* Block elements */
			"address":    1,
			"blockquote": 1,
			"center":     1,
			"dir":        1,
			"dl":         1,
			"fieldset":   1,
			"form":       1,
			"h1":         1,
			"h2":         1,
			"h3":         1,
			"h4":         1,
			"h5":         1,
			"h6":         1,
			"hr":         1,
			"isindex":    1,
			"menu":       1,
			"noframes":   1,
			"noscript":   1,
			"ol":         1,
			"p":          1,
			"pre":        1,
			"table":      1,
			"ul":         1,
			"div":        1,
			"math":       1,
			"caption":    1,
			"colgroup":   1,
			"col":        1,

			/* Considered block elements, because they may contain block elements */
			"dd":         1,
			"dt":         1,
			"frameset":   1,
			"li":         1,
			"tbody":      1,
			"td":         1,
			"thead":      1,
			"tfoot":      1,
			"th":         1,
			"tr":         1
		};
	},

	is_block_element: function (tagName) {
		if (typeof tagName === 'string') {
			return this.block_elements().hasOwnProperty(tagName.toLowerCase());
		}
		return false;
	},

	remove_whitespace: function (node) {
		var remove = false,
			parent = node.parentNode,
			prevSibling;

		if (node === parent.firstChild || node === parent.lastChild) {
			remove = true;
		} else {
			prevSibling = node.previousSibling;
			if (prevSibling !== null && prevSibling.nodeType === 1 && this.is_block_element(prevSibling.tagName)) {
				remove = true;
			}
		}

		return remove;
	},

	clean_children_ws: function (parent) {
		var remove, child;
		for (remove = false, child = parent.firstChild; child !== null; null) {
			if (child.nodeType === 3) {
				if (/^\s*$/.test(child.nodeValue) && this.remove_whitespace(child)) {
					remove = true;
				}
			} else {
				this.clean_children_ws(child);
			}

			if (remove) {
				var wsChild = child;
				child = child.nextSibling;
				parent.removeChild(wsChild);
				remove = false;
			} else {
				child = child.nextSibling;
			}
		}
	},

	clean_updates: function () {
		this.log('DOMManipulator clean_updates.');
		// Replace the <span>...<ins ...></span> by the content of <ins ...>
		jQuery.each(this.selector('span.oortle-diff-text-updated'), function () {
			var replaceWith;
			if (this.childNodes.length > 1) {
				replaceWith = this.childNodes[1];
			} else {
				replaceWith = this.childNodes[0];
			}
			if (replaceWith.nodeType !== 8) { // Comment node
				replaceWith = replaceWith.childNodes[0];
			}
			this.parentNode.replaceChild(replaceWith, this);
		});

		this.selector('.oortle-diff-changed').removeClass('oortle-diff-changed');
		this.selector('.oortle-diff-inserted').removeClass('oortle-diff-inserted');
		this.selector('.oortle-diff-inserted-block').removeClass('oortle-diff-inserted-block');
		this.selector('.oortle-diff-removed').remove();
		this.selector('.oortle-diff-removed-block').remove();
	},

	apply_changes: function (changes, options) {
		var display_with_effects = options.effects_display || false,
			registers = [],
			i;

		this.clean_whitespaces();

		for (i = 0; i < changes.length; i++) {
			this.log('apply changes i=', i, ' changes.length = ', changes.length);
			var change = changes[i];
			this.log('change[i] = ', change[i]);
			var parts, node, parent, container, childIndex, el, childRef, parent_path;
			switch (change[0]) {

				// ['add_class', 'element xpath', 'class name changed']
				case 'add_class':
					try {
						parts = this.get_path_parts(change[1]);
						node = this.node_at_path(parts);
						this.add_class(node, change[2]);

					} catch (e) {
						this.log('Exception on add_class: ', e);
					}
					break;

				// ['set_attr',  'element xpath', 'attr name', 'attr value']
				case 'set_attr':
					try {
						parts = this.get_path_parts(change[1]);
						node = this.node_at_path(parts);
						this.set_attr(node, change[2], change[3]);
					} catch (esa) {
						this.log('Exception on set_attr: ', esa);
					}
					break;

				// ['del_attr',  'element xpath', 'attr name']
				case 'del_attr':
					try {
						parts = this.get_path_parts(change[1]);
						node = this.node_at_path(parts);
						this.del_attr(node, change[2]);
					} catch (eda) {
						this.log('Exception on del_attr: ', eda);
					}
					break;

				// ['set_text',  'element xpath', '<span><del>old</del><ins>new</ins></span>']
				case 'set_text':
					try {
						this.set_text(change[1], change[2]);
					} catch (est) {
						this.log('Exception on set_text: ', est);
					}
					break;

				// ['del_node',  'element xpath']
				case 'del_node':
					try {
						parts = this.get_path_parts(change[1]);
						node = this.node_at_path(parts);

						if (node.nodeType === 3) { // TextNode
							parent = node.parentNode;
							for (var x = 0; x < parent.childNodes.length; x++) {
								if (parent.childNodes[x] === node) {
									container = parent.ownerDocument.createElement('span');
									container.appendChild(node);
									container.className = 'oortle-diff-removed';
									break;
								}
							}
							if (x < parent.childNodes.length) {
								parent.insertBefore(container, parent.childNodes[x]);
							} else {
								parent.appendChild(container);
							}
						} else if (node.nodeType === 8) { // CommentNode
							node.parentNode.removeChild(node);
						} else {
							this.add_class(node, 'oortle-diff-removed');
						}
					} catch (edn) {
						this.log('Exception on del_node: ', edn);
					}

					break;

				// ['push_node', 'element xpath', reg index ]
				case 'push_node':
					try {
						parts = this.get_path_parts(change[1]);
						node = this.node_at_path(parts);

						if (node !== null) {
							var parentNode = node.parentNode;

							this.log('push_node: parentNode = ', parentNode, ', node = ', node);

							registers[change[2]] = parentNode.removeChild(node);
						}
					} catch (epn) {
						this.log('Exception on push_node: ', epn);
					}

					break;

				// ['pop_node',  'element xpath', reg index ]
				case 'pop_node':
					try {
						parts = this.get_path_parts(change[1]);
						childIndex = this.get_child_index(parts);
						parent = this.node_at_path(this.get_parent_path(parts));

						if (childIndex > -1 && parent !== null) {
							el = registers[change[2]];
							childRef = parent.childNodes.length <= childIndex ? null : parent.childNodes[childIndex];

							this.log("pop_node", el, 'from register', change[2], 'before element', childRef, 'on index ', childIndex, ' on parent ', parent);
							parent.insertBefore(el, childRef);
						}
					} catch (epon) {
						this.log('Exception on pop_node: ', epon);
					}

					break;

				// ['ins_node',  'element xpath', content]
				case 'ins_node':
					try {
						parts = this.get_path_parts(change[1]);
						childIndex = this.get_child_index(parts);
						parent_path = this.get_parent_path(parts);
						parent = this.node_at_path(parent_path);
						this.log('ins_node: childIndex = ', childIndex, ', parent = ', parent);

						if (childIndex > -1 && parent !== null) {
							el = document.createElement('span');
							var html = change[2];
							var found = html.match( /(<p>)?<script.*?src="\/\/platform.twitter.com\/widgets.js".*?<\/script>(<\/p>)?/i );
							html = html.replace( /(<p>)?<script.*?src="\/\/platform.twitter.com\/widgets.js".*?<\/script>(<\/p>)?/i, '' );
							el.innerHTML = html;

							var content = el.childNodes[0];
							childRef = parent.childNodes.length <= childIndex ? null : parent.childNodes[childIndex];

							this.log("the case, childRef = ", childRef, ', content = ', content);
							parent.insertBefore(content, childRef);

							if ( null !== found ) {
								var script = document.createElement( 'script' );
								script.src = '//platform.twitter.com/widgets.js';

								parent.appendChild( script );
							}
						}
					} catch (ein1) {
						this.log('Exception on ins_node: ', ein1);
					}

					break;

				default:
					this.log('Operation not implemented yet.');
					throw 'Operation not implemented yet.';
			}

			this.log('i=', i, ' container: ', this.containerElement.childNodes, ' -- registers: ', registers);
		}

		try {
			this.display(display_with_effects);
		} catch (ein2) {
			this.log('Exception on display: ', ein2);
		}

		try {
			if (Livepress.Scroll.shouldScroll()) {
				var scroll_class = (options.custom_scroll_class === undefined) ?
					'.oortle-diff-inserted-block, .oortle-diff-changed, .oortle-diff-inserted' :
					options.custom_scroll_class;
				jQuery.scrollTo(scroll_class, 900, {axis: 'y', offset: -30 });
			}
		} catch (ein) {
			this.log('Exception on scroll ', ein);
		}

		this.log('end apply_changes.');
	},

	colorForOperation: function (element) {
		if (element.length === 0) {
			return false;
		}
		var colors = {
			'oortle-diff-inserted':       "#55C64D",
			'oortle-diff-changed':        "#55C64D",
			'oortle-diff-inserted-block': "#ffff66",
			'oortle-diff-removed-block':  "#C63F32",
			'oortle-diff-removed':        "#C63F32"
		};

		var color_hex = "#fff";
		jQuery.each(colors, function (klass, hex) {
			if (element.hasClass(klass)) {
				color_hex = hex;
				return false;
			}
		});

		return color_hex;
	},

	show: function (el) {
		var $el = jQuery(el);

		// if user is not on the page
		if (!Livepress.Config.page_active) {
			$el.getBg();
			$el.data("oldbg", $el.css('background-color'));
			$el.addClass('unfocused-lp-update');
			$el.css("background-color", this.colorForOperation($el));
		}
		$el.show();
	},

	/**
	 * this is a fix for the jQuery s(l)ide effects
	 * Without this element sometimes has inline style of height
	 * set to 0 or 1px. Remember not to use this on collection but
	 * on single elements only.
	 *
	 * @param object node to be displayed/hidden
	 * @param object hash with
	 *  slideType:
	 *   "down" - default, causes element to be animated as if using slideDown
	 *    anything else, is recognised as slideUp
	 *  duration: this value will be passed as duration param to slideDown, slideUp
	 */
	sliderFixed: function (el, options) {
		var $ = jQuery;
		var defaults = {slideType: "down", duration: 250};
		options = $.extend({}, defaults, options);
		var bShow = (options.slideType === "down");
		var $el = $(el), height = $el.data("originalHeight"), visible = $el.is(":visible");
		var originalStyle = $el.data("originalStyle");
		// if the bShow isn't present, get the current visibility and reverse it
		if (arguments.length === 1) {
			bShow = !visible;
		}

		// if the current visiblilty is the same as the requested state, cancel
		if (bShow === visible) {
			return false;
		}

		// get the original height
		if (!height || !originalStyle) {
			// get original height
			height = $el.show().height();
			originalStyle = $el.attr('style');
			$el.data("originalStyle", originalStyle);
			// update the height
			$el.data("originalHeight", height);
			// if the element was hidden, hide it again
			if (!visible) {
				$el.hide();
			}
		}

		// expand the knowledge (instead of slideDown/Up, use custom animation which applies fix)
		if (bShow) {
			$el.show().animate({
				height: height
			}, {
				duration: options.duration,
				complete: function () {
					$el.css({height: $el.data("originalHeight")});
					$el.attr("style", $el.data("originalStyle"));
					$el.show();
				}
			});
		} else {
			$el.animate({
				height: 0
			}, {
				duration: options.duration,
				complete: function () {
					$el.hide();
				}
			});
		}
	},

	show_with_effects: function ($selects, effects) {
		if (this.custom_background_color === "string") {
			$selects.css('background-color', this.custom_background_color);
		}
		$selects.getBg();
		effects($selects, $selects.css('background-color'));
	},


	display: function (display_with_effects) {
		if (display_with_effects) {
			var $els = this.selector('.oortle-diff-inserted-block');
			$els.hide().css("height", "");
			var self = this;
			var blockInsertionEffects = function ($el, old_bg) {
				self.sliderFixed($el, "down");
				$el.animate({backgroundColor: self.colorForOperation($el)}, 200)
					.animate({backgroundColor: old_bg}, 800);

				// Clear background after effects
				setTimeout(function () {
					$el.css('background-color', '');
				}, 1500);
			};

			$els.each(function (index, update) {
				self.show_with_effects(jQuery(update), blockInsertionEffects);
			});

			this.show_with_effects(this.selectors('.oortle-diff-inserted', '.oortle-diff-changed'),
				function ($el, old_bg) {
					$el.slideDown(200);
					try {
						$el.animate(self.colorForOperation($el), 200)
							.animate({backgroundColor: old_bg}, 800);
					} catch (e) {
						console.log('Error when animating new comment div.');
					}

					// Clear background after effects
					setTimeout(function () {
						$el.css('background-color', '');
					}, 1500);
				}
			);

			this.show_with_effects(this.selectors('.oortle-diff-removed-block', '.oortle-diff-removed'),
				function ($el, old_bg) {
					try {
						$el.animate({backgroundColor: self.colorForOperation($el)}, 200)
							.animate({backgroundColor: old_bg}, 800)
							.slideUp(200);
					} catch (e) {
						console.log('Error when removing comment div.');
					}
					// Clear background after effects
					setTimeout(function () {
						$el.css('background-color', '');
					}, 1500);
				}
			);
		} else {
			this.show(this.selectors('.oortle-diff-changed', '.oortle-diff-inserted', '.oortle-diff-removed'));
			this.show(this.selector('.oortle-diff-inserted-block'));
		}
	},

	set_text: function (nodePath, content) {
		var parts = this.get_path_parts(nodePath);
		var childIndex = this.get_child_index(parts);
		var parent = this.node_at_path(this.get_parent_path(parts));

		if (childIndex > -1 && parent !== null) {
			var refNode = parent.childNodes[childIndex];
			var contentArr = jQuery(content);

			for (var i = 0, len = contentArr.length; i < len; i++) {
				parent.insertBefore(contentArr[i], refNode);
			}

			parent.removeChild(refNode);
		}
	},

	get_path_parts: function (nodePath) {
		var parts = nodePath.split(':');
		var indices = [];
		for (var i = 0, len = parts.length; i < len; i++) {
			indices[i] = parseInt(parts[i], 10);
		}
		return indices;
	},

	get_child_index: function (pathParts) {
		if (pathParts.length > 0) {
			return parseInt(pathParts[pathParts.length - 1], 10);
		}
		return -1;
	},

	get_parent_path: function (pathParts) {
		var parts = pathParts.slice(); // "clone" the array
		parts.splice(-1, 1);
		return parts;
	},

	node_at_path: function (pathParts) {
		return this.get_node_by_path(this.containerElement, pathParts);
	},

	get_node_by_path: function (root, pathParts) {
		var parts = pathParts.slice();
		parts.splice(0, 1); // take out the first element (the root)
		if (parts.length === 0) {
			return root;
		}
		var i = 0, tmp = root, result = null;
		for (var len = parts.length; i < len; i++) {
			tmp = tmp.childNodes[parts[i]];
			if (typeof(tmp) === 'undefined') {
				break;
			}
		}
		if (i === parts.length) {
			result = tmp;
		}
		return result;
	},

	add_class: function (node, newClass) {
		if (node !== null) {
			node.className += ' ' + newClass;
		}
	},

	set_attr: function (node, attrName, attrValue) {
		if (node !== null) {
			node.setAttribute(attrName, attrValue);
		}
	},

	del_attr: function (node, attrName) {
		if (node !== null) {
			node.removeAttribute(attrName);
		}
	}
};

Livepress.DOMManipulator.clean_updates = function (el) {
	var temp_manipulator = new Livepress.DOMManipulator(el);
	temp_manipulator.clean_updates();
};
//
// Copyright (c) 2008, 2009 Paul Duncan (paul@pablotron.org)
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//

(function () {
	// We are already defined. Hooray!
	if (window.google && google.gears) {
		return;
	}

	// factory
	var F = null;

	// Firefox
	if (typeof GearsFactory != 'undefined') {
		F = new GearsFactory();
	} else {
		// IE
		try {
			F = new ActiveXObject('Gears.Factory');
			// privateSetGlobalObject is only required and supported on WinCE.
			if (F.getBuildInfo().indexOf('ie_mobile') != -1) {
				F.privateSetGlobalObject(this);
			}

		} catch (e) {
			// Safari
			if ((typeof navigator.mimeTypes != 'undefined') && navigator.mimeTypes["application/x-googlegears"]) {
				F = document.createElement("object");
				F.style.display = "none";
				F.width = 0;
				F.height = 0;
				F.type = "application/x-googlegears";
				document.documentElement.appendChild(F);
			}
		}
	}

	// *Do not* define any objects if Gears is not installed. This mimics the
	// behavior of Gears defining the objects in the future.
	if (!F) {
		return;
	}


	// Now set up the objects, being careful not to overwrite anything.
	//
	// Note: In Internet Explorer for Windows Mobile, you can't add properties to
	// the window object. However, global objects are automatically added as
	// properties of the window object in all browsers.
	if (!window.google) {
		google = {};
	}

	if (!google.gears) {
		google.gears = {factory:F};
	}

})();
Persist = (function () {
	var VERSION = '0.3.0', P, B, esc, init, empty, ec;

	ec = (function () {
		var EPOCH = 'Thu, 01-Jan-1970 00:00:01 GMT',
		// milliseconds per day
			RATIO = 1000 * 60 * 60 * 24,
		// keys to encode
			KEYS = ['expires', 'path', 'domain'],
		// wrappers for common globals
			esc = escape, un = unescape, doc = document,
			me;

		// private methods

		/*
		 * Get the current time.
		 *
		 * This method is private.
		 */
		var get_now = function () {
			var r = new Date();
			r.setTime(r.getTime());
			return r;
		};

		/*
		 * Convert the given key/value pair to a cookie.
		 *
		 * This method is private.
		 */
		var cookify = function (c_key, c_val /*, opt */) {
			var i, key, val, r = [],
				opt = (arguments.length > 2) ? arguments[2] : {};

			// add key and value
			r.push(esc(c_key) + '=' + esc(c_val));

			// iterate over option keys and check each one
			for (var idx = 0; idx < KEYS.length; idx++) {
				key = KEYS[idx];
				val = opt[key];
				if (val) {
					r.push(key + '=' + val);
				}

			}

			// append secure (if specified)
			if (opt.secure) {
				r.push('secure');
			}

			// build and return result string
			return r.join('; ');
		};

		/*
		 * Check to see if cookies are enabled.
		 *
		 * This method is private.
		 */
		var alive = function () {
			var k = '__EC_TEST__',
				v = new Date();

			// generate test value
			v = v.toGMTString();

			// set test value
			this.set(k, v);

			// return cookie test
			this.enabled = (this.remove(k) == v);
			return this.enabled;
		};

		// public methods

		// build return object
		me = {
			/*
			 * Set a cookie value.
			 *
			 * Examples:
			 *
			 *   // simplest-case
			 *   EasyCookie.set('test_cookie', 'test_value');
			 *
			 *   // more complex example
			 *   EasyCookie.set('test_cookie', 'test_value', {
			 *     // expires in 13 days
			 *     expires: 13,
			 *
			 *     // restrict to given domain
			 *     domain: 'foo.example.com',
			 *
			 *     // restrict to given path
			 *     path: '/some/path',
			 *
			 *     // secure cookie only
			 *     secure: true
			 *   });
			 *
			 */
			set:    function (key, val /*, opt */) {
				var opt = (arguments.length > 2) ? arguments[2] : {},
					now = get_now(),
					expire_at,
					cfg = {};

				// if expires is set, convert it from days to milliseconds
				if (opt.expires) {
					// Needed to assign to a temporary variable because of pass by reference issues
					var expires = opt.expires * RATIO;

					// set cookie expiration date
					cfg.expires = new Date(now.getTime() + expires);
					cfg.expires = cfg.expires.toGMTString();
				}

				// set remaining keys
				var keys = ['path', 'domain', 'secure'];
				for (var i = 0; i < keys.length; i++) {
					if (opt[keys[i]]) {
						cfg[keys[i]] = opt[keys[i]];
					}
				}

				var r = cookify(key, val, cfg);
				doc.cookie = r;

				return val;
			},

			/*
			 * Check to see if the given cookie exists.
			 *
			 * Example:
			 *
			 *   val = EasyCookie.get('test_cookie');
			 *
			 */
			has:    function (key) {
				key = esc(key);

				var c = doc.cookie,
					ofs = c.indexOf(key + '='),
					len = ofs + key.length + 1,
					sub = c.substring(0, key.length);

				// check to see if key exists
				return ((!ofs && key != sub) || ofs < 0) ? false : true;
			},

			/*
			 * Get a cookie value.
			 *
			 * Example:
			 *
			 *   val = EasyCookie.get('test_cookie');
			 *
			 */
			get:    function (key) {
				key = esc(key);

				var c = doc.cookie,
					ofs = c.indexOf(key + '='),
					len = ofs + key.length + 1,
					sub = c.substring(0, key.length),
					end;

				// check to see if key exists
				if ((!ofs && key != sub) || ofs < 0) {
					return null;
				}

				// grab end of value
				end = c.indexOf(';', len);
				if (end < 0) {
					end = c.length;
				}

				// return unescaped value
				return un(c.substring(len, end));
			},

			/*
			 * Remove a preset cookie.  If the cookie is already set, then
			 * return the value of the cookie.
			 *
			 * Example:
			 *
			 *   old_val = EasyCookie.remove('test_cookie');
			 *
			 */
			remove: function (k) {
				var r = me.get(k),
					opt = { expires:EPOCH };

				// delete cookie
				doc.cookie = cookify(k, '', opt);

				// return value
				return r;
			},

			/*
			 * Get a list of cookie names.
			 *
			 * Example:
			 *
			 *   // get all cookie names
			 *   cookie_keys = EasyCookie.keys();
			 *
			 */
			keys:   function () {
				var c = doc.cookie,
					ps = c.split('; '),
					i, p, r = [];

				// iterate over each key=val pair and grab the key
				for (var idx = 0; idx < ps.length; idx++) {
					p = ps[idx].split('=');
					r.push(un(p[0]));
				}

				// return results
				return r;
			},

			/*
			 * Get an array of all cookie key/value pairs.
			 *
			 * Example:
			 *
			 *   // get all cookies
			 *   all_cookies = EasyCookie.all();
			 *
			 */
			all:    function () {
				var c = doc.cookie,
					ps = c.split('; '),
					i, p, r = [];

				// iterate over each key=val pair and grab the key
				for (var idx = 0; idx < ps.length; idx++) {
					p = ps[idx].split('=');
					r.push([un(p[0]), un(p[1])]);
				}

				// return results
				return r;
			},

			/*
			 * Version of EasyCookie
			 */
			version:'0.2.1',

			/*
			 * Are cookies enabled?
			 *
			 * Example:
			 *
			 *   have_cookies = EasyCookie.enabled
			 *
			 */
			enabled:false
		};

		// set enabled attribute
		me.enabled = alive.call(me);

		// return self
		return me;
	}());

	// wrapper for Array.prototype.indexOf, since IE doesn't have it
	var index_of = (function () {
		if (Array.prototype.indexOf) {
			return function (ary, val) {
				return Array.prototype.indexOf.call(ary, val);
			};
		} else {
			return function (ary, val) {
				var i, l;

				for (var idx = 0, len = ary.length; idx < len; idx++) {
					if (ary[idx] == val) {
						return idx;
					}
				}

				return -1;
			};
		}
	})();


	// empty function
	empty = function () {
	};

	/**
	 * Escape spaces and underscores in name.  Used to generate a "safe"
	 * key from a name.
	 *
	 * @private
	 */
	esc = function (str) {
		return 'PS' + str.replace(/_/g, '__').replace(/ /g, '_s');
	};

	var C = {
		/*
		 * Backend search order.
		 *
		 * Note that the search order is significant; the backends are
		 * listed in order of capacity, and many browsers
		 * support multiple backends, so changing the search order could
		 * result in a browser choosing a less capable backend.
		 */
		search_order:[
			// TODO: air
			'localstorage',
			'globalstorage',
			'gears',
			'cookie',
			'ie',
			'flash'
		],

		// valid name regular expression
		name_re:     /^[a-z][a-z0-9_ \-]+$/i,

		// list of backend methods
		methods:     [
			'init',
			'get',
			'set',
			'remove',
			'load',
			'save',
			'iterate'
			// TODO: clear method?
		],

		// sql for db backends (gears and db)
		sql:         {
			version:'1', // db schema version

			// XXX: the "IF NOT EXISTS" is a sqlite-ism; fortunately all the
			// known DB implementations (safari and gears) use sqlite
			create: "CREATE TABLE IF NOT EXISTS persist_data (k TEXT UNIQUE NOT NULL PRIMARY KEY, v TEXT NOT NULL)",
			get:    "SELECT v FROM persist_data WHERE k = ?",
			set:    "INSERT INTO persist_data(k, v) VALUES (?, ?)",
			remove: "DELETE FROM persist_data WHERE k = ?",
			keys:   "SELECT * FROM persist_data"
		},

		// default flash configuration
		flash:       {
			// ID of wrapper element
			div_id:'_persist_flash_wrap',

			// id of flash object/embed
			id:    '_persist_flash',

			// default path to flash object
			path:  'persist.swf',
			size:  { w:1, h:1 },

			// arguments passed to flash object
			args:  {
				autostart:true
			}
		}
	};

	// built-in backends
	B = {
		// gears db backend
		// (src: http://code.google.com/apis/gears/api_database.html)
		gears:        {
			// no known limit
			size:-1,

			test:function () {
				// test for gears
				return (window.google && window.google.gears) ? true : false;
			},

			methods:{

				init:function () {
					var db;

					// create database handle (TODO: add schema version?)
					db = this.db = google.gears.factory.create('beta.database');

					// open database
					// from gears ref:
					//
					// Currently the name, if supplied and of length greater than
					// zero, must consist only of visible ASCII characters
					// excluding the following characters:
					//
					//   / \ : * ? " < > | ; ,
					//
					// (this constraint is enforced in the Store constructor)
					db.open(esc(this.name));

					// create table
					db.execute(C.sql.create).close();
				},

				get:function (key) {
					var r, sql = C.sql.get;
					var db = this.db;
					var ret;

					// begin transaction
					db.execute('BEGIN').close();

					// exec query
					r = db.execute(sql, [key]);

					// check result and get value
					ret = r.isValidRow() ? r.field(0) : null;

					// close result set
					r.close();

					// commit changes
					db.execute('COMMIT').close();
					return ret;
				},

				set:function (key, val) {
					var rm_sql = C.sql.remove,
						sql = C.sql.set, r;
					var db = this.db;
					var ret;

					// begin transaction
					db.execute('BEGIN').close();

					// exec remove query
					db.execute(rm_sql, [key]).close();

					// exec set query
					db.execute(sql, [key, val]).close();

					// commit changes
					db.execute('COMMIT').close();

					return val;
				},

				remove: function (key) {
					var get_sql = C.sql.get;
					sql = C.sql.remove,
						r, val = null, is_valid = false;
					var db = this.db;

					// begin transaction
					db.execute('BEGIN').close();

					// exec remove query
					db.execute(sql, [key]).close();

					// commit changes
					db.execute('COMMIT').close();

					return true;
				},
				iterate:function (fn, scope) {
					var key_sql = C.sql.keys;
					var r;
					var db = this.db;

					// exec keys query
					r = db.execute(key_sql);
					while (r.isValidRow()) {
						fn.call(scope || this, r.field(0), r.field(1));
						r.next();
					}
					r.close();
				}
			}
		},

		// globalstorage backend (globalStorage, FF2+, IE8+)
		// (src: http://developer.mozilla.org/en/docs/DOM:Storage#globalStorage)
		// https://developer.mozilla.org/En/DOM/Storage
		//
		// TODO: test to see if IE8 uses object literal semantics or
		// getItem/setItem/removeItem semantics
		globalstorage:{
			// (5 meg limit, src: http://ejohn.org/blog/dom-storage-answers/)
			size:5 * 1024 * 1024,

			test:function () {
				if (window.globalStorage) {
					var domain = '127.0.0.1';
					if (this.o && this.o.domain) {
						domain = this.o.domain;
					}
					try {
						var dontcare = globalStorage[domain];
						return true;
					} catch (e) {
						if (window.console && window.console.warn) {
							console.warn("globalStorage exists, but couldn't use it because your browser is running on domain:", domain);
						}
						return false;
					}
				} else {
					return false;
				}
			},

			methods:{
				key:function (key) {
					return esc(this.name) + esc(key);
				},

				init:function () {
					this.store = globalStorage[this.o.domain];
				},

				get:function (key) {
					// expand key
					key = this.key(key);

					return  this.store.getItem(key);
				},

				set:function (key, val) {
					// expand key
					key = this.key(key);

					// set value
					this.store.setItem(key, val);

					return val;
				},

				remove:function (key) {
					var val;

					// expand key
					key = this.key(key);

					// get value
					val = this.store.getItem[key];

					// delete value
					this.store.removeItem(key);

					return val;
				}
			}
		},

		// localstorage backend (globalStorage, FF2+, IE8+)
		// (src: http://www.whatwg.org/specs/web-apps/current-work/#the-localstorage)
		// also http://msdn.microsoft.com/en-us/library/cc197062(VS.85).aspx#_global
		localstorage: {
			// (unknown?)
			// ie has the remainingSpace property, see:
			// http://msdn.microsoft.com/en-us/library/cc197016(VS.85).aspx
			size:-1,

			test:function () {
				return window.localStorage ? true : false;
			},

			methods:{
				key:function (key) {
					return this.name + '>' + key;
					//return esc(this.name) + esc(key);
				},

				init:function () {
					this.store = localStorage;
				},

				get:function (key) {
					// expand key
					key = this.key(key);
					return this.store.getItem(key);
				},

				set:function (key, val) {
					// expand key
					key = this.key(key);

					// set value
					this.store.setItem(key, val);

					return val;
				},

				remove:function (key) {
					var val;

					// expand key
					key = this.key(key);

					// get value
					val = this.store.getItem(key);

					// delete value
					this.store.removeItem(key);

					return val;
				},

				iterate:function (fn, scope) {
					var l = this.store;
					for (i = 0; i < l.length; i++) {
						keys = l[i].split('>');
						if ((keys.length == 2) && (keys[0] == this.name)) {
							fn.call(scope || this, keys[1], l[l[i]]);
						}
					}
				}
			}
		},

		// IE backend
		ie:           {
			prefix:'_persist_data-',
			// style:    'display:none; behavior:url(#default#userdata);',

			// 64k limit
			size:  64 * 1024,

			test:function () {
				// make sure we're dealing with IE
				// (src: http://javariet.dk/shared/browser_dom.htm)
				return window.ActiveXObject ? true : false;
			},

			make_userdata:function (id) {
				var el = document.createElement('div');

				// set element properties
				// http://msdn.microsoft.com/en-us/library/ms531424(VS.85).aspx
				// http://www.webreference.com/js/column24/userdata.html
				el.id = id;
				el.style.display = 'none';
				el.addBehavior('#default#userdata');

				// append element to body
				document.body.appendChild(el);

				// return element
				return el;
			},

			methods:{
				init:function () {
					var id = B.ie.prefix + esc(this.name);

					// save element
					this.el = B.ie.make_userdata(id);

					// load data
					if (this.o.defer) {
						this.load();
					}
				},

				get:function (key) {
					var val;

					// expand key
					key = esc(key);

					// load data
					if (!this.o.defer) {
						this.load();
					}

					// get value
					val = this.el.getAttribute(key);

					return val;
				},

				set:function (key, val) {
					// expand key
					key = esc(key);

					// set attribute
					this.el.setAttribute(key, val);

					// save data
					if (!this.o.defer) {
						this.save();
					}

					return val;
				},

				remove:function (key) {
					var val;

					// expand key
					key = esc(key);

					// load data
					if (!this.o.defer) {
						this.load();
					}

					// get old value and remove attribute
					val = this.el.getAttribute(key);
					this.el.removeAttribute(key);

					// save data
					if (!this.o.defer) {
						this.save();
					}

					return val;
				},

				load:function () {
					this.el.load(esc(this.name));
				},

				save:function () {
					this.el.save(esc(this.name));
				}
			}
		},

		// cookie backend
		// uses easycookie: http://pablotron.org/software/easy_cookie/
		cookie:       {
			delim:':',

			// 4k limit (low-ball this limit to handle browser weirdness, and
			// so we don't hose session cookies)
			size: 4000,

			test:function () {
				// XXX: use easycookie to test if cookies are enabled
				return P.Cookie.enabled ? true : false;
			},

			methods:{
				key:function (key) {
					return this.name + B.cookie.delim + key;
				},

				get:function (key, fn) {
					var val;

					// expand key
					key = this.key(key);

					// get value
					val = ec.get(key);

					return val;
				},

				set:function (key, val, fn) {
					// expand key
					key = this.key(key);

					// save value
					ec.set(key, val, this.o);

					return val;
				},

				remove:function (key, val) {
					var val;

					// expand key
					key = this.key(key);

					// remove cookie
					val = ec.remove(key);

					return val;
				}
			}
		},

		// flash backend (requires flash 8 or newer)
		// http://kb.adobe.com/selfservice/viewContent.do?externalId=tn_16194&sliceId=1
		// http://livedocs.adobe.com/flash/8/main/wwhelp/wwhimpl/common/html/wwhelp.htm?context=LiveDocs_Parts&file=00002200.html
		flash:        {
			test:function () {
				// TODO: better flash detection
				if (!deconcept || !deconcept.SWFObjectUtil) {
					return false;
				}

				// get the major version
				var major = deconcept.SWFObjectUtil.getPlayerVersion().major;

				// check flash version (require 8.0 or newer)
				return (major >= 8) ? true : false;
			},

			methods:{
				init:function () {
					if (!B.flash.el) {
						var o, key, el, cfg = C.flash;

						// create wrapper element
						el = document.createElement('div');
						el.id = cfg.div_id;

						// FIXME: hide flash element
						// el.style.display = 'none';

						// append element to body
						document.body.appendChild(el);

						// create new swf object
						o = new deconcept.SWFObject(this.o.swf_path || cfg.path, cfg.id, cfg.size.w, cfg.size.h, '8');

						// set parameters
						for (key in cfg.args) {
							if (cfg.args[key] != 'function') {
								o.addVariable(key, cfg.args[key]);
							}
						}

						// write flash object
						o.write(el);

						// save flash element
						B.flash.el = document.getElementById(cfg.id);
					}

					// use singleton flash element
					this.el = B.flash.el;
				},

				get:function (key) {
					var val;

					// escape key
					key = esc(key);

					// get value
					val = this.el.get(this.name, key);

					return val;
				},

				set:function (key, val) {
					var old_val;

					// escape key
					key = esc(key);

					// set value
					old_val = this.el.set(this.name, key, val);

					return old_val;
				},

				remove:function (key) {
					var val;

					// get key
					key = esc(key);

					// remove old value
					val = this.el.remove(this.name, key);
					return val;
				}
			}
		}
	};

	/**
	 * Test for available backends and pick the best one.
	 * @private
	 */
	init = function () {
		var i, l, b, key, fns = C.methods, keys = C.search_order;

		// set all functions to the empty function
		for (var idx = 0, len = fns.length; idx < len; idx++) {
			P.Store.prototype[fns[idx]] = empty;
		}

		// clear type and size
		P.type = null;
		P.size = -1;

		// loop over all backends and test for each one
		for (var idx2 = 0, len2 = keys.length; !P.type && idx2 < len2; idx2++) {
			b = B[keys[idx2]];

			// test for backend
			if (b.test()) {
				// found backend, save type and size
				P.type = keys[idx2];
				P.size = b.size;
				// extend store prototype with backend methods
				for (key in b.methods) {
					P.Store.prototype[key] = b.methods[key];
				}
			}
		}

		// mark library as initialized
		P._init = true;
	};

	// create top-level namespace
	P = {
		// version of persist library
		VERSION:VERSION,

		// backend type and size limit
		type:   null,
		size:   0,

		// XXX: expose init function?
		// init: init,

		add:function (o) {
			// add to backend hash
			B[o.id] = o;

			// add backend to front of search order
			C.search_order = [o.id].concat(C.search_order);

			// re-initialize library
			init();
		},

		remove:function (id) {
			var ofs = index_of(C.search_order, id);
			if (ofs < 0) {
				return;
			}

			// remove from search order
			C.search_order.splice(ofs, 1);

			// delete from lut
			delete B[id];

			// re-initialize library
			init();
		},

		// expose easycookie API
		Cookie:ec,

		// store API
		Store: function (name, o) {
			// verify name
			if (!C.name_re.exec(name)) {
				throw new Error("Invalid name");
			}

			// XXX: should we lazy-load type?
			// if (!P._init)
			//   init();

			if (!P.type) {
				throw new Error("No suitable storage found");
			}

			o = o || {};
			this.name = name;

			// get domain (XXX: does this localdomain fix work?)
			o.domain = o.domain || location.hostname || 'localhost';

			// strip port from domain (XXX: will this break ipv6?)
			o.domain = o.domain.replace(/:\d+$/, '');

			// Specifically for IE6 and localhost
			o.domain = (o.domain == 'localhost') ? '' : o.domain;

			// append localdomain to domains w/o '."
			// (see https://bugzilla.mozilla.org/show_bug.cgi?id=357323)
			// (file://localhost/ works, see:
			// https://bugzilla.mozilla.org/show_bug.cgi?id=469192)
			/*
			 *       if (!o.domain.match(/\./))
			 *         o.domain += '.localdomain';
			 */

			this.o = o;

			// expires in 2 years
			o.expires = o.expires || 365 * 2;

			// set path to root
			o.path = o.path || '/';

			// call init function
			this.init();
		}
	};

	// init persist
	init();

	// return top-level namespace
	return P;
})();
Livepress.storage = (function () {
	var storage = new Persist.Store('Livepress', {
		defer:    false,
		swf_path: Livepress.Config.lp_plugin_url + '/swf/persist.swf'
	});
	return {
		get: function (key, def) {
			var val = storage.get(key);
			return (val === null || val === undefined) ? def : val;
		},
		set: function (key, value) {
			return storage.set(key, value);
		}
	};
}());
/*global Livepress, OORTLE, console */
/**
 *  Connects to Oortle, apply diff messages and handles the view, playing sounds for each task.
 *
 *  Applies the diffs of content (to '#post_content_livepress') and comments (to '#post_comments_livepress')
 *
 * @param   config  Can have the following options
 *                  * comment_count = the actual comment count (will be updated on each comment update)
 *                  * site_url = site url to use in Oortle' topics
 *                  * ajax_url = url to use in ajax requests
 *                  * post_update_msg_id, comment_msg_id, new_post_msg_id = the id of the last message
 *                      sent to the topics post-{config.post_id}, post-{config.post_id}_comment and
 *                      post-new-update (all 3 starts with livepress|{site_url}|)
 *                  * can_edit_comments = boolean, if true will use the topic
 *                      post-{config.post_id}_comment-logged instead of post-{config.post_id}_comment
 *                  * custom_title_css_selector = if set, will change the topic in the selector
 *                      provided instead of "#post-{config.post_id}"
 *                  * custom_background_color = should be set if the text color background is
 *                      provided by an image. If it's form an image, will get it from the CSS.
 *                  * post_id = the current post_id
 *                  * page_type = [home|single|page|admin], used to choose between partial/full view
 *                      and subscribe to the topics that makes sense
 *                  * feed_sub_link = Link to subscribe to post updates from feed
 *                  * feed_title = Title of the post updates feed
 *                  * disable_comments = Disables all comment related UI
 *                  * comment_live_updates_default = Live comment update should be on/off
 *                  * sounds_default = Sounds should be on/off
 *
 * @param   hooks   Can have the following function hooks:
 *                  * post_comment_update = call after apply the diff operation
 */
Livepress.Ui.Controller = function (config, hooks) {
	var $window = jQuery( window ),
		$livepress = jQuery( document.getElementById( 'livepress' ) );
	var post_dom_manipulator, comments_dom_manipulator;
	var comment_count = config.comment_count;
	var page_type = config.page_type;
	var on_home_page = (page_type === 'home');
	var on_single_page = (page_type === 'single');
	var posts_on_hold = [];
	var paused = false;
	var update_box;
	var widget;
	var comet = OORTLE.instance;
	var sounds = Livepress.sounds;

	function connected () {
		if ( widget !== undefined ) {
			widget.connected();
		}
		sounds.load();
	}

	function comet_error_callback ( message ) {
		console.log( "Comet error: ", message );
	}

	function call_hook (name) {
		if (typeof(hooks) === 'object') {
			if (typeof(hooks[name]) === 'function') {
				return hooks[name].apply(this, Array.prototype.slice.call(arguments, 1));
			}
		}
	}

	function trigger_action_on_view  () {
		setTimeout(function () {
			if (comet.is_connected()) {
				widget.connected();
			} else {
				widget.disconnected();
			}
		}, 1500);
	}

	function comment_update (data, topic, msg_id) {
		if (config.comment_msg_id === msg_id) {
			return;
		}

		call_hook('before_live_comment', data);
		// WP only: don't attach comments if we're using page split on comments and we're not on first or last
		// page, depending on what option of comment sorting is set.
		var should_attach = call_hook("should_attach_comment", config);
		// should attach if such hook doesn't exist
		should_attach = (should_attach === undefined ? true : should_attach);

		if (should_attach) {
			var result = call_hook('on_comment_update', data, comments_dom_manipulator);
			if (result === undefined) {
				comments_dom_manipulator.update(data.diff);
			}
		}
		trigger_action_on_view();

		// The submit form looses the ajax bind after applying the diff operations
		// so provide this hook to let attach the onClick function again
		call_hook('post_comment_update');

		if (comment_count === 0) {
			sounds.firstComment.play();
		} else {
			sounds.commentAdded.play();
		}
		comment_count += 1;

		if (data.comment_id) {
			var containerId = call_hook("get_comment_container", data.comment_id);
			if (containerId === undefined) {
				for (var i = 0; i < data.diff.length; i += 1) {
					if (data.diff[i][0] === "ins_node" && data.diff[i][2].indexOf(data.content) >= 0) {
						containerId = jQuery(data.diff[i][2]).attr('id');
						break;
					}
				}
			}

			var avatar_src;
			// checking if avatar_url is <img> or just string with url
			if (jQuery(data.avatar_url).length === 0) {
				avatar_src = data.avatar_url;
			} else {
				avatar_src = jQuery(data.avatar_url).attr('src');
			}

			// change the bubble to contain refresh button instead of
			// 'scroll to' if we didn't attach new comment
			var options = {
				title:             data.author,
				text:              data.content,
				commentContainerId:containerId,
				image:             avatar_src
			};

			if (!should_attach) {
				options.scrollToText = "Refresh page";
				options.scrollToCallback = function () {
					location.reload();
				};
			}
			widget.comment_alert(options, data.comment_gmt);
		}

		widget.set_comment_num(comment_count);
	}

	function update_live_updates () {
		var $live_updates = jQuery( document.querySelectorAll( '#post_content_livepress .livepress-update' ) ).not('.oortle-diff-removed');
		widget.set_live_updates_num($live_updates.length);

		var current_post_link = window.location.href.replace(window.location.hash, "");
		// If reached the page with an anchor to a specific post update, it should
		// be highlight for 10 seconds.
		$live_updates.filter(window.location.hash).each(function () {
			return new Livepress.Ui.UpdateView(jQuery(this), current_post_link, 10, config.disable_comments);
		});

		if (on_single_page) {
			$live_updates.addClass('lp-hl-on-hover');
		}

		$live_updates.each(function () {
			var $this = jQuery( this );
			if ( ! $this.is( '.lp-live' ) ) {
				/* Disable sharing UI for now
				$this.on('mouseenter', function () {
					return new Livepress.Ui.UpdateView($this, current_post_link, window.location, config.disable_comments);
				});
				*/
				$this.addClass('lp-live');
			}
		});
	}

	function handle_page_title_update (data) {
		// we want to notify about the new post updates and edits. No deletes.
		if (window.is_active) {
			return;
		}
		var only_deletes = false;
		jQuery.each(data, function (k, v) {
			// it's deletion if only del_node operations are in changes array
			only_deletes = (v[0] === "del_node");
		});
		if (only_deletes) {
			return;
		}

		var title = jQuery("title");
		var updates = title.data("updates");
		updates += 1;
		title.data("updates", updates);
		title.text("(" + updates + ") " + title.data("text"));
		// TODO: change window title too, to match new post title
	}

	function post_title_update (title) {
		trigger_action_on_view();

		if (title.length === 2) {
			var old_title = title[0];
			var new_title = title[1];
			var selector;
			if (typeof(config.custom_title_css_selector) === "string") {
				selector = config.custom_title_css_selector;
			} else {
				selector = "#post-" + config.post_id;
			}
			var $post_title = jQuery(selector);

			var new_title_value = $post_title.html().replaceAll(old_title, new_title);
			$post_title.html(new_title_value);
			var html_title_value = document.title.replace(old_title, new_title);
			document.title = html_title_value;

			//  // Should highlight the title but it's highlighting the whole post
			//  $post_title.addClass('oortle-diff-changed').show();
			//  setTimeout("$post_title.removeClass('oortle-diff-changed');", 3000);
		} else {
			console.log("error -- received data about post = " + title);
		}
	}

	var timer = null;
	function update_timer () {
		clearTimeout(timer);
		var $counter = $livepress.find('.lp-updated-counter'),
			current = $counter.data('min');

		current += 1;

		if ( current === 0 ) {
			$counter.html('updated just now');
		} else if ( current === 1 ) {
			$counter.html('updated 1 minute ago');
		} else if ( current <= 60 ) {
			$counter.html('updated ' + current + ' minutes ago');
		} else {
			$counter.html('no recent updates');
			return;
		}

		$counter.data('min', current);

		timer = setTimeout(update_timer, 60 * 1000);
	}
	timer = setTimeout(update_timer, 60 * 1000);

	function post_update (data) {
		console.log("post_update with data = ", data);
		if ('event' in data && data.event === 'post_title') {
			return post_title_update(data.data);
		}
		var paused_data = data.pop();
		handle_page_title_update(data);

		if (paused) {
			posts_on_hold.push(data);
			if (typeof(update_box) !== "undefined") {
				var updated_at = paused_data.updated_at;
				for (var i = 0; i < paused_data.post_updates.length; i += 1) {
					update_box.post_update(paused_data.post_updates[i], updated_at);
				}
			}
		} else {
			post_dom_manipulator.update(data, {effects_display:window.is_active});
			update_live_updates();
		}
		trigger_action_on_view();
		sounds.postUpdated.play();

		$livepress.find('.lp-updated-counter').data('min', -1);
		$livepress.find('.lp-bar .lp-status').removeClass('lp-off').addClass('lp-on');
		update_timer();
	}

	function new_post_update_box (post, topic, msg_id) {
		if (config.new_post_msg_id === msg_id) {
			return;
		}

		update_box.new_post(post.title, post.link, post.author, post.updated_at_gmt);
		sounds.postUpdated.play();
	}

	function new_post_widget (post) {
		trigger_action_on_view();
		widget.post_alert(post.title, post.link, post.author, post.updated_at_gmt);
		sounds.postUpdated.play();
	}

	var imSubscribing = false;
	function imSubscribeCallback (userName, imType) {

		if (imSubscribing || userName.length === 0 || userName === "username") {
			return;
		}

		imSubscribing = true;
		widget.imFeedbackSpin(true);

		// TODO handle imType on backend
		var postData = { action:'new_im_follower', user_name:userName, im_type:imType, post_id:config.post_id };

		jQuery.post(config.ajax_url, postData, function (response) {
			widget.handleImFeedback(response, userName);
			imSubscribing = false;
		});
	}

	function bindPageActivity () {
		var animateLateUpdates = function () {
			var updates = jQuery(".unfocused-lp-update");
			var old_bg = updates.data("oldbg") || "#FFF";
			updates.animate({backgroundColor:old_bg}, 4000, "swing", function () {
				jQuery(this).removeClass("unfocused-lp-update").css('background-color', '');
			});
		};

		var title = jQuery("title");
		title.data("text", title.text());
		title.data("updates", 0);
		$window.focus(function () {
			this.is_active = true;
			title.text(title.data("text"));
			title.data("updates", 0);
			animateLateUpdates();
		});

		$window.blur(function () {
			this.is_active = false;
		});
	}

	window.is_active = true;
	$window.ready(bindPageActivity);

	if ( null !== document.getElementById( 'lp-update-box' ) ) {
		update_box = new Livepress.Ui.UpdateBoxView(on_home_page);
	}

	if ( null !== document.getElementById( 'livepress') ) {
		widget = new Livepress.Ui.View(config.disable_comments);
		widget.set_comment_num(comment_count);
		update_live_updates();
		var feed_link = encodeURIComponent(config.feed_sub_link);
		var feed_title = encodeURIComponent(config.feed_title);
		widget.add_link_to_greader("http://www.google.com/ig/addtoreader?et=gEs490VY&source=ign_pLt&feedurl=" + feed_link + "&feedtitle=" + feed_title);
	}

	// Just connect to LivePress if there is any of the views present
	if ( update_box !== undefined || widget !== undefined ) {
		var connection_id = "#livepress-connection";
		jQuery(document.body).append('<div id="' + connection_id + '"><!-- --></div>');

		var new_post_topic = "|livepress|" + config.site_url + "|post-new-update";

		comet.attachEvent('connected', connected);
		comet.attachEvent('error', comet_error_callback);

		// Subscribe to the post, comments and 'new posts' topics.
		// post_update_msg_id, comment_msg_id and new_post_msg_id have the message hash

		// Handle LivePress update box if present
		if ( update_box !== undefined ) {
			if (on_home_page) {
				var opt1 = config.new_post_msg_id ? {last_id:config.new_post_msg_id} : {fetch_all:true};
				comet.subscribe(new_post_topic, new_post_update_box, opt1);
				comet.connect(); // We always subscribe on main page to get new post notifications
			}
		}

		// Handle LivePress control widget if present
		if ( widget !== undefined ) {
			comet.attachEvent('reconnected', widget.connected);
			comet.attachEvent('disconnected', widget.disconnected);

			var post_update_topic = "|livepress|" + config.site_url + "|post-" + config.post_id;
			var comment_update_topic = "|livepress|" + config.site_url + "|post-" + config.post_id + "_comment";

			if (config.can_edit_comments) {
				comment_update_topic += "-logged";
			}

			// Create dom manipulator of the post and the comments
			post_dom_manipulator = new Livepress.DOMManipulator('#post_content_livepress', config.custom_background_color);
			comments_dom_manipulator = new Livepress.DOMManipulator('#post_comments_livepress', config.custom_background_color);

			var opt = config.new_post_msg_id ? {last_id:config.new_post_msg_id} : {fetch_all:true};
			comet.subscribe(new_post_topic, new_post_widget, opt);
			if (!config.disable_comments && config.comment_live_updates_default) {
				opt = config.comment_msg_id ? {last_id:config.comment_msg_id} : {fetch_all:true};
				comet.subscribe(comment_update_topic, function () {
				}, opt); // just set options there
			}

			opt = config.post_update_msg_id ? {last_id:config.post_update_msg_id} : {fetch_all:true};
			comet.subscribe(post_update_topic, post_update, opt);

			widget.subscribeIm(imSubscribeCallback);

			widget.sound_control(
				Livepress.storage.get('settings-sound', config.sounds_default === undefined || config.sounds_default),
				function (save) {
					sounds.on();
					if (save) { Livepress.storage.set('settings-sound', "1"); }
				},
				function (save) {
					sounds.off();
					if (save) { Livepress.storage.set('settings-sound', ""); }
				}
			);

			widget.live_control(
				Livepress.storage.get('settings-live', true),
				function (save) {
					comet.connect();
					if (save) { Livepress.storage.set('settings-live', "1"); }
				},
				function (save) {
					comet.disconnect();
					if (save) { Livepress.storage.set('settings-live', ""); }
				}
			);

			if (!config.disable_comments) {
				widget.follow_comments_control(
					Livepress.storage.get('settings-comments', true),
					function (save) {
						comet.subscribe(comment_update_topic, comment_update);
						if (save) { Livepress.storage.set('settings-comments', "1"); }
					},
					function (save) {
						comet.unsubscribe(comment_update_topic, comment_update);
						if (save) { Livepress.storage.set('settings-comments', ""); }
					}
				);
			}

			widget.scroll_control(
				Livepress.storage.get('settings-scroll', config.autoscroll === undefined || config.autoscroll),
				function (save) {
					Livepress.Scroll.settings_enabled = true;
					if (save) { Livepress.storage.set('settings-scroll', "1"); }
				},
				function (save) {
					Livepress.Scroll.settings_enabled = false;
					if (save) { Livepress.storage.set('settings-scroll', ""); }
				}
			);
		}
	}
};

jQuery(function () {
	Livepress.Comment = (function () {
		var sending = false;

		var set_comment_status = function (status) {
			var $status = jQuery('#oortle-comment-status');
			if ($status.length === 0) {
				jQuery('#submit').after("<span id='oortle-comment-status'></span>");
				$status = jQuery('#oortle-comment-status');
			}
			$status.text(status);
		};

		var unblock_comment_textarea = function (eraseText) {
			var comment_textarea = jQuery("#comment");
			comment_textarea.attr("disabled", false);

			if (eraseText) {
				comment_textarea.val('');
				jQuery("#cancel-comment-reply-link").click();
			}
		};

		var send = function () {
			try {
				if (sending) {
					return false;
				}
				sending = true;

				var $btn = jQuery('#submit');
				var btn_text = $btn.attr("value");

				$btn.attr("value", "Sending...");
				$btn.attr("disabled", true);
				jQuery("textarea#comment").attr("disabled", true);
				set_comment_status("");

				var params = {};
				params.oortle_send_comment = true;
				var form = document.getElementById('commentform') || document.getElementById('comment-form');
				params.comment_post_ID = form.comment_post_ID.value;
				if (typeof(form.comment_parent) !== 'undefined') {
					params.comment_parent = form.comment_parent.value;
				}
				params.comment = form.comment.value;
				// FIXME: this won't work when accepting comments without email and name fields
				// sent author is same as comment then. Ex. author:	test!@ comment:	test!@
				params.author = form.elements[0].value;
				params.email = form.elements[1].value;
				params.url = form.elements[2].value;
				params._wp_unfiltered_html_comment = (form._wp_unfiltered_html_comment !== undefined) ? form._wp_unfiltered_html_comment.value : '';
				params.redirect_to = '';
				params.livepress_update = 'true';
				params.action = 'post_comment';
				params._ajax_nonce = Livepress.Config.ajax_nonce;

				Livepress.sounds.commented.play();

				jQuery.ajax({
					url:     Livepress.Config.site_url + '/wp-admin/admin-ajax.php',
					type:    'post',
					dataType:'json',
					data:    params,
					error:   function (request, textStatus, errorThrown) {
						// TODO: Display message that send failed.
						console.log("comment response: " + request.status + ' :: ' + request.statusText);
						console.log("comment ajax failed: %s", textStatus);
						set_comment_status("Unknown error.");
						unblock_comment_textarea(false);
					},
					success: function (data, textStatus) {
						// TODO: Improve display message that send successed.
						set_comment_status("Comment Status: " + data.msg);
						unblock_comment_textarea(data.code === "200");
					},
					complete:function (request, textStatus) {
						$btn = jQuery('#submit');
						sending = false;
						$btn.attr("value", btn_text);
						$btn.attr("disabled", false);
					}
				});
			} catch (error) {
				console.log("EXCEPTION: %s", error);
				set_comment_status("Sending error.");
			}

			return false;
		};

		var attach = function () {
			jQuery('#submit').click(send);
		};

		// WP only: we must hide new comment form before making any modifications to dom tree
		// otherwise wp javascripts which handle cancel link won't work anymore
		// we check if new comment is of same author and if user didn't modify it's contents meanwhile
		var before_live_comment = function (comment_data) {
			var comment_textarea = jQuery("#comment");
			if (comment_data.ajax_nonce === Livepress.Config.ajax_nonce && comment_textarea.val() === comment_data.content) {
				unblock_comment_textarea(true);
			}
		};

		var should_attach_comment = function (config) {
			var page_number = config.comment_page_number;
			if (config.comment_order === "asc") {
				return(page_number === 0 || page_number === config.comment_pages_count);
			} else {
				return(page_number <= 1);
			}
		};

		var get_comment_container = function (comment_id) {
			return jQuery("#comment-" + comment_id).parent().attr("id");
		};

		var on_comment_update = function (data, manipulator) {
			var manipulator_options = {
				custom_scroll_class:'#comment-' + data.comment_id
			};
			if (data.comment_parent === '0') {
				manipulator.update(data.diff, manipulator_options);
			} else { // updating threaded comment
				manipulator.update(data.comments_counter_only_diff, manipulator_options);

				var new_comment = jQuery(data.comment_html);
				// we want new comment to be animated as usual by DOMmanipuator.js
				new_comment.addClass('oortle-diff-inserted-block').hide();
				var parent = jQuery("#comment-" + data.comment_parent);
				var children = parent.children(".children");
				if (children.length === 0) {
					children = jQuery("<ul>").addClass("children").appendTo(parent);
				}
				children.append(new_comment);
				manipulator.display(true);
			}

			return true;
		};

		if (!Livepress.Config.disable_comments) {
			attach();
		}

		return {
			send:                 send,
			attach:               attach,
			before_live_comment:  before_live_comment,
			should_attach_comment:should_attach_comment,
			get_comment_container:get_comment_container,
			on_comment_update:    on_comment_update
		};
	}());
});
if (jQuery !== undefined) {
	jQuery.ajax = (function (jQajax) {
		return function () {
			if (OORTLE !== undefined && OORTLE.instance !== undefined && OORTLE.instance) {
				OORTLE.instance.flush();
			}
			return jQajax.apply(this, arguments);
		};
	}(jQuery.ajax));
}

Livepress.Ready = function () {

	var hooks = {
		post_comment_update:  Livepress.Comment.attach,
		before_live_comment:  Livepress.Comment.before_live_comment,
		should_attach_comment:Livepress.Comment.should_attach_comment,
		get_comment_container:Livepress.Comment.get_comment_container,
		on_comment_update:    Livepress.Comment.on_comment_update
	};
	return new Livepress.Ui.Controller(Livepress.Config, hooks);
};
jQuery.effects || (function($, undefined) {

	$.effects = {};

	// override the animation for color styles
	$.each(['backgroundColor', 'borderBottomColor', 'borderLeftColor',
		'borderRightColor', 'borderTopColor', 'borderColor', 'color', 'outlineColor'],
		function(i, attr) {
			$.fx.step[attr] = function(fx) {
				if (!fx.colorInit) {
					fx.start = getColor(fx.elem, attr);
					fx.end = getRGB(fx.end);
					fx.colorInit = true;
				}

				fx.elem.style[attr] = 'rgb(' +
					Math.max(Math.min(parseInt((fx.pos * (fx.end[0] - fx.start[0])) + fx.start[0], 10), 255), 0) + ',' +
					Math.max(Math.min(parseInt((fx.pos * (fx.end[1] - fx.start[1])) + fx.start[1], 10), 255), 0) + ',' +
					Math.max(Math.min(parseInt((fx.pos * (fx.end[2] - fx.start[2])) + fx.start[2], 10), 255), 0) + ')';
			};
		});

	// Color Conversion functions from highlightFade
	// By Blair Mitchelmore
	// http://jquery.offput.ca/highlightFade/

	// Parse strings looking for color tuples [255,255,255]
	function getRGB(color) {
		var result;

		// Check if we're already dealing with an array of colors
		if ( color && color.constructor == Array && color.length == 3 )
			return color;

		// Look for rgb(num,num,num)
		if (result = /rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(color))
			return [parseInt(result[1],10), parseInt(result[2],10), parseInt(result[3],10)];

		// Look for rgb(num%,num%,num%)
		if (result = /rgb\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*\)/.exec(color))
			return [parseFloat(result[1])*2.55, parseFloat(result[2])*2.55, parseFloat(result[3])*2.55];

		// Look for #a0b1c2
		if (result = /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(color))
			return [parseInt(result[1],16), parseInt(result[2],16), parseInt(result[3],16)];

		// Look for #fff
		if (result = /#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(color))
			return [parseInt(result[1]+result[1],16), parseInt(result[2]+result[2],16), parseInt(result[3]+result[3],16)];

		// Look for rgba(0, 0, 0, 0) == transparent in Safari 3
		if (result = /rgba\(0, 0, 0, 0\)/.exec(color))
			return colors['transparent'];

		// Otherwise, we're most likely dealing with a named color
		return colors[$.trim(color).toLowerCase()];
	}

	function getColor(elem, attr) {
		var color;

		do {
			// jQuery <1.4.3 uses curCSS, in 1.4.3 - 1.7.2 curCSS = css, 1.8+ only has css
			color = ($.curCSS || $.css)(elem, attr);

			// Keep going until we find an element that has color, or we hit the body
			if ( color != '' && color != 'transparent' || $.nodeName(elem, "body") )
				break;

			attr = "backgroundColor";
		} while ( elem = elem.parentNode );

		return getRGB(color);
	};

	// Some named colors to work with
	// From Interface by Stefan Petre
	// http://interface.eyecon.ro/

	var colors = {
		aqua:[0,255,255],
		azure:[240,255,255],
		beige:[245,245,220],
		black:[0,0,0],
		blue:[0,0,255],
		brown:[165,42,42],
		cyan:[0,255,255],
		darkblue:[0,0,139],
		darkcyan:[0,139,139],
		darkgrey:[169,169,169],
		darkgreen:[0,100,0],
		darkkhaki:[189,183,107],
		darkmagenta:[139,0,139],
		darkolivegreen:[85,107,47],
		darkorange:[255,140,0],
		darkorchid:[153,50,204],
		darkred:[139,0,0],
		darksalmon:[233,150,122],
		darkviolet:[148,0,211],
		fuchsia:[255,0,255],
		gold:[255,215,0],
		green:[0,128,0],
		indigo:[75,0,130],
		khaki:[240,230,140],
		lightblue:[173,216,230],
		lightcyan:[224,255,255],
		lightgreen:[144,238,144],
		lightgrey:[211,211,211],
		lightpink:[255,182,193],
		lightyellow:[255,255,224],
		lime:[0,255,0],
		magenta:[255,0,255],
		maroon:[128,0,0],
		navy:[0,0,128],
		olive:[128,128,0],
		orange:[255,165,0],
		pink:[255,192,203],
		purple:[128,0,128],
		violet:[128,0,128],
		red:[255,0,0],
		silver:[192,192,192],
		white:[255,255,255],
		yellow:[255,255,0],
		transparent: [255,255,255]
	};

	// Animations

	var classAnimationActions = ['add', 'remove', 'toggle'],
		shorthandStyles = {
			border: 1,
			borderBottom: 1,
			borderColor: 1,
			borderLeft: 1,
			borderRight: 1,
			borderTop: 1,
			borderWidth: 1,
			margin: 1,
			padding: 1
		};

	function getElementStyles() {
		var style = document.defaultView
				? document.defaultView.getComputedStyle(this, null)
				: this.currentStyle,
			newStyle = {},
			key,
			camelCase;

		// webkit enumerates style porperties
		if (style && style.length && style[0] && style[style[0]]) {
			var len = style.length;
			while (len--) {
				key = style[len];
				if (typeof style[key] == 'string') {
					camelCase = key.replace(/\-(\w)/g, function(all, letter){
						return letter.toUpperCase();
					});
					newStyle[camelCase] = style[key];
				}
			}
		} else {
			for (key in style) {
				if (typeof style[key] === 'string') {
					newStyle[key] = style[key];
				}
			}
		}

		return newStyle;
	}

	function filterStyles(styles) {
		var name, value;
		for (name in styles) {
			value = styles[name];
			if (
			// ignore null and undefined values
				value == null ||
					// ignore functions (when does this occur?)
					$.isFunction(value) ||
					// shorthand styles that need to be expanded
					name in shorthandStyles ||
					// ignore scrollbars (break in IE)
					(/scrollbar/).test(name) ||

					// only colors or values that can be converted to numbers
					(!(/color/i).test(name) && isNaN(parseFloat(value)))
				) {
				delete styles[name];
			}
		}

		return styles;
	}

	function styleDifference(oldStyle, newStyle) {
		var diff = { _: 0 }, // http://dev.jquery.com/ticket/5459
			name;

		for (name in newStyle) {
			if (oldStyle[name] != newStyle[name]) {
				diff[name] = newStyle[name];
			}
		}

		return diff;
	}

	$.effects.animateClass = function(value, duration, easing, callback) {
		if ($.isFunction(easing)) {
			callback = easing;
			easing = null;
		}

		return this.queue(function() {
			var that = $(this),
				originalStyleAttr = that.attr('style') || ' ',
				originalStyle = filterStyles(getElementStyles.call(this)),
				newStyle,
				className = that.attr('class') || "";

			$.each(classAnimationActions, function(i, action) {
				if (value[action]) {
					that[action + 'Class'](value[action]);
				}
			});
			newStyle = filterStyles(getElementStyles.call(this));
			that.attr('class', className);

			that.animate(styleDifference(originalStyle, newStyle), {
				queue: false,
				duration: duration,
				easing: easing,
				complete: function() {
					$.each(classAnimationActions, function(i, action) {
						if (value[action]) { that[action + 'Class'](value[action]); }
					});
					// work around bug in IE by clearing the cssText before setting it
					if (typeof that.attr('style') == 'object') {
						that.attr('style').cssText = '';
						that.attr('style').cssText = originalStyleAttr;
					} else {
						that.attr('style', originalStyleAttr);
					}
					if (callback) { callback.apply(this, arguments); }
					$.dequeue( this );
				}
			});
		});
	};

	$.fn.extend({
		_addClass: $.fn.addClass,
		addClass: function(classNames, speed, easing, callback) {
			return speed ? $.effects.animateClass.apply(this, [{ add: classNames },speed,easing,callback]) : this._addClass(classNames);
		},

		_removeClass: $.fn.removeClass,
		removeClass: function(classNames,speed,easing,callback) {
			return speed ? $.effects.animateClass.apply(this, [{ remove: classNames },speed,easing,callback]) : this._removeClass(classNames);
		},

		_toggleClass: $.fn.toggleClass,
		toggleClass: function(classNames, force, speed, easing, callback) {
			if ( typeof force == "boolean" || force === undefined ) {
				if ( !speed ) {
					// without speed parameter;
					return this._toggleClass(classNames, force);
				} else {
					return $.effects.animateClass.apply(this, [(force?{add:classNames}:{remove:classNames}),speed,easing,callback]);
				}
			} else {
				// without switch parameter;
				return $.effects.animateClass.apply(this, [{ toggle: classNames },force,speed,easing]);
			}
		},

		switchClass: function(remove,add,speed,easing,callback) {
			return $.effects.animateClass.apply(this, [{ add: add, remove: remove },speed,easing,callback]);
		}
	});

	// Effects
	$.extend($.effects, {
		version: "1.8.24",

		// Saves a set of properties in a data storage
		save: function(element, set) {
			for(var i=0; i < set.length; i++) {
				if(set[i] !== null) element.data("ec.storage."+set[i], element[0].style[set[i]]);
			}
		},

		// Restores a set of previously saved properties from a data storage
		restore: function(element, set) {
			for(var i=0; i < set.length; i++) {
				if(set[i] !== null) element.css(set[i], element.data("ec.storage."+set[i]));
			}
		},

		setMode: function(el, mode) {
			if (mode == 'toggle') mode = el.is(':hidden') ? 'show' : 'hide'; // Set for toggle
			return mode;
		},

		getBaseline: function(origin, original) { // Translates a [top,left] array into a baseline value
			// this should be a little more flexible in the future to handle a string & hash
			var y, x;
			switch (origin[0]) {
				case 'top': y = 0; break;
				case 'middle': y = 0.5; break;
				case 'bottom': y = 1; break;
				default: y = origin[0] / original.height;
			};
			switch (origin[1]) {
				case 'left': x = 0; break;
				case 'center': x = 0.5; break;
				case 'right': x = 1; break;
				default: x = origin[1] / original.width;
			};
			return {x: x, y: y};
		},

		// Wraps the element around a wrapper that copies position properties
		createWrapper: function(element) {

			// if the element is already wrapped, return it
			if (element.parent().is('.ui-effects-wrapper')) {
				return element.parent();
			}

			// wrap the element
			var props = {
					width: element.outerWidth(true),
					height: element.outerHeight(true),
					'float': element.css('float')
				},
				wrapper = $('<div></div>')
					.addClass('ui-effects-wrapper')
					.css({
						fontSize: '100%',
						background: 'transparent',
						border: 'none',
						margin: 0,
						padding: 0
					}),
				active = document.activeElement;

			// support: Firefox
			// Firefox incorrectly exposes anonymous content
			// https://bugzilla.mozilla.org/show_bug.cgi?id=561664
			try {
				active.id;
			} catch( e ) {
				active = document.body;
			}

			element.wrap( wrapper );

			// Fixes #7595 - Elements lose focus when wrapped.
			if ( element[ 0 ] === active || $.contains( element[ 0 ], active ) ) {
				$( active ).focus();
			}

			wrapper = element.parent(); //Hotfix for jQuery 1.4 since some change in wrap() seems to actually loose the reference to the wrapped element

			// transfer positioning properties to the wrapper
			if (element.css('position') == 'static') {
				wrapper.css({ position: 'relative' });
				element.css({ position: 'relative' });
			} else {
				$.extend(props, {
					position: element.css('position'),
					zIndex: element.css('z-index')
				});
				$.each(['top', 'left', 'bottom', 'right'], function(i, pos) {
					props[pos] = element.css(pos);
					if (isNaN(parseInt(props[pos], 10))) {
						props[pos] = 'auto';
					}
				});
				element.css({position: 'relative', top: 0, left: 0, right: 'auto', bottom: 'auto' });
			}

			return wrapper.css(props).show();
		},

		removeWrapper: function(element) {
			var parent,
				active = document.activeElement;

			if (element.parent().is('.ui-effects-wrapper')) {
				parent = element.parent().replaceWith(element);
				// Fixes #7595 - Elements lose focus when wrapped.
				if ( element[ 0 ] === active || $.contains( element[ 0 ], active ) ) {
					$( active ).focus();
				}
				return parent;
			}

			return element;
		},

		setTransition: function(element, list, factor, value) {
			value = value || {};
			$.each(list, function(i, x){
				var unit = element.cssUnit(x);
				if (unit[0] > 0) value[x] = unit[0] * factor + unit[1];
			});
			return value;
		}
	});

	function _normalizeArguments(effect, options, speed, callback) {
		// shift params for method overloading
		if (typeof effect == 'object') {
			callback = options;
			speed = null;
			options = effect;
			effect = options.effect;
		}
		if ($.isFunction(options)) {
			callback = options;
			speed = null;
			options = {};
		}
		if (typeof options == 'number' || $.fx.speeds[options]) {
			callback = speed;
			speed = options;
			options = {};
		}
		if ($.isFunction(speed)) {
			callback = speed;
			speed = null;
		}

		options = options || {};

		speed = speed || options.duration;
		speed = $.fx.off ? 0 : typeof speed == 'number'
			? speed : speed in $.fx.speeds ? $.fx.speeds[speed] : $.fx.speeds._default;

		callback = callback || options.complete;

		return [effect, options, speed, callback];
	}

	function standardSpeed( speed ) {
		// valid standard speeds
		if ( !speed || typeof speed === "number" || $.fx.speeds[ speed ] ) {
			return true;
		}

		// invalid strings - treat as "normal" speed
		if ( typeof speed === "string" && !$.effects[ speed ] ) {
			return true;
		}

		return false;
	}

	$.fn.extend({
		effect: function(effect, options, speed, callback) {
			var args = _normalizeArguments.apply(this, arguments),
			// TODO: make effects take actual parameters instead of a hash
				args2 = {
					options: args[1],
					duration: args[2],
					callback: args[3]
				},
				mode = args2.options.mode,
				effectMethod = $.effects[effect];

			if ( $.fx.off || !effectMethod ) {
				// delegate to the original method (e.g., .show()) if possible
				if ( mode ) {
					return this[ mode ]( args2.duration, args2.callback );
				} else {
					return this.each(function() {
						if ( args2.callback ) {
							args2.callback.call( this );
						}
					});
				}
			}

			return effectMethod.call(this, args2);
		},

		_show: $.fn.show,
		show: function(speed) {
			if ( standardSpeed( speed ) ) {
				return this._show.apply(this, arguments);
			} else {
				var args = _normalizeArguments.apply(this, arguments);
				args[1].mode = 'show';
				return this.effect.apply(this, args);
			}
		},

		_hide: $.fn.hide,
		hide: function(speed) {
			if ( standardSpeed( speed ) ) {
				return this._hide.apply(this, arguments);
			} else {
				var args = _normalizeArguments.apply(this, arguments);
				args[1].mode = 'hide';
				return this.effect.apply(this, args);
			}
		},

		// jQuery core overloads toggle and creates _toggle
		__toggle: $.fn.toggle,
		toggle: function(speed) {
			if ( standardSpeed( speed ) || typeof speed === "boolean" || $.isFunction( speed ) ) {
				return this.__toggle.apply(this, arguments);
			} else {
				var args = _normalizeArguments.apply(this, arguments);
				args[1].mode = 'toggle';
				return this.effect.apply(this, args);
			}
		},

		// helper functions
		cssUnit: function(key) {
			var style = this.css(key), val = [];
			$.each( ['em','px','%','pt'], function(i, unit){
				if(style.indexOf(unit) > 0)
					val = [parseFloat(style), unit];
			});
			return val;
		}
	});

	var baseEasings = {};

	$.each( [ "Quad", "Cubic", "Quart", "Quint", "Expo" ], function( i, name ) {
		baseEasings[ name ] = function( p ) {
			return Math.pow( p, i + 2 );
		};
	});

	$.extend( baseEasings, {
		Sine: function ( p ) {
			return 1 - Math.cos( p * Math.PI / 2 );
		},
		Circ: function ( p ) {
			return 1 - Math.sqrt( 1 - p * p );
		},
		Elastic: function( p ) {
			return p === 0 || p === 1 ? p :
				-Math.pow( 2, 8 * (p - 1) ) * Math.sin( ( (p - 1) * 80 - 7.5 ) * Math.PI / 15 );
		},
		Back: function( p ) {
			return p * p * ( 3 * p - 2 );
		},
		Bounce: function ( p ) {
			var pow2,
				bounce = 4;

			while ( p < ( ( pow2 = Math.pow( 2, --bounce ) ) - 1 ) / 11 ) {}
			return 1 / Math.pow( 4, 3 - bounce ) - 7.5625 * Math.pow( ( pow2 * 3 - 2 ) / 22 - p, 2 );
		}
	});

	$.each( baseEasings, function( name, easeIn ) {
		$.easing[ "easeIn" + name ] = easeIn;
		$.easing[ "easeOut" + name ] = function( p ) {
			return 1 - easeIn( 1 - p );
		};
		$.easing[ "easeInOut" + name ] = function( p ) {
			return p < .5 ?
				easeIn( p * 2 ) / 2 :
				easeIn( p * -2 + 2 ) / -2 + 1;
		};
	});

	$.effects.blind = function(o) {

		return this.queue(function() {

			// Create element
			var el = $(this), props = ['position','top','bottom','left','right'];

			// Set options
			var mode = $.effects.setMode(el, o.options.mode || 'hide'); // Set Mode
			var direction = o.options.direction || 'vertical'; // Default direction

			// Adjust
			$.effects.save(el, props); el.show(); // Save & Show
			var wrapper = $.effects.createWrapper(el).css({overflow:'hidden'}); // Create Wrapper
			var ref = (direction == 'vertical') ? 'height' : 'width';
			var distance = (direction == 'vertical') ? wrapper.height() : wrapper.width();
			if(mode == 'show') wrapper.css(ref, 0); // Shift

			// Animation
			var animation = {};
			animation[ref] = mode == 'show' ? distance : 0;

			// Animate
			wrapper.animate(animation, o.duration, o.options.easing, function() {
				if(mode == 'hide') el.hide(); // Hide
				$.effects.restore(el, props); $.effects.removeWrapper(el); // Restore
				if(o.callback) o.callback.apply(el[0], arguments); // Callback
				el.dequeue();
			});

		});

	};

})(jQuery);
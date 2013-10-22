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
/*jslint vars:true */
var Dashboard = Dashboard || {};

Dashboard.Controller = Dashboard.Controller || function () {
	var itsOn = false;
	var $paneHolder = jQuery( '#lp-pane-holder' );
	var $paneBookmarks = jQuery( '#lp-pane-holder .pane-bookmark' );
	var $hintText = $paneHolder.find( '.taghint' );
	var $hintedInput = $paneHolder.find( '.lp-input' );
	var $searchTabs = jQuery( '#twitter-search-subtabs li' );

	var init = function () {
		if ( Dashboard.Twitter !== undefined ) {
			setTimeout( function() {
				Dashboard.Twitter.init();
			}, 500 );
		}
		if ( Dashboard.Comments !== undefined ) {
			if ( Livepress.Config.disable_comments ) {
				jQuery( "#bar-controls .comment-count" ).hide();
				$paneHolder.find( 'div[data-pane-name="Comments"]' ).hide();
				Dashboard.Comments.disable();
			} else {
				Dashboard.Comments.init();
			}
		}

		/* Hints */
		$hintedInput.bind( 'click', function () {
			$hintText = jQuery( this ).parent( "div" ).find( '.taghint' );
			$hintText.css( "visibility", "hidden" );
		} );

		$hintText.bind( 'click', function () {
			var input = jQuery( this ).siblings( "input.lp-input" );
			input.focus();
			input.click();
		} );

		$hintedInput.bind( 'blur', function () {
			if ( jQuery( this ).val() === '' ) {
				$hintText.css( "visibility", "visible" );
			}
		} );

		// Add the new page tab
		var tab_markup = '<a id="content-livepress" class="hide-if-no-js wp-switch-editor switch-livepress">Real-Time</a>';
		jQuery( tab_markup ).insertAfter( '#content-tmce' );
	};

	// handle ON/OFF button
	var live_switcher = function ( evt ) {
		var target = jQuery( evt.srcElement || evt.target ), publish = jQuery( '#publish' ), switchWarning = jQuery( '#lp-switch-panel .warning' );

		itsOn = itsOn ? false : true;

		Dashboard.Helpers.saveEEState( itsOn.toString() );

		if ( itsOn ) {
			switchWarning.hide();
			publish.data( 'publishText', publish.val() );
			if ( publish.val() === "Update" ) {
				publish.val( 'Save and Refresh' );
			} else {
				publish.val( 'Publish and Refresh' );
			}
			publish.removeClass( "button-primary" ).addClass( "button-secondary" );
			jQuery( window ).trigger( 'start.livepress' );

			// Unbind the editor tab click - only showing live editor when live
			jQuery( '#wp-content-editor-tools' ).unbind();
		} else {
			switchWarning.show();
			publish.val( publish.data( 'publishText' ) ).removeClass( "button-secondary" ).addClass( "button-primary" );
			jQuery( window ).trigger( 'stop.livepress' );

			if ( target.hasClass( 'switch-html' ) ) {
				switchEditors.go( 'content', 'html' );
			} else if ( target.hasClass( 'switch-tmce' ) ) {
				switchEditors.go( 'content', 'tmce' );
			}
		}

		$paneHolder.toggleClass( 'scroll-pane' );
	};

	jQuery( '#wp-content-editor-tools' ).on( 'click', '#content-livepress', live_switcher );
	jQuery( '#poststuff' ).on( 'click', '.secondary-editor-tools .switch-tmce, .secondary-editor-tools .switch-html', live_switcher );
	Dashboard.Helpers.setupLivePressTabs();  //Set up the LivePress tabs after brief pause

	var hidePane = function () {
		jQuery( '#lp-pane-holder div.active' ).removeClass( 'active' );
		jQuery( '.lp-pane-active' ).slideUp().removeClass( 'lp-pane-active' );
		jQuery( '#lp-pane-holder span.count-update' ).show();
		jQuery.each( ['Twitter', 'Comments'], function ( i, name ) {
			if ( ! Dashboard[name].liveCounter.enabled ) {
				Dashboard[name].liveCounter.enable();
			}
		} );
	};

	var switchPane = function ( currPane ) {
		hidePane();
		var currPaneName = currPane.attr( 'data-pane-name' );
		jQuery.each( ['Twitter', 'Comments'], function ( i, name ) {
			if ( name === currPaneName ) {
				Dashboard[name].liveCounter.disable();
			}
		} );

		currPane.addClass( 'active' );
		currPane.siblings( '.lp-pane' ).slideDown().addClass( 'lp-pane-active' );
		currPane.find( 'span.count-update' ).hide();
	};

	var switchTab = function ( currTab ) {
		var currTabName = currTab.attr( 'data-tab-name' );
		console.log( currTabName );
		console.log( currTab );
		currTab.addClass( 'tabs' );
		jQuery( '.lp-search-pane' ).hide();
		var pane = jQuery( '#lp-on-top' ).find( 'div.' + currTabName ).show();
	};

	$searchTabs.bind( 'click', function () {
		if ( ! jQuery( this ).is( '.tabs' ) ) {
			$searchTabs.removeClass( 'tabs' );
			switchTab( jQuery( this ) );
		}
	} );

	$paneBookmarks.bind( 'click', function () {
		var $this = jQuery( this );
		if ( $this.is( '.active' ) === false ) {
			switchPane( $this );
		} else {
			hidePane();
		}
	} );

	init();

	if ( Dashboard.Helpers.getEEState() ) {
		live_switcher( {srcElement: null} );
	}
};

function DHelpers() {
	var SELF = this,
		pane_errors = document.getElementById( 'lp-pane-errors' ),
		$pane_errors = jQuery( pane_errors );

	function LiveCounter( container ) {
		var SELF = this;

		SELF.enable = function() {
			SELF.counterContainer = jQuery( container ).siblings( '.count-update' );
			SELF.count = 0;
			SELF.enabled = true;
			SELF.counterContainer.show();
		};

		SELF.reset = function() {
			SELF.count = 0;
			SELF.counterContainer.text( '0' );
		};

		SELF.disable = function() {
			SELF.enabled = false;
			SELF.count = 0;
			SELF.counterContainer.text( '0' ).hide();
		};

		SELF.increment = function( num ) {
			SELF.count += num || 1;
			SELF.counterContainer.text( SELF.count );
		};
	}

	SELF.saveEEState = function ( state ) {
		var postId = Livepress.Config.post_id;
		Livepress.storage.set( 'post-' + postId + '-eeenabled', state );
	};

	SELF.getEEState = function () {
		if ( jQuery.getUrlVar( 'action' ) === 'edit' ) {
			var postId = Livepress.Config.post_id;
			if ( ! postId ) {
				return false;
			}

			if ( Livepress.storage.get( 'post-' + postId + '-eeenabled' ) === 'true' ) {
				return true;
			}
		}

		return false;
	};

	SELF.hideAndMark = function ( el ) {
		el.hide().addClass( 'spinner-hidden' );
		return(el);
	};

	SELF.disableAndDisplaySpinner = function ( elToBlock ) {
		var $spinner = jQuery( "<div class='lp-spinner'></div>" );
		if ( elToBlock.is( "input" ) ) {
			elToBlock.attr( "disabled", true );
			var $addButton = this.hideAndMark( elToBlock.siblings( ".button" ) );
			$spinner.css( 'float', $addButton.css( "float" ) );
		}
		elToBlock.after( $spinner );
	};

	SELF.enableAndHideSpinner = function ( elToShow ) {
		elToShow.attr( "disabled", false );
		elToShow.siblings( ".button" ).show();
		elToShow.siblings( '.lp-spinner' ).remove();
	};

	SELF.setSwitcherState = function ( state ) {
		jQuery( document.getElementById( 'live-switcher' ) )
			.removeClass( state === 'connected' ? 'disconnected' : 'connected' )
			.addClass( state );
	};

	SELF.handleErrors = function ( errors ) {
		console.log( errors );
		$pane_errors.html('');
		$pane_errors.hide();
		jQuery.each( errors, function ( field, error ) {
			var error_p = document.createElement( 'p' );
			error_p.className = 'lp-pane-error ' + field;
			error_p.innerHtml = error;
			$pane_errors.append( error_p );
		} );
		$pane_errors.show();
	};

	SELF.clearErrors = function ( selector ) {
		if ( null !== pane_errors ) {
			jQuery( pane_errors.querySelectorAll( selector ) ).remove();
		}
	};

	SELF.hideErrors = function () {
		$pane_errors.hide();
	};

	SELF.createLiveCounter = function ( container ) {
		return new LiveCounter( container );
	};

	/**
	 * Ensure Live Blogging Tools & Real Time open/closed when post is live/not live
	 */
	SELF.setupLivePressTabs = function () {
		if ( jQuery('#livepress_status_meta_box').hasClass( 'live' ) ) {

			// Post marked live, switch on the tabs if closed.
			if ( jQuery( '.livepress-update-form' ).not(':visible') ) { // Is the LivePress live update form hidden?
				jQuery( '#content-livepress' ).trigger( 'click' ); // If so, click the tab to open it.
			}

			// Open the Live Blogging Tools area if not already open.
			if ( 'true' !== jQuery( 'a#blogging-tools-link' ).attr( 'aria-expanded' ) ) { // Is the live blogging closed?
				jQuery( 'a#blogging-tools-link' ).trigger( 'click' ); // If so, click the tab to open it.
			}
		} else {

			// Post not marked as live, switch off the tabs if open.
			if ( jQuery( '.livepress-update-form' ).is(':visible') ) { // Is the LivePress live update form visible?
				jQuery( 'a.switch-tmce' ).trigger( 'click' ); // If so, click the tab to close it.
			}

			// Close the Live Blogging Tools area if  already open.
			if ( 'true' === jQuery( 'a#blogging-tools-link' ).attr( 'aria-expanded' ) ) { // Is the live blogging open?
				jQuery( 'a#blogging-tools-link' ).trigger( 'click' ); // If so, click the tab to close it.
			}
		}
	};

}

Dashboard.Helpers = Dashboard.Helpers || new DHelpers();

/*global Livepress, Dashboard, console, OORTLE */
var Collaboration = Livepress.ensureExists(Collaboration);
Collaboration.chat_topic_id = function () {
	var topic = Collaboration.post_topic() + "_chat";
	console.log("Collaboration.chat_topic evaluation -- " + topic);
	return topic;
};

Collaboration.Chat = {
	enabled:   false,
	nextShade: false,
	html:      [
		'<div>',
		'<div id="chat-messages">',
		'<div id="inner-chat-messages"></div>',
		'</div>',
		'<div id="chat-form-message"><hr />',
		'<form>',
		'<input id="chat_message" type="text" name="chat_message" style="width:240px;" />',
		'<input id="chat-submit" type="submit" class="button" value="submit" />',
		'</form></div>',
		'</div>'
	].join(''),

	message_html: function (msg) {
		this.nextShade = !this.nextShade;
		var shade = this.nextShade ? ' shaded' : '';
		return '<div class="message' + shade + '">' +
			msg +
			'</div>';
	},

	/**
	 *  Adds a message to the #inner-chat-messages
	 *
	 *  @param  {Array}    data    First element should be the author name and second his message
	 */
	add_message: function (data) {
		var $chat = jQuery('#chat-messages'),
			$myDiv = jQuery('div#inner-chat-messages'),
			msg = '<strong>' + data[0] + '</strong>: ' + data[1];

		//jQuery('div#chat-messages').append(this.message_html(msg));
		$myDiv.append(Collaboration.Chat.message_html(msg));
		$chat.attr({
			scrollTop: $chat.attr("scrollHeight")
		});
	},

	/**
	 *  Sends a chat message to be published, can be used as an event callback or directly
	 *
	 *  @param  {String}  msg Message to be published, if not given, gets from the #chat_message
	 */
	send_message: function (msg) {
		if (typeof msg !== "string") {
			var $mes = jQuery('#chat_message');
			if ($mes.length && $mes.val() !== '') {
				msg = $mes.val();
				$mes.focus().val('');
			}
		}
		if (msg) {
			OORTLE.instance.publish(Collaboration.chat_topic_id(), [Collaboration.Author, msg]);
		}
		return false;
	},

	initialize: function () {
		if (!this.enabled) {
			var resizeMe = function () {
				var $livepress_chat_window = jQuery('#livepress-chat-window'),
					$dialogue = $livepress_chat_window.find('div:first'),
					$chats = jQuery('#chat-messages'),
					$chatinput = jQuery('#chat_message'),
					bw = jQuery('#chat-submit').width();

				$chats.height($livepress_chat_window.height() - jQuery('#chat-form-message').height() + 5);
				$chatinput.width($dialogue.width() - bw - 20);
			};

			console.log(this, this.html);
			jQuery('<div id="livepress-chat-window" title="Live Press <span>Live Chat</span>">' + this.html + '</div>')
				.dialog({
					/*position: 'right',*/
					width:      330,
					minWidth:   130,
					minHeight:  115,
					close:      function () {
						Collaboration.Chat.destroy();
					},
					resize:     resizeMe,
					dialogopen: resizeMe
				});
		}

		Collaboration.start(this);

		if (!Collaboration.Connected) {
			jQuery('input#chat-submit').disabled = true;
		}
	},

	create: function () {
		var $chat_submit = jQuery('input#chat-submit');
		$chat_submit.disabled = false;
		$chat_submit.click(this.send_message);

		OORTLE.instance.subscribe(Collaboration.chat_topic_id(), this.add_message);

		Collaboration.Chat.send_message("Im in!");
	},

	destroy: function () {
		this.enabled = false;

		jQuery("div#livepress-chat-window").remove();
		OORTLE.instance.unsubscribe(Collaboration.chat_topic_id(), this.add_message);
	}
};

Collaboration.Edit = Livepress.ensureExists(Collaboration.Edit);

jQuery.extend(Collaboration.Edit, {
	update_live_posts_number: function () {
		var length = jQuery("#livepress-canvas")
			.find(".livepress-update")
			.filter( function( index ) { return ( 0 === jQuery( this ).find(".livepress-update").length ); } )
			.length;
		OORTLE.Livepress.LivepressHUD.updateLivePosts(length);
	},

	editing_post_callback: function (data) {
		data = JSON.parse(data);

		if ( null !== data ) {
			OORTLE.Livepress.mergeLiveCanvasData(data);
		}
	}
});

Collaboration.post_topic = function () {
	return "|livepress|" + Livepress.Config.site_url + "|post-" + Livepress.Config.post_id;
};

Collaboration.edit_post_topic = function () {
	return Collaboration.post_topic() + "_edit";
};


jQuery.extend(Collaboration, {
	Connected: false,
	Author:    Livepress.Config.current_user,

	start: function (mode) {
		if (mode.enabled) {
			return;
		}
		mode.enabled = true;

		if (this.Connected) {
			mode.create();
		} else {
			this.initialize();
		}
	}
});

jQuery.extend(Collaboration.Edit, {
	enabled:                false,
	editor_dom_manipulator: null,
	runOnce:                false,

	initialize: function (args) {
		this.startArgs = args;
		Collaboration.start(this);

		this.refresh(this);
	},

	refresh: function (instance) {
		var args = null;
		if (!instance.runOnce) {
			instance.runOnce = true;

			if (instance.startArgs !== undefined) {
				args = instance.startArgs;
			}
		}

		instance.get_live_edition_data(args);

		/*setTimeout(function() {
			instance.refresh(instance);
		}, 15000);*/
	},

	create: function () {
		// Set the oortle manipulator to add changes in tinyMCE chunks of live updates.
		this.editor_dom_manipulator = new Livepress.DOMManipulator(jQuery("#content_ifr").contents().find("body"));
		if (this.startArgs !== undefined && this.startArgs) {
			this.get_live_edition_data(this.startArgs);
		} else {
			this.get_live_edition_data();
		}
		this.update_live_posts_number();

		// Collaborative editing...
		var opt = Livepress.Config.post_edit_msg_id ? {last_id: Livepress.Config.post_edit_msg_id} : {fetch_all: true};
		OORTLE.instance.subscribe(Collaboration.edit_post_topic(), this.editing_post_callback, opt);
		// Readers online
		OORTLE.instance.subscribe("|subcount" + Collaboration.post_topic(), this.readers_callback);
	},

	destroy: function () {
		this.enabled = false;
		OORTLE.instance.unsubscribe(Collaboration.edit_post_topic(), this.editing_post_callback);
		Dashboard.Comments.unsubscribe_comment_channels();
		OORTLE.instance.unsubscribe(Collaboration.post_topic(), this.readers_callback);
		OORTLE.instance.unsubscribe("|subcount" + Collaboration.post_topic(), this.readers_callback);
		Dashboard.Twitter.unsubscribeTwitterChannels();
	},

	get_live_edition_data: function (args) {
		var handleGuestBloggers, handle_terms, success, error, params;

		handleGuestBloggers = function (guestBloggers) {
			if (guestBloggers === undefined) {
				return;
			}
			jQuery.each(guestBloggers, function (i, account) {
				Dashboard.Twitter.addGuestBlogger(account, true);
			});
		};

		handle_terms = function (terms) {
			var getContainer, i;
			jQuery.each(terms, function (i, term) {
				Dashboard.Twitter.addTerm(term, true);
			});

			getContainer = function () {
				return jQuery('#lp-twitter-results');
			};

			for (i = 0; i < Dashboard.Twitter.terms.length; i++) {
				Dashboard.Twitter.renderStaticSearchResults(Dashboard.Twitter.terms[i], getContainer, 5);
			}
		};

		success = function (env) {
			if (env) {
				Dashboard.Comments.clear_container_and_count(env.comments);
				handleGuestBloggers(env.guest_bloggers);
				handle_terms(env.terms);
			}
		};

		error = function () {
			// Fetch just comment count, of list of comments can't be retrived
			Dashboard.Comments.get_comments_number_from_wp();
			// subscribe anyway if timeout or other error
			Dashboard.Comments.subscribe_comment_channels();
		};

		if (!args) {
			params = {
				action:           'collaboration_get_live_edition_data',
				_ajax_nonce:      Livepress.Config.ajax_nonce,
				post_id:          Livepress.Config.post_id,
				livepress_action: true
			};
			jQuery.ajax({
				type:     "GET",
				dataType: "json",
				url:      Livepress.Config.site_url + '/wp-admin/admin-ajax.php',
				data:     params,
				success:  success,
				error:    error
			});
		} else {
			success(args);
		}
	},

	readers_callback: function (data) {
		console.log("Collaboration.readers_callback data -- " + data);
		OORTLE.Livepress.LivepressHUD.updateReaders(data.count);
	}
});

Collaboration.Modes = [Collaboration.Chat, Collaboration.Edit];

Collaboration.connected = function () {
	var i;

	if (!Collaboration.Connected) {
		Collaboration.Connected = true;

		for (i = 0; i < Collaboration.Modes.length; i++) {
			if (Collaboration.Modes[i].enabled) {
				Collaboration.Modes[i].create();
			}
		}

		Dashboard.Helpers.clearErrors('*');
		Dashboard.Helpers.hideErrors();
		Dashboard.Helpers.setSwitcherState('connected');

		console.log("Collaboration.connected");
	}
};

Collaboration.disconnected = function () {
	var i;

	if (Collaboration.Connected) {
		Collaboration.Connected = false;

		for (i = 0; i < Collaboration.Modes.length; i++) {
			Collaboration.Modes[i].destroy();
		}

		Dashboard.Helpers.handleErrors({ disconnected: Collaboration.errorMessages.disconnected });
		Dashboard.Helpers.setSwitcherState('disconnected');

		console.log("Collaboration.disconnected");
	}
};

Collaboration.reconnect = function () {
	if (!this.Connected) {
		Dashboard.Helpers.clearErrors('.connection');
		OORTLE.instance.reconnect();
	}
};

Collaboration.errorMessages = {
	max_connection_attempts_reached: '<strong>Warning:</strong> The connection to the server has been lost. Will try to reconnect in some time.', // It's really Math.rand
	server_list_empty:               '<strong>Warning:</strong> The connection to server has been lost. Please try to reconnect later.',
	disconnected:                    '<strong>Warning:</strong> The connection to the server has been lost.',
	message_order_broken:            '<strong>Warning:</strong> Syncronization of live editor seems to be lost. Try to enable/disable live editor or reload page.',
	cache_empty:                     '<strong>Warning:</strong> Collaboration state may be out of sync. Try to reload page.',
	cache_miss:                      '<strong>Warning:</strong> Collaboration may be out of sync. Try to reload page.'
};

Collaboration.onError = function (key, arg) {
	var errors = {};
	if (Collaboration.errorMessages.hasOwnProperty(key)) {
		errors[key] = Collaboration.errorMessages[key].replace("{1}", arg);
	} else {
		errors[key] = arg + "[" + key + "]";
	}
	Dashboard.Helpers.handleErrors(errors);
	Dashboard.Helpers.setSwitcherState('disconnected');
	console.log("Collaboration.onError", arguments);
};

Collaboration.initialize = function () {
	if(!OORTLE.instance || !OORTLE.server_list_location) {
		window.setTimeout(Collaboration.initialize, 100); // OORTLE not loaded? try a bit
	} else
	if (!this.Connected) {
		OORTLE.instance.attachEvent('connected', Collaboration.connected);
		OORTLE.instance.attachEvent('state_changed', function (oldState, newState) {
			if (newState === 'connected') {
				Collaboration.connected();
			}
		});
		OORTLE.instance.attachEvent('disconnected', Collaboration.disconnected);
		OORTLE.instance.attachEvent('error', Collaboration.onError);

		OORTLE.instance.connect();
	}
};

/*global Dashboard, console, Collaboration, OORTLE, Livepress, tinyMCE */
if (Dashboard.Comments === undefined) {
	Dashboard.Comments = (function () {
		var comments_on_hold = [];
		var hold_comments = false;
		var prev_comment_was_even = true;
		var disabled = false;

		var new_comment_post_topic = function () {
			return Collaboration.post_topic() + "_new_comment";
		};

		var approved_comment_post_topic = function () {
			return Collaboration.post_topic() + "_comment";
		};

		var liveCounter = Dashboard.Helpers.createLiveCounter('#live-comments-mark');

		var new_comment_callback = function (data) {
			console.log("Dashboard.Comments.new_comment_callback: " + data.comment_id);

			if (liveCounter.enabled) {
				liveCounter.increment();
			}

			if (hold_comments) {
				comments_on_hold.push(data);
			} else {
				var commentDiv = jQuery("#lp-comment-" + data.comment_id);
				if (commentDiv.length <= 0 && data.comment_id !== undefined) {
					commentDiv = Dashboard.Comments.Builder.createCommentDiv(data, prev_comment_was_even);
					prev_comment_was_even = !prev_comment_was_even;
					var contentDiv = commentDiv.find(".comment");
					var rowActions = Dashboard.Comments.Builder.prepareCommentActions(data.comment_id, data);
					contentDiv.append(rowActions);
					OORTLE.Livepress.LivepressHUD.sumToComments(1);
				} else {
					commentDiv.removeClass("approved").removeClass("unapproved");
				}

				commentDiv.addClass(data.status);
			}

			var placeholder = document.getElementById( 'lp-new-comments-notice' );
			if ( null !== placeholder ) {
				jQuery( placeholder ).remove();
			}
		};

		var approved_comment_callback = function (data) {
			console.log("Collaboration.approved_comment_callback");
			data.status = 'approved';
			new_comment_callback(data);
		};

		var bind_pause_on_hover = function () {
			jQuery('#live-comments-pane').hover(function (e) {
				hold_comments = true;
				liveCounter.enable();
			}, function (e) {
				hold_comments = false;
				var data;
				while ((data = comments_on_hold.shift())) {
					new_comment_callback(data);
				}
				liveCounter.disable();
			});
		};

		return {
			unsubscribe_comment_channels: function () {
				if (disabled) {
					return;
				}
				OORTLE.instance.unsubscribe(new_comment_post_topic(), new_comment_callback);
				OORTLE.instance.unsubscribe(approved_comment_post_topic(), approved_comment_callback);
			},

			subscribe_comment_channels: function (msgId) {
				if (disabled) {
					return;
				}
				// Live Comments - unnapproved
				var opt = msgId ? {
					last_id: msgId
				} : {
					fetch_all: true
				};

				OORTLE.instance.subscribe(new_comment_post_topic(), new_comment_callback, opt);
				// Live Comments - approved
				opt = msgId ? {
					last_id: msgId
				} : {
					fetch_all: true
				};
				OORTLE.instance.subscribe(approved_comment_post_topic(), approved_comment_callback, opt);
			},

			clear_container_and_count: function (env) {
				if (disabled) {
					return;
				}
				// clear comments container and count of comments
				OORTLE.Livepress.LivepressHUD.updateComments(0);
				if (env.comments.length) {
					jQuery("#lp-comments-results").html('');
					jQuery.each(env.comments, function (i, comment) {
						new_comment_callback(comment);
					});
				}
				this.subscribe_comment_channels(env.comment_msg_id);
			},

			get_comments_number_from_wp: function () {
				if (disabled) {
					return;
				}
				var params = {};
				params.action = 'collaboration_comments_number';
				params.post_id = Livepress.Config.post_id;
				jQuery.ajax({
					url:      Livepress.Config.site_url + '/wp-admin/admin-ajax.php',
					type:     'post',
					dataType: 'json',
					data:     params,

					success: function (data, textStatus) {
						console.log("Collaboration.comments_number -- " + data);
						OORTLE.Livepress.LivepressHUD.updateComments(data);
					}
				});
			},

			liveCounter: liveCounter,

			disable: function () {
				disabled = true;
			},

			init: function () {
				if (disabled) {
					return;
				}
				liveCounter.enable();
				bind_pause_on_hover();
			}
		};
	}());
}

/**
 * Contains functions which build new comment div to be later displayed
 * in real-time editor dashboard under comments tab
 */
if (Dashboard.Comments.Builder === undefined) {
	Dashboard.Comments.Builder = (function () {
		var createCommentDiv = function (data, even) {
			if (data.comment_id === undefined) {
				return null;
			}
			var commentDiv = jQuery("<div id='lp-comment-" + data.comment_id + "' class='comment-item " + ( even ? 'even' : 'odd' ) + "'></div>");
			var url = data.comment_url;

			var timestamp = data.comment_gmt.parseGMT();

			var createdAtEl;

			if (data.status === "approved") {
				createdAtEl = jQuery("<a href='" + url + "' target='_blank'>" + timestamp + "</a>");
				createdAtEl.addClass('lp-comment-link');
			} else {
				createdAtEl = jQuery("<span>" + timestamp + "</span>");
			}

			// create comment's author div
			var authorDiv = jQuery("<div class='lp-comment-author author'>");
			authorDiv.append(data.avatar_url);
			if (data.author_url) {
				var authorLink = jQuery("<a></a>").text(data.author).attr("href", data.author_url);
				authorDiv.append(jQuery("<strong></strong>").append(authorLink));
			} else {
				authorDiv.append(jQuery("<strong>" + data.author + "</strong>"));
			}
			authorDiv.append("<br/>").append(createdAtEl);
			commentDiv.append(authorDiv);

			var commentsContainer = jQuery("#lp-comments-results");

			var contentDiv = jQuery("<div class='lp-comment comment'></div>");
			contentDiv.append(jQuery("<p>" + data.content + "</p>"));
			commentDiv.append(contentDiv);
			commentsContainer.prepend(commentDiv);
			return commentDiv;
		};

		var prepareCommentActions = function (commentId, data) {
			var commentLink = function (klass, link, skipPipe) {
				var span = jQuery("<span></span>").addClass(klass);
				if (!skipPipe) {
					span.text(" | ");
				}
				span.append(link);
				return span;
			};

			var href = location.href;
			var linkForSpamAndTrash = href.substring(0, href.lastIndexOf('/')) + "/edit-comments.php";
			var defaultAjaxData = {
				_ajax_nonce:      Livepress.Config.ajax_nonce,
				id:               commentId,
				livepress_action: 1
			};

			var linkTag = function (title, href, text) {
				return jQuery("<a></a>").attr("href", href).text(text).attr('title', title);
			};

			var postAndCommentIds = "&p=" + Livepress.Config.post_id + "&c=" + commentId + "&_wpnonce=" + Livepress.Config.ajax_nonce;
			var linkAction = function (action) {
				return "comment.php?action=" + action + postAndCommentIds;
			};

			var rowActions = jQuery("<div class='row-actions'></div>");

			var postLink = linkTag("Copy the commenter name and full text into the post text box", "#", "Send to editor");
			rowActions.append(commentLink('post', postLink, true));
			var approveLink = linkTag("Approve this comment", linkAction('approvecomment'), "Approve");
			rowActions.append(commentLink('approve', approveLink));
			var unapproveLink = linkTag("Unapprove this comment", linkAction("unapprovecomment"), "Unapprove");
			rowActions.append(commentLink('unapprove', unapproveLink));
			var spamLink = linkTag("Mark this comment as spam", linkAction("spamcomment"), "Spam");
			rowActions.append(commentLink('spam', spamLink));
			var trashLink = linkTag("Move this comment to the trash", linkAction("trashcomment"), "Trash");
			rowActions.append(commentLink('trash', trashLink));

			var removeComment = function () {
				jQuery("#lp-comment-" + commentId).css({
					'background-color': 'rgb(255, 170, 170)'
				}).fadeOut("slow", function () {
						jQuery(this).remove();
						OORTLE.Livepress.LivepressHUD.sumToComments(-1);
					});
			};

			var bindApprove = function (link) {
				link.click(function (e) {
					e.preventDefault();
					e.stopPropagation();

					jQuery.post("admin-ajax.php", jQuery.extend({}, defaultAjaxData, {
						'new':    'approved',
						action:   'dim-comment',
						dimClass: 'unapproved'
					}),
						function () {
							jQuery("#lp-comment-" + commentId).removeClass("unapproved").addClass("approved");
						}
					);
				});
			};

			var bindUnapprove = function (link) {
				link.click(function (e) {
					e.preventDefault();
					e.stopPropagation();
					jQuery.post("admin-ajax.php", jQuery.extend({}, defaultAjaxData, {
						'new':    'unapproved',
						action:   'dim-comment',
						dimClass: 'unapproved'
					}),
						function () {
							jQuery("#lp-comment-" + commentId).removeClass("approved").addClass("unapproved");
						}
					);
				});
			};

			bindApprove(approveLink);
			bindUnapprove(unapproveLink);

			spamLink.click(function (e) {
				e.preventDefault();
				e.stopPropagation();

				jQuery.post("admin-ajax.php",
					jQuery.extend({}, defaultAjaxData,
						{
							action: 'delete-comment',
							spam:   1,
							_url:   linkForSpamAndTrash
						}),
					removeComment
				);
			});

			trashLink.click(function (e) {
				e.preventDefault();
				e.stopPropagation();
				jQuery.post("admin-ajax.php",
					jQuery.extend({}, defaultAjaxData,
						{
							action: 'delete-comment',
							trash:  1,
							_url:   linkForSpamAndTrash
						}),
					removeComment
				);
			});

			postLink.bind('click', function (e) {
				e.preventDefault();
				e.stopPropagation();
				var t = tinyMCE.activeEditor;
				var textToAppend = "\n" + data.author + ": <blockquote>" + data.content + "</blockquote>";
				t.setContent(t.getContent() + textToAppend);
				return false;
			});

			return rowActions;
		};

		return {
			createCommentDiv:      createCommentDiv,
			prepareCommentActions: prepareCommentActions
		};
	}());
}

if (typeof window === "undefined" || window === null) {
	window = { twttr: {} };
}
if (window.twttr == null) {
	window.twttr = {};
}
if (typeof twttr === "undefined" || twttr === null) {
	twttr = {};
}

(function() {
	twttr.txt = {};
	twttr.txt.regexen = {};

	var HTML_ENTITIES = {
		'&': '&amp;',
		'>': '&gt;',
		'<': '&lt;',
		'"': '&quot;',
		"'": '&#39;'
	};

	// HTML escaping
	twttr.txt.htmlEscape = function(text) {
		return text && text.replace(/[&"'><]/g, function(character) {
			return HTML_ENTITIES[character];
		});
	};

	// Builds a RegExp
	function regexSupplant(regex, flags) {
		flags = flags || "";
		if (typeof regex !== "string") {
			if (regex.global && flags.indexOf("g") < 0) {
				flags += "g";
			}
			if (regex.ignoreCase && flags.indexOf("i") < 0) {
				flags += "i";
			}
			if (regex.multiline && flags.indexOf("m") < 0) {
				flags += "m";
			}

			regex = regex.source;
		}

		return new RegExp(regex.replace(/#\{(\w+)\}/g, function(match, name) {
			var newRegex = twttr.txt.regexen[name] || "";
			if (typeof newRegex !== "string") {
				newRegex = newRegex.source;
			}
			return newRegex;
		}), flags);
	}

	twttr.txt.regexSupplant = regexSupplant;

	// simple string interpolation
	function stringSupplant(str, values) {
		return str.replace(/#\{(\w+)\}/g, function(match, name) {
			return values[name] || "";
		});
	}

	twttr.txt.stringSupplant = stringSupplant;

	function addCharsToCharClass(charClass, start, end) {
		var s = String.fromCharCode(start);
		if (end !== start) {
			s += "-" + String.fromCharCode(end);
		}
		charClass.push(s);
		return charClass;
	}

	twttr.txt.addCharsToCharClass = addCharsToCharClass;

	// Space is more than %20, U+3000 for example is the full-width space used with Kanji. Provide a short-hand
	// to access both the list of characters and a pattern suitible for use with String#split
	// Taken from: ActiveSupport::Multibyte::Handlers::UTF8Handler::UNICODE_WHITESPACE
	var fromCode = String.fromCharCode;
	var UNICODE_SPACES = [
		fromCode(0x0020), // White_Space # Zs       SPACE
		fromCode(0x0085), // White_Space # Cc       <control-0085>
		fromCode(0x00A0), // White_Space # Zs       NO-BREAK SPACE
		fromCode(0x1680), // White_Space # Zs       OGHAM SPACE MARK
		fromCode(0x180E), // White_Space # Zs       MONGOLIAN VOWEL SEPARATOR
		fromCode(0x2028), // White_Space # Zl       LINE SEPARATOR
		fromCode(0x2029), // White_Space # Zp       PARAGRAPH SEPARATOR
		fromCode(0x202F), // White_Space # Zs       NARROW NO-BREAK SPACE
		fromCode(0x205F), // White_Space # Zs       MEDIUM MATHEMATICAL SPACE
		fromCode(0x3000)  // White_Space # Zs       IDEOGRAPHIC SPACE
	];
	addCharsToCharClass(UNICODE_SPACES, 0x009, 0x00D); // White_Space # Cc   [5] <control-0009>..<control-000D>
	addCharsToCharClass(UNICODE_SPACES, 0x2000, 0x200A); // White_Space # Zs  [11] EN QUAD..HAIR SPACE

	var INVALID_CHARS = [
		fromCode(0xFFFE),
		fromCode(0xFEFF), // BOM
		fromCode(0xFFFF) // Special
	];
	addCharsToCharClass(INVALID_CHARS, 0x202A, 0x202E); // Directional change

	twttr.txt.regexen.spaces_group = regexSupplant(UNICODE_SPACES.join(""));
	twttr.txt.regexen.spaces = regexSupplant("[" + UNICODE_SPACES.join("") + "]");
	twttr.txt.regexen.invalid_chars_group = regexSupplant(INVALID_CHARS.join(""));
	twttr.txt.regexen.punct = /\!'#%&'\(\)*\+,\\\-\.\/:;<=>\?@\[\]\^_{|}~\$/;
	twttr.txt.regexen.rtl_chars = /[\u0600-\u06FF]|[\u0750-\u077F]|[\u0590-\u05FF]|[\uFE70-\uFEFF]/mg;

	var nonLatinHashtagChars = [];
	// Cyrillic
	addCharsToCharClass(nonLatinHashtagChars, 0x0400, 0x04ff); // Cyrillic
	addCharsToCharClass(nonLatinHashtagChars, 0x0500, 0x0527); // Cyrillic Supplement
	addCharsToCharClass(nonLatinHashtagChars, 0x2de0, 0x2dff); // Cyrillic Extended A
	addCharsToCharClass(nonLatinHashtagChars, 0xa640, 0xa69f); // Cyrillic Extended B
	// Hebrew
	addCharsToCharClass(nonLatinHashtagChars, 0x0591, 0x05bf); // Hebrew
	addCharsToCharClass(nonLatinHashtagChars, 0x05c1, 0x05c2);
	addCharsToCharClass(nonLatinHashtagChars, 0x05c4, 0x05c5);
	addCharsToCharClass(nonLatinHashtagChars, 0x05c7, 0x05c7);
	addCharsToCharClass(nonLatinHashtagChars, 0x05d0, 0x05ea);
	addCharsToCharClass(nonLatinHashtagChars, 0x05f0, 0x05f4);
	addCharsToCharClass(nonLatinHashtagChars, 0xfb12, 0xfb28); // Hebrew Presentation Forms
	addCharsToCharClass(nonLatinHashtagChars, 0xfb2a, 0xfb36);
	addCharsToCharClass(nonLatinHashtagChars, 0xfb38, 0xfb3c);
	addCharsToCharClass(nonLatinHashtagChars, 0xfb3e, 0xfb3e);
	addCharsToCharClass(nonLatinHashtagChars, 0xfb40, 0xfb41);
	addCharsToCharClass(nonLatinHashtagChars, 0xfb43, 0xfb44);
	addCharsToCharClass(nonLatinHashtagChars, 0xfb46, 0xfb4f);
	// Arabic
	addCharsToCharClass(nonLatinHashtagChars, 0x0610, 0x061a); // Arabic
	addCharsToCharClass(nonLatinHashtagChars, 0x0620, 0x065f);
	addCharsToCharClass(nonLatinHashtagChars, 0x066e, 0x06d3);
	addCharsToCharClass(nonLatinHashtagChars, 0x06d5, 0x06dc);
	addCharsToCharClass(nonLatinHashtagChars, 0x06de, 0x06e8);
	addCharsToCharClass(nonLatinHashtagChars, 0x06ea, 0x06ef);
	addCharsToCharClass(nonLatinHashtagChars, 0x06fa, 0x06fc);
	addCharsToCharClass(nonLatinHashtagChars, 0x06ff, 0x06ff);
	addCharsToCharClass(nonLatinHashtagChars, 0x0750, 0x077f); // Arabic Supplement
	addCharsToCharClass(nonLatinHashtagChars, 0x08a0, 0x08a0); // Arabic Extended A
	addCharsToCharClass(nonLatinHashtagChars, 0x08a2, 0x08ac);
	addCharsToCharClass(nonLatinHashtagChars, 0x08e4, 0x08fe);
	addCharsToCharClass(nonLatinHashtagChars, 0xfb50, 0xfbb1); // Arabic Pres. Forms A
	addCharsToCharClass(nonLatinHashtagChars, 0xfbd3, 0xfd3d);
	addCharsToCharClass(nonLatinHashtagChars, 0xfd50, 0xfd8f);
	addCharsToCharClass(nonLatinHashtagChars, 0xfd92, 0xfdc7);
	addCharsToCharClass(nonLatinHashtagChars, 0xfdf0, 0xfdfb);
	addCharsToCharClass(nonLatinHashtagChars, 0xfe70, 0xfe74); // Arabic Pres. Forms B
	addCharsToCharClass(nonLatinHashtagChars, 0xfe76, 0xfefc);
	addCharsToCharClass(nonLatinHashtagChars, 0x200c, 0x200c); // Zero-Width Non-Joiner
	// Thai
	addCharsToCharClass(nonLatinHashtagChars, 0x0e01, 0x0e3a);
	addCharsToCharClass(nonLatinHashtagChars, 0x0e40, 0x0e4e);
	// Hangul (Korean)
	addCharsToCharClass(nonLatinHashtagChars, 0x1100, 0x11ff); // Hangul Jamo
	addCharsToCharClass(nonLatinHashtagChars, 0x3130, 0x3185); // Hangul Compatibility Jamo
	addCharsToCharClass(nonLatinHashtagChars, 0xA960, 0xA97F); // Hangul Jamo Extended-A
	addCharsToCharClass(nonLatinHashtagChars, 0xAC00, 0xD7AF); // Hangul Syllables
	addCharsToCharClass(nonLatinHashtagChars, 0xD7B0, 0xD7FF); // Hangul Jamo Extended-B
	addCharsToCharClass(nonLatinHashtagChars, 0xFFA1, 0xFFDC); // half-width Hangul
	// Japanese and Chinese
	addCharsToCharClass(nonLatinHashtagChars, 0x30A1, 0x30FA); // Katakana (full-width)
	addCharsToCharClass(nonLatinHashtagChars, 0x30FC, 0x30FE); // Katakana Chouon and iteration marks (full-width)
	addCharsToCharClass(nonLatinHashtagChars, 0xFF66, 0xFF9F); // Katakana (half-width)
	addCharsToCharClass(nonLatinHashtagChars, 0xFF70, 0xFF70); // Katakana Chouon (half-width)
	addCharsToCharClass(nonLatinHashtagChars, 0xFF10, 0xFF19); // \
	addCharsToCharClass(nonLatinHashtagChars, 0xFF21, 0xFF3A); //  - Latin (full-width)
	addCharsToCharClass(nonLatinHashtagChars, 0xFF41, 0xFF5A); // /
	addCharsToCharClass(nonLatinHashtagChars, 0x3041, 0x3096); // Hiragana
	addCharsToCharClass(nonLatinHashtagChars, 0x3099, 0x309E); // Hiragana voicing and iteration mark
	addCharsToCharClass(nonLatinHashtagChars, 0x3400, 0x4DBF); // Kanji (CJK Extension A)
	addCharsToCharClass(nonLatinHashtagChars, 0x4E00, 0x9FFF); // Kanji (Unified)
	// -- Disabled as it breaks the Regex.
	//addCharsToCharClass(nonLatinHashtagChars, 0x20000, 0x2A6DF); // Kanji (CJK Extension B)
	addCharsToCharClass(nonLatinHashtagChars, 0x2A700, 0x2B73F); // Kanji (CJK Extension C)
	addCharsToCharClass(nonLatinHashtagChars, 0x2B740, 0x2B81F); // Kanji (CJK Extension D)
	addCharsToCharClass(nonLatinHashtagChars, 0x2F800, 0x2FA1F); // Kanji (CJK supplement)
	addCharsToCharClass(nonLatinHashtagChars, 0x3003, 0x3003); // Kanji iteration mark
	addCharsToCharClass(nonLatinHashtagChars, 0x3005, 0x3005); // Kanji iteration mark
	addCharsToCharClass(nonLatinHashtagChars, 0x303B, 0x303B); // Han iteration mark

	twttr.txt.regexen.nonLatinHashtagChars = regexSupplant(nonLatinHashtagChars.join(""));

	var latinAccentChars = [];
	// Latin accented characters (subtracted 0xD7 from the range, it's a confusable multiplication sign. Looks like "x")
	addCharsToCharClass(latinAccentChars, 0x00c0, 0x00d6);
	addCharsToCharClass(latinAccentChars, 0x00d8, 0x00f6);
	addCharsToCharClass(latinAccentChars, 0x00f8, 0x00ff);
	// Latin Extended A and B
	addCharsToCharClass(latinAccentChars, 0x0100, 0x024f);
	// assorted IPA Extensions
	addCharsToCharClass(latinAccentChars, 0x0253, 0x0254);
	addCharsToCharClass(latinAccentChars, 0x0256, 0x0257);
	addCharsToCharClass(latinAccentChars, 0x0259, 0x0259);
	addCharsToCharClass(latinAccentChars, 0x025b, 0x025b);
	addCharsToCharClass(latinAccentChars, 0x0263, 0x0263);
	addCharsToCharClass(latinAccentChars, 0x0268, 0x0268);
	addCharsToCharClass(latinAccentChars, 0x026f, 0x026f);
	addCharsToCharClass(latinAccentChars, 0x0272, 0x0272);
	addCharsToCharClass(latinAccentChars, 0x0289, 0x0289);
	addCharsToCharClass(latinAccentChars, 0x028b, 0x028b);
	// Okina for Hawaiian (it *is* a letter character)
	addCharsToCharClass(latinAccentChars, 0x02bb, 0x02bb);
	// Combining diacritics
	addCharsToCharClass(latinAccentChars, 0x0300, 0x036f);
	// Latin Extended Additional
	addCharsToCharClass(latinAccentChars, 0x1e00, 0x1eff);
	twttr.txt.regexen.latinAccentChars = regexSupplant(latinAccentChars.join(""));

	// A hashtag must contain characters, numbers and underscores, but not all numbers.
	twttr.txt.regexen.hashSigns = /[#＃]/;
	twttr.txt.regexen.hashtagAlpha = regexSupplant(/[a-z_#{latinAccentChars}#{nonLatinHashtagChars}]/i);
	twttr.txt.regexen.hashtagAlphaNumeric = regexSupplant(/[a-z0-9_#{latinAccentChars}#{nonLatinHashtagChars}]/i);
	twttr.txt.regexen.endHashtagMatch = regexSupplant(/^(?:#{hashSigns}|:\/\/)/);
	twttr.txt.regexen.hashtagBoundary = regexSupplant(/(?:^|$|[^&a-z0-9_#{latinAccentChars}#{nonLatinHashtagChars}])/);
	twttr.txt.regexen.validHashtag = regexSupplant(/(#{hashtagBoundary})(#{hashSigns})(#{hashtagAlphaNumeric}*#{hashtagAlpha}#{hashtagAlphaNumeric}*)/gi);

	// Mention related regex collection
	twttr.txt.regexen.validMentionPrecedingChars = /(?:^|[^a-zA-Z0-9_!#$%&*@＠]|RT:?)/;
	twttr.txt.regexen.atSigns = /[@＠]/;
	twttr.txt.regexen.validMentionOrList = regexSupplant(
		'(#{validMentionPrecedingChars})' +  // $1: Preceding character
			'(#{atSigns})' +                     // $2: At mark
			'([a-zA-Z0-9_]{1,20})' +             // $3: Screen name
			'(\/[a-zA-Z][a-zA-Z0-9_\-]{0,24})?'  // $4: List (optional)
		, 'g');
	twttr.txt.regexen.validReply = regexSupplant(/^(?:#{spaces})*#{atSigns}([a-zA-Z0-9_]{1,20})/);
	twttr.txt.regexen.endMentionMatch = regexSupplant(/^(?:#{atSigns}|[#{latinAccentChars}]|:\/\/)/);

	// URL related regex collection
	twttr.txt.regexen.validUrlPrecedingChars = regexSupplant(/(?:[^A-Za-z0-9@＠$#＃#{invalid_chars_group}]|^)/);
	twttr.txt.regexen.invalidUrlWithoutProtocolPrecedingChars = /[-_.\/]$/;
	twttr.txt.regexen.invalidDomainChars = stringSupplant("#{punct}#{spaces_group}#{invalid_chars_group}", twttr.txt.regexen);
	twttr.txt.regexen.validDomainChars = regexSupplant(/[^#{invalidDomainChars}]/);
	twttr.txt.regexen.validSubdomain = regexSupplant(/(?:(?:#{validDomainChars}(?:[_-]|#{validDomainChars})*)?#{validDomainChars}\.)/);
	twttr.txt.regexen.validDomainName = regexSupplant(/(?:(?:#{validDomainChars}(?:-|#{validDomainChars})*)?#{validDomainChars}\.)/);
	twttr.txt.regexen.validGTLD = regexSupplant(/(?:(?:aero|asia|biz|cat|com|coop|edu|gov|info|int|jobs|mil|mobi|museum|name|net|org|pro|tel|travel|xxx)(?=[^0-9a-zA-Z]|$))/);
	twttr.txt.regexen.validCCTLD = regexSupplant(/(?:(?:ac|ad|ae|af|ag|ai|al|am|an|ao|aq|ar|as|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|cr|cs|cu|cv|cx|cy|cz|dd|de|dj|dk|dm|do|dz|ec|ee|eg|eh|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|in|io|iq|ir|is|it|je|jm|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mk|ml|mm|mn|mo|mp|mq|mr|ms|mt|mu|mv|mw|mx|my|mz|na|nc|ne|nf|ng|ni|nl|no|np|nr|nu|nz|om|pa|pe|pf|pg|ph|pk|pl|pm|pn|pr|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|ss|st|su|sv|sy|sz|tc|td|tf|tg|th|tj|tk|tl|tm|tn|to|tp|tr|tt|tv|tw|tz|ua|ug|uk|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|ye|yt|za|zm|zw)(?=[^0-9a-zA-Z]|$))/);
	twttr.txt.regexen.validPunycode = regexSupplant(/(?:xn--[0-9a-z]+)/);
	twttr.txt.regexen.validDomain = regexSupplant(/(?:#{validSubdomain}*#{validDomainName}(?:#{validGTLD}|#{validCCTLD}|#{validPunycode}))/);
	twttr.txt.regexen.validAsciiDomain = regexSupplant(/(?:(?:[a-z0-9#{latinAccentChars}]+)\.)+(?:#{validGTLD}|#{validCCTLD}|#{validPunycode})/gi);
	twttr.txt.regexen.invalidShortDomain = regexSupplant(/^#{validDomainName}#{validCCTLD}$/);

	twttr.txt.regexen.validPortNumber = regexSupplant(/[0-9]+/);

	twttr.txt.regexen.validGeneralUrlPathChars = regexSupplant(/[a-z0-9!\*';:=\+,\.\$\/%#\[\]\-_~|&#{latinAccentChars}]/i);
	// Allow URL paths to contain balanced parens
	//  1. Used in Wikipedia URLs like /Primer_(film)
	//  2. Used in IIS sessions like /S(dfd346)/
	twttr.txt.regexen.validUrlBalancedParens = regexSupplant(/\(#{validGeneralUrlPathChars}+\)/i);
	// Valid end-of-path chracters (so /foo. does not gobble the period).
	// 1. Allow =&# for empty URL parameters and other URL-join artifacts
	twttr.txt.regexen.validUrlPathEndingChars = regexSupplant(/[\+\-a-z0-9=_#\/#{latinAccentChars}]|(?:#{validUrlBalancedParens})/i);
	// Allow @ in a url, but only in the middle. Catch things like http://example.com/@user/
	twttr.txt.regexen.validUrlPath = regexSupplant('(?:' +
		'(?:' +
		'#{validGeneralUrlPathChars}*' +
		'(?:#{validUrlBalancedParens}#{validGeneralUrlPathChars}*)*' +
		'#{validUrlPathEndingChars}'+
		')|(?:@#{validGeneralUrlPathChars}+\/)'+
		')', 'i');

	twttr.txt.regexen.validUrlQueryChars = /[a-z0-9!?\*'\(\);:&=\+\$\/%#\[\]\-_\.,~|]/i;
	twttr.txt.regexen.validUrlQueryEndingChars = /[a-z0-9_&=#\/]/i;
	twttr.txt.regexen.extractUrl = regexSupplant(
		'('                                                            + // $1 total match
			'(#{validUrlPrecedingChars})'                                + // $2 Preceeding chracter
			'('                                                          + // $3 URL
			'(https?:\\/\\/)?'                                         + // $4 Protocol (optional)
			'(#{validDomain})'                                         + // $5 Domain(s)
			'(?::(#{validPortNumber}))?'                               + // $6 Port number (optional)
			'(\\/#{validUrlPath}*)?'                                   + // $7 URL Path
			'(\\?#{validUrlQueryChars}*#{validUrlQueryEndingChars})?'  + // $8 Query String
			')'                                                          +
			')'
		, 'gi');

	twttr.txt.regexen.validTcoUrl = /^https?:\/\/t\.co\/[a-z0-9]+/i;

	// cashtag related regex
	twttr.txt.regexen.cashtag = /[a-z]{1,6}(?:[._][a-z]{1,2})?/i;
	twttr.txt.regexen.validCashtag = regexSupplant('(^|#{spaces})(\\$)(#{cashtag})(?=$|\\s|[#{punct}])', 'gi');

	// These URL validation pattern strings are based on the ABNF from RFC 3986
	twttr.txt.regexen.validateUrlUnreserved = /[a-z0-9\-._~]/i;
	twttr.txt.regexen.validateUrlPctEncoded = /(?:%[0-9a-f]{2})/i;
	twttr.txt.regexen.validateUrlSubDelims = /[!$&'()*+,;=]/i;
	twttr.txt.regexen.validateUrlPchar = regexSupplant('(?:' +
		'#{validateUrlUnreserved}|' +
		'#{validateUrlPctEncoded}|' +
		'#{validateUrlSubDelims}|' +
		'[:|@]' +
		')', 'i');

	twttr.txt.regexen.validateUrlScheme = /(?:[a-z][a-z0-9+\-.]*)/i;
	twttr.txt.regexen.validateUrlUserinfo = regexSupplant('(?:' +
		'#{validateUrlUnreserved}|' +
		'#{validateUrlPctEncoded}|' +
		'#{validateUrlSubDelims}|' +
		':' +
		')*', 'i');

	twttr.txt.regexen.validateUrlDecOctet = /(?:[0-9]|(?:[1-9][0-9])|(?:1[0-9]{2})|(?:2[0-4][0-9])|(?:25[0-5]))/i;
	twttr.txt.regexen.validateUrlIpv4 = regexSupplant(/(?:#{validateUrlDecOctet}(?:\.#{validateUrlDecOctet}){3})/i);

	// Punting on real IPv6 validation for now
	twttr.txt.regexen.validateUrlIpv6 = /(?:\[[a-f0-9:\.]+\])/i;

	// Also punting on IPvFuture for now
	twttr.txt.regexen.validateUrlIp = regexSupplant('(?:' +
		'#{validateUrlIpv4}|' +
		'#{validateUrlIpv6}' +
		')', 'i');

	// This is more strict than the rfc specifies
	twttr.txt.regexen.validateUrlSubDomainSegment = /(?:[a-z0-9](?:[a-z0-9_\-]*[a-z0-9])?)/i;
	twttr.txt.regexen.validateUrlDomainSegment = /(?:[a-z0-9](?:[a-z0-9\-]*[a-z0-9])?)/i;
	twttr.txt.regexen.validateUrlDomainTld = /(?:[a-z](?:[a-z0-9\-]*[a-z0-9])?)/i;
	twttr.txt.regexen.validateUrlDomain = regexSupplant(/(?:(?:#{validateUrlSubDomainSegment]}\.)*(?:#{validateUrlDomainSegment]}\.)#{validateUrlDomainTld})/i);

	twttr.txt.regexen.validateUrlHost = regexSupplant('(?:' +
		'#{validateUrlIp}|' +
		'#{validateUrlDomain}' +
		')', 'i');

	// Unencoded internationalized domains - this doesn't check for invalid UTF-8 sequences
	twttr.txt.regexen.validateUrlUnicodeSubDomainSegment = /(?:(?:[a-z0-9]|[^\u0000-\u007f])(?:(?:[a-z0-9_\-]|[^\u0000-\u007f])*(?:[a-z0-9]|[^\u0000-\u007f]))?)/i;
	twttr.txt.regexen.validateUrlUnicodeDomainSegment = /(?:(?:[a-z0-9]|[^\u0000-\u007f])(?:(?:[a-z0-9\-]|[^\u0000-\u007f])*(?:[a-z0-9]|[^\u0000-\u007f]))?)/i;
	twttr.txt.regexen.validateUrlUnicodeDomainTld = /(?:(?:[a-z]|[^\u0000-\u007f])(?:(?:[a-z0-9\-]|[^\u0000-\u007f])*(?:[a-z0-9]|[^\u0000-\u007f]))?)/i;
	twttr.txt.regexen.validateUrlUnicodeDomain = regexSupplant(/(?:(?:#{validateUrlUnicodeSubDomainSegment}\.)*(?:#{validateUrlUnicodeDomainSegment}\.)#{validateUrlUnicodeDomainTld})/i);

	twttr.txt.regexen.validateUrlUnicodeHost = regexSupplant('(?:' +
		'#{validateUrlIp}|' +
		'#{validateUrlUnicodeDomain}' +
		')', 'i');

	twttr.txt.regexen.validateUrlPort = /[0-9]{1,5}/;

	twttr.txt.regexen.validateUrlUnicodeAuthority = regexSupplant(
		'(?:(#{validateUrlUserinfo})@)?'  + // $1 userinfo
			'(#{validateUrlUnicodeHost})'     + // $2 host
			'(?::(#{validateUrlPort}))?'        //$3 port
		, "i");

	twttr.txt.regexen.validateUrlAuthority = regexSupplant(
		'(?:(#{validateUrlUserinfo})@)?' + // $1 userinfo
			'(#{validateUrlHost})'           + // $2 host
			'(?::(#{validateUrlPort}))?'       // $3 port
		, "i");

	twttr.txt.regexen.validateUrlPath = regexSupplant(/(\/#{validateUrlPchar}*)*/i);
	twttr.txt.regexen.validateUrlQuery = regexSupplant(/(#{validateUrlPchar}|\/|\?)*/i);
	twttr.txt.regexen.validateUrlFragment = regexSupplant(/(#{validateUrlPchar}|\/|\?)*/i);

	// Modified version of RFC 3986 Appendix B
	twttr.txt.regexen.validateUrlUnencoded = regexSupplant(
		'^'                               + // Full URL
			'(?:'                             +
			'([^:/?#]+):\\/\\/'             + // $1 Scheme
			')?'                              +
			'([^/?#]*)'                       + // $2 Authority
			'([^?#]*)'                        + // $3 Path
			'(?:'                             +
			'\\?([^#]*)'                    + // $4 Query
			')?'                              +
			'(?:'                             +
			'#(.*)'                         + // $5 Fragment
			')?$'
		, "i");


	// Default CSS class for auto-linked lists (along with the url class)
	var DEFAULT_LIST_CLASS = "tweet-url list-slug";
	// Default CSS class for auto-linked usernames (along with the url class)
	var DEFAULT_USERNAME_CLASS = "tweet-url username";
	// Default CSS class for auto-linked hashtags (along with the url class)
	var DEFAULT_HASHTAG_CLASS = "tweet-url hashtag";
	// Default CSS class for auto-linked cashtags (along with the url class)
	var DEFAULT_CASHTAG_CLASS = "tweet-url cashtag";
	// Options which should not be passed as HTML attributes
	var OPTIONS_NOT_ATTRIBUTES = {'urlClass':true, 'listClass':true, 'usernameClass':true, 'hashtagClass':true, 'cashtagClass':true,
		'usernameUrlBase':true, 'listUrlBase':true, 'hashtagUrlBase':true, 'cashtagUrlBase':true,
		'usernameUrlBlock':true, 'listUrlBlock':true, 'hashtagUrlBlock':true, 'linkUrlBlock':true,
		'usernameIncludeSymbol':true, 'suppressLists':true, 'suppressNoFollow':true,
		'suppressDataScreenName':true, 'urlEntities':true, 'symbolTag':true, 'textWithSymbolTag':true, 'urlTarget':true,
		'invisibleTagAttrs':true, 'linkAttributeBlock':true, 'linkTextBlock': true
	};
	var BOOLEAN_ATTRIBUTES = {'disabled':true, 'readonly':true, 'multiple':true, 'checked':true};

	// Simple object cloning function for simple objects
	function clone(o) {
		var r = {};
		for (var k in o) {
			if (o.hasOwnProperty(k)) {
				r[k] = o[k];
			}
		}

		return r;
	}

	twttr.txt.tagAttrs = function(attributes) {
		var htmlAttrs = "";
		for (var k in attributes) {
			var v = attributes[k];
			if (BOOLEAN_ATTRIBUTES[k]) {
				v = v ? k : null;
			}
			if (v == null) continue;
			htmlAttrs += " " + twttr.txt.htmlEscape(k) + "=\"" + twttr.txt.htmlEscape(v.toString()) + "\"";
		}
		return htmlAttrs;
	};

	twttr.txt.linkToText = function(entity, text, attributes, options) {
		if (!options.suppressNoFollow) {
			attributes.rel = "nofollow";
		}
		// if linkAttributeBlock is specified, call it to modify the attributes
		if (options.linkAttributeBlock) {
			options.linkAttributeBlock(entity, attributes);
		}
		// if linkTextBlock is specified, call it to get a new/modified link text
		if (options.linkTextBlock) {
			text = options.linkTextBlock(entity, text);
		}
		var d = {
			text: text,
			attr: twttr.txt.tagAttrs(attributes)
		};
		return stringSupplant("<a#{attr}>#{text}</a>", d);
	};

	twttr.txt.linkToTextWithSymbol = function(entity, symbol, text, attributes, options) {
		var taggedSymbol = options.symbolTag ? "<" + options.symbolTag + ">" + symbol + "</"+ options.symbolTag + ">" : symbol;
		text = twttr.txt.htmlEscape(text);
		var taggedText = options.textWithSymbolTag ? "<" + options.textWithSymbolTag + ">" + text + "</"+ options.textWithSymbolTag + ">" : text;

		if (options.usernameIncludeSymbol || !symbol.match(twttr.txt.regexen.atSigns)) {
			return twttr.txt.linkToText(entity, taggedSymbol + taggedText, attributes, options);
		} else {
			return taggedSymbol + twttr.txt.linkToText(entity, taggedText, attributes, options);
		}
	};

	twttr.txt.linkToHashtag = function(entity, text, options) {
		var hash = text.substring(entity.indices[0], entity.indices[0] + 1);
		var hashtag = twttr.txt.htmlEscape(entity.hashtag);
		var attrs = clone(options.htmlAttrs || {});
		attrs.href = options.hashtagUrlBase + hashtag;
		attrs.title = "#" + hashtag;
		attrs["class"] = options.hashtagClass;
		if (hashtag[0].match(twttr.txt.regexen.rtl_chars)){
			attrs["class"] += " rtl";
		}

		return twttr.txt.linkToTextWithSymbol(entity, hash, hashtag, attrs, options);
	};

	twttr.txt.linkToCashtag = function(entity, text, options) {
		var cashtag = twttr.txt.htmlEscape(entity.cashtag);
		var attrs = clone(options.htmlAttrs || {});
		attrs.href = options.cashtagUrlBase + cashtag;
		attrs.title = "$" + cashtag;
		attrs["class"] =  options.cashtagClass;

		return twttr.txt.linkToTextWithSymbol(entity, "$", cashtag, attrs, options);
	};

	twttr.txt.linkToMentionAndList = function(entity, text, options) {
		var at = text.substring(entity.indices[0], entity.indices[0] + 1);
		var user = twttr.txt.htmlEscape(entity.screenName);
		var slashListname = twttr.txt.htmlEscape(entity.listSlug);
		var isList = entity.listSlug && !options.suppressLists;
		var attrs = clone(options.htmlAttrs || {});
		attrs["class"] = (isList ? options.listClass : options.usernameClass);
		attrs.href = isList ? options.listUrlBase + user + slashListname : options.usernameUrlBase + user;
		if (!isList && !options.suppressDataScreenName) {
			attrs['data-screen-name'] = user;
		}

		return twttr.txt.linkToTextWithSymbol(entity, at, isList ? user + slashListname : user, attrs, options);
	};

	twttr.txt.linkToUrl = function(entity, text, options) {
		var url = entity.url;
		var displayUrl = url;
		var linkText = twttr.txt.htmlEscape(displayUrl);

		// If the caller passed a urlEntities object (provided by a Twitter API
		// response with include_entities=true), we use that to render the display_url
		// for each URL instead of it's underlying t.co URL.
		var urlEntity = (options.urlEntities && options.urlEntities[url]) || entity;
		if (urlEntity.display_url) {
			linkText = twttr.txt.linkTextWithEntity(urlEntity, options);
		}

		var attrs = clone(options.htmlAttrs || {});
		attrs.href = url;

		// set class only if urlClass is specified.
		if (options.urlClass) {
			attrs["class"] = options.urlClass;
		}

		// set target only if urlTarget is specified.
		if (options.urlTarget) {
			attrs.target = options.urlTarget;
		}

		if (!options.title && urlEntity.display_url) {
			attrs.title = urlEntity.expanded_url;
		}

		return twttr.txt.linkToText(entity, linkText, attrs, options);
	};

	twttr.txt.linkTextWithEntity = function (entity, options) {
		var displayUrl = entity.display_url;
		var expandedUrl = entity.expanded_url;

		// Goal: If a user copies and pastes a tweet containing t.co'ed link, the resulting paste
		// should contain the full original URL (expanded_url), not the display URL.
		//
		// Method: Whenever possible, we actually emit HTML that contains expanded_url, and use
		// font-size:0 to hide those parts that should not be displayed (because they are not part of display_url).
		// Elements with font-size:0 get copied even though they are not visible.
		// Note that display:none doesn't work here. Elements with display:none don't get copied.
		//
		// Additionally, we want to *display* ellipses, but we don't want them copied.  To make this happen we
		// wrap the ellipses in a tco-ellipsis class and provide an onCopy handler that sets display:none on
		// everything with the tco-ellipsis class.
		//
		// Exception: pic.twitter.com images, for which expandedUrl = "https://twitter.com/#!/username/status/1234/photo/1
		// For those URLs, display_url is not a substring of expanded_url, so we don't do anything special to render the elided parts.
		// For a pic.twitter.com URL, the only elided part will be the "https://", so this is fine.

		var displayUrlSansEllipses = displayUrl.replace(/…/g, ""); // We have to disregard ellipses for matching
		// Note: we currently only support eliding parts of the URL at the beginning or the end.
		// Eventually we may want to elide parts of the URL in the *middle*.  If so, this code will
		// become more complicated.  We will probably want to create a regexp out of display URL,
		// replacing every ellipsis with a ".*".
		if (expandedUrl.indexOf(displayUrlSansEllipses) != -1) {
			var displayUrlIndex = expandedUrl.indexOf(displayUrlSansEllipses);
			var v = {
				displayUrlSansEllipses: displayUrlSansEllipses,
				// Portion of expandedUrl that precedes the displayUrl substring
				beforeDisplayUrl: expandedUrl.substr(0, displayUrlIndex),
				// Portion of expandedUrl that comes after displayUrl
				afterDisplayUrl: expandedUrl.substr(displayUrlIndex + displayUrlSansEllipses.length),
				precedingEllipsis: displayUrl.match(/^…/) ? "…" : "",
				followingEllipsis: displayUrl.match(/…$/) ? "…" : ""
			};
			for (var k in v) {
				if (v.hasOwnProperty(k)) {
					v[k] = twttr.txt.htmlEscape(v[k]);
				}
			}
			// As an example: The user tweets "hi http://longdomainname.com/foo"
			// This gets shortened to "hi http://t.co/xyzabc", with display_url = "…nname.com/foo"
			// This will get rendered as:
			// <span class='tco-ellipsis'> <!-- This stuff should get displayed but not copied -->
			//   …
			//   <!-- There's a chance the onCopy event handler might not fire. In case that happens,
			//        we include an &nbsp; here so that the … doesn't bump up against the URL and ruin it.
			//        The &nbsp; is inside the tco-ellipsis span so that when the onCopy handler *does*
			//        fire, it doesn't get copied.  Otherwise the copied text would have two spaces in a row,
			//        e.g. "hi  http://longdomainname.com/foo".
			//   <span style='font-size:0'>&nbsp;</span>
			// </span>
			// <span style='font-size:0'>  <!-- This stuff should get copied but not displayed -->
			//   http://longdomai
			// </span>
			// <span class='js-display-url'> <!-- This stuff should get displayed *and* copied -->
			//   nname.com/foo
			// </span>
			// <span class='tco-ellipsis'> <!-- This stuff should get displayed but not copied -->
			//   <span style='font-size:0'>&nbsp;</span>
			//   …
			// </span>
			v['invisible'] = options.invisibleTagAttrs;
			return stringSupplant("<span class='tco-ellipsis'>#{precedingEllipsis}<span #{invisible}>&nbsp;</span></span><span #{invisible}>#{beforeDisplayUrl}</span><span class='js-display-url'>#{displayUrlSansEllipses}</span><span #{invisible}>#{afterDisplayUrl}</span><span class='tco-ellipsis'><span #{invisible}>&nbsp;</span>#{followingEllipsis}</span>", v);
		}
		return displayUrl;
	};

	twttr.txt.autoLinkEntities = function(text, entities, options) {
		options = clone(options || {});

		options.hashtagClass = options.hashtagClass || DEFAULT_HASHTAG_CLASS;
		options.hashtagUrlBase = options.hashtagUrlBase || "https://twitter.com/#!/search?q=%23";
		options.cashtagClass = options.cashtagClass || DEFAULT_CASHTAG_CLASS;
		options.cashtagUrlBase = options.cashtagUrlBase || "https://twitter.com/#!/search?q=%24";
		options.listClass = options.listClass || DEFAULT_LIST_CLASS;
		options.usernameClass = options.usernameClass || DEFAULT_USERNAME_CLASS;
		options.usernameUrlBase = options.usernameUrlBase || "https://twitter.com/";
		options.listUrlBase = options.listUrlBase || "https://twitter.com/";
		options.htmlAttrs = twttr.txt.extractHtmlAttrsFromOptions(options);
		options.invisibleTagAttrs = options.invisibleTagAttrs || "style='position:absolute;left:-9999px;'";

		// remap url entities to hash
		var urlEntities, i, len;
		if(options.urlEntities) {
			urlEntities = {};
			for(i = 0, len = options.urlEntities.length; i < len; i++) {
				urlEntities[options.urlEntities[i].url] = options.urlEntities[i];
			}
			options.urlEntities = urlEntities;
		}

		var result = "";
		var beginIndex = 0;

		// sort entities by start index
		entities.sort(function(a,b){ return a.indices[0] - b.indices[0]; });

		for (var i = 0; i < entities.length; i++) {
			var entity = entities[i];
			result += text.substring(beginIndex, entity.indices[0]);

			if (entity.url) {
				result += twttr.txt.linkToUrl(entity, text, options);
			} else if (entity.hashtag) {
				result += twttr.txt.linkToHashtag(entity, text, options);
			} else if (entity.screenName) {
				result += twttr.txt.linkToMentionAndList(entity, text, options);
			} else if (entity.cashtag) {
				result += twttr.txt.linkToCashtag(entity, text, options);
			}
			beginIndex = entity.indices[1];
		}
		result += text.substring(beginIndex, text.length);
		return result;
	};

	twttr.txt.autoLinkWithJSON = function(text, json, options) {
		// concatenate all entities
		var entities = [];
		for (var key in json) {
			entities = entities.concat(json[key]);
		}
		// map JSON entity to twitter-text entity
		for (var i = 0; i < entities.length; i++) {
			entity = entities[i];
			if (entity.screen_name) {
				// this is @mention
				entity.screenName = entity.screen_name;
			} else if (entity.text) {
				// this is #hashtag
				entity.hashtag = entity.text;
			}
		}
		// modify indices to UTF-16
		twttr.txt.modifyIndicesFromUnicodeToUTF16(text, entities);

		return twttr.txt.autoLinkEntities(text, entities, options);
	};

	twttr.txt.extractHtmlAttrsFromOptions = function(options) {
		var htmlAttrs = {};
		for (var k in options) {
			var v = options[k];
			if (OPTIONS_NOT_ATTRIBUTES[k]) continue;
			if (BOOLEAN_ATTRIBUTES[k]) {
				v = v ? k : null;
			}
			if (v == null) continue;
			htmlAttrs[k] = v;
		}
		return htmlAttrs;
	};

	twttr.txt.autoLink = function(text, options) {
		var entities = twttr.txt.extractEntitiesWithIndices(text, {extractUrlWithoutProtocol: false});
		return twttr.txt.autoLinkEntities(text, entities, options);
	};

	twttr.txt.autoLinkUsernamesOrLists = function(text, options) {
		var entities = twttr.txt.extractMentionsOrListsWithIndices(text);
		return twttr.txt.autoLinkEntities(text, entities, options);
	};

	twttr.txt.autoLinkHashtags = function(text, options) {
		var entities = twttr.txt.extractHashtagsWithIndices(text);
		return twttr.txt.autoLinkEntities(text, entities, options);
	};

	twttr.txt.autoLinkCashtags = function(text, options) {
		var entities = twttr.txt.extractCashtagsWithIndices(text);
		return twttr.txt.autoLinkEntities(text, entities, options);
	};

	twttr.txt.autoLinkUrlsCustom = function(text, options) {
		var entities = twttr.txt.extractUrlsWithIndices(text, {extractUrlWithoutProtocol: false});
		return twttr.txt.autoLinkEntities(text, entities, options);
	};

	twttr.txt.removeOverlappingEntities = function(entities) {
		entities.sort(function(a,b){ return a.indices[0] - b.indices[0]; });

		var prev = entities[0];
		for (var i = 1; i < entities.length; i++) {
			if (prev.indices[1] > entities[i].indices[0]) {
				entities.splice(i, 1);
				i--;
			} else {
				prev = entities[i];
			}
		}
	};

	twttr.txt.extractEntitiesWithIndices = function(text, options) {
		var entities = twttr.txt.extractUrlsWithIndices(text, options)
			.concat(twttr.txt.extractMentionsOrListsWithIndices(text))
			.concat(twttr.txt.extractHashtagsWithIndices(text, {checkUrlOverlap: false}))
			.concat(twttr.txt.extractCashtagsWithIndices(text));

		if (entities.length == 0) {
			return [];
		}

		twttr.txt.removeOverlappingEntities(entities);
		return entities;
	};

	twttr.txt.extractMentions = function(text) {
		var screenNamesOnly = [],
			screenNamesWithIndices = twttr.txt.extractMentionsWithIndices(text);

		for (var i = 0; i < screenNamesWithIndices.length; i++) {
			var screenName = screenNamesWithIndices[i].screenName;
			screenNamesOnly.push(screenName);
		}

		return screenNamesOnly;
	};

	twttr.txt.extractMentionsWithIndices = function(text) {
		var mentions = [];
		var mentionsOrLists = twttr.txt.extractMentionsOrListsWithIndices(text);

		for (var i = 0 ; i < mentionsOrLists.length; i++) {
			mentionOrList = mentionsOrLists[i];
			if (mentionOrList.listSlug == '') {
				mentions.push({
					screenName: mentionOrList.screenName,
					indices: mentionOrList.indices
				});
			}
		}

		return mentions;
	};

	/**
	 * Extract list or user mentions.
	 * (Presence of listSlug indicates a list)
	 */
	twttr.txt.extractMentionsOrListsWithIndices = function(text) {
		if (!text || !text.match(twttr.txt.regexen.atSigns)) {
			return [];
		}

		var possibleNames = [];

		text.replace(twttr.txt.regexen.validMentionOrList, function(match, before, atSign, screenName, slashListname, offset, chunk) {
			var after = chunk.slice(offset + match.length);
			if (!after.match(twttr.txt.regexen.endMentionMatch)) {
				slashListname = slashListname || '';
				var startPosition = offset + before.length;
				var endPosition = startPosition + screenName.length + slashListname.length + 1;
				possibleNames.push({
					screenName: screenName,
					listSlug: slashListname,
					indices: [startPosition, endPosition]
				});
			}
		});

		return possibleNames;
	};


	twttr.txt.extractReplies = function(text) {
		if (!text) {
			return null;
		}

		var possibleScreenName = text.match(twttr.txt.regexen.validReply);
		if (!possibleScreenName ||
			RegExp.rightContext.match(twttr.txt.regexen.endMentionMatch)) {
			return null;
		}

		return possibleScreenName[1];
	};

	twttr.txt.extractUrls = function(text, options) {
		var urlsOnly = [],
			urlsWithIndices = twttr.txt.extractUrlsWithIndices(text, options);

		for (var i = 0; i < urlsWithIndices.length; i++) {
			urlsOnly.push(urlsWithIndices[i].url);
		}

		return urlsOnly;
	};

	twttr.txt.extractUrlsWithIndices = function(text, options) {
		if (!options) {
			options = {extractUrlsWithoutProtocol: true};
		}

		if (!text || (options.extractUrlsWithoutProtocol ? !text.match(/\./) : !text.match(/:/))) {
			return [];
		}

		var urls = [];

		while (twttr.txt.regexen.extractUrl.exec(text)) {
			var before = RegExp.$2, url = RegExp.$3, protocol = RegExp.$4, domain = RegExp.$5, path = RegExp.$7;
			var endPosition = twttr.txt.regexen.extractUrl.lastIndex,
				startPosition = endPosition - url.length;

			// if protocol is missing and domain contains non-ASCII characters,
			// extract ASCII-only domains.
			if (!protocol) {
				if (!options.extractUrlsWithoutProtocol
					|| before.match(twttr.txt.regexen.invalidUrlWithoutProtocolPrecedingChars)) {
					continue;
				}
				var lastUrl = null,
					lastUrlInvalidMatch = false,
					asciiEndPosition = 0;
				domain.replace(twttr.txt.regexen.validAsciiDomain, function(asciiDomain) {
					var asciiStartPosition = domain.indexOf(asciiDomain, asciiEndPosition);
					asciiEndPosition = asciiStartPosition + asciiDomain.length;
					lastUrl = {
						url: asciiDomain,
						indices: [startPosition + asciiStartPosition, startPosition + asciiEndPosition]
					};
					lastUrlInvalidMatch = asciiDomain.match(twttr.txt.regexen.invalidShortDomain);
					if (!lastUrlInvalidMatch) {
						urls.push(lastUrl);
					}
				});

				// no ASCII-only domain found. Skip the entire URL.
				if (lastUrl == null) {
					continue;
				}

				// lastUrl only contains domain. Need to add path and query if they exist.
				if (path) {
					if (lastUrlInvalidMatch) {
						urls.push(lastUrl);
					}
					lastUrl.url = url.replace(domain, lastUrl.url);
					lastUrl.indices[1] = endPosition;
				}
			} else {
				// In the case of t.co URLs, don't allow additional path characters.
				if (url.match(twttr.txt.regexen.validTcoUrl)) {
					url = RegExp.lastMatch;
					endPosition = startPosition + url.length;
				}
				urls.push({
					url: url,
					indices: [startPosition, endPosition]
				});
			}
		}

		return urls;
	};

	twttr.txt.extractHashtags = function(text) {
		var hashtagsOnly = [],
			hashtagsWithIndices = twttr.txt.extractHashtagsWithIndices(text);

		for (var i = 0; i < hashtagsWithIndices.length; i++) {
			hashtagsOnly.push(hashtagsWithIndices[i].hashtag);
		}

		return hashtagsOnly;
	};

	twttr.txt.extractHashtagsWithIndices = function(text, options) {
		if (!options) {
			options = {checkUrlOverlap: true};
		}

		if (!text || !text.match(twttr.txt.regexen.hashSigns)) {
			return [];
		}

		var tags = [];

		text.replace(twttr.txt.regexen.validHashtag, function(match, before, hash, hashText, offset, chunk) {
			var after = chunk.slice(offset + match.length);
			if (after.match(twttr.txt.regexen.endHashtagMatch))
				return;
			var startPosition = offset + before.length;
			var endPosition = startPosition + hashText.length + 1;
			tags.push({
				hashtag: hashText,
				indices: [startPosition, endPosition]
			});
		});

		if (options.checkUrlOverlap) {
			// also extract URL entities
			var urls = twttr.txt.extractUrlsWithIndices(text);
			if (urls.length > 0) {
				var entities = tags.concat(urls);
				// remove overlap
				twttr.txt.removeOverlappingEntities(entities);
				// only push back hashtags
				tags = [];
				for (var i = 0; i < entities.length; i++) {
					if (entities[i].hashtag) {
						tags.push(entities[i]);
					}
				}
			}
		}

		return tags;
	};

	twttr.txt.extractCashtags = function(text) {
		var cashtagsOnly = [],
			cashtagsWithIndices = twttr.txt.extractCashtagsWithIndices(text);

		for (var i = 0; i < cashtagsWithIndices.length; i++) {
			cashtagsOnly.push(cashtagsWithIndices[i].cashtag);
		}

		return cashtagsOnly;
	};

	twttr.txt.extractCashtagsWithIndices = function(text) {
		if (!text || text.indexOf("$") == -1) {
			return [];
		}

		var tags = [];

		text.replace(twttr.txt.regexen.validCashtag, function(match, before, dollar, cashtag, offset, chunk) {
			var startPosition = offset + before.length;
			var endPosition = startPosition + cashtag.length + 1;
			tags.push({
				cashtag: cashtag,
				indices: [startPosition, endPosition]
			});
		});

		return tags;
	};

	twttr.txt.modifyIndicesFromUnicodeToUTF16 = function(text, entities) {
		twttr.txt.convertUnicodeIndices(text, entities, false);
	};

	twttr.txt.modifyIndicesFromUTF16ToUnicode = function(text, entities) {
		twttr.txt.convertUnicodeIndices(text, entities, true);
	};

	twttr.txt.convertUnicodeIndices = function(text, entities, indicesInUTF16) {
		if (entities.length == 0) {
			return;
		}

		var charIndex = 0;
		var codePointIndex = 0;

		// sort entities by start index
		entities.sort(function(a,b){ return a.indices[0] - b.indices[0]; });
		var entityIndex = 0;
		var entity = entities[0];

		while (charIndex < text.length) {
			if (entity.indices[0] == (indicesInUTF16 ? charIndex : codePointIndex)) {
				var len = entity.indices[1] - entity.indices[0];
				entity.indices[0] = indicesInUTF16 ? codePointIndex : charIndex;
				entity.indices[1] = entity.indices[0] + len;

				entityIndex++;
				if (entityIndex == entities.length) {
					// no more entity
					break;
				}
				entity = entities[entityIndex];
			}

			var c = text.charCodeAt(charIndex);
			if (0xD800 <= c && c <= 0xDBFF && charIndex < text.length - 1) {
				// Found high surrogate char
				c = text.charCodeAt(charIndex + 1);
				if (0xDC00 <= c && c <= 0xDFFF) {
					// Found surrogate pair
					charIndex++;
				}
			}
			codePointIndex++;
			charIndex++;
		}
	};

	// this essentially does text.split(/<|>/)
	// except that won't work in IE, where empty strings are ommitted
	// so "<>".split(/<|>/) => [] in IE, but is ["", "", ""] in all others
	// but "<<".split("<") => ["", "", ""]
	twttr.txt.splitTags = function(text) {
		var firstSplits = text.split("<"),
			secondSplits,
			allSplits = [],
			split;

		for (var i = 0; i < firstSplits.length; i += 1) {
			split = firstSplits[i];
			if (!split) {
				allSplits.push("");
			} else {
				secondSplits = split.split(">");
				for (var j = 0; j < secondSplits.length; j += 1) {
					allSplits.push(secondSplits[j]);
				}
			}
		}

		return allSplits;
	};

	twttr.txt.hitHighlight = function(text, hits, options) {
		var defaultHighlightTag = "em";

		hits = hits || [];
		options = options || {};

		if (hits.length === 0) {
			return text;
		}

		var tagName = options.tag || defaultHighlightTag,
			tags = ["<" + tagName + ">", "</" + tagName + ">"],
			chunks = twttr.txt.splitTags(text),
			i,
			j,
			result = "",
			chunkIndex = 0,
			chunk = chunks[0],
			prevChunksLen = 0,
			chunkCursor = 0,
			startInChunk = false,
			chunkChars = chunk,
			flatHits = [],
			index,
			hit,
			tag,
			placed,
			hitSpot;

		for (i = 0; i < hits.length; i += 1) {
			for (j = 0; j < hits[i].length; j += 1) {
				flatHits.push(hits[i][j]);
			}
		}

		for (index = 0; index < flatHits.length; index += 1) {
			hit = flatHits[index];
			tag = tags[index % 2];
			placed = false;

			while (chunk != null && hit >= prevChunksLen + chunk.length) {
				result += chunkChars.slice(chunkCursor);
				if (startInChunk && hit === prevChunksLen + chunkChars.length) {
					result += tag;
					placed = true;
				}

				if (chunks[chunkIndex + 1]) {
					result += "<" + chunks[chunkIndex + 1] + ">";
				}

				prevChunksLen += chunkChars.length;
				chunkCursor = 0;
				chunkIndex += 2;
				chunk = chunks[chunkIndex];
				chunkChars = chunk;
				startInChunk = false;
			}

			if (!placed && chunk != null) {
				hitSpot = hit - prevChunksLen;
				result += chunkChars.slice(chunkCursor, hitSpot) + tag;
				chunkCursor = hitSpot;
				if (index % 2 === 0) {
					startInChunk = true;
				} else {
					startInChunk = false;
				}
			} else if(!placed) {
				placed = true;
				result += tag;
			}
		}

		if (chunk != null) {
			if (chunkCursor < chunkChars.length) {
				result += chunkChars.slice(chunkCursor);
			}
			for (index = chunkIndex + 1; index < chunks.length; index += 1) {
				result += (index % 2 === 0 ? chunks[index] : "<" + chunks[index] + ">");
			}
		}

		return result;
	};

	var MAX_LENGTH = 140;

	// Characters not allowed in Tweets
	var INVALID_CHARACTERS = [
		// BOM
		fromCode(0xFFFE),
		fromCode(0xFEFF),

		// Special
		fromCode(0xFFFF),

		// Directional Change
		fromCode(0x202A),
		fromCode(0x202B),
		fromCode(0x202C),
		fromCode(0x202D),
		fromCode(0x202E)
	];

	// Returns the length of Tweet text with consideration to t.co URL replacement
	twttr.txt.getTweetLength = function(text, options) {
		if (!options) {
			options = {
				short_url_length: 20,
				short_url_length_https: 21
			};
		}
		var textLength = text.length;
		var urlsWithIndices = twttr.txt.extractUrlsWithIndices(text);

		for (var i = 0; i < urlsWithIndices.length; i++) {
			// Subtract the length of the original URL
			textLength += urlsWithIndices[i].indices[0] - urlsWithIndices[i].indices[1];

			// Add 21 characters for URL starting with https://
			// Otherwise add 20 characters
			if (urlsWithIndices[i].url.toLowerCase().match(/^https:\/\//)) {
				textLength += options.short_url_length_https;
			} else {
				textLength += options.short_url_length;
			}
		}

		return textLength;
	};

	// Check the text for any reason that it may not be valid as a Tweet. This is meant as a pre-validation
	// before posting to api.twitter.com. There are several server-side reasons for Tweets to fail but this pre-validation
	// will allow quicker feedback.
	//
	// Returns false if this text is valid. Otherwise one of the following strings will be returned:
	//
	//   "too_long": if the text is too long
	//   "empty": if the text is nil or empty
	//   "invalid_characters": if the text contains non-Unicode or any of the disallowed Unicode characters
	twttr.txt.isInvalidTweet = function(text) {
		if (!text) {
			return "empty";
		}

		// Determine max length independent of URL length
		if (twttr.txt.getTweetLength(text) > MAX_LENGTH) {
			return "too_long";
		}

		for (var i = 0; i < INVALID_CHARACTERS.length; i++) {
			if (text.indexOf(INVALID_CHARACTERS[i]) >= 0) {
				return "invalid_characters";
			}
		}

		return false;
	};

	twttr.txt.isValidTweetText = function(text) {
		return !twttr.txt.isInvalidTweet(text);
	};

	twttr.txt.isValidUsername = function(username) {
		if (!username) {
			return false;
		}

		var extracted = twttr.txt.extractMentions(username);

		// Should extract the username minus the @ sign, hence the .slice(1)
		return extracted.length === 1 && extracted[0] === username.slice(1);
	};

	var VALID_LIST_RE = regexSupplant(/^#{validMentionOrList}$/);

	twttr.txt.isValidList = function(usernameList) {
		var match = usernameList.match(VALID_LIST_RE);

		// Must have matched and had nothing before or after
		return !!(match && match[1] == "" && match[4]);
	};

	twttr.txt.isValidHashtag = function(hashtag) {
		if (!hashtag) {
			return false;
		}

		var extracted = twttr.txt.extractHashtags(hashtag);

		// Should extract the hashtag minus the # sign, hence the .slice(1)
		return extracted.length === 1 && extracted[0] === hashtag.slice(1);
	};

	twttr.txt.isValidUrl = function(url, unicodeDomains, requireProtocol) {
		if (unicodeDomains == null) {
			unicodeDomains = true;
		}

		if (requireProtocol == null) {
			requireProtocol = true;
		}

		if (!url) {
			return false;
		}

		var urlParts = url.match(twttr.txt.regexen.validateUrlUnencoded);

		if (!urlParts || urlParts[0] !== url) {
			return false;
		}

		var scheme = urlParts[1],
			authority = urlParts[2],
			path = urlParts[3],
			query = urlParts[4],
			fragment = urlParts[5];

		if (!(
			(!requireProtocol || (isValidMatch(scheme, twttr.txt.regexen.validateUrlScheme) && scheme.match(/^https?$/i))) &&
				isValidMatch(path, twttr.txt.regexen.validateUrlPath) &&
				isValidMatch(query, twttr.txt.regexen.validateUrlQuery, true) &&
				isValidMatch(fragment, twttr.txt.regexen.validateUrlFragment, true)
			)) {
			return false;
		}

		return (unicodeDomains && isValidMatch(authority, twttr.txt.regexen.validateUrlUnicodeAuthority)) ||
			(!unicodeDomains && isValidMatch(authority, twttr.txt.regexen.validateUrlAuthority));
	};

	function isValidMatch(string, regex, optional) {
		if (!optional) {
			// RegExp["$&"] is the text of the last match
			// blank strings are ok, but are falsy, so we check stringiness instead of truthiness
			return ((typeof string === "string") && string.match(regex) && RegExp["$&"] === string);
		}

		// RegExp["$&"] is the text of the last match
		return (!string || (string.match(regex) && RegExp["$&"] === string));
	}

	if (typeof module != 'undefined' && module.exports) {
		module.exports = twttr.txt;
	}

}());
/*global Dashboard, Livepress, tinyMCE, OORTLE, twttr */
Dashboard.Twitter = Livepress.ensureExists(Dashboard.Twitter);

Dashboard.Twitter.terms = [];
Dashboard.Twitter.tweets = [];
if (Dashboard.Twitter.twitter === undefined) {
	Dashboard.Twitter = jQuery.extend(Dashboard.Twitter, (function () {
		var tweetTrackerPaused = 0;
		var $paneHolder = jQuery('#lp-pane-holder');
		var twitter = Dashboard.Twitter;
		var tweetCounter = 0;

		var liveCounter = Dashboard.Helpers.createLiveCounter('#tab-link-live-twitter-search a'); // '#twitter-search-mark');
		var tweetContainer = "#lp-twitter-results";
		var tweetHolder = "#lp-hidden-tweets";
		var getTweetTarget = function(){
			return jQuery(tweetTrackerPaused>0 ? tweetHolder : tweetContainer); 
		};

		var binders = (function () {
			var bindRemoveButtons = function (elToBind, type) {
				elToBind.bind('click', function () {
					var container = jQuery(this).parent('.lp-' + type),
						text = container.find(".lp-" + type + "-text").text(),
						id = container.attr('id');

					// Dashboard.Helpers.disableAndDisplaySpinner(jQuery(this));
					if (type === "term") {
						twitter.removeTerm(id, text);
					} else if (type === "tweet") {
						// Remove the first @ character
						text = text.substr(1, text.length);

						twitter.removeTweet(id, text);
					}
				});
			};

			var tweet_player_id = "#lp-tweet-player";
			var play = function () {
				tweetTrackerPaused--;
				if (tweetTrackerPaused <= 0) {
					tweetTrackerPaused = 0;
					//liveCounter.disable();
					twitter.appendGatheredTweets();

					jQuery(tweet_player_id).attr('title', "Click to pause the tweets so you can decide when to display them").removeClass('paused');
					jQuery(tweetContainer).removeClass('paused');
					jQuery('#pausedmsg').hide();
				}
			};

			var pause = function () {
				tweetTrackerPaused++;
				if (tweetTrackerPaused === 1) {
					//liveCounter.enable();

					jQuery(tweet_player_id).attr('title', "Click to copy tweets into the post editor.").addClass('paused');
					jQuery(tweetContainer).addClass('paused');
					jQuery('#pausedmsg').show();
				}
			};

			return {
				bindCleaners: function () {
					var $tweetCleaner = $paneHolder.find('a.lp-tweet-cleaner');
					var $termCleaner = $paneHolder.find('.lp-term-cleaner a');

					$tweetCleaner.live('click', function (e) {
						e.preventDefault();
						e.stopPropagation();
						// Dashboard.Helpers.disableAndDisplaySpinner(jQuery(this));
						twitter.removeAllTweets();
						return false;
					});

					$termCleaner.live('click', function (e) {
						e.preventDefault();
						e.stopPropagation();
						// Dashboard.Helpers.disableAndDisplaySpinner(jQuery(this));
						twitter.removeAllTerms();
						if (jQuery(this).attr('data-action') === 'clear') {
							jQuery(tweetContainer).html('');
							jQuery(tweetHolder).html('');
						}
					});
				},


				bindAddTermInput: function () {
					/* Twitter search terms */
					var termAddInputAction = function (e) {
						e.preventDefault();
						e.stopPropagation();
						var term = jQuery("#live-search-query").val();
						if (term.length > 0) {
							twitter.addTerm(term);
						}
					}, meta = jQuery('#screen-meta');

					meta.on('click', '#live-search-column input.button-secondary', termAddInputAction);

					meta.on('keydown', '#live-search-column #live-search-query', function (e) {
						if (e.keyCode === 13) {
							termAddInputAction(e);
						}
					});
				},

				bindStaticSearchButton: function () {
					var $searchBox = jQuery('#lp-new-static-search');
					var $searchButton = jQuery('#lp-on-top input.new_static_search');

					var newStaticSearchAction = function (e) {
						e.preventDefault();
						e.stopPropagation();
						var query = jQuery("#lp-new-static-search").val();
						if (query.length > 0) {
							twitter.renderStaticSearchResults(query);
							$searchBox.val('');
						}
					};

					$searchButton.bind('click', newStaticSearchAction);

					$searchBox.keydown(function (e) {
						if (e.keyCode === 13) {
							newStaticSearchAction(e);
						}
					});
				},

				bindAddGuestBloggerInput: function () {
					var guestBloggerAddAction = function (e) {
							e.preventDefault();
							e.stopPropagation();
							var username = jQuery('#new-twitter-account').val();
							if (username.length > 0) {
								twitter.addGuestBlogger(username);
							}
						},
						meta = jQuery('#screen-meta');

					meta.on('click', '#remote-authors input.termadd', guestBloggerAddAction);

					meta.on('keydown', '#remote-authors #new-twitter-account', function (e) {
						if (e.keyCode === 13) {
							guestBloggerAddAction(e);
						}
					});

					meta.on('click', '#remote-authors .cleaner', function(e) {
						e.preventDefault();
						e.stopPropagation();
						twitter.removeAllTweets();
						return false;
					});

					meta.find(".lp-tweet-cleaner").hide();
				},

				bindRemoveTermButtons: function () {
					bindRemoveButtons(jQuery('.lp-term-clean-button'), 'term');
				},

				bindRemoveTweetButtons: function () {
					bindRemoveButtons(jQuery('.lp-tweet-clean-button'), 'tweet');
				},

				bindTweetPlayer: function () {
					jQuery(tweet_player_id).click(function (e) {
						e.preventDefault();
						e.stopPropagation();
						return jQuery(this).hasClass("paused") ? play() : pause();
					});
				},

				bindTweetMouse: function () {
					jQuery(tweetContainer).hover(pause, play);
				},

				init: function () {
					//this.bindCleaners();
					this.bindAddTermInput();
					this.bindStaticSearchButton();
					this.bindAddGuestBloggerInput();
					this.bindRemoveTweetButtons();
					this.bindRemoveTermButtons();
					this.bindTweetPlayer();
					this.bindTweetMouse();
				}
			};
		}());

		var prevTweetWasEven = false;
		var formatTweet = function (tweet) {
			var tweetDiv = jQuery("<div id=tweet-" + tweet.id + " class='comment-item " + ( prevTweetWasEven ? 'odd' : 'even' ) + "'></div>");
			var createdAt = tweet.created_at.parseGMT();
			var avatar = jQuery("<img class='avatar avatar-32 photo' width='32' height='32' />").attr('src', tweet.avatar_url).attr('alt', tweet.author);
			var authorDiv = jQuery("<div class='lp-comment-author author'>")
				.append(avatar)
				.append(jQuery("<strong></strong>")
				.text(tweet.author))
				.append("<br/>")
				.append(jQuery("<span>" + createdAt + "</span>"));

			tweetDiv.append(authorDiv);
			tweetDiv.data('term', tweet.term);

			prevTweetWasEven = !prevTweetWasEven;

			var contentDiv = jQuery("<div class='lp-comment comment'></div>").append(jQuery("<p>" + tweet.text + "</p>").autolink());
			contentDiv.find('a').attr("target", "_blank");

			var rowActions = jQuery("<div class='row-actions'></div>");
			var postLink = jQuery("<span class='post'><a href='#' title='Copy the tweet into the post editing area'>Send to editor</a><span>");
			rowActions.append(postLink);
			postLink.bind('click', function (e) {
				e.preventDefault();
				e.stopPropagation();
				var t = tinyMCE.activeEditor;

				var created_at = new Date(tweet.created_at);
				var textToAppend = "[embed]http://twitter.com/"+tweet.author+"/status/"+tweet.id+"[/embed]\n";

				t.setContent(t.getContent() + textToAppend);

				// Enable the update button.
				var pushBtn = jQuery('.livepress-newform' ).find('input.button-primary');
				pushBtn.removeAttr( 'disabled' );
			});
			contentDiv.append(rowActions);
			tweetDiv.append(contentDiv);

			return tweetDiv;
		};


		var pushTweet = function (container, tweet) {
			if (container.find("#tweet-" + tweet.id).length > 0) {
				return;
			}
			var spinner = container.find( '.lp-spinner' );
			if ( spinner.length > 0 ) {
				spinner.remove();
			}

			var formatedTweet = formatTweet(tweet);
			formatedTweet.hide();
			container.prepend(formatedTweet);
			container.find("div.comment-item:gt(200)").remove();
			formatedTweet.slideDown();
		};

		return {
			twitter:                       this, // for convenience
			liveCounter:                   liveCounter,
			new_tweet_for_search_callback: function (tweet) {
				var tweetsDiv = getTweetTarget();

				tweet.id = tweet.id_str;
				pushTweet(tweetsDiv, tweet);

				if (liveCounter.enabled) {
					liveCounter.increment();
				}
			},

			follow_twitter_search: function (term) {
				var topic = "|livepress|tweet-search|" + term;
				OORTLE.instance.subscribe(topic, this.new_tweet_for_search_callback);
			},

			unfollow_twitter_search: function (term) {
				var topic = "|livepress|tweet-search|" + term;
				OORTLE.instance.unsubscribe(topic, this.new_tweet_for_search_callback);
			},

			// FIXME: we shouldn't reload all of the terms, just add the neccessary ones.
			refresh_terms:           function () {
				var terms = Dashboard.Twitter.terms;
				var termHtml = "";

				for (var i = 0; i < terms.length; i += 1) {
					termHtml += '<div class="lp-term" id="term-' + i + '"><a class="lp-term-clean-button" title="Remove this term"></a><span class="lp-term-text">' + terms[i] + '</span></div>';
				}

				termHtml += '<div class="clear"></div>';
				jQuery('#lp-twitter-search-terms').html(termHtml);

				if (jQuery('#twitter-search-pane').is('.lp-pane-active')) {
					jQuery("#lp-on-top").show();
				}
				binders.bindRemoveTermButtons();
				
				liveCounter.reset();
				if ( 0 === terms.length ) {
					jQuery(tweetContainer).html(''); // No more terms, clear the container
				} else {
					jQuery(tweetContainer).html("<div class='lp-spinner'></div>"); // Still terms, show spinner
				}
			},

			refresh_tweets: function () {
				var tweets = Dashboard.Twitter.tweets;
				var tweetHtml = "";
				for (var i = 0; i < tweets.length; i += 1) {
					tweetHtml += '<li id="tweet-' + i + '" class="' + ((i % 2 === 1) ? 'odd' : 'even') + ' lp-tweet">';
					tweetHtml += '<span class="lp-tweet-text">@' + tweets[i] + '</span>';
					tweetHtml += '<a class="lp-tweet-clean-button" title="Remove this account">remove</a>';
					tweetHtml += '</li>';
				}
				jQuery('#lp-account-list').html(tweetHtml);
				if (tweets.length) {
					jQuery(".lp-tweet-cleaner").show();
				}
				else {
					jQuery(".lp-tweet-cleaner").hide();
				}

				var $authors = jQuery( document.getElementById( 'livepress-authors_num' ) ),
					$author_label = $authors.siblings( '.label' );
				var label = ( 1 === tweets.length ) ? 'Remote Author' : 'Remote Authors';

				$authors.html( tweets.length );
				$author_label.text( label );
				binders.bindRemoveTweetButtons();
			},

			/**
			 * Handles adding terms or tweet to accurate widget in the dashboard.
			 *
			 * @param {String} name Term to search or twitter account to follow.
			 * @param {Array} collection Array with tweets or terms
			 * @param {Object} options
			 *  dontPostToLivepress - if true, term/tweet is only added to widget without
			 *    sending it to livepress.
			 *  afterPushFunction - launched after adding tweet/term to widget,
			 *    after ajax returns with success
			 *  ajaxRequest - ajax for communication with livepress
			 *  inputToClean - jquery object of input field which should be cleared
			 * @return void
			 */
			addTermOrTweet: function (name, collection, options) {
				var defaults = {
					dontPostToLivepress: false,
					afterPushFunction:   function () {
					},
					ajaxRequest:         function () {
					},
					inputToClean:        null
				};
				options = jQuery.extend({}, defaults, options);
				if (options.inputToClean) {
					options.inputToClean.val('');
				}

				name = name.toLowerCase();
				if (jQuery.inArray(name, collection) !== -1) {
					return;
				}

				var addToCollection = function (env) {
					if (typeof(env) === "string") {
						env = JSON.parse(env);
					}

					if (env) {
						if (env.success) {
							collection.push(name);
							options.afterPushFunction();
						} else {
							if (env.errors) {
								Dashboard.Helpers.handleErrors(env.errors);
								if (options.inputToClean) {
									Dashboard.Helpers.enableAndHideSpinner(options.inputToClean);
								}
							}
						}
					}
				};

				if (options.dontPostToLivepress) {
					addToCollection({
						success: true
					});
				} else {
					// Dashboard.Helpers.disableAndDisplaySpinner(options.inputToClean);
					options.ajaxRequest(name, 'add', addToCollection);
				}
			},


			handleRemovingFromCollection: function (id, collection, name) {
				var number = id.replace(name + "-", "");
				collection.splice(number, 1);
				if (name === "tweet") {
					this.refresh_tweets(collection);
				} else {
					this.refresh_terms();
				}
			},

			addTerm: function (name, dontPostToLivepress) {
				var $newTermInput = jQuery("#live-search-query");
				var options = {
					dontPostToLivepress: dontPostToLivepress,
					afterPushFunction:   function () {
						twitter.follow_twitter_search(name);
						twitter.refresh_terms();
						Dashboard.Helpers.enableAndHideSpinner($newTermInput);
					},
					ajaxRequest:         twitter.postTweetSearch,
					inputToClean:        $newTermInput
				};

				this.addTermOrTweet(name, Dashboard.Twitter.terms, options);
			},

			removeTerm: function (id, name) {
				twitter.postTweetSearch(name, 'remove', function (env) {
					env = JSON.parse(env);
					if (env && env.success) {
						twitter.unfollow_twitter_search(name);
						twitter.handleRemovingFromCollection(id, Dashboard.Twitter.terms, 'term');

						jQuery(tweetContainer+' .comment-item').filter(function () {
							return jQuery.data(this, 'term') === name;
						}).remove();
					}
				});
			},

			unsubscribeTwitterChannels: function () {
				this.removeAllTerms(true);
			},

			/**
			 * Removes all terms from being tracked and unfollows their channels
			 *
			 * @param {Boolean} locallyOnly if true no ajax will be sent to livepress with
			 *  request to remove terms from being tracked
			 */
			removeAllTerms: function (locallyOnly) {
				var unfollowThemAll = function () {
					jQuery.each(Dashboard.Twitter.terms, function (i, term) {
						twitter.unfollow_twitter_search(term);
					});

					Dashboard.Twitter.terms = [];
					twitter.refresh_terms();
				};

				if (locallyOnly) {
					unfollowThemAll();
				} else {
					// Dashboard.Helpers.disableAndDisplaySpinner($paneHolder.find('a.lp-tweet-cleaner'));
					var callback = function (env) {
						env = JSON.parse(env);
						if (env && env.success) {
							unfollowThemAll();
						}
					};
					this.postTweetSearch('', 'clear', callback);
				}
			},

			/**
			 * Request search results from twitter and push them to pane
			 *
			 * @param {String} query    - Search query
			 */
			renderStaticSearchResults: function (query, target, limit) {
				if (!target) {
					target = function () {
						var container = jQuery('#lp-static-search-results');
						container.html('');
						return container;
					};
				}

				// Add a spinner to take care of notifications
				var container = target(),
					$spinner = jQuery( "<div class='lp-spinner'></div>" );

				// Only add the spinner if it doesn't exist
				if ( 0 === container.find( '.lp-spinner' ).length ) {
					$spinner.appendTo( container );
				}

				// Static Twitter search was dependent on the deprecated v1 API. This code does not work!
				/*if (!limit) {
					limit = 20;
				}

				jQuery.getJSON("http://search.twitter.com/search.json?callback=?", {
					q:   query,
					rpp: limit
				}, function (response) {
					var tweets = response.results;
					var container = target();
					jQuery.each(tweets.reverse(), function (idx, tweet) {
						pushTweet(container, {
							id:         tweet.id_str,
							user_id:    tweet.from_user_id,
							author:     tweet.from_user,
							created_at: tweet.created_at,
							text:       tweet.text,
							avatar_url: tweet.profile_image_url,
							term:       query
						});
					});
				});*/
			},

			/**
			 * Sends ajax with twitter search terms to follow or remove
			 *
			 * @param {String} term   Twitter search term
			 * @param {String} action_type Should be 'add', 'remove' or 'clear'
			 * @param {function} success Function to be run on success callback
			 * @returns Always true
			 */
			postTweetSearch:          function (term, action_type, success) {
				jQuery.post(
					"admin-ajax.php",
					{
						livepress_action: true,
						_ajax_nonce:      Livepress.Config.ajax_nonce,
						action:           'twitter_search_term',
						term:             term,
						action_type:      action_type,
						post_id:          Livepress.Config.post_id
					},
					success
				);
				if (action_type === 'add') {
					// Run single round of static search to populate stub results
					Dashboard.Twitter.renderStaticSearchResults(term, getTweetTarget, 5);

					twitter.refresh_terms();
				}
				return true;
			},

			// Auto tweets
			checkIfAutoTweetPossible: function () {
				if (!Livepress.Config.remote_post) {
					$paneHolder.find(".autotweet-container").hide();
					jQuery("#autotweet-blocked .warning").show();
				} else {
					$paneHolder.find(".autotweet-container").show();
					jQuery("#autotweet-blocked .warning").hide();
				}
			},

			addGuestBlogger: function (username, dontPostToLivepress) {
				var $newTweetInput = jQuery("#new-twitter-account");
				username = username.replace("@", '');
				var options = {
					dontPostToLivepress: dontPostToLivepress,
					afterPushFunction:   function () {
						twitter.refresh_tweets();
						Dashboard.Helpers.enableAndHideSpinner($newTweetInput);
					},
					ajaxRequest:         this.postTwitterFollow,
					inputToClean:        $newTweetInput
				};

				this.addTermOrTweet(username, Dashboard.Twitter.tweets, options);
			},

			removeTweet: function (id, username) {
				var twitter = this;
				this.postTwitterFollow(username, 'remove', function (env) {
					env = JSON.parse(env);
					if (env && env.success) {
						twitter.handleRemovingFromCollection(id, Dashboard.Twitter.tweets, "tweet");
					}
				});
			},

			removeAllTweets: function () {
				this.postTwitterFollow('', 'clear', function (env) {
					env = JSON.parse(env);
					if (env && env.success) {
						Dashboard.Twitter.tweets = [];
						twitter.refresh_tweets();
					}
				});
			},

			appendGatheredTweets: function () {
				var tweets = jQuery(tweetHolder+" .comment-item");
				var results = jQuery(tweetContainer);
				tweets.hide();
				results.prepend(tweets);
				tweets.slideDown();
			},

			postTwitterFollow: function (username, action_type, success) {
				jQuery.post(
					"admin-ajax.php",
					{
						livepress_action: true,
						_ajax_nonce:      Livepress.Config.ajax_nonce,
						action:           'twitter_follow',
						username:         username,
						action_type:      action_type,
						post_id:          Livepress.Config.post_id
					},
					success
				);
				return true;
			},

			init: function () {
				liveCounter.enable();
				this.checkIfAutoTweetPossible();
				binders.init();
			}
		};
	}()));
}

/*global Livepress*/
(function () {
	var loader = function () {
		var scripts = [],
			styles = [],
			agent = navigator.userAgent.toLowerCase(),
			gecko_version,
			seq_load, i;

		gecko_version = agent.match(new RegExp("rv:(\\d+)\\.\\d+"));
		seq_load = (agent.indexOf("khtml") !== -1) ||
			(navigator.appName === 'Microsoft Internet Explorer') ||
			(agent.indexOf("gecko") !== -1) && (parseInt(gecko_version[1], 10) >= 2);

		if (Livepress.JSQueue !== undefined) {
			scripts = scripts.concat(Livepress.JSQueue);
		}
		if (Livepress.CSSQueue !== undefined) {
			styles = styles.concat(Livepress.CSSQueue);
		}

		if ( Livepress.Config.current_screen !== undefined && Livepress.Config.current_screen[0] === 'post' && Livepress.Config.current_screen[1] === 'post' ) {
			//DEBUG Lines are included only in debugging version. They are completely removed from release code
			if (Livepress.Config.debug !== undefined && Livepress.Config.debug) { //DEBUG
				var run = encodeURIComponent("jQuery(function(){Livepress.Ready()})"); //DEBUG
				scripts = scripts.concat([ //DEBUG
					'static://oortle.full.js?rnd=' + Math.random(), //DEBUG
					'static://oortle_dynamic.js?run=' + run + '&rnd=' + Math.random() //DEBUG
				]); //DEBUG
			} else //DEBUG
			{
				scripts = scripts.concat([
					'static://oortle/' + Livepress.Config.oover[0] + '/oortle.min.js',
					'static://' + Livepress.Config.oover[1] + '/cluster_settings.js?v=' + Livepress.Config.oover[2]
				]);
			}
		}
		var getPath = function (url) {
			var m = url.match(/^([a-z]+):\/\/(.*)$/);

			if (m.length) {
				if (Livepress.Config[m[1] + '_url'] !== undefined) { // Translate if url mapping defined for it
					var prefix = Livepress.Config[m[1] + "_url"];
					if (prefix.substr(-1) !== "/") {
						prefix += "/";
					}
					url = prefix + m[2];
				}
			}
			return url;
		};
		var loadStyle = function (idx) {
			if (idx >= styles.length) {
				return;
			}
			var tag = document.createElement('link');
			tag.setAttribute('id', 'OORTLEstyle' + idx);
			tag.setAttribute('type', 'text/css');
			tag.setAttribute('rel', 'stylesheet');
			tag.setAttribute('href', getPath(styles[idx]));
			document.getElementsByTagName("head").item(0).appendChild(tag);
			return true;
		};
		var loadScript = function (idx, only) {
			if (idx >= scripts.length) {
				return false;
			}
			if (!scripts[idx]) {
				if (only) {
					return false;
				}
				return loadScript(idx + 1);
			}
			var oortleScript = document.createElement('script');
			oortleScript.setAttribute('id', 'OORTLEscript' + idx);
			oortleScript.setAttribute('type', 'text/javascript');
			oortleScript.setAttribute('src', getPath(scripts[idx]));
			if (seq_load) {
				if (typeof(oortleScript.onreadystatechange) !== "undefined") {
					oortleScript.onreadystatechange = function () {
						if (this.readyState === "loaded" || this.readyState === "complete") {
							this.onreadystatechange = function () {
							};
							loadScript(idx + 1);
						}
					};
				} else {
					oortleScript.onload = oortleScript.onerror = function () {
						loadScript(idx + 1);
					};
				}
			}
			document.getElementsByTagName("head").item(0).appendChild(oortleScript);
			return true;
		};
		for (i = 0; i < styles.length; i++) {
			loadStyle(i);
		}
		for (i = 0; i < scripts.length; i++) {
			if (!loadScript(i, true)) {
				continue;
			} // skip empty lines
			if (seq_load) {
				break;
			}
		}
	};
	if (typeof jQuery === 'undefined') {
		loader();
	} // If jQuery not defined, we called as loader for whole plugin
	else {
		jQuery(loader);
	} // Otherwise, we called as loader for only external part
}());
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
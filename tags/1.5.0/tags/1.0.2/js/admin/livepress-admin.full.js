/*! livepress -v1.0.2
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
/**
 * Object containing methods pertaining to instance message integration.
 *
 * @namespace
 * @type {Object}
 */
var ImIntegration = {
	CHECK_TIMEOUT_SECONDS: 5,
	CHECK_TIMES:           5
};

/**
 * Check the status of the specified protocol
 *
 * @memberOf ImIntegration
 * @param {String} protocol Protocol to check.
 * @see ImIntegration.__check_status
 */
ImIntegration.check_status = function (protocol) {
	ImIntegration.__check_status(protocol, ImIntegration.CHECK_TIMES);
};

/**
 * Create HTML markup for a loading spinnter.
 *
 * @memberOf ImIntegration
 * @return {Object} jQuery object containing the spinner.
 * @private
 */
ImIntegration.__spin_loading = function () {
	var image_path = Livepress.Config.lp_plugin_url + '/img/spin.gif',
		html_image = jQuery("<img />").attr('src', image_path);

	console.log("created spin: " + html_image.html());
	console.log("image_path  : " + image_path);
	return html_image;
};

/**
 * Check the status of a specific protocol several times.
 *
 * @memberOf ImIntegration
 * @param {String} protocol Protocol to check.
 * @param {number} tries Number of times to test the protocol.
 * @private
 */
ImIntegration.__check_status = function (protocol, tries) {
	var params = {},
		$check_button = jQuery("#check_" + protocol),
		$check_message = jQuery("#check_message_" + protocol),
		admin_ajax_url = Livepress.Config.site_url + '/wp-admin/admin-ajax.php';

	params.action = "im_integration";
	params.im_integration_check_status = true;
	params.im_service = protocol;

	console.log("Start status check to: protocol=" + protocol);

	$check_button.hide();

	$check_message.css({ 'color': 'black' }).html(ImIntegration.__spin_loading());

	jQuery.post(admin_ajax_url, params, function (response, code) {
		var json_response = JSON.parse(response),
			show_button = false,
			error_msg = "",
			reason;

		if ((json_response.status === 'not_found' ||
			json_response.status === 'offline' ||
			json_response.status === 'failed') && tries > 0) {
			//checked_str = ((ImIntegration.CHECK_TIMES + 1) - tries) + "/" + ImIntegration.CHECK_TIMES;
			setTimeout(function () {
				ImIntegration.__check_status(params.im_service, tries - 1);
			}, ImIntegration.CHECK_TIMEOUT_SECONDS * 1000);
		} else if (json_response.status === 'not_found') {
			show_button = true;
			$check_message.html("Account not found").css({'color':'red'});
		} else if (json_response.status === 'connecting') {
			setTimeout(function () {
				ImIntegration.__check_status(params.im_service, 5);
			}, ImIntegration.CHECK_TIMEOUT_SECONDS * 1000);
			$check_message.html("Connecting").css({'color':'lightgreen'});
		} else if (json_response.status === 'offline') {
			$check_message.html("offline");
		} else if (json_response.status === 'online') {
			$check_message.html("connected").css({'color':'green'});
		} else if (json_response.status === 'failed') {
			show_button = true;
			reason = json_response.reason;

			if (reason === 'authentication_error') {
				error_msg = "username/password invalid";
			} else if (reason === "wrong_jid") {
				error_msg = "Wrong account name supplied";
			} else {
				console.log("Im check failure reason: ", reason);
				error_msg = "Internal Server Error";
			}

			$check_message.html(error_msg).css({'color':'red'});
		} else {
			show_button = true;
			$check_message.html("Unknown error").css({'color':'red'});
		}

		if (show_button) {
			$check_button.show();
		}
	});

};

/**
 * Current status of the test message.
 *
 * @memberOf ImIntegration
 * @type {Boolean}
 */
ImIntegration.test_message_sending = false;

/**
 * Send a test message from a given user via a specified protocol.
 *
 * @memberOf ImIntegration
 * @param {String} source Source of the message.
 * @param {String} protocol Protocol to use while sending the message.
 * @see ImIntegration.test_message_sending
 */
ImIntegration.send_test_message = function (source, protocol) {
	var $input = jQuery("#" + source),
		buddy = $input.attr('value'),
		$button,
		$feedback_msg,
		params,
		feedback_msg = "",
		self = this;

	if (buddy.length === 0) {
		return;
	}
	if (this.test_message_sending) {
		return;
	}
	this.test_message_sending = true;
	$input.attr('readOnly', true);

	$button = jQuery("#" + source + "_test_button");
	$button.attr('value', "Sending...");
	$button.attr("disabled", true);

	$feedback_msg = jQuery("#" + protocol + "_message");
	$feedback_msg.html("");

	params = {};
	params.action = 'im_integration';
	params.im_integration_test_message = true;
	params.im_service = protocol;
	params.buddy = buddy;

	console.log("Sending test message to: " + buddy + " using " + protocol + " protocol");

	jQuery.ajax({
		url:      Livepress.Config.site_url + '/wp-admin/admin-ajax.php',
		type:     'post',
		dataType: 'json',
		data:     params,

		error: function (request) {
			feedback_msg = "Problem connecting to the blog server.";
		},

		success: function (data) {
			console.log("return from test message: %d", data);
			if (data === 200) {
				feedback_msg = "Test message sent";
			} else {
				feedback_msg = "Failure sending test message";
			}
		},

		complete: function (XMLHttpRequest, textStatus) {
			console.log("feed: %s", feedback_msg);
			$feedback_msg.html(feedback_msg);

			self.test_message_sending = false;
			$input.attr('readOnly', false);

			$button.attr('value', "Send test message again");
			$button.attr("disabled", false);
		}
	});
};
/*global Livepress, Dashboard, Collaboration, tinymce, tinyMCE, console, confirm, switchEditors */

/**
 * Global object into which we add our other functionality.
 *
 * @namespace
 * @type {Object}
 */
var OORTLE = OORTLE || {};

/**
 * Container for Livepress administration functionality.
 *
 * @memberOf Livepress
 * @namespace
 * @type {Object}
 */
Livepress.Admin = Livepress.Admin || {};

/**
 * Object that checks the live update status of a given post asynchronously.
 *
 * @memberOf Livepress.Admin
 * @namespace
 * @constructor
 * @requires Livepress.Config
 */
Livepress.Admin.PostStatus = function () {
	var CHECK_WAIT_TIME = 5, // Seconds
		MESSAGE_DISPLAY_TIME = 10, // Seconds
		SELF = this,
		spin = false;

	/**
	 * Add a spinner to the post form.
	 *
	 * @private
	 */
	function add_spin () {
		if (spin) {
			return;
		}
		spin = true;
		var $spinner = jQuery("<div class='lp-spinner'></div>")
			.attr('id', "lp_spin_img");
		jQuery("form#post").before($spinner);
	}

	/**
	 * Add a notice to alert the user of some change.
	 *
	 * This implementation is based in the edit-form-advanced.php html structure
	 * @param {String} msg Message to display to the user.
	 * @param {String} kind Type of message. Used as a CSS class for styling.
	 * @private
	 */
	function message (msg, kind) {
		kind = kind || "lp-notice";
		var $el = jQuery('<p/>').text(msg),
			$container = jQuery('<div class="lp-message ' + kind + '"></div>');
		$container.append($el);
		jQuery("#post").before($container);
		setTimeout(function () {
			$container.fadeOut(2000, function () {
				jQuery(this).remove();
			});
		}, MESSAGE_DISPLAY_TIME * 1000);
	}

	/**
	 * Remove the spinner added by add_spin().
	 *
	 * @private
	 */
	function remove_spin () {
		spin = false;
		jQuery('#lp_spin_img').remove();
	}

	/**
	 * Add an error message for the user.
	 *
	 * @param {String} msg Error message text.
	 * @private
	 */
	function error (msg) {
		message(msg, "lp-error");
	}

	/**
	 * Add a warning message for the user.
	 *
	 * @param {String} msg Warning message text.
	 * @private
	 */
	function warning (msg) {
		message(msg, "lp-warning");
	}

	/**
	 * Set the status of the post live update attempt.
	 *
	 * @param {String} status Status code.
	 * @private
	 */
	function set_status (status) {
		if (status === "completed") {
			message("Update was published live to users.");
			remove_spin();
		} else if (status === "failed") {
			warning("Update was published NOT live.");
			remove_spin();
		} else if (status === "lp_failed") {
			error("Can't get update status from LivePress.");
			remove_spin();
		} else if (status === "empty") {
			remove_spin();
		} else {
			setTimeout(SELF.check, CHECK_WAIT_TIME * 1000);
		}
	}

	/**
	 * Check the current post's update status.
	 *
	 * @requires Livepress.Config#ajax_nonce
	 * @requires Livepress.Config#post_id
	 */
	SELF.check = function () {
		add_spin();
		jQuery.ajax({
			url:     'admin-ajax.php',
			data:    {
				livepress_action: true,
				_ajax_nonce:      Livepress.Config.ajax_nonce,
				post_id:          Livepress.Config.post_id,
				action:           'lp_status'
			},
			success: set_status,
			error:   function () {
				error("Can't get update status from blog server.");
				remove_spin();
			}
		});
	};

	jQuery( window ).on( 'livepress.post_update', function () {
		add_spin();
		setTimeout(SELF.check, CHECK_WAIT_TIME * 1000);
	} );
};

/**
 * Object containing the logic to post updates to Twitter.
 *
 * @memberOf Livepress.Admin
 * @namespace
 * @constructor
 */
Livepress.Admin.PostToTwitter = function () {
	var sending_post_to_twitter = false,
		msg_span_id = 'post_to_twitter_message',
		check_timeout,
		oauth_popup,
		TIME_BETWEEN_CHECK_OAUTH_REQUESTS = 5;

	/**
	 * Show an OAuth popup if necessary.
	 *
	 * @param {String} url OAuth popup url.
	 * @private
	 */
	function show_oauth_popup( url ) {
		try {
			oauth_popup.close();
		} catch (exc) {
		}
		oauth_popup = window.open( url, '_blank', 'height=600,width=600' );
		jQuery("#post_to_twitter_url")
			.html('<br /><a href="' + url + '">' + url + '</a>')
			.click(function (e) {
				try {
					oauth_popup.close();
				} catch (exc) {
				}
				oauth_popup = undefined;
				oauth_popup = window.open( url, '_blank', 'height=600,width=600' );
				return false;
			})
			.show();
	}

	/**
	 * Check the current status of Twitter OAuth authorization.
	 *
	 * Will poll the Twitter API asynchronously and display an error if needed.
	 *
	 * @param {Number} attempts Number of times to check authorization status.
	 * @private
	 */
	function check_oauth_authorization_status(attempts) {
		var $msg_span = jQuery('#' + msg_span_id),
			times = attempts || 1,
			params = {action: 'check_oauth_authorization_status'};

		$msg_span.html('Checking authorization status... (' + times + ')');

		jQuery.ajax({
			url:   "./admin-ajax.php",
			data:  params,
			type:  'post',
			async: true,

			error:   function (XMLHttpRequest) {
				$msg_span.html('Failed to check status.');
			},
			success: function (data) {
				if (data.status === 'authorized') {
					$msg_span.html(
						'Sending out alerts on Twitter account: <strong>' + data.username + '</strong>.');
					jQuery("#lp-post-to-twitter-change_link").show();
					jQuery("#lp-post-to-twitter-change").hide();
				} else if (data.status === 'unauthorized') {
					handle_twitter_deauthorization();
				} else if (data.status === 'not_available') {
					var closed = false;
					if (oauth_popup !== undefined) {
						try {
							closed = oauth_popup.closed;
						} catch (e) {
							if (e.name.toString() === "ReferenceError") {
								closed = true;
							} else {
								throw e;
							}
						}
					}
					if (oauth_popup !== undefined && closed) {
						handle_twitter_deauthorization();
					} else {
						$msg_span.html("Status isn't available yet.");
						check_timeout = setTimeout(function () {
							check_oauth_authorization_status(++times);
						}, TIME_BETWEEN_CHECK_OAUTH_REQUESTS * 1000);
					}
				} else {
					$msg_span.html('Internal server error.');
				}
			}
		});
	}

	/**
	 * Update post on Twitter using current OAuth credentials.
	 *
	 * @param {Boolean} change_oauth_user Change the user making the request.
	 * @param {Boolean} disable Disable OAuth popup.
	 * @returns {Boolean} True when sending, False if already in the process of sending.
	 * @private
	 */
	function update_post_to_twitter(change_oauth_user, disable) {
		var $msg_span,
			params;

		if (sending_post_to_twitter) {
			return false;
		}
		sending_post_to_twitter = true;

		$msg_span = jQuery('#' + msg_span_id);

		params = {};
		params.action = 'post_to_twitter';
		params.enable = document.getElementById('lp-remote').checked;
		if (change_oauth_user) {
			params.change_oauth_user = true;
		}

		jQuery("#post_to_twitter_message_change_link").hide();
		jQuery("#post_to_twitter_url").hide();

		jQuery.ajax({
			url:   "./admin-ajax.php",
			data:  params,
			type:  'post',
			async: true,

			error:    function (XMLHttpRequest) {
				if (XMLHttpRequest.status === 409) {
					$msg_span.html('Already ' + ((params.enable) ? 'enabled.' : 'disabled.'));
				} else if (XMLHttpRequest.status === 502) {
					if (XMLHttpRequest.responseText === "404") {
						$msg_span.html("Can't connect to Twitter.");
					} else {
						$msg_span.html("Can't connect to livepress service.");
					}
				} else {
					$msg_span.html(
						'Failed for an unknown reason. (return code: ' + XMLHttpRequest.status + ')'
					);
				}
				clearTimeout(check_timeout);
			},
			success:  function (data) {
				if (params.enable) {
					console.log('OAuth url: ', data);
					$msg_span.html(
						'A new window should be open to Twitter.com awaiting your login.'
					);
					show_oauth_popup(data);
					check_timeout = setTimeout(check_oauth_authorization_status,
						TIME_BETWEEN_CHECK_OAUTH_REQUESTS * 1000);
				} else {
					clearTimeout(check_timeout);
					if (disable !== true) {
						$msg_span.html('');
					}
				}
			},
			complete: function () {
				sending_post_to_twitter = false;
			}
		});

		return true;
	}

	/**
	 * If Twitter access is unauthorized, show the user an approripate message.
	 *
	 * @private
	 */
	function handle_twitter_deauthorization() {
		var $msg_span = jQuery( '#' + msg_span_id );
		$msg_span.html( 'Twitter access unauthorized.' );
		update_post_to_twitter( false, true );
	}

	/**
	 * Universal callback function used inside click events.
	 *
	 * @param {Event} e Event passed by the click event.
	 * @param {Boolean} change_oauth_user Flag to change the current OAuth user.
	 * @private
	 */
	function callback( e, change_oauth_user ) {
		e.preventDefault();
		e.stopPropagation();
		update_post_to_twitter( change_oauth_user );
	}

	jQuery( "#post_to_twitter" ).on( 'click', function ( e ) {
		callback( e, false );
	} );

	jQuery( "#lp-post-to-twitter-change, #lp-post-to-twitter-change_link" ).on( 'click', function ( e ) {
		callback( e, true );
	} );

	jQuery( "#lp-post-to-twitter-not-authorized" ).on( 'click', function ( e ) {
		jQuery( '#' + msg_span_id ).html(
			'A new window should be open to Twitter.com awaiting your login.'
		);
		show_oauth_popup( this.href );
		check_timeout = window.setTimeout( check_oauth_authorization_status, TIME_BETWEEN_CHECK_OAUTH_REQUESTS * 1000 );
		return false;
	} );
};

/**
 * Object containing the logic responsible for the Live Blogging Tools palette.
 *
 * @memberOf Livepress.Admin
 * @namespace
 * @constructor
 * @requires OORTLE.Livepress.LivepressHUD.init
 * @requires Collaboration.Edit.initialize
 */
Livepress.Admin.Tools = function () {
	var tools_link_wrap = document.createElement( 'div' );
	tools_link_wrap.className = 'hide-if-no-js screen-meta-toggle';
	tools_link_wrap.setAttribute( 'id', 'blogging-tools-link-wrap' );

	var tools_link = document.createElement( 'a' );
	tools_link.className = 'show-settings';
	tools_link.setAttribute( 'id', 'blogging-tools-link' );
	tools_link.setAttribute( 'href', '#blogging-tools-wrap' );

	var tools_wrap = document.createElement( 'div' );
	tools_wrap.className = 'hidden';
	tools_wrap.setAttribute( 'id', 'blogging-tools-wrap' );

	var $tools_link_wrap = jQuery( tools_link_wrap ),
		$tools_wrap = jQuery( tools_wrap );

	/**
	 * Asynchronously load the markup for the Live Blogging Tools palette from the server and inject it into the page.
	 *
	 * @private
	 */
	function getTabs () {
		jQuery.ajax({
			url:     Livepress.Config.ajax_url,
			data:    {
				action:  'get_blogging_tools',
				post_id: Livepress.Config.post_id
			},
			type:    'post',
			success: function (data) {
				tools_wrap.innerHTML = data;

				jQuery('.blogging-tools-tabs').on('click', 'a', function (e) {
					var link = jQuery(this), panel;

					e.preventDefault();

					if (link.is('.active a')) {
						return false;
					}

					jQuery('.blogging-tools-tabs .active').removeClass('active');
					link.parent('li').addClass('active');

					panel = jQuery(link.attr('href'));

					jQuery('.blogging-tools-content').not(panel).removeClass('active').hide();
					panel.addClass('active').show();

					return false;
				});

				wireupDefaults();
			}
		});
	}

	/**
	 * Configure event handlers for default Live Blogging Tools tabs.
	 *
	 * @private
	 */
	function wireupDefaults () {
		var nonces = jQuery('#blogging-tool-nonces');

		jQuery('#tab-panel-live-notes').on('click', 'input[type="submit"]', function (e) {
			var submit = jQuery( this ),
				status = jQuery( '.live-notes-status' );
			e.preventDefault();

			submit.attr('disabled', 'disabled');

			jQuery.ajax({
				url:     Livepress.Config.ajax_url,
				data:    {
					action:     'update-live-notes',
					post_id:    Livepress.Config.post_id,
					content:    jQuery('#live-notes-text').val(),
					ajax_nonce: nonces.data('live-notes')
				},
				type:    'post',
				success: function (data) {
					submit.removeAttr('disabled');
					status.show();

					setTimeout( function() {
						status.addClass( 'hide-fade' );

						setTimeout( function() {
							status.hide().removeClass( 'hide-fade' );
						}, 3000 );
					}, 2000 );
				}
			});
		});

		jQuery('#lp-pub-status-bar').on('click', 'a.toggle-live', function (e) {
			e.preventDefault();

			jQuery.ajax({
				url:     Livepress.Config.ajax_url,
				data:    {
					action:     'update-live-status',
					post_id:    Livepress.Config.post_id,
					ajax_nonce: nonces.data('live-status')
				},
				type:    'post',
				success: function (data) {
					var $bar = jQuery('#lp-pub-status-bar').toggleClass('live').toggleClass('not-live');

					$bar.find('a.toggle-live span').toggleClass('hidden');
					$bar.find('.icon').toggleClass('live').toggleClass('not-live');
					$bar.find('.first-line').find('.lp-on, .lp-off').toggleClass('hidden');
					$bar.find('.second-line').find('.inactive').toggleClass('hidden');
					$bar.find('.recent').addClass('hidden');
				}
			});
		});

		jQuery.ajax({
			url:      Livepress.Config.ajax_url,
			data:     {
				action:  'update-live-comments',
				post_id: Livepress.Config.post_id
			},
			type:     'post',
			dataType: 'json',
			success:  function (data) {
				OORTLE.Livepress.LivepressHUD.init();
				Collaboration.Edit.initialize(data);
			}
		});

		// Initialize the Twitter handler
		if ( undefined !== window.Dashboard ) {
			window.Dashboard.Twitter.init();
		}
	}

	/**
	 * Render the loaded default tabs into the UI.
	 */
	this.render = function () {
		var element = document.getElementById( 'blogging-tools-link-wrap' );
		if ( null !== element ) {
			element.parentNode.removeChild( element );
		}

		element = document.getElementById( 'blogging-tools-link' );
		if ( null !== element ) {
			element.parentNode.removeChild( element );
		}

		element = document.getElementById( 'blogging-tools-wrap' );
		if ( null !== element ) {
			element.parentNode.removeChild( element );
		}

		tools_link.innerText = 'Live Blogging Tools';
		tools_link_wrap.appendChild( tools_link );

		$tools_link_wrap.insertAfter('#screen-options-link-wrap');

		$tools_wrap.insertAfter('#screen-options-wrap');

		getTabs();

		jQuery( window ).trigger( 'livepress.blogging-tools-loaded' );
	};
};

jQuery(function () {
	var pstatus = new Livepress.Admin.PostStatus(),
		post_to_twitter = new Livepress.Admin.PostToTwitter();

	pstatus.check();

	/**
	 * Title: LivePress Plugin Documentation
	 * Details the current LivePress plugin architecture (mostly internal objects).
	 * This plugin works by splitting a blog entry into micro posts (identified by special div tags),
	 * receiving new micro posts from other authors (ajax) while allowing the logged-in
	 * user to post micro post updates (ajax).
	 *
	 * Authors:
	 * Mauvis Ledford <switchstatement@gmail.com>
	 * Filipe Giusti <filipegiusti@gmail.com>
	 *
	 * Section: (global variables)
	 * These are variables accessible in the global Window namespace.
	 *
	 * method: tinyMCE.activeEditor.execCommand('livepress-activate')
	 * Enables Livepress mode. Hides original TinyMCE area and displays LiveCanvas area. (Note that actual method call depends on <namespace>.)
	 *
	 * method: tinyMCE.activeEditor.execCommand('livepress-deactivate')
	 * Disables Livepress mode. Redisplays original TinyMCE area. Hides LiveCanvas area. (Note that actual method call depends on <namespace>.)
	 *
	 * Events: global jQuery events.
	 * See full list. LivePress events let you tie arbitrary code execution to specific happenings.
	 *
	 * start.livepress       -  _(event)_ Triggered when LivePress is starting.
	 * stop.livepress        -  _(event)_ Triggered when LivePress is stopping.
	 * livepress.post_update -  _(event)_ Triggered when a new post update is made.
	 *
	 * Example: To listen for a livepress event run the following.
	 *
	 * >  $j(document).bind('stop.livepress', function(){
	 * >    alert(1);
	 * >  });
	 */

	/**
	 * Custom animate plugin for animating LivePressHUD.
	 *
	 * @memberOf jQuery
	 * @param {Number} newInt New integer to which we are animating.
	 */
	jQuery.fn.animateTo = function (newInt) {
		var incremental = 1,
			$this = jQuery(this),
			oldInt = parseInt($this.text(), 10),
			t,
			ani;

		if (oldInt === newInt) {
			return;
		}

		if (newInt < oldInt) {
			incremental = incremental * -1;
		}

		ani = (function () {
			return function () {
				oldInt = oldInt + incremental;
				$this.text(oldInt);
				if (oldInt === newInt) {
					clearInterval(t);
				}
			};
		}());
		t = setInterval(ani, 50);
	};

	if (OORTLE.Livepress === undefined && window.tinymce !== undefined) {
		/**
		 * Global Livepress object inside the OORTLE namespace. Distinct from the global window.Livepress object.
		 *
		 * @namespace
		 * @memberOf OORTLE
		 * @type {Object}
		 */
		OORTLE.Livepress = (function () {
			var LIVEPRESS_DEBUG = false,
				LiveCanvas,
				$liveCanvas,
				/**
				 * Object that controls the Micro post form that replaces (hides) the original WordPress TinyMCE form.
				 * It is blue instead of grey and posts (ajax) to the LiveCanvas area.
				 *
				 * @private
				 */
					microPostForm,

				/** Plugin namespace used for DOM ids and CSS classes. */
					namespace = 'livepress',
				/** Name of the current plugin. Must also be the name of the plugin directory. */
					pluginName = 'livepress-wp',
				i18n = tinyMCE.i18n,
				/** Default namespace of the current plugin. */
					pluginNamespace = 'en.livepress.',
				/** Relative folder for the TinyMCE plugin. */
					path = Livepress.Config.lp_plugin_url + 'tinymce/',

				/** Base directory from where the Livepress TinyMCE plugin loads. */
					d = tinyMCE.baseURI.directory,

				/** All configurable options. */
					config = Livepress.Config.PostMetainfo,

				$eDoc,
				$eHTML,
				$eHead,
				$eBody,

				livepressHUD,
				inittedOnce,
				username,
				Helper,
				livePressChatStarted = false,
				placementOrder = config.placement_of_updates,

				$j = jQuery,
				$ = document.getElementById,

				extend = tinymce.extend,
				each = tinymce.each,

				livepress_init;

			window.eeActive = false;

			// local i18n object, merges into tinyMCE.i18n
			each({
				// HUD
				'start':      'Start live blogging',
				'stop':       'Stop live blogging',
				'readers':    'readers online',
				'updates':    'live updates posted',
				'comments':   'comments',

				// TOGGLE
				'toggle':     'Click to toggle',
				'title':      'Live Blogging Real-Time Editor',
				'toggleOff':  'off',
				'toggleOn':   'on',
				'toggleChat': 'Private chat'
			}, function (val, name, obj) {
				i18n[pluginNamespace + name] = val;
			});

			/**
			 * Creates a stylesheet link for the specified file.
			 *
			 * @param {String} file Filename of the CSS to include.
			 * @return {Object} jQuery object containing the new stylesheet reference.
			 */
			function $makeStyle (file) {
				return $j('<link rel="stylesheet" type="text/css" href="' + path + 'css/' + file + '.css' + '?' + (+new Date()) + '" />');
			}

			/**
			 * Retrieve a string from the i18n object.
			 *
			 * @param {String} string Key to pull from the i18n object.
			 * @returns {String} Value stored in the i18n object.
			 */
			function getLang (string) {
				return i18n[pluginNamespace + string];
			}

			/**
			 * Informs you of current live posters, comments, etc.
			 *
			 * @namespace
			 * @memberOf OORTLE.Livepress
			 * @returns {Object}
			 * @type {LivepressHUD}
			 * @constructor
			 */
			function LivepressHUD () {
				var $livepressHud,
					$readers,
					$posts,
					$comments,
					$labels = {};

				/** Hide the HUD. */
				this.hide = function () {
					$livepressHud.slideUp('fast');
				};

				/** Hide the HUD. */
				this.show = function () {
					$livepressHud.slideDown('fast');
				};

				/**
				 * Initialize the HUD object.
				 *
				 * @see LivepressHUD#show
				 */
				this.init = function () {
					$livepressHud = $j('.inner-lp-dashboard');
					$readers = $j('#livepress-online_num');
					$posts = $j('#livepress-updates_num');
					$comments = $j('#livepress-comments_num');
					$labels['readers'] = $readers.siblings( '.label' );
					//$labels['authors'] = $posts.siblings( '.label' );
					$labels['comments'] = $comments.siblings( '.label' );
					this.show();
				};

				/**
				 * Update the number of readers subscribed to the post.
				 *
				 * @param {Number} number New number of readers.
				 * @returns {Object} jQuery object containing the readers display element.
				 */
				this.updateReaders = function (number) {
					var label = ( 1 === number ) ? 'Person Online' : 'People Online';

					$labels['readers'].text( label );

					return $readers.text(number);
				};

				/**
				 * Update the number of live updates.
				 *
				 * @param {Number} number New number of updates.
				 * @returns {Object} jQuery object containing the updates display element.
				 */
				this.updateLivePosts = function (number) {
					if ($posts.length === 0) {
						$posts = $j('#livepress-updates_num');
					}

					return $posts.text(number);
				};

				/**
				 * Update the number of comments.
				 *
				 * @param {Number} number New number of comments.
				 * @return {Object} jQuery object containing the comments display element.
				 */
				this.updateComments = function (number) {
					var label = ( 1 === number ) ? 'Comment' : 'Comments';

					$labels['comments'].text( label );

					return $comments.text(number);
				};

				/**
				 * Add to the total number of comments.
				 *
				 * @param {Number} number Number to add to the current number of comments.
				 */
				this.sumToComments = function (number) {
					var $comments = $j('#livepress-comments_num'),
						actual = parseInt($comments.text(), 10 ),
						count = actual + number,
						label = ( 1 === count ) ? 'Comment' : 'Comments';

					$labels['comments'].text( label );

					$comments.text( count );
				};

				return this;
			}

			jQuery(window).on('start.livechat', function () {
				if (!livePressChatStarted) {
					livePressChatStarted = true;

					$j('<link rel="stylesheet" type="text/css" href="' + Livepress.Config.lp_plugin_url + 'css/collaboration.css' + '?' + (+new Date()) + '" />').appendTo('head');

					// load custom version of jQuery.ui if it doesn't contain the dialogue plugin
					if (!jQuery.fn.dialog) {
						$j.getScript(path + 'jquery.ui.js', function () {
							$makeStyle('flick/jquery-ui-1.7.2.custom').appendTo('head');
							// Out of first LP release
							//          Collaboration.Chat.initialize();
						});
						//} else {
						// Out of first LP release
						//        Collaboration.Chat.initialize();
					}
				} else {
					console.log('already loaded chat before');
					// Out of first LP release
					//      Collaboration.Chat.initialize();
				}
			});

			$makeStyle('outside').appendTo('head');

			/**
			 * Initialize the Livepress HUD.
			 */
			livepress_init = function () {
				// On first init we load in external and internal styles
				// on secondary called we just disable / enable
				if (!inittedOnce) {
					inittedOnce = true;

					var activeEditor = tinyMCE.activeEditor;
					if (activeEditor) {
						$eDoc = $j(tinyMCE.activeEditor.getDoc());
						$eHTML = $eDoc.find('html:first');
						$eHead = $eDoc.find('head:first');
						$eBody = $eDoc.find('body:first');
					} else {
						$eDoc = $eHTML = $eHead = null;
					}

					if (Livepress.Config.debug !== undefined && Livepress.Config.debug) {
						$j(document).find('html:first').addClass('debug');
						if ($eDoc != null) {
							$eDoc.find('html:first').addClass('debug');
						}
					}

				}

				OORTLE.Livepress.LivepressHUD.show();

				setTimeout(LiveCanvas.init, 1);

				$j(document.body).add($eHTML).addClass(namespace + '-active');
			};

			jQuery(window).on('start.livepress', function () {
				window.eeActive = true;
				// switch to visual mode if in html mode
				if (!tinyMCE.editors.content) {
					switchEditors.go('content', 'tmce');
				}

				// A timeout is used to give TinyMCE a time to invoke itself and refresh the DOM.
				setTimeout(livepress_init, 5);
			});

			jQuery(window).on('stop.livepress', function () {
				window.eeActive = false;
				OORTLE.Livepress.LivepressHUD.hide();
				// Stops the livepress collaborative edit
				Collaboration.Edit.destroy();

				$j(document.body).add($eHTML).removeClass(namespace + '-active');
				LiveCanvas.hide();
			});

			/**
			 * Generic helper object for the real-time editor.
			 *
			 * @returns {Object}
			 * @constructor
			 * @memberOf OORTLE.Livepress
			 * @private
			 */
			function InnerHelper () {
				var SELF = this,
					NONCES = jQuery( '#livepress-nonces' ),
					hasRegex = new RegExp("\\[livepress_metainfo[^\\]]*]"),
					onlyRegex = new RegExp("^\\s*\\[livepress_metainfo[^\\]]*]\\s*$");

				/**
				 * Dispatch a specific action to the server asynchronously.
				 *
				 * @param {String} action Server-side action to invoke.
				 * @param {String} content Content in the current editor window.
				 * @param {Function} callback Function to invoke upon success or failure.
				 * @param {Object} additional Additional parameters to send with the request
				 * @return {Object} jQuery.
				 */
				SELF.ajaxAction = function (action, content, callback, additional) {
					return jQuery.ajax({
						type:     "POST",
						url:      Livepress.Config.site_url + '/wp-admin/admin-ajax.php',
						data:     jQuery.extend({
							action:  action,
							content: content,
							post_id: Livepress.Config.post_id
						}, additional || {}),
						dataType: "json",
						success:  callback,
						error:    function (jqXHR, textStatus, errorThrown) {
							callback.apply(jqXHR, [undefined, textStatus, errorThrown]);
						}
					});
				};

				/**
				 * Start the Real-Time Editor.
				 *
				 * @param {String} content Content in the current editor window.
				 * @param {Function} callback Function to invoke upon success or failure,
				 * @returns {Object} jQuery
				 */
				SELF.doStartEE = function (content, callback) {
					return SELF.ajaxAction('start_ee', content, callback);
				};

				/**
				 * Append a new post update.
				 *
				 * @param {String} content Content to append.
				 * @param {Function} callback Function to invoke after processing.
				 * @param {String} title Title of the update.
				 * @returns {Object} jQuery
				 */
				SELF.appendPostUpdate = function (content, callback, title) {
					var args = (title === undefined) ? {} : {title: title};
					args._ajax_nonce = NONCES.data('append-nonce');

					jQuery('.peeklink span, .peekmessage').removeClass('hidden');
					jQuery('.peek').addClass('live');
					return SELF.ajaxAction('append_post_update', content, callback, args);
				};

				/**
				 * Modify a specific post update.
				 *
				 * @param {string} updateId ID of the update to change.
				 * @param {String} content Content with which to modify the update.
				 * @param {Function} callback Function to invoke after processing.
				 * @returns {Object} jQuery
				 */
				SELF.changePostUpdate = function (updateId, content, callback) {
					var nonce = NONCES.data('change-nonce');
					return SELF.ajaxAction('change_post_update', content, callback, {update_id: updateId, _ajax_nonce: nonce});
				};

				/**
				 * Remove a post update.
				 *
				 * @param {String} updateId ID of the update to remove.
				 * @param {Function} callback Function to invoke after processing.
				 * @returns {Object} jQuery
				 */
				SELF.deletePostUpdate = function (updateId, callback) {
					var nonce = NONCES.data('delete-nonce');
					return SELF.ajaxAction('delete_post_update', "", callback, {update_id: updateId, _ajax_nonce: nonce});
				};

				/**
				 * Get text from the editor, but preprocess it the same way WordPress does first.
				 *
				 * @param {Object} editor TinyMCE editor instance.
				 * @returns {String} Preprocessed text from editor.
				 */
				SELF.getProcessedContent = function (editor) {
					if ( undefined === editor ) {
						return;
					}

					var originalContent = editor.getContent({format: 'raw'});
					originalContent = originalContent.replace( '<p><br data-mce-bogus="1"></p>', '' );

					if ( '' === originalContent.trim() ) {
						editor.undoManager.redo();

						originalContent = editor.getContent( { format: 'raw' } ).replace( '<p><br data-mce-bogus="1"></p>', '' );

						if ( '' === originalContent.trim() ) {
							return;
						}
					}

					var processed = switchEditors.pre_wpautop(originalContent);
					if (jQuery('.livepress-author-info input[type="checkbox"]').is(':checked') && jQuery(editor.formElement.outerHTML).hasClass('livepress-newform')) {
						processed = SELF.newMetainfoShortcode(true) + processed;
					}

					return processed;
				};

				/**
				 * Gets the metainfo shortcode.
				 *
				 * @param {Boolean} omitNewline Flag to omit adding \n to the end of the shortcode.
				 * @returns {String} Metainfo shortcode.
				 */
				SELF.newMetainfoShortcode = function (omitNewline) {
					var metainfo = "[livepress_metainfo",
						d,
						utc,
						server_time;

					omitNewline = omitNewline || false;

					if (config.author_display_name) {
						metainfo += ' author="' + config.author_display_name + '"';
					}

					d = new Date();
					utc = d.getTime() + (d.getTimezoneOffset() * 60000); // Minutes to milisec
					server_time = utc + (3600000 * Livepress.Config.blog_gmt_offset); // Hours to milisec
					server_time = new Date(server_time);
					if (config.timestamp_template) {
						if (window.eeActive) {
							metainfo += ' time="' + server_time.format(config.timestamp_template) + '"';
						} else {
							metainfo += ' POSTTIME ';
						}
					}

					if (config.has_avatar) {
						metainfo += ' has_avatar="1"';
					}

					metainfo += "]";

					if (!omitNewline) {
						metainfo += "\n";
					}

					return metainfo;
				};

				/**
				 * Tests if metainfo shortcode included in text.
				 *
				 * @param {String} text Text to test.
				 * @return {Boolean} Whether or not meta info is included in the shortcode.
				 */
				SELF.hasMetainfoShortcode = function (text) {
					return hasRegex.test(text);
				};

				/**
				 * Tests if text is ''only'' the metainfo shortcode.
				 *
				 * @param {String} text Text to test.
				 * @return {Boolean} Whether or not text is only the metainfo shortcode.
				 */
				SELF.hasMetainfoShortcodeOnly = function (text) {
					return onlyRegex.test(text);
				};
			}

			Helper = new InnerHelper();

			/**
			 * Class that creates and controls TinyMCE-enabled form.
			 * - called by the LiveCanvas whenever a new post needs to be added or edited.
			 * - It converts selected element into a tinymce area and adds buttons to performs particular actions.
			 * - It currently has two modes "new" or "editing".
			 *
			 * @param {String} mode Either 'editing' or 'new.' If 'new,' will create a new TinyMCE form after element el.
			 * @param {String} el DOM identifier of element to be removed.
			 * @returns {Object} New Selection object
			 * @memberOf OORTLE.Livepress
			 * @constructor
			 * @private
			 */
			function Selection ( mode, el ) {
				var SELF = this;

				SELF.handle = namespace + '-tiny' + (+new Date());

				SELF.mode = mode;

				if (SELF.mode === 'new') {
					SELF.originalContent = "";
					if (tinyMCE.onRemoveEditor !== undefined) {
						tinyMCE.onRemoveEditor.add(function (mgr, ed) {
							if ((ed !== SELF) && (tinyMCE.editors.hasOwnProperty(SELF.handle))) {
								try {
									tinyMCE.execCommand('mceFocus', false, SELF.handle);
								} catch (err) {
									console.log("mceFocus error", err);
								}
							}
							return true;
						});
					}
				} else if (SELF.mode === 'editing' || SELF.mode === 'deleting') {
					// saving old content in case of reset
					var $el = $j(el);
					SELF.originalHtmlContent = $el.data("originalHtmlContent") || $el;
					SELF.originalContent = $el.data("originalContent") || $el.data("nonExpandedContent") || '';
					SELF.originalId = $el.data('originalId');
					SELF.originalUpdateId = $el.attr('id');
					if (SELF.mode === 'deleting') {
						SELF.newEditContent = null; // Display to user content to be removed by update
					} else {
						SELF.newEditContent = $el.data("nonExpandedContent"); // Display to user current content
					}
				}

				// See switchEditors.go('tinymce') -- wpautop should be processed before running RichEditor
				SELF.newEditContent = SELF.newEditContent ? switchEditors.wpautop(SELF.newEditContent) : SELF.newEditContent;
				SELF.formLayout = SELF.formLayout.replace('{content}', SELF.newEditContent || SELF.originalContent || '');
				SELF.formLayout = SELF.formLayout.replace('{handle}', SELF.handle);
				SELF.$form = $j(SELF.formLayout)
					.find('div.livepress-form-actions:first').on( 'click', function (e) {
						SELF.onFormAction(e);
					} )
					.end()
					// running it this way is required since we don't have Function.bind
					.on( 'submit', function () {
						SELF.onSave();
						return false;
					} );
				SELF.$form.attr('id', SELF.originalUpdateId);
				SELF.$form.data('originalId', SELF.originalId);
				SELF.$form.addClass('livepress-update-form');
				if (mode === 'new') {
					SELF.$form.find('input.button:not(.primary)').remove();
					SELF.$form.find('a.livepress-delete').remove();
					SELF.$form.addClass(namespace + '-newform');
					SELF.$form.find( 'input.button-primary' ).attr( 'disabled', 'disabled' );
					if ($j('#post input[name=original_post_status]').val() !== 'publish') {
						SELF.$form.find('input.published').remove();
						SELF.$form.find('.quick-publish').remove();
					} else {
						SELF.$form.find('input.notpublished').remove();
					}
				} else {
					SELF.$form.find('.primary.button-primary').remove();
					SELF.$form.find('.livepress-author-info').remove();
					if (mode === 'deleting') {
						SELF.$form.addClass(namespace + '-delform');
					}
				}
				return this;
			}

			extend(Selection.prototype, {
				/*
				 * variable: mode
				 * The mode of this Selection object (currently either 'new' or 'editing' or 'deleting')
				 */
				mode:        null,

				/*
				 * variable: formLayout
				 */
				formLayout:  [
					'<form>',
					'<div class="editorcontainer">',
					'<textarea id="{handle}">{content}</textarea>',
					'</div>',
					'<div class="editorcontainerend"></div>',
					'<div class="livepress-form-actions">',
					'<div class="livepress-author-info"><input type="checkbox" checked="checked" /> ' + ('include timestamp and author information') + '</div>',
					'<a href="#" class="livepress-delete" data-action="delete">' + ('Delete Permanently') + '</a>',
					'<span class="quick-publish">' + ('Ctrl+Enter') + '</span>',
					'<input class="livepress-cancel button button-secondary" type="button" value="' + ('Cancel') + '" data-action="cancel" />',
					'<input class="livepress-update button button-primary" type="submit" value="' + ('Save') + '" data-action="update" />',
					'<input class="livepress-submit published primary button-primary" type="submit" value="' + ('Push Update') + '" data-action="update" />',
					'<input class="livepress-submit notpublished primary button-primary" type="submit" value="' + ('Add update') + '" data-action="update" />',
					'</div>',
					'<div class="clear"></div>',
					'</form>'
				].join(''),

				/*
				 * function: enableTiny
				 */
				enableTiny:  function (optClass) {
					var te,
						selection = this,
						pushBtn = jQuery('.livepress-newform' ).find('input.button-primary');
					// initialize default editor at required selector
					tinyMCE.execCommand('mceAddControl', false, this.handle);
					te = tinyMCE.editors[this.handle];
					if (!te) {
						console.log("Unable to get editor for " + this.handle);
						return;
					}
					te.dom.loadCSS(path + 'css/inside.css' + '?' + (+new Date()));
					// only our punymce editors have this class, used for additional styling
					te.dom.addClass(te.dom.getRoot(), 'livepress_editor');
					if (optClass) {
						te.dom.addClass(te.dom.getRoot(), 'livepress-' + optClass + '_editor');
						te.dom.addClass(te.dom.getRoot().parentNode, 'livepress-' + optClass + '_editor');
					}
					if (config.has_avatar) {
						te.dom.addClass(te.dom.getRoot(), 'livepress-has-avatar');
					}

					te.onKeyDown.add(function (ed, e) {
						if (e.ctrlKey && e.keyCode === 13) {
							e.preventDefault();

							// TinyMCE doesn't hit this event until *after* the line return was added. So remove it manually.
							ed.undoManager.undo();

							selection.onSave();
						}
					});

					te.onKeyUp.add( function (ed, e) {
						if ( '' !== ed.getContent().trim() ) {
							pushBtn.removeAttr( 'disabled' );
						} else {
							pushBtn.attr( 'disabled', 'disabled' );
						}
					} );
				},

				/*
				 * function: disableTiny
				 */
				disableTiny: function () {
					tinyMCE.execCommand('mceRemoveControl', false, this.handle);
				},

				/*
				 * function: stash
				 */
				stash:       function () {
					this.disableTiny();
					this.$form.remove();
				},

				/**
				 * Synchronize content from Real-Time Editor to hidden normal editor.
				 * Copies full state of currently open editor, including open and not saved yet.
				 */
				syncData:       function () {
					var newContent = "",
						addCnt,
						t;

					$liveCanvas.find('div.inside:first').children().each(function () {
						var $this = $j(this),
							cnt = $this.data('nonExpandedContent'),
							handle,
							te;

						if (!cnt) {
							handle = $this.find("textarea").attr('id');
							te = tinyMCE.editors[handle];
							if (handle) {
								if (te.dom.hasClass(te.dom.getRoot(), 'livepress-del_editor')) {
									cnt = "";
								} else {
									cnt = Helper.getProcessedContent(te);
								}
							}
							if (cnt !== "" && cnt.substr(-1) !== ">" && cnt.substr(-1) !== "\n") {
								cnt += "\n";
							}
						}
						newContent += cnt;
					});

					// Handle non-saved update
					addCnt = Helper.getProcessedContent( tinyMCE.editors[ microPostForm.handle ] );
					if ( undefined !== addCnt && ! Helper.hasMetainfoShortcodeOnly( addCnt ) ) {
						if (placementOrder === 'bottom') {
							newContent = newContent + "\n\n" + addCnt;
						} else {
							newContent = addCnt + "\n\n" + newContent;
						}
					}

					// We take over tinyMCE.editors.content namespace due to wordpress's hardcoding
					t = tinyMCE.editors.originalContent || tinyMCE.editors.content;
					t.setContent(switchEditors.wpautop(newContent), {format: 'raw'});
				},

				/*
				 * function: mergeData
				 * merge data from external Edit info with current liveCanvas
				 */
				mergeData:      function (regions) {
					var r, c, nc, reg, $block, curr = [], currlink = {}, reglink = {},
						$inside_first = $liveCanvas.find('div.inside:first');
					// Get list of currently visible regions
					$inside_first.children().each(function () {
						var $this = $j(this),
							cnt = $this.data('nonExpandedContent'),
							handle = $this.data('originalId');
						currlink[handle] = curr.length;
						curr[curr.length] = {'id': handle, 'cnt': cnt, 'handle': $this};
					});
					for (r = 0; r < regions.length; r++) {
						reglink[regions[r].id] = r;
					}
					// Merge list with incoming list
					for (r = 0, c = 0; r < regions.length && c < curr.length;) {
						if (regions[r].id === curr[c].id) {
							// nothing
							r++;
							c++;
						} else if (regions[r].id in currlink) {
							nc = currlink[regions[r].id];
							// from c to nc-1 regions are removed
							for (; c < nc; c++) {
								curr[c].handle.remove();
								curr[c].handle = undefined;
							}
							r++;
							c++;
						} else {
							// new region added just before c
							reg = regions[r];
							$block = $j(reg.prefix + reg.proceed + reg.suffix);
							$block.data("nonExpandedContent", reg.content);
							$block.data("originalContent", reg.orig);
							$block.data("originalHtmlContent", reg.origproc);
							$block.data("originalId", reg.id);
							$block.attr("editStyle", "");
							$block.insertBefore(curr[c].handle);
							r++; // left c untouched
						}
					}
					// Remove all regions not existed in received update
					for (; c < curr.length; c++) {
						curr[c].handle.remove();
					}
					// Append all new regions
					for (; r < regions.length; r++) {
						reg = regions[r];
						$block = $j(reg.prefix + reg.proceed + reg.suffix);
						$block.data("nonExpandedContent", reg.content);
						$block.data("originalContent", reg.orig);
						$block.data("originalHtmlContent", reg.origproc);
						$block.data("originalId", reg.id);
						$block.attr("editStyle", "");
						$inside_first.append($block);
					}
					Collaboration.Edit.update_live_posts_number();
				},

				/*
				 * function: onFormAction
				 */
				onFormAction:   function (e) {
					var val = e.target.getAttribute("data-action");
					if (val === 'cancel') {
						this.onCancel();
						return false;
					} else if (val === 'delete') {
						e.preventDefault();
						this.onDelete();
						return false;
					}
					// skipped (must be a save)...
				},

				/*
				 * function: displayContent
				 * replaces given element with formatted text update
				 */
				displayContent: function (el) {
					var $newPost = $j(this.originalHtmlContent);
					$newPost.data("nonExpandedContent", this.originalContent);
					$newPost.data("originalContent", "");
					$newPost.attr('editStyle', ''); // on cancel, disable delete mode
					$newPost.insertAfter(el);
					el.remove();
					this.addListeners($newPost);
					$liveCanvas.data('mode', '');
					return false;
				},

				/*
				 * function: onSave
				 * Modifies livepress-tiny.
				 */
				onSave:         function () {
					// First, we need to be sure we're toggling the update indicator if they're disabled
					var $bar = jQuery('#lp-pub-status-bar');

					// If the bar has this class, it means updates are disabled ... so don't do anything
					if (!$bar.hasClass('no-toggle')) {
						$bar.removeClass('not-live').addClass('live');

						$bar.find('a.toggle-live span').removeClass('hidden');
						$bar.find('.icon').addClass('live').removeClass('not-live');
						$bar.find('.first-line').find('.lp-on').removeClass('hidden');
						$bar.find('.first-line').find('.lp-off').addClass('hidden');
						$bar.find('.second-line').find('.inactive').addClass('hidden');
						$bar.find('.recent').removeClass('hidden');
					}

					var newContent = Helper.getProcessedContent(tinyMCE.editors[this.handle]);
					// Check, is update empty
					var hasTextNodes = $j('<div>').append(newContent).contents().filter(function () {
						return this.nodeType === 3 || this.innerHtml !== '' || this.innerText !== '';
					}).length > 0;
					var onlyMeta = Helper.hasMetainfoShortcodeOnly(newContent);
					if ((!hasTextNodes && $j(newContent).text().trim() === '') || onlyMeta) {
						if (this.mode === 'new') {
							var afterTitleUpdate = function (res) {
								return false;
							};
							// If new update empty -- just send title update
							Helper.appendPostUpdate("", afterTitleUpdate, $j('#title').val());
							return false;
						} else {
							// If user tries to save empty update -- that means that he want to delete it
							return this.onDelete();
						}
					} else {
						var $spinner = $j("<div class='lp-spinner'></div>");
						var $spin = $spinner;
						var afterUpdate = (function (self) {
							return function (region) {
								self.originalHtmlContent = region.prefix + region.proceed + region.suffix;
								self.originalContent = region.content;
								self.originalId = region.id;
								self.displayContent($spin);
								Collaboration.Edit.update_live_posts_number();
							};
						}(this));
						// Save of non-empty update can be:
						// 1) append from new post form
						if (this.mode === 'new' /*&& this.handle == microPostForm.handle*/) {
							var action = placementOrder === 'bottom' ? 'appendTo' : 'prependTo';
							$spinner[action]($liveCanvas.find('div.inside:first'));
							tinyMCE.editors[this.handle].setContent("");
							Helper.appendPostUpdate(newContent, afterUpdate, $j('#title').val());
						} else
						// 2) save of newly appended text somewhere [TODO]
						/*if(this.mode === 'new') {
						} else*/
						// 3) change of already existent update
						{
							tinyMCE.execCommand('mceRemoveControl', false, this.handle);
							$spinner.insertAfter(this.$form);
							$spinner.data("nonExpandedContent", newContent); // Make sure syncData works even while spinner active
							this.$form.remove();
							Helper.changePostUpdate(this.originalUpdateId, newContent, afterUpdate);
						}
					}

					return false;
				},

				/*
				 * function: onCancel
				 * Modifies livepress-tiny.
				 */
				onCancel:       function () {
					console.log('onCancel()');
					var newContent = Helper.getProcessedContent(tinyMCE.editors[this.handle]);
					var check = true;
					if (this.mode !== 'deleting' && newContent !== this.originalContent) {
						console.log([newContent, this.originalContent]);
						check = confirm('Are you sure you want to cancel your changes? This action cannot be undone.');
					}
					if (check) {
						tinyMCE.execCommand('mceRemoveControl', false, this.handle);
						this.displayContent(this.$form);
					}
					return false;
				},

				/*
				 * function: onDelete
				 * Modifies livepress-tiny.
				 */
				onDelete:       function () {
					var check = confirm('Are you sure you want to delete this update? This action cannot be undone.');
					if (check) {
						tinyMCE.execCommand('mceRemoveControl', false, this.handle);
						var $spinner = $j("<div class='lp-spinner'></div>");
						$spinner.insertAfter(this.$form);
						this.$form.remove();

						Helper.deletePostUpdate(this.originalUpdateId, function () {
							$spinner.remove();
							Collaboration.Edit.update_live_posts_number();
						});
					}
					return false;
				},

				/*
				 * function: addListeners
				 * Adds hover and click events to new / edited posts.
				 */
				addListeners:   function ($el) {
					$el.hover(LiveCanvas.onUpdateHoverIn, LiveCanvas.onUpdateHoverOut);
					// Not trigger editing on mebedded elements.
					$el.find('div').not('.livepress-meta').find('a').on( 'click', function (ev) {
						ev.stopPropagation();
						ev.preventDefault();
					} );
				}

			});


			/*
			 * namespaces: LiveCanvas
			 * _(object)_ Object that controls the LiveCanvas area.
			 */
			LiveCanvas = (function () {
				var inittedOnce = 0;
				var initXhr = null;

				/*
				 * variable: $liveCanvas
				 * _(private)_ jQuery liveCanvas DOM element.
				 */
				$liveCanvas = $j([
					'<div id="livepress-canvas" class="">',
					'<h3><span id="livepress-updates_num">-</span> Updates</h3>',
					"<div class='inside'></div>",
					"</div>"
				].join(''));

				/*
				 * function: isEditing
				 * _(private)_
				 */
				var isEditing = function () {
					return $liveCanvas.data('mode') === 'editing';
				};

				/*
				 * function: onUpdateHoverIn
				 * _(public)_
				 */
				var onUpdateHoverIn = function () {
					if (!isEditing()) {
						$j(this).addClass('hover');
					}
				};

				/*
				 * function: showMicroPostForm
				 * _(public)_ Builds and enabled main micro post form.
				 */
				var showMicroPostForm = function (cnt) {
					console.log('Show micro post form');
					// if MicroPost form doesn't exist
					// add new micropost form
					microPostForm = new Selection('new', cnt);
					$liveCanvas.before(microPostForm.$form);
					microPostForm.enableTiny('main');

					// because (add) media buttons are hard coded to use wordpress TinyMCE.editors['content']
					// we must switch the references while our editor is active
					if (!tinyMCE.editors.originalContent) {
						tinyMCE.editors.originalContent = tinyMCE.editors.content;
						tinyMCE.editors.content = tinyMCE.editors[microPostForm.handle];
					}
				};

				var addPost = function (data) {
					console.log('addPost(data)');
					if (data.replace(/<p>\s*<\/p>/gi, "") === '') {
						return false;
					}
					var $newPost = $j(data);
					var action = (Livepress.Config.PostMetainfo.placement_of_updates === 'bottom' ? 'appendTo' : 'prependTo');

					$newPost.hide()[action]($liveCanvas.find('div.inside:first')).animate(
						{
							"height":  "toggle",
							"opacity": "toggle"
						},
						"slow",
						function () {
							$j(this).removeAttr('style');
						});
					return false;
				};

				/*
				 * function: hideMicroPostForm
				 * _(public)_
				 */
				var hideMicroPostForm = function () {
					if (microPostForm) {
						microPostForm.stash();
					}
					// because (add) media buttons are hard coded to use wordpress TinyMCE.editors['content']
					// we must switch the references while our editor is active
					tinyMCE.editors.content = tinyMCE.editors.originalContent;
					delete tinyMCE.editors.originalContent;
				};

				/*
				 * function: hide
				 * _(public)_
				 */
				var hide = function () {
					if (initXhr) {
						var xhr = initXhr;
						xhr.abort();
						initXhr = null;
					} else {
						$j('#post-body-content .livepress-newform,.secondary-editor-tools').hide();
						microPostForm.syncData();
						hideMicroPostForm();
						$liveCanvas.hide();
						$j('#postdivrich').show();
					}
				};

				/*
				 * funtion: mergeData
				 * _(public)_
				 */
				var mergeData = function (regions) {
					if (microPostForm !== undefined) {
						microPostForm.mergeData(regions);
					}
				};

				/*
				 * function: onUpdateHoverOut
				 * _(public)_
				 */
				var onUpdateHoverOut = function () {
					if (!isEditing()) {
						$j(this).removeClass('hover');
					}
				};

				/*
				 * function: livePressDisableCheck
				 * _(private)_ Called when disabling live blog, checks if there are unsaved editors open.
				 */
				var livePressDisableCheck = function () {
					if (isEditing()) {
						if (!confirm('You have unsaved editors open. Discard them?')) {
							return false;
						}
					}

					hide();
					return false;
				};

				/*
				 * function: init
				 * _(public)_ Hides original canvas and create live one.
				 */
				var init = function () {
					var postdivrich = document.getElementById( 'postdivrich' ),
						$postdivrich = jQuery( postdivrich );

					if (!window.eeActive) {
						return;
					} // break initialization cycle in case of interrupt
					if (!tinyMCE.editors.length || tinyMCE.editors.content === undefined || !tinyMCE.editors.content.initialized) {
						window.setTimeout(init, 50); // tinyMCE not initialized? try a bit later
						return;
					}
					if (!inittedOnce && !$j.fn.live) {
						$j.fn.live = $j.fn.livequery;
						// set a listener on disabling live blog since
						// we need to run checks before turning it off now that it's on
						$j( document.getElementById( 'live-blog-disable' ) ).on( 'click', livePressDisableCheck );
					}

					// hide original tinymce area
					$postdivrich.hide();

					var spinner = document.createElement( 'div' ),
						$spinner = jQuery( spinner );

					var spin_livecanvas = document.createElement( 'div' );
					spin_livecanvas.className = 'lp-spinner';
					spin_livecanvas.setAttribute( 'id', 'lp_spin_livecanvas' );
					spinner.appendChild( spin_livecanvas );
					var spin_p = document.createElement( 'p' );
					spin_p.style.textAlign = 'center';
					spin_p.innerText = 'Loading content...';
					spinner.appendChild( spin_p );

					var titlediv = document.getElementById( 'titlediv' );
					if ( titlediv.nextSibling ) {
						titlediv.parentNode.insertBefore( spinner, titlediv.nextSibling );
					} else {
						titlediv.parentNode.appendChild( spinner );
					}

					// get content from existing "old" tinymce editor
					var originalContent = Helper.getProcessedContent(tinyMCE.editors.content);

					// regions contains:
					//    orig -- last saved (visible to users) content
					//    user -- content from currently edit content
					//            will be omitted, if not differs
					// every part is array, where every element = region:
					//    id -- ID of region
					//    prefix -- wrapping prefix tag
					//    suffix -- wrapping end tag
					//    content -- original content
					//    proceed -- filtered resulting html
					// initial regions analyse:
					//    we should find:
					//    1. New region prepended
					//    2. New region appended
					//    3. Regions matching, not changed
					//    4. Regions matching, changed
					var analyseStartEE = function (in_regions) {
						var orig = in_regions.orig, user = in_regions.user;
						if (!orig) {
							orig = [];
						}
						if (!user) {
							return {"prepend": [], "append": [], "changed": [], "deleted": [], "regions": orig};
						}
						var prepend = [], append = [], changed = [], deleted = [], regions = [];
						var o = 0, c = 0, state = 0, i;
						// Discover head changes
						for (o = 0; o < orig.length && !state; o++) {
							var id = orig[o].id;
							for (c = 0; c < user.length && !state; c++) {
								if (id === user[c].id) {
									state = 1;
									if (o === 0 && c === 0) {
										// start of arrays equals, nothing was prepended
										state = 1; // do nothing, make JSLint happy
									}
									else if (o === 0 && c === 1) {
										// there one update appended
										prepend[prepend.length] = user[0].id;
										user[0].orig = "";
										user[0].origproc = "";
										regions[regions.length] = user[0];
									}
									else if (o === 1 && c === 1) {
										// there edit conflict: first update fully rewritten.
										prepend[prepend.length] = user[0].id;
										deleted[deleted.length] = orig[0].id;
										user[0].orig = "";
										user[0].origproc = "";
										regions[regions.length] = user[0];
										orig[0].orig = orig[0].content;
										orig[0].origproc = orig[0].prefix + orig[0].proceed + orig[0].suffix;
										orig[0].content = "";
										regions[regions.length] = orig[0];
									}
									else {
										// some weird was happend with post: lot of content changed.
										// better to reload editor page...
										for (i = 0; i < o; i++) {
											deleted[deleted.length] = orig[i].id;
											orig[i].orig = orig[i].content;
											orig[i].proc = orig[i].prefix + orig[i].proceed + orig[i].suffix;
											orig[i].content = "";
											regions[regions.length] = orig[i];
										}
										for (i = 0; i < c; i++) {
											prepend[prepend.length] = user[i].id;
											user[i].orig = "";
											user[i].origproc = "";
											regions[regions.length] = user[i];
										}
									}
									o--;
									c--;
								}
							}
						}
						// Discover body changes
						while (o < orig.length && c < user.length) {
							if (orig[o].id !== user[c].id) {
								// ids not match, possible some middle conflict
								// solve it by find next same IDs (if any)
								var no, nc, s = 0;
								for (no = o; no < orig.length && !s; no++) {
									var ni = orig[no].id;
									for (nc = c; nc < user.length && !s; nc++) {
										if (user[nc].id === ni) {
											// found equals match
											// all between match from user is "changed" (appended in middle)
											for (s = c; s < nc; s++) {
												changed[changed.length] = user[s].id;
												user[s].orig = "";
												user[s].origproc = "";
												regions[regions.length] = user[s];
											}
											// all between match from orig is deleted.
											for (s = o; s < no; s++) {
												deleted[deleted.length] = orig[s].id;
												orig[s].orig = orig[s].content;
												orig[s].origproc = orig[s].prefix + orig[s].proceed + orig[s].suffix;
												orig[s].content = "";
												regions[regions.length] = orig[s];
											}
											// found, continue
											s = 1;
										}
									}
								}
								if (s) {
									o = no - 1;
									c = nc - 1;
								} else {
									break;
								}
							}
							if (orig[o].content !== user[c].content) {
								changed[changed.length] = orig[o].id;
							}
							user[c].orig = orig[o].content;
							user[c].origproc = orig[o].prefix + orig[o].proceed + orig[o].suffix;
							regions[regions.length] = user[c];
							// Advance
							o++;
							c++;
						}
						// end of equals body. anything left in user are appended,
						// anything left in orig are deleted (conflict?)
						for (; c < user.length; c++) {
							append[append.length] = user[c].id;
							user[c].orig = "";
							user[c].origproc = "";
							regions[regions.length] = user[c];
						}
						for (; o < orig.length; o++) {
							deleted[deleted.length] = orig[o].id;
							orig[o].orig = orig[o].content;
							orig[o].origproc = orig[o].prefix + orig[o].proceed + orig[o].suffix;
							orig[o].content = "";
							regions[regions.length] = orig[o];
						}
						return {"prepend": prepend, "append": append, "changed": changed, "deleted": deleted, "regions": regions};
					};
					var startError = function (error) {
						//Livepress.Admin.PostStatus.error(error);
						$j('#post-body-content .livepress-newform,.secondary-editor-tools').hide();
						$liveCanvas.hide();
						$postdivrich.show();
						$spinner.remove();
						Collaboration.Edit.destroy();
						var $ls = jQuery('#live-switcher');
						if ($ls.hasClass('on')) {
							$ls.trigger('click');
						}
						return;
					};
					var initAfterStartEE = function (regions, textError, errorThrown) {
						if (this !== initXhr && errorThrown !== initXhr) {
							// Got complete on aborted ajax call
							return;
						}
						var blogContent = "", i = 0;
						if (regions === undefined) {
							return startError("Error: " + textError + " : " + errorThrown);
						}
						if (regions.edit_uuid) {
							Livepress.Config.post_edit_msg_id = regions.edit_uuid;
						}
						// Start the livepress collaborative edit
						if ("editStartup" in regions) {
							Collaboration.Edit.initialize(regions.editStartup);
						} else {
							Collaboration.Edit.initialize();
						}
						var ee = analyseStartEE(regions);
						// set this content in the livecanvas area but remove
						// livepress-update-stub tags
						// set events
						var $inside_first = $liveCanvas.find('div.inside:first').html("");
						var pr = 0, ap = 0, ch = 0, de = 0, sty = "";
						var microContent = "";
						for (i = 0; i < ee.regions.length; i++) {
							var reg = ee.regions[i];
							if (pr < ee.prepend.length && reg.id === ee.prepend[pr]) {
								// prepended block
								if (!pr && !ap) { // first prepended block come to new edit area
									microContent = reg.content;
									pr++;
									continue; // do not apply it
								}
								sty = "new"; // display block as new (not saved yet)
							} else if (ap < ee.append.length && reg.id === ee.append[ap]) {
								// appended block
								if (!pr && !ap) { // first appended block come to new edit area
									microContent = reg.content;
									ap++;
									continue; // do not apply it
								}
								sty = "new"; // display block as new (not saved yet)
							} else if (ch < ee.changed.length && reg.id === ee.changed[ch]) {
								// changed block
								sty = "edit"; // display block as edited
								ch++;
							} else if (de < ee.deleted.length && reg.id === ee.deleted[de]) {
								// deleted block
								sty = "del"; // display block as deleted
								de++;
							} else {
								// published non touched block
								sty = "";
							}
							var proc = reg.prefix + reg.proceed + reg.suffix;
							var origproc = reg.origproc===undefined ? proc : reg.origproc;
							var $block = $j(proc);
							var orig = reg.orig===undefined ? reg.content : reg.orig;
							$block.data("nonExpandedContent", reg.content);
							$block.data("originalContent", orig);
							$block.data("originalHtmlContent", origproc);
							$block.data("originalId", reg.id);
							if (sty === "new") {
								// FIXME: add some kind of support for that
								return startError("Double added updates. Not supported now.");
							}
							$block.attr("editStyle", sty);
							$inside_first.append($block);
						}
						$inside_first
							.find('div.livepress-update')
							.hover(onUpdateHoverIn, onUpdateHoverOut);

						$spinner.remove();
						if (!inittedOnce) {
							$liveCanvas.insertAfter('#titlediv');

							var canvas = document.getElementById( 'livepress-canvas' ),
                                $canvas = $j( canvas );

							// live listeners, bound to canvas (since childs are recreated/added/removed dynamically)
							$canvas.on( 'click',  'div.livepress-update', function (ev) {
								var $target = $j(ev.target);
								if ($target.is("a,input,button,textarea") || $target.parents("a,input,button,textarea").length > 0) {
									return true; // do not handle click event from children links (needed to fix live)
								}
								if (!isEditing()) {
									var style = this.getAttribute( 'editStyle' );

									var Sel = new Selection( 'del' === style ? 'deleting' : 'editing', this);
									Sel.$form.insertAfter( this );
									Sel.enableTiny( style );
									jQuery( this ).remove();
								}
							});
							$canvas.on( 'click', 'div.livepress-update a', function (ev) {
								ev.stopPropagation();
							} );

							//showMicroPostForm();
						} else {
							$j('#post-body-content .livepress-newform').show();
							$liveCanvas.show();
						}

						var $sec = $j('.secondary-editor-tools');
						if (!$sec.length) {
							//copy media buttons from orig tinymce
							jQuery('#wp-content-editor-tools')
								.clone(true)
								.insertAfter('#titlediv')
								.addClass('secondary-editor-tools')
								.find('#content-tmce, #content-html')
								.each(function () {
									jQuery(this)
										.removeAttr('id')
										.removeAttr('onclick')
										.on('click', function () {

										});
								});
						} else {
							$sec.show();
						}

						showMicroPostForm(microContent);
						Collaboration.Edit.update_live_posts_number();

						// first micro post
						var $currentPosts = $liveCanvas.find('div.livepress-update:first');

						//$inside_first.find('div.livepress-update[editStyle="edit"],div.livepress-update[editStyle="del"]').click();

						var $pub = jQuery('#publish');
						$pub.on( 'click', function () {
							LiveCanvas.hide();
							return true;
						} );

						inittedOnce = 1;
						initXhr = null;
					};
					initXhr = Helper.doStartEE(originalContent, initAfterStartEE);
				};

				/*
				 * function: get
				 * _(public)_
				 */
				var get = function () {
					return $liveCanvas.find('div.inside:first');
				};

				return {
					init:              init,
					get:               get,
					hide:              hide,
					mergeData:         mergeData,
					onUpdateHoverIn:   onUpdateHoverIn,
					onUpdateHoverOut:  onUpdateHoverOut,
					showMicroPostForm: showMicroPostForm,
					hideMicroPostForm: hideMicroPostForm,
					addPost:           addPost
				};
			}());

			// creates live blogging activation tools
			Livepress.Ready = function () {
				OORTLE.Livepress.Dashboard = new Dashboard.Controller();

				OORTLE.Livepress.LivepressHUD.init();
			};

			return {
				LivepressHUD:        new LivepressHUD(),
				startLiveCanvas:     LiveCanvas.init,
				getLiveCanvas:       LiveCanvas.get,
				mergeLiveCanvasData: LiveCanvas.mergeData
			};
		}());
	}

	/**
	 * Optimized code for twitter intents.
	 *
	 * @see <a href="http://dev.twitter.com/pages/intents">External documentation</a>
	 */
	(function () {
		if (window.__twitterIntentHandler) {
			return;
		}
		var intentRegex = /twitter\.com(\:\d{2,4})?\/intent\/(\w+)/,
			windowOptions = 'scrollbars=yes,resizable=yes,toolbar=no,location=yes',
			width = 550,
			height = 420,
			winHeight = screen.height,
			winWidth = screen.width;

		function handleIntent (e) {
			e = e || window.event;
			var target = e.target || e.srcElement,
				m, left, top;

			while (target && target.nodeName.toLowerCase() !== 'a') {
				target = target.parentNode;
			}

			console.log('handle intent');

			if (target && target.nodeName.toLowerCase() === 'a' && target.href) {
				m = target.href.match(intentRegex);
				if (m) {
					left = Math.round((winWidth / 2) - (width / 2));
					top = 0;

					if (winHeight > height) {
						top = Math.round((winHeight / 2) - (height / 2));
					}

					window.open(target.href, 'intent', windowOptions + ',width=' + width +
						',height=' + height + ',left=' + left + ',top=' + top);
					e.returnValue = false;
					if (e.preventDefault) {
						e.preventDefault();
					}
				}
			}
		}

		if (document.addEventListener) {
			document.addEventListener('click', handleIntent, false);
		} else if (document.attachEvent) {
			document.attachEvent('onclick', handleIntent);
		}
		window.__twitterIntentHandler = true;
	}());

	/**
	 * Once all the other code is loaded, we check to be sure the user is on the post edit screen and load the new Live
	 * Blogging Tools palette if they are.
	 */
	if (Livepress.Config.current_screen !== undefined && Livepress.Config.current_screen[0] === 'post' && Livepress.Config.current_screen[1] === 'post') {
		var live_blogging_tools = new Livepress.Admin.Tools();
		live_blogging_tools.render();
	}
});

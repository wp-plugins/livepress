/*global Livepress, console */
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
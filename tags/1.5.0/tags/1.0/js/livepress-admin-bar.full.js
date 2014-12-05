/*! LivePress -v0.7.3 - 2013-07-16
 * http://livepress.com/
 * Copyright (c) 2013 LivePress, Inc.
 */
jQuery(document).ready(function () {
	jQuery('#wp-admin-bar-livepress-enable').on('click', 'a', function (e) {
		e.preventDefault();

		// Enable updates via AJAX
		var data = {
			action: 'livepress-enable-global',
			nonce:  jQuery(this).data('nonce')
		};

		endisable(data);
	});

	jQuery('#wp-admin-bar-livepress-disable').on('click', 'a', function (e) {
		e.preventDefault();

		// Disable updates via AJAX
		var data = {
			action:  'livepress-disable-global',
			post_id: Livepress.Config.post_id,
			nonce:   jQuery(this).data('nonce')
		};

		endisable(data);
	});

	var endisable = function (data) {
		jQuery.post(
			ajaxurl || Livepress.Config.ajax_url,
			data,
			function (response) {
				var bar = jQuery('#wp-admin-bar-livepress-status'),
					explanation = jQuery('#wp-admin-bar-livepress-status-explanation'),
					external = jQuery('#wp-admin-bar-livepress-status-external');
				switch (response) {
					case 'connected':
						bar.removeClass('disabled').addClass('connected');
						explanation.find('.connected').removeClass('hidden');
						explanation.find('.disconnected, .disabled').addClass('hidden');
						external.removeClass('disabled').addClass('enabled');
						publishBox('on');
						break;
					case 'disconnected':
						bar.removeClass('disabled').removeClass('connected');
						explanation.find('.disconnected').removeClass('hidden');
						explanation.find('.connected, .disabled').addClass('hidden');
						external.removeClass('disabled').addClass('enabled');
						break;
					case 'disabled':
						bar.addClass('disabled').removeClass('connected');
						explanation.find('.disabled').removeClass('hidden');
						explanation.find('.disconnected, .connected').addClass('hidden');
						external.removeClass('enabled').addClass('disabled');
						publishBox('off');
						break;
				}
			}
		);
	};

	var publishBox = function (onoroff) {
		var $bar = jQuery('#lp-pub-status-bar');

		switch (onoroff) {
			case 'on':
				$bar.removeClass('no-toggle').removeClass('not-live').addClass('live');

				$bar.find('a.toggle-live span').addClass('hidden');
				$bar.find('.icon').addClass('not-live').removeClass('disabled').removeClass('live');
				$bar.find('.first-line').find('.lp-off').removeClass('hidden');
				$bar.find('.first-line').find('.lp-on, .disabled').addClass('hidden');
				$bar.find('.second-line').find('.inactive').removeClass('hidden');
				$bar.find('.second-line').find('.recent, .lp-off').addClass('hidden');
				break;
			case 'off':
				$bar.addClass('no-toggle').addClass('not-live').removeClass('live');

				$bar.find('a.toggle-live span').addClass('hidden');
				$bar.find('.icon').removeClass('live').removeClass('not-live').addClass('disabled');
				$bar.find('.first-line').find('.lp-on, .lp-off').addClass('hidden');
				$bar.find('.first-line').find('.disabled').removeClass('hidden');
				$bar.find('.second-line').find('.inactive, .recent').addClass('hidden');
				$bar.find('.second-line').find('.lp-off').removeClass('hidden');
				break;
		}
	};
});
/*jslint vars:true */
/*global lp_client_strings, Livepress, console */
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
		$checkbox.prop('checked', initial).change(function () {
			return $checkbox.is(':checked') ? fOn(1) : fOff(1);
		});
		return initial ? fOn() : fOff();
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
			'INVALID_JID':           lp_client_strings.no_google_acct,
			'NOT_IN_ROSTER':         lp_client_strings.no_acct_in_jabber,
			'NOT_AUTHORIZED':        lp_client_strings.username_not_auth,
			'AUTHORIZED':            lp_client_strings.username_authorized,
			'INTERNAL_SERVER_ERROR': lp_client_strings.livepress_err_retry,
			'AUTHORIZATION_SENT':    lp_client_strings.auth_request_sent
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
		jQuery("abbr.livepress-timestamp").timeago();
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
		jQuery("abbr.livepress-timestamp").timeago();
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
		'<strong class="lp-update-new-update"> ' + lp_client_strings.new_updates + '. </strong>',
		'<a href="javascript:location.reload();" class="lp-refresher">' + lp_client_strings.refresh + '</a> ' + lp_client_strings.to_see + ' <span class="lp-update-it-them">' + lp_client_strings.them + '</span>.',
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
		jQuery("abbr.livepress-timestamp").timeago();
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

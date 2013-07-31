/*jslint vars:true */
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
				$this.on('mouseenter', function () {
					return new Livepress.Ui.UpdateView($this, current_post_link, window.location, config.disable_comments);
				});
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
				function () {
					sounds.on();
					Livepress.storage.set('settings-sound', "1");
				},
				function () {
					sounds.off();
					Livepress.storage.set('settings-sound', "");
				}
			);

			widget.live_control(
				Livepress.storage.get('settings-live', true),
				function () {
					comet.connect();
					Livepress.storage.set('settings-live', "1");
				},
				function () {
					comet.disconnect();
					Livepress.storage.set('settings-live', "");
				}
			);

			if (!config.disable_comments) {
				widget.follow_comments_control(
					Livepress.storage.get('settings-comments', true),
					function () {
						comet.subscribe(comment_update_topic, comment_update);
						Livepress.storage.set('settings-comments', "1");
					},
					function () {
						comet.unsubscribe(comment_update_topic, comment_update);
						Livepress.storage.set('settings-comments', "");
					}
				);
			}

			widget.scroll_control(
				Livepress.storage.get('settings-scroll', true),
				function () {
					Livepress.Scroll.settings_enabled = true;
					Livepress.storage.set('settings-scroll', "1");
				},
				function () {
					Livepress.Scroll.settings_enabled = false;
					Livepress.storage.set('settings-scroll', "");
				}
			);
		}
	}
};

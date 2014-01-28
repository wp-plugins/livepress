/*global OORTLE, Livepress */

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
	jQuery( "abbr.livepress-timestamp" ).timeago();
	return new Livepress.Ui.Controller(Livepress.Config, hooks);
};
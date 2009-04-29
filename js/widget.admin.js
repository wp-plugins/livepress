jQuery(document).ready(function() {
	var bindEditLinkEvent = function() {
		jQuery("ul.widget-control-list a.widget-control-edit[href*='edit=author_avatars']").bind('click', function() {
			var p = jQuery(this).parent().parent().parent();
			AA_init_avatarpreview(jQuery("div.avatar_size_preview", p), jQuery('input.avatar_size_input', p));
      AA_check_sortdirection_status(p);
		});
	};
	jQuery('ul.widget-control-list').bind('mouseover', bindEditLinkEvent);
});
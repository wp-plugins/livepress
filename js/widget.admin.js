jQuery(document).ready(function() {
	/* Wordpress 2.6-2.7 */
	var initAvatarPreviewEvent = function() {
		var p = jQuery(this).parent().parent().parent();
		AA_init_avatarpreview(jQuery("div.avatar_size_preview", p), jQuery('input.avatar_size_input', p));
		AA_check_sortdirection_status(p);
	};
	jQuery('ul.widget-control-list').bind('mouseover', function() {
		jQuery("a.widget-control-edit[href*='edit=author_avatars']", this)
			.unbind('click', initAvatarPreviewEvent)
			.bind('click', initAvatarPreviewEvent);
	});
	
	/* Wordpress 2.8+ */
	jQuery('#widgets-right, #wp_inactive_widgets').bind('mouseover', function() {
		jQuery('.widget[id*="author_avatars"] .widget-inside:visible', this).each(function() {
			if (!jQuery(this).data('aa_form_initialised')) {
				AA_init_avatarpreview(jQuery("div.avatar_size_preview", this), jQuery('input.avatar_size_input', this));
				AA_check_sortdirection_status(this);
			}
		});
	});
});
//resize the popup to fit form
function init() {
	// init jquery tabs
	jQuery('.aa-tabs>ol').tabs();
	jQuery('.aa-tabs>ol').tabs('disable', 1);
	
	// hide or show fields & bind change event handler
	jQuery('#shortcode_type label').click(AA_updateFieldVisibility);
	
	// initialise the resizable avatar preview
	AA_init_avatarpreview(jQuery("div.avatar_size_preview"), jQuery('input.avatar_size_input'));
	
	// resize the tinymce popup (???)
	tinyMCEPopup.resizeToInnerSize();
}
tinyMCEPopup.executeOnLoad('init();')

// Checks the value of the shortcode type field and hides/shows other form fields respectively.
function AA_updateFieldVisibility(evt) {
	var selected_value = null;
	if (evt != undefined && evt.currentTarget != undefined) {
		selected_value = jQuery('input', evt.currentTarget);
	} else {
		selected_value = jQuery('#shortcode_type :checked').val();
	}
	
	if (selected_value == 'show_avatar') {
		jQuery('.fields_type_authoravatars').hide();
		jQuery('.fields_type_show_avatar').show();
		jQuery('.aa-tabs>ol').tabs('disable', 1);
	}
	else if (selected_value == 'authoravatars' ) {
		jQuery('.fields_type_show_avatar').hide();
		jQuery('.fields_type_authoravatars').show();
		jQuery('.aa-tabs>ol').tabs('enable', 1);
	}
	else {
		jQuery('.fields_type_show_avatar').hide();
		jQuery('.fields_type_authoravatars').hide();
		jQuery('.aa-tabs>ol').tabs('disable', 1);
	}
}

function insertAuthorAvatarsCode() {
	var error = false;
	
	// get shortcode type
	var type = jQuery('#shortcode_type :checked').val() || '';
	if (type.length == 0) {
		jQuery('#shortcode_type').addClass('aa-form-error');
		error = true;
	}
	else {
		jQuery('#shortcode_type').removeClass('aa-form-error');
	}
	
	var tagtext = "[" + type;
	
	if (type == 'authoravatars') {
		
		// blogs
		var blogs = jQuery("#blogs").val() || [];
	    if (blogs.length > 0) {
	        tagtext += " blogs=" + blogs.join(',');
	    }

		// group_by
		var group_by = new Array();
		jQuery("#group_by :checked").each(function(i, el) { group_by.push(jQuery(el).val()); });
	    if (group_by.length > 0) {
	        tagtext += " group_by=" + group_by.join(',');
	    }
		
		// roles
		var roles = new Array();
		jQuery("#roles :checked").each(function(i, el) { roles.push(jQuery(el).val()); });
	    if (roles.length > 0) {
	        tagtext += " roles=" + roles.join(',');
	    }

		// hiddenusers
		var hiddenusers = jQuery("#hiddenusers").val() || "";
		if (hiddenusers.length > 0) {
			tagtext += " hiddenusers=" + hiddenusers;
		}
				
		// link_to_authorpage
		var link_to_authorpage = jQuery("#display input[value=link_to_authorpage]").attr("checked");
		if (link_to_authorpage != true) {
			tagtext += " link_to_authorpage=false";
		}
		
		// show_name
		var show_name = jQuery("#display input[value=show_name]").attr("checked");
		if (show_name == true) {
			tagtext += " show_name=true";
		}
		
		// limit
		var limit = jQuery("#limit").val() || "";
		if (limit.length > 0) {
			tagtext += " limit=" + limit;
		}
		
		// order
		var order = jQuery("#order").val() || "";
		if (order.length > 0) {
			tagtext += " order=" + order;
		}
		
		// render_as_list
		// TODO
	}
	
	if (type == 'show_avatar') {
		
		// email or id
		var email = jQuery('#email').val() || '';
		if (email.length > 0) {
			jQuery('#email').parent().parent().removeClass('aa-form-error');
			tagtext += " email=" + email;
		}
		else {
			jQuery('#email').parent().parent().addClass('aa-form-error');
			error = true;
		}
		
		// alignment
		var align = jQuery('#alignment :checked').val() || '';
		if (align.length > 0) {
			tagtext += " align=" + align;
		}
		
	}
	
	// avatar_size
	var avatar_size = jQuery("#avatar_size").val() || "";
	if (avatar_size.length > 0) {
		tagtext += " avatar_size=" + avatar_size;
	}
	
    tagtext += "]";

	if (error == true) {
		return;
	}
	
    if (window.tinyMCE) {
		window.tinyMCE.execInstanceCommand('content', 'mceInsertContent', false, tagtext);
		tinyMCEPopup.editor.execCommand('mceRepaint');
		tinyMCEPopup.close();
	}
	return;
}
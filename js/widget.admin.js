// make avatar preview resizable 
jQuery(document).ready(function() {
	// maximum and minimum size of the avatar preview
	var maxSize = 200;
	var minSize = 25;

	// if user clicks on "add" or "edit" widget buttons...
	jQuery('.widget-title a').bind('click', function() {
		// ... start listening to the changes of the avatar-size input field and update the image respectively
		jQuery('input.avatar_size_input').bind('keyup', function(evt) {
			// determine size
			var size = this.value;
			if (size < minSize) size = minSize;
			if (size > maxSize) size = maxSize;
			size += 'px';
			// update avatar size
			updateAvatarSize(size,this.parentNode.parentNode.parentNode);
		});
		
		// ... and make the avatar preview image resizable. 
		jQuery('div.avatar_size_preview').bind('mouseenter', function () { makeResizable(this, minSize, maxSize); });
	});
});

// sets the size of the avatar preview image (and also the "resizable" container, if there)
function updateAvatarSize(size, parentnode) {
	// set size of image element
	var img = jQuery('div.avatar_size_preview img', parentnode);	
	img.width(size);
	img.height(size);
	
	// if existent, set size of resizable container element
	var img_container = jQuery('.ui-resizable-knob', parentnode);
	if (img_container.length > 0) {
		img_container.width(size);
		img_container.height(size);
	}
}

// makes the given avatar image node resizable, using given minimum and maximum size.
// on resize we try to update the avatar_size input field to the new value.
function makeResizable(node, minSize, maxSize) {
	if (!jQuery(node).hasClass('is_resizable')) {
		jQuery('img', node).resizable({
			handles: "se",
			aspectRatio: 1,
			minWidth: minSize,
			maxWidth: maxSize,
			minHeight: minSize,
			maxHeight: maxSize,
			knobHandles: true,
			resize: function(e, ui) {
				// update the avatar_size input field to the new value.
				jQuery('input.avatar_size_input', ui.originalElement.parent().parent().parent()).val(ui.size.width);
			}
		});
	}
	jQuery(node).addClass('is_resizable');
}
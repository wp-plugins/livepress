
jQuery(document).ready(function() {
	var maxSize = 200;
	var minSize = 25;

	jQuery('.widget-title a').bind('click', function() {
		jQuery('input.avatar_size_input').bind('keyup', function(evt) {
			// determine size
			var size = this.value;
			if (size < minSize) size = minSize;
			if (size > maxSize) size = maxSize;
			size += 'px';	
			
			// set size of image element
			var img = jQuery('div.avatar_size_preview img', this.parentNode.parentNode.parentNode);	
			img.width(size);
			img.height(size);
			
			// if existent, set size of resizable container element
			var img_container = jQuery('.ui-resizable-knob', this.parentNode.parentNode.parentNode);
			if (img_container.length > 0) {
				img_container.width(size);
				img_container.height(size);
			}
		});
		jQuery('div.avatar_size_preview').bind('mouseenter', function () {
			if (!jQuery(this).hasClass('is_resizable')) {
				jQuery('img', this).resizable({
				    handles: "se",
					aspectRatio: 1,
					minWidth: minSize,
					maxWidth: maxSize,
					minHeight: minSize,
					maxHeight: maxSize,
					knobHandles: true,
					resize: function(e, ui) {
						console.debug(ui.size);
						console.debug('resizing...');
						jQuery('input.avatar_size_input', ui.originalElement.parent().parent().parent()).val(ui.size.width);
					}
				});
			}
			jQuery(this).addClass('is_resizable');
		});
	});
});

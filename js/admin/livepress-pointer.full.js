/*! livepress -v1.3.4.2
 * http://livepress.com/
 * Copyright (c) 2015 LivePress, Inc.
 */
( function( window, $, undefined ) {
	var CORE = window.livepress_pointer;

	function Pointer( element ) {
		var SELF = this,
			$element = $( element );

		SELF.close = function () {
			$.post( CORE.ajaxurl, {
				pointer: 'livepress_pointer',
				action:  'dismiss-wp-pointer'
			} );
		};

		SELF.open = function() {
			$element.pointer( options ).pointer( 'open' );
		};

		var options = {
			'pointerClass': 'livepress_pointer',
			'content': CORE.content,
			'position': {
				'edge': 'top',
				'align': 'left'
			},
			'close': SELF.close
		};
	}

	$( window ).on( 'livepress.blogging-tools-loaded', function() {
		var pointer = CORE.pointer = new Pointer( '#blogging-tools-link-wrap' );
		pointer.open();
		// Close the pointer when live blogging tools opened (once)
		$( '#blogging-tools-link' ).one( 'click', function() {
			$( '.livepress_pointer .close' ).trigger( 'click' );
		} );

	} );
}( this, jQuery ) );
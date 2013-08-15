/*! livepress -v1.0.2
 * http://livepress.com/
 * Copyright (c) 2013 LivePress, Inc.
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
	} );
}( this, jQuery ) );
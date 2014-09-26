/*global OORTLE, LivepressConfig, Livepress */

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

	var $lpcontent, $firstUpdate, $livepressBar, $heightOfFirstUpdate, $firstUpdateContainer, diff,
		hooks = {
			post_comment_update:  Livepress.Comment.attach,
			before_live_comment:  Livepress.Comment.before_live_comment,
			should_attach_comment:Livepress.Comment.should_attach_comment,
			get_comment_container:Livepress.Comment.get_comment_container,
			on_comment_update:    Livepress.Comment.on_comment_update
		};
	jQuery( "abbr.livepress-timestamp" ).timeago();

	if ( jQuery( '.lp-status' ).hasClass( 'livepress-pinned-header' ) ) {
		// Adjust the positioning of the first post to pin it to the top
		var adjustTopPostPositioning = function() {
			setTimeout( function() {
				window.console.log( 'adjust top' );
				$lpcontent    = jQuery( '.livepress_content' );
				$firstUpdate  = $lpcontent.find( '.livepress-update#livepress-update-0' );
				$firstUpdateContainer = $lpcontent.parent();
				$firstUpdate.css( 'marginTop', 0 );
				diff = $firstUpdate.offset().top - $firstUpdateContainer.offset().top;
				$livepressBar = jQuery( '#livepress' );
				$heightOfFirstUpdate = ( $firstUpdate.outerHeight() + 20 );
				$firstUpdate.css( {
					'margin-top': '-' + ( diff + 50 ) + 'px',
					'position': 'absolute',
					'width' : ( $livepressBar.outerWidth() ) + 'px'
				} );
				$livepressBar.css( { 'margin-top': $heightOfFirstUpdate + 'px' } );
			}, 1500 );
		};

		adjustTopPostPositioning();

		// Adjust the top position whenever the post is updated so it fits properly
		jQuery( document ).on( 'live_post_update', function(){
			adjustTopPostPositioning();
		});
	}
	return new Livepress.Ui.Controller(LivepressConfig, hooks);
};
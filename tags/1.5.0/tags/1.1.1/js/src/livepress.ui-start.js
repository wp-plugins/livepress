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

	var $lpcontent, $firstUpdate, $livepressBar, $heightOfUpdate,
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
			$lpcontent    = jQuery( '.livepress_content' );
			$firstUpdate  = $lpcontent.find( '.livepress-update:first' );
			$livepressBar = jQuery( '#livepress' );
			$heightOfUpdate = ( $firstUpdate.outerHeight() + 20 );
			$firstUpdate.css( {
				'margin-top': '-' + ( $heightOfUpdate + 30 ) + 'px',
				'position': 'absolute',
				'width' : ( $livepressBar.outerWidth() ) + 'px'
			} );
			$livepressBar.css( { 'margin-top': $heightOfUpdate + 'px' } );
		};

		adjustTopPostPositioning();

		// Adjust the top position whenever the post is updated so it fits properly
		jQuery( document ).on( 'post_update', function(){
			adjustTopPostPositioning();
		});
	}
	return new Livepress.Ui.Controller(Livepress.Config, hooks);
};
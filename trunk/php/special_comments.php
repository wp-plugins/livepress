<?php
echo lp_comment::$comments_template_tag['start'];
// Use the included comments form if available, otherwise use built in comment form
if ( file_exists( lp_comment::$comments_template_path ) ) {
	include(lp_comment::$comments_template_path);
} else {

	// Build default form, showing only author and email (ommit default url field)
	$commenter = wp_get_current_commenter();
	$req = get_option( 'require_name_email' );
	$aria_req = ( $req ? " aria-required='true'" : '' );
	$args = array(
		'fields' => apply_filters( 'comment_form_default_fields', array(
			'author' =>
				'<p class="comment-form-author">' .
				'<label for="author">' . __( 'Name', 'domainreference' ) . '</label> ' .
				( $req ? '<span class="required">*</span>' : '' ) .
				'<input id="author" name="author" type="text" value="' . esc_attr( $commenter['comment_author'] ) .
				'" size="30"' . $aria_req . ' /></p>',
			'email' =>
				'<p class="comment-form-email"><label for="email">' . __( 'Email', 'domainreference' ) . '</label> ' .
				( $req ? '<span class="required">*</span>' : '' ) .
				'<input id="email" name="email" type="text" value="' . esc_attr(  $commenter['comment_author_email'] ) .
				'" size="30"' . $aria_req . ' /></p>',
				)
		),
	);
	comment_form( $args );
}
echo lp_comment::$comments_template_tag['end'];

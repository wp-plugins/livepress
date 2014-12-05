<?php
/*
 * Livepress extender to XMLRPC protocol.
 * This class initizalises only for XMLRPC requests
 *
 */

class livepress_xmlrpc {

	static private $lp_xmlrpc = null;

	static function initialize() {
		if ( self::$lp_xmlrpc == null ) {
			self::$lp_xmlrpc = new livepress_xmlrpc();
		}
	}

	private function __construct() {
		add_filter( 'xmlrpc_methods',             array( $this, 'add_livepress_functions_to_xmlrpc' ) );
		add_filter( 'authenticate',               array( $this, 'livepress_authenticate' ), 5, 3 );
		add_filter( 'authenticate',               array( $this, 'livepress_deauthenticate' ), 999999, 3 );
		add_filter( 'pre_option_enable_xmlrpc',   array( $this, 'livepress_enable_xmlrpc' ), 0, 1 );
		add_filter( 'wp_insert_post_data',        array( $this, 'insert_post_data' ), 10, 2 );
		add_filter( 'xmlrpc_wp_insert_post_data', array( $this, 'insert_post_data' ), 10, 2 );
	}

	public static function scrape_hooks() {
		add_filter( 'comment_flood_filter', '__return_false' );
		add_filter( 'xmlrpc_allow_anonymous_comments', '__return_true' );
	}

	function add_livepress_functions_to_xmlrpc( $methods ) {
		// unfortunatelly, it seems passed function names must relate to global ones
		$methods['livepress.appendToPost'] = 'livepress_append_to_post';
		if ( livepress_config::get_instance()->scrape_hooks() ) {
			$methods['scrape.newComment'] = 'new_comment_from_scrape';
		}

		return $methods;
	}


	var $livepress_authenticated = false;
	var $livepress_auth_called = false;

	/**
	 * When xml-rpc server active, short-circuit enable_xmlrpc option
	 * and apply original later.
	 *
	 * @param bool $v
	 *
	 * @return bool
	 */
	function livepress_enable_xmlrpc( $v ) {
		$val = ! ( $this->livepress_auth_called || $this->livepress_authenticated );

		return $val || (bool) $v;
	}

	/**
	 * We should take care of authentication, and pass auth reason only
	 * when livepress auth has taken, or enable_xmlrpc are really set
	 *
	 * @param mixed  $user
	 * @param string $username
	 * @param string $password
	 *
	 * @return mixed|WP_Error
	 */
	function livepress_deauthenticate( $user, $username, $password ) {
		// If we're using version 3.5 or higher, skip the authentication check.
		if ( version_compare( '3.5', get_bloginfo( 'version' ) ) <= 0 ) {
			return $user;
		}

		if ( $this->livepress_authenticated ) {
			return $user;
		}

		// Get enable_xmlrpc option without our short-circuit...
		remove_filter( 'pre_option_enable_xmlrpc', array( &$this, 'livepress_enable_xmlrpc' ), 0, 1 );
		$enable = get_option( 'enable_xmlrpc' );
		add_filter( 'pre_option_enable_xmlrpc', array( &$this, 'livepress_enable_xmlrpc' ), 0, 1 );

		if ( ! $enable ) {
			return new WP_Error( 405, sprintf( __( 'XML-RPC services are disabled on this site. An admin user can enable them at %s' ), admin_url( 'options-writing.php' ) ) );
		}

		return $user;
	}

	/**
	 * Transparent authentication. Will just allow if pass match, all other ways -- as we not there.
	 *
	 * @param mixed  $user
	 * @param string $username
	 * @param string $password
	 *
	 * @return WP_User
	 */
	function livepress_authenticate( $user, $username, $password ) {
		$this->livepress_auth_called = true;
		if ( is_a( $user, 'WP_User' ) ) {
			return $user;
		}

		if ( empty( $username ) || empty( $password ) ) {
			return $user;
		}

		$userdata = get_user_by( 'login', $username );
		if ( ! $userdata ) {
			return $user;
		}

		$lp_pass = get_user_meta( $userdata->ID, 'livepress-access-key', true );

		$auth = false;

		if ( ! empty( $lp_pass ) && wp_check_password( $password, $lp_pass, $userdata->ID ) ) {
			$auth = true;
		}

		if ( ! $auth ) {
			$lp_pass = get_user_meta( $userdata->ID, 'livepress-access-key-new', true );
			if ( ! empty( $lp_pass ) && wp_check_password( $password, $lp_pass, $userdata->ID ) ) {
				$auth = true;
			}
		}

		if ( $auth ) {
			$user                          = new WP_User( $userdata->ID );
			$this->livepress_authenticated = true;
		}

		return $user;
	}

	/**
	 * Short circut the update mechanism.
	 *
	 * Logic branches
	 * - If this is a new post, do nothing.
	 * - If this is a change to an existing post, do nothing.
	 * - If this is an addition to an existing post, remove the addition and store it as
	 *   a LivePress update instead.
	 *
	 * @param array $post_data
	 * @param array $content_struct
	 */
	function insert_post_data( $post_data, $content_struct ) {
		// Only fire on XML-RPC requests
		if ( ! defined( 'XMLRPC_REQUEST' ) || false == XMLRPC_REQUEST || ( defined( 'LP_FILTERED' ) && true == LP_FILTERED ) ) {
			return $post_data;
		}

		define( 'LP_FILTERED', true );

		$defaults = array(
			'post_status' => 'draft',
			'post_type' => 'post',
			'post_author' => 0,
			'post_password' => '',
			'post_excerpt' => '',
			'post_content' => '',
			'post_title' => ''
		);

		$unparsed_data = wp_parse_args( $content_struct, $defaults );

		// If this isn't an update, exit early so we don't walk all over ourselves.
		if ( empty( $unparsed_data['ID'] ) ) {
			return $post_data;
		}

		// Get the post we're updating so we can compare the new content with the old content.
		$post_id = $unparsed_data['ID'];
		$post = get_post( $post_id );

		$original_posts = $this->get_existing_updates( $post );
		$new_posts = $this->parse_updates( $unparsed_data['post_content'] );

		// First, add the new update if there is one
		if ( isset( $new_posts['new'] ) ) {
			if ( 1 === count( $new_posts ) ) {
				// Todo: If the only post sent up is "new" create a diff against the existing post so we can process the update.
				$clean_content = preg_replace( '/\<\!--livepress(.+)--\>/', '', $post->post_content );
				$new_posts['new']['content'] = str_replace( $clean_content, '', $new_posts['new']['content'] );
			}

			$update_id = LivePress_PF_Updates::get_instance()->add_update( $post, $new_posts['new']['content'] );

			// Remove the new post from the array so we don't double-process by mistake.
			unset( $new_posts['new'] );
		}

		// Second, update the content of any posts that have been changed.
		// You cannot *delete* an update via XMLRPC.  For that, you need to actually use the WordPress UI.
		foreach( $original_posts as $original_id => $original_post ) {
			// Skip the parent post
			if ( $post_id === $original_id ) {
				continue;
			}

			// Skip if no changes were passed in for this post
			if ( ! isset( $new_posts[ $original_id ] ) ) {
				continue;
			}

			$updated = $new_posts[ $original_id ];

			// Do we actually need to do an update?
			$md5 = md5( $updated['content'] );
			if ( $updated['md5'] === $md5 ) {
				continue;
			}

			$original_post['post_content'] = $updated['content'];

			wp_update_post( $original_post );
		}

		// Update post data for the parent post.
		if ( isset( $new_posts[ $post_id ] ) ) {
			$post_data['post_content'] = $new_posts[ $post_id ]['content'];
		} else {
			$post_data['post_content'] = $post->post_content;
		}

		return $post_data;
	}

	/**
	 * Get an array of the existing post updates, including the parent post.
	 *
	 * @param WP_Post $parent
	 *
	 * @return array
	 */
	private function get_existing_updates( $parent ) {
		$updates = array();
		$updates[ $parent->ID ] = $parent;

		// Set up child posts
		$children = get_children(
			array(
			     'post_type'   => 'post',
			     'post_parent' => $parent->ID,
			     'orderby'     => 'ID',
			     'order'       => 'ASC',
			     'limit'       => -1
			)
		);

		foreach( $children as $child ) {
			$updates[ $child->ID ] = $child;
		}

		return $updates;
	}

	/**
	 * Parse the posts passed in as a string.
	 *
	 * Every discrete update is prefixed with an HTML comment containing an MD5 hash of the original content (for comparison)
	 * and the ID of the post that contains that content.  The hash can be used for a quick check to see if anything has changed.
	 *
	 * Example: <!--livepress md5=1234567890 id=3-->This is an update
	 *
	 * @param string $string Entire concatenated post, or just the
	 *
	 * @return array
	 */
	private function parse_updates( $string ) {
		$parsed = array();

		$split = preg_split( '/\<\!--livepress(.+)--\>/', $string, -1, PREG_SPLIT_DELIM_CAPTURE );

		for( $i = 0; $i < count( $split ); $i++ ) {
			$part = $split[ $i ];

			if ( '' === trim( $part ) ) {
				continue;
			}

			if ( strpos( trim( $part ), 'md5=' ) === 0 ) {
				$id = preg_match( '/md5=(?P<md5>\w+) id=(?P<id>\w+)/', trim( $part ), $matches );

				$parsed[ $matches['id'] ] = array(
					'md5'     => $matches['md5'],
					'content' => $split[ $i + 1]
				);

				$i++;
			} else {
				if ( isset( $parsed['new'] ) ) {
					continue;
				}

				// This content was not prefixed, so assume it was new.
				$parsed['new'] = array(
					'content' => $split[ $i ]
				);
			}
		}

		return $parsed;
	}
}

/**
 * Called by scrape tool. Does nothing special except turning off the wordpress
 * check for comment flood. Then passes untouched $args to wp.newComment function.
 *
 * @global <type> $wp_xmlrpc_server
 *
 * @param  <type> $args
 *
 * @return <type>
 */
function new_comment_from_scrape( $args ) {
	global $wp_xmlrpc_server;
	livepress_xmlrpc::scrape_hooks();

	return $wp_xmlrpc_server->wp_newComment( $args );
}

/**
 * Called by livepress webservice instead of editPost as we need to save
 * display_author (if passed) before the actual post save method so we know the
 * real author of update.
 * Also, we want to fetch post and append given content to it here, as doing it
 * in livepress webservice can cause race conditions.
 * This handles passed values, updates the arguments and passes them to
 * xmlrpc.php so it works as nothing happened.
 *
 * Handles custom_fields correclty
 *
 * @param array $args
 *
 * @return bool
 */
function livepress_append_to_post( $args ) {
	global $wp_xmlrpc_server, $wpdb;
	$username       = $wpdb->escape( $args[1] );
	$password       = $wpdb->escape( $args[2] );
	$post_id        = (int) $args[0];
	$content_struct = $args[3];

	if ( ! $wp_xmlrpc_server->login( $username, $password ) ) {
		return $wp_xmlrpc_server->error;
	}

	if ( isset( $content_struct['display_author'] ) ) {
		livepress_updater::instance()->set_custom_author_name( $content_struct['display_author'] );
	}

	if ( isset( $content_struct['created_at'] ) ) {
		livepress_updater::instance()->set_custom_timestamp( $content_struct['created_at'] );
	}

	if ( isset( $content_struct['avatar_url'] ) ) {
		livepress_updater::instance()->set_custom_avatar_url( $content_struct['avatar_url'] );
	}

	$plugin_options = get_option( livepress_administration::$options_name );

	// Adds metainfo shortcode
	$content_struct['description'] = "[livepress_metainfo] "
		. $content_struct['description'];

	// append content to post's original
	$edited = $wp_xmlrpc_server->mw_getPost( array( $args[0], $args[1], $args[2] ) );
	if ( $plugin_options['feed_order'] == 'top' ) {
		$content_struct['description'] = $content_struct['description'] . "\n\n" . $edited['description'];
	} else {
		$content_struct['description'] = $edited['description'] . "\n\n" . $content_struct['description'];
	}

	// replacing other fields if given
	$allowed_keys = array(
		'title', 'mt_excerpt', 'mt_text_more', 'mt_keywords',
		'mt_tb_ping_urls', 'categories', 'enclosure'
	);

	foreach ( $allowed_keys as $field ) {
		if ( ! array_key_exists( $field, $content_struct ) ) {
			$content_struct[$field] = $edited[$field];
		}
	}

	// pass modified args to original xmlrpc method
	$args[3] = $content_struct;

	return $wp_xmlrpc_server->mw_editPost( $args );
}
?>
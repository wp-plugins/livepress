<?php
/**
 * Module to handle post-format updates to individual posts.
 *
 * @module LivePress
 * @since 0.7
 */

/**
 * Singleton class for managing post formats and updates.
 *
 * Covers inserting new updates into the database, overriding post displays to hide them from the normal display,
 * and pulling them back out in the appropriate loops for display on individual post pages.
 */
class LivePress_PF_Updates {
	/**
	 * Singleton instance
	 *
	 * @var bool|LivePress_PF_Updates
	 */
	protected static $instance = false;

	/**
	 * LivePress API communication instance.
	 *
	 * @var livepress_communication
	 */
	var $lp_comm;

	/**
	 * LivePress API key as stored in the database.
	 *
	 * @var string
	 */
	var $api_key;

	/**
	 * Order in which updates are displayed.
	 *
	 * @var string
	 */
	var $order;

	/**
	 * Array of region information for each update.
	 *
	 * Must be populated by calling assemble_pieces() and specifying the Post for which to parse regions.
	 *
	 * @var array[]
	 */
	var $pieces;

	/**
	 * Private constructor used to build the singleton instance.
	 * Registers all hooks and filters.
	 */
	protected function __construct() {
		$options = get_option( livepress_administration::$options_name);

		$this->api_key = $options['api_key'];
		$this->lp_comm = new livepress_communication( $this->api_key );

		$this->order = $options['feed_order'];

		// Wire actions
		add_action( 'wp_ajax_start_ee',           array( $this, 'start_editor' ) );
		add_action( 'wp_ajax_append_post_update', array( $this, 'append_update' ) );
		add_action( 'wp_ajax_change_post_update', array( $this, 'change_update' ) );
		add_action( 'wp_ajax_delete_post_update', array( $this, 'delete_update' ) );
		add_action( 'wp_insert_post',             array( $this, 'prepend_lp_comment' ), 10, 2 );
		//add_action( 'delete_post',                array( $this, 'delete_children' ) );

		// Wire filters
		add_filter( 'parse_query',         array( $this, 'hierarchical_posts_filter' ) );
		add_filter( 'pre_get_posts',       array( $this, 'filter_children_from_query' ) );
		add_filter( 'edit_posts_per_page', array( $this, 'setup_post_counts' ), 10, 2 );
		add_filter( 'the_content',         array( $this, 'process_oembeds' ), -10 );
		add_filter( 'the_content',         array( $this, 'append_more_tag' ) );
		add_filter( 'the_content',         array( $this, 'add_children_to_post' ) );
		add_filter( 'the_content',         array( $this, 'filter_xhtml' ), 999 );
		add_filter( 'get_comment_text',    array( $this, 'filter_xhtml' ), 999 );
	}

	/**
	 * Static method used to retrieve the current class instance.
	 *
	 * @return LivePress_PF_Updates
	 */
	public static function get_instance() {
		if ( ! self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	/**
	 * Posts cannot typically have parent-child relationships. Our updates, however, are all "owned" by a traditional
	 * post so we know how to lump things together on the front-end and in the post editor.
	 *
	 * @param WP_Query $query Current query
	 *
	 * @return WP_Query
	 */
	public function hierarchical_posts_filter( $query ) {
		global $pagenow, $typenow;

		if ( is_admin() && 'edit.php' == $pagenow && 'post' == $typenow ) {
			$query->query_vars['post_parent'] = 0;
		}

		return $query;
	}

	/**
	 * Incredibly hacky way to fix post counts on the post edit screen.
	 *
	 * By default, the post counts will list all posts, even the hidden child posts that we want to hide.  This
	 * can cause confusion if the list is only showing 5 posts by shows there are a total of 20 posts in the database.
	 * To fix this, we hook in to the last filter we can before `$wp_list_table->get_views()` is called on the post
	 * list screen and run our own query to update the count cache, omitting child posts from our query.
	 *
	 * Since we're hooking on to a filter rather than an action, be sure to return whatever value was passed in.
	 *
	 * @param int    $per_page
	 * @param string $post_type
	 *
	 * @return int
	 */
	public function setup_post_counts( $per_page, $post_type ) {
		if ( 'post' !== $post_type ) {
			return $per_page;
		}

		global $wpdb;

		$user = wp_get_current_user();

		$cache_key = $post_type;

		$query = "SELECT post_status, COUNT( * ) AS num_posts FROM {$wpdb->posts} WHERE post_type = %s AND post_parent = 0";
		if ( is_user_logged_in() ) {
			$post_type_object = get_post_type_object( $post_type );
			if ( ! current_user_can( $post_type_object->cap->read_private_posts ) ) {
				$cache_key .= '_' . 'readable' . '_' . $user->ID;
				$query .= " AND (post_status != 'private' OR ( post_author = '$user->ID' AND post_status = 'private' ))";
			}
		}
		$query .= ' GROUP BY post_status';

		$count = $wpdb->get_results( $wpdb->prepare( $query, $post_type ), ARRAY_A );

		$stats = array();
		foreach ( get_post_stati() as $state )
			$stats[$state] = 0;

		foreach ( (array) $count as $row )
			$stats[$row['post_status']] = $row['num_posts'];

		$stats = (object) $stats;
		wp_cache_set($cache_key, $stats, 'counts');

		return $per_page;
	}

	/**
	 * If a post has children (live updates) automatically append a read more link.
	 * Also, automatically pad the post's content with the first update if content
	 * is empty.
	 *
	 * @param string $content Post content
	 *
	 * @return string
	 */
	public function append_more_tag( $content ) {
		global $post;

		if ( ! is_object( $post ) ) {
			return $content;
		}

        if ( isset( $post->no_update_tag ) || is_single() || is_admin() || 
             (defined( 'XMLRPC_REQUEST' ) && constant( 'XMLRPC_REQUEST' )) ) {
			return $content;
		}

		// First, make sure the content is non-empty
		$content = $this->hide_empty_update( $content );

		$children = $this->count_children( $post->ID );

		if ( $children > 0 ) {
			$more_link_text = __( '(see updates...)', 'livepress' );

			$pad = $this->pad_content( $post );

			$content .= apply_filters( 'livepress_pad_content', $pad, $post );
			$content .= apply_filters( 'the_content_more_link', ' <a href="' . get_permalink() . "#more-{$post->ID}\" class=\"more-link\">$more_link_text</a>", $more_link_text );
			$content = force_balance_tags( $content );
		}

		return $content;
	}

	/**
	 * Don't display unnecessarily empty LivePress HTML tags.
	 *
	 * @param string $content
	 *
	 * @return string
	 */
	protected function hide_empty_update( $content ) {
		if ( $this->is_empty( $content ) ) {
			$content = '';
		}

		return $content;
	}

	/**
	 * Filter posts on the front end so that individual updates appear as separate elements.
	 *
	 * Filter automatically removes itself when called the first time.
	 *
	 * @param string $content Parent post content.
	 *
	 * @return string
	 */
	public function add_children_to_post( $content ) {
		// Don't filter on the back end
		if ( ! is_singular( 'post' ) ) {
			return $content;
		}

		// Remove the filter to prevent an infinite cascade.
		remove_filter( 'the_content', array( $this, 'add_children_to_post' ) );

		global $post;

		$this->assemble_pieces( $post );

		$response = array();
		foreach( $this->pieces as $piece ) {
			$response[] = $piece['prefix'];
			$response[] = $piece['proceed'];
			$response[] = $piece['suffix'];
		}

		$content = join( '', $response );
		$content = livepress_updater::instance()->add_global_post_content_tag( $content );

		// Re-add the filter and carry on
		add_filter( 'the_content', array( $this, 'add_children_to_post' ) );

		return $content;
	}

	/**
	 * If the post's content is below a certain threshhold, pad it with updates until it's reasonable.
	 *
	 * @param WP_Post $post
	 *
	 * @return string
	 */
	public function pad_content( $post ) {
		// Temporarily unhook this filter
		remove_filter( 'the_content', array( $this, 'append_more_tag' ) );

		$extras = '';

		$content = trim( $post->post_content );
		$excerpt = trim( $post->post_excerpt );

		if ( $this->is_empty( $content ) && $this->is_empty( $excerpt ) ) {
			// We have no content to display. Grab the post's first update and return it instead.
			$children = get_children(
				array(
				     'post_type'   => 'post',
				     'post_parent' => $post->ID,
				     'numberposts' => 1
				)
			);

			if ( count( $children ) > 0 ) {
				reset( $children );
				$child = $children[key( $children )];
				$piece_id = get_post_meta( $child->ID, '_livepress_update_id', true );

				$extras = apply_filters( 'the_content', $child->post_content );
			}
		}

		// Re-add filters
		add_filter( 'the_content', array( $this, 'append_more_tag' ) );

		return $extras;
	}

	/**
	 * Don't show child posts on the front page of the site, they'll be pulled in separately as updates to a live post.
	 *
	 * @param WP_Query $query The current query
	 *
	 * @return WP_Query
	 */
	public function filter_children_from_query( $query ) {
		$parent = $query->get( 'post_parent' );
		if ( empty( $parent ) ) {
			$query->set( 'post_parent', 0 );
		}

		return $query;
	}

	/**
	 * Prepend a region identifier to a post update so we can check it later.
	 *
	 * @param int     $post_ID
	 * @param WP_Post $post
	 */
	public function prepend_lp_comment( $post_ID, $post ) {
		if ( 'post' !== $post->post_type ) {
			return;
		}

		// If the content already has the LivePress comment field, remove it and re-add it
		if ( 1 === preg_match( '/\<\!--livepress(.+)--\>/', $post->post_content) ) {
			$post->post_content = preg_replace( '/\<\!--livepress(.+)--\>/', '', $post->post_content );
		}
		
		if ( '' === $post->post_content ) {
			return;
		}
		
		$md5 = md5( $post->post_content );

		$post->post_content = "<!--livepress md5={$md5} id={$post_ID}-->" . $post->post_content;

		// Remove the action before updating
		remove_action( 'wp_insert_post', array( $this, 'prepend_lp_comment' ) );
		wp_update_post( $post );
		add_action( 'wp_insert_post', array( $this, 'prepend_lp_comment' ), 10, 2 );
	}

	/**
	 * Parse passed content and convert it to strict XHTML.
	 *
	 * @param string $content
	 *
	 * @return string
	 */
	public function filter_xhtml( $content ) {

		// Check to verify that the current post is marked as live, skip HTMLPurify if not live
		$lp_active = get_post_meta( get_the_ID(), '_livepress_live_status', true );
		if( isset( $lp_active['live'] ) ) {
			$lp_active = (int) $lp_active['live'];
		} else {
			$lp_active = 0;
		}

		if ( 1 === $lp_active && true !== HTMLPurifier_DefinitionCache_WPDatabase::$caching ) {
			$content = lp_wp_utils::purifyHTML( $content );
		}

		return $content;
	}

	/*****************************************************************/
	/*                         AJAX Functions                        */
	/*****************************************************************/

	/**
	 * Enable the Real-Time Editor for LivePress.
	 *
	 * Fetch the content of the user's current textarea and return:
	 * - Original post content, split into regions with distinct IDs
	 * - Processed content, again split into regions
	 * - User's POSTed content, split into regions with same IDs as original post
	 * - Processed POSTed content, split into regions
	 */
	public function start_editor() {
		// Globalize $post so we can modify it a bit before using it
		global $post;

		// Set up the $post object
		$post = get_post( $_POST['post_id'] );
		$post->no_update_tag = true;

		$edit_uuid = lp_wp_utils::get_from_post( $post->ID, "post_update" /*"post_edit"*/, true );

		$user_content = stripslashes( $_POST['content'] );

		$this->assemble_pieces( $post );

		$original = $this->pieces;

		if ( $post->post_content == $user_content ) {
			$user = null;
		} else {
			// Proceed user-supplied post content.
			$user = $this->pieces;
		}

		$ans = array(
			'orig'        => $original,
			'user'        => $user,
			'edit_uuid'   => $edit_uuid,
			'editStartup' => Collaboration::return_live_edition_data()
		);

		header( "Content-type: application/javascript" );
		echo json_encode( $ans );
		die;
	}

	/**
	 * Insert a new child post to the current post via AJAX.
	 *
	 * @uses LivePress_PF_Updates::add_update
	 */
	public function append_update() {
		global $post;
		check_ajax_referer( 'livepress-append_post_update-' . intval( $_POST['post_id'] ) );

		$post = get_post( intval( $_POST['post_id'] ) );
		$user_content = stripslashes( $_POST['content'] );

		if ( ! empty( $user_content ) ) {
			$plugin_options = get_option( livepress_administration::$options_name );

			$update = $this::add_update( $post->ID, $_POST['content'] );

			if ( is_wp_error( $update ) ) {
				$response = false;
			} else {
				$update = get_post( $update );
				$piece_id = get_post_meta( $update->ID, '_livepress_update_id', true );
				$response = array(
					'id'      => $piece_id,
					'content' => $update->post_content,
					'proceed' => apply_filters( 'the_content', $this->process_oembeds( $update->post_content ) ),
					'prefix'  => sprintf( '<div id="livepress-update-%s" class="livepress-update">', $piece_id ),
					'suffix'  => '</div>'
				);
			}
		} else {
			$response = false;
		}

		header( "Content-type: application/javascript" );
		echo json_encode( $response );
		die;
	}

	/**
	 * Modify an existing update. Basically, replace the content of a child post with some other content.
	 *
	 * @uses wp_update_post() Uses the WordPress API to update post content.
	 */
	public function change_update() {
		global $post;
		check_ajax_referer( 'livepress-change_post_update-' . intval( $_POST['post_id'] ) );

		$post = get_post( intval( $_POST['post_id'] ) );

		if ( ! current_user_can( 'edit_post', $post->ID ) ) {
			die;
		}

		$update_id = intval( substr( $_POST['update_id'], strlen( 'livepress-update-' ) ) );
		$user_content = stripslashes( $_POST['content'] );

		$update = $this->get_update( $post->ID, $update_id );
		if( null == $update ) {
			die;
		}

		$this->assemble_pieces( $post );
		$old_data = $this->pieces;

		// Swap the content out, but keep track of it so we can send a diff to LivePress
		$old_content = $update->post_content;
		$update->post_content = $user_content;

		wp_update_post( $update );

		$this->assemble_pieces( $post );
		$new_data = $this->pieces;

		$this->send_change_to_livepress( $post, $old_data, $new_data );

		$piece_id = get_post_meta( $update->ID, '_livepress_update_id', true );
		$region = array(
			'id'      => $piece_id,
			'content' => $update->post_content,
			'proceed' => apply_filters( 'the_content', $update->post_content ),
			'prefix'  => sprintf( '<div id="livepress-update-%s" class="livepress-update">', $piece_id ),
			'suffix'  => '</div>'
		);

		header("Content-type: application/javascript");
		echo json_encode( $region );
		die;
	}

	/**
	 * Removes an update from the database entirely.
	 *
	 * @uses wp_delete_post() Uses the WordPress API to delete a post.
	 */
	public function delete_update() {
		global $post;
		check_ajax_referer( 'livepress-delete_post_update-' . intval( $_POST['post_id'] ) );

		$post = get_post( intval( $_POST['post_id'] ) );

		if ( !current_user_can( 'edit_post', $post->ID ) ) {
			die();
		}

		$update_id = intval( substr( $_POST['update_id'], strlen( 'livepress-update-' ) ) );

		$update = $this->get_update( $post->ID, $update_id );
		if( null == $update ) {
			die;
		}

		$this->assemble_pieces( $post );
		$old_data = $this->pieces;

		wp_delete_post( $update->ID, true );

		$this->assemble_pieces( $post );
		$new_data = $this->pieces;

		$this->send_change_to_livepress( $post, $old_data, $new_data );

		header("Content-type: application/javascript");
		echo "true";
		die;
	}

	/*****************************************************************/
	/*                         Helper Functions                      */
	/*****************************************************************/

	/**
	 * Add an update to an existing post
	 *
	 * @param int|WP_Post $parent  Either the ID or object for the post which you are updating
	 * @param string      $content Post content
	 *
	 * @return int|WP_Error
	 *
	 * @uses wp_insert_post() Uses the WordPress API to create a new child post.
	 */
	public function add_update( $parent, $content ) {
		global $current_user, $post;
		get_currentuserinfo();

		if ( ! is_object( $parent ) ) {
			$parent = get_post( $parent );
		}
		$save_post = $post;
		$post = $parent;

		$this->assemble_pieces( $parent );
		$old_data = $this->pieces;

		$update = wp_insert_post(
			array(
			     'post_author' => $current_user->ID,
			     'post_content' => $content,
			     'post_parent' => $parent->ID,
			     'post_title' => $parent->post_title,
			     'post_type' => 'post',
			     'post_status' => 'publish'
			),
			true
		);

		if ( ! is_a( $update, 'WP_Error' ) ) {
			set_post_format( $update, 'aside' );

			$region_id = mt_rand( 10000000, 26242537 );
			update_post_meta( $update, '_livepress_update_id', $region_id );

			$this->assemble_pieces( $parent );
			$new_data = $this->pieces;

			$this->send_change_to_livepress( $parent, $old_data, $new_data );
		}

		$post = $save_post;
		return $update;
	}

	/**
	 * Remove nested child posts when a parent is removed.
	 *
	 * @param int $parent ID of the parent post being deleted
	 */
	public function delete_children( $parent ) {
		// Get all children
		$children = get_children(
			array(
			     'post_type'   => 'post',
			     'post_parent' => $parent
			)
		);

		// Remove the action so it doesn't fire again
		remove_action( 'delete_post', array( $this, 'delete_children' ) );

		/** @var WP_Post $child */
		foreach( $children as $child ) {
			wp_delete_post( $child->ID, true );
		}
		add_action( 'delete_post', array( $this, 'delete_children' ) );
	}

	/**
	 * Get the full content of a given parent post.
	 *
	 * @param object $parent
	 *
	 * @return string
	 */
	public function get_content( $parent ) {
		$this->assemble_pieces( $parent );

		$pieces = array();
		foreach( $this->pieces as $piece ) {
			$pieces[] = $piece['content'];
		}

		return join( '', $pieces );
	}

	/**
	 * Send an update (add/change/delete) to LivePress' API
	 *
	 * @param object  $parent Parent post.
	 * @param array[] $old    Old region data
	 * @param array[] $new    New region data
	 */
	protected function send_change_to_livepress( $parent, $old, $new ) {
		$update = array();

		$old_res = array();
		foreach( $old as $piece ) {
			$old_res[] = $piece['prefix'];
			$old_res[] = $piece['proceed'];
			$old_res[] = $piece['suffix'];
		}
		$update['old_data'] = join( "", $old_res );

		$new_res = array();
		foreach( $new as $piece ) {
			$new_res[] = $piece['prefix'];
			$new_res[] = $piece['proceed'];
			$new_res[] = $piece['suffix'];
		}
		$update['data'] = join( "", $new_res );

		// If nothing's changed, bail
		if ( $update['old_data'] == $update['data'] ) {
			return;
		}

		$update['updated_at'] = get_gmt_from_date( current_time( 'mysql' ) ) . 'Z';
		$update['is_new'] = $update['old_data'] == $update['data'] ? true : $this->is_new( $parent->ID );

		$user = wp_get_current_user();
		if ( $user->ID ) {
			if ( empty( $user->display_name ) ) {
				$update['author'] = addslashes( $user->user_login );
			}
			$update['author'] = addslashes( $user->display_name );
		} else {
			$update['author'] = '';
		}

		// Update unique identifiers for the post and update
		$old_uuid = get_post_meta( $parent->ID, '_livepress_post_update', true );
		$new_uuid = $this->lp_comm->new_uuid();
		update_post_meta( $parent->ID, '_livepress_post_update', $new_uuid );
		$update['previous_uuid'] = $old_uuid;
		$update['uuid'] = $new_uuid;

		// Region stuff
		$this->assemble_pieces( $parent );
		$region_content = $this->pieces;
		$update['edit'] = json_encode( $region_content );

		try {
			$update['post_id'] = $parent->ID;
			$update['post_title'] = $parent->post_title;
			$update['post_link'] = get_permalink( $parent->ID );

			$job_uuid = $this->lp_comm->send_to_livepress_post_update( $update );
		} catch( livepress_communication_exception $e ) {
			$e->log( 'post update' );
		}

		// Set the post as having been updated
		$status = array( 'automatic' => 1, 'live' => 1 );
		update_post_meta( $parent->ID, '_livepress_live_status', $status );
	}

	/**
	 * Populate the pieces array based on a given parent post.
	 *
	 * @param object $parent Parent post for which we're assembling pieces
	 */
	protected function assemble_pieces( $parent ) {
		if ( ! is_object( $parent ) ) {
			$parent = get_post( $parent );
		}

		$pieces = array();

		$parent_lp_id = get_post_meta( $parent->ID, '_livepress_update_id', true );
		if ( ! $this->is_empty( $parent->post_content ) ) {
			$pieces[] = array(
				'id'      => $parent_lp_id,
				'content' => $parent->post_content,
				'proceed' => apply_filters( 'the_content', $parent->post_content ),
				'prefix'  => sprintf( '<div id="livepress-update-%s" class="livepress-update">', $parent_lp_id ),
				'suffix'  => '</div>'
			);
		}

		// Set up child posts
		$children = get_children(
			array(
			     'post_type'   => 'post',
			     'post_parent' => $parent->ID
			)
		);

		$child_pieces = array();

		if ( count( $children ) > 0 ) {
			foreach( $children as $child ) {
				$post = $child;

				$piece_id = get_post_meta( $child->ID, '_livepress_update_id', true );
				$piece = array(
					'id'      => $piece_id,
					'content' => $child->post_content,
					'proceed' => apply_filters( 'the_content', $child->post_content ),
					'prefix'  => sprintf( '<div id="livepress-update-%s" class="livepress-update">', $piece_id ),
					'suffix'  => '</div>'
				);

				$child_pieces[] = $piece;
			}
		}

		// Display posts oldest-newest by default
		$child_pieces = array_reverse( $child_pieces );
		$pieces = array_merge( $pieces, $child_pieces );

		if ( 'top' == $this->order ) {
			// Display posts newest-oldest
			$pieces = array_reverse( $pieces );
		}

		$this->pieces = $pieces;
	}

	public function process_oembeds( $content ) {
		return preg_replace('&((?:<!--livepress.*?-->|\[livepress[^]]*\])\s*)(https?://[^\s"]+)&', "$1[embed]$2[/embed]", $content);
	}

	/**
	 * Check if a post update is empty (blank or only an HTML comment).
	 *
	 * @param string $post_content
	 *
	 * @return boolean
	 */
	protected function is_empty( $post_content ) {
		$empty_tag_position = strpos( $post_content, '<!--livepress md5=d41d8cd98f00b204e9800998ecf8427e' );
		return empty( $post_content ) || false !== $empty_tag_position || ( is_int( $empty_tag_position ) && $empty_tag_position >= 0 );
	}

	/**
	 * Check if an update is new or if it has been previously saved
	 *
	 * @param int $post_id
	 *
	 * @return boolean true if post has just been created.
	 */
	protected function is_new( $post_id ) {
		$options = array(
			'post_parent' => $post_id,
			'post_type'   => 'revision',
			'numberposts' => -1,
			'post_status' => 'any',
		);

		$updates = get_children( $options );
		if ( count( $updates ) == 0 ) {
			return true;
		} elseif ( count( $updates ) >= 2 ) {
			$first = array_shift($updates);
			$last = array_pop($updates);
			return $last->post_modified_gmt == $first->post_modified_gmt;
		} else {
			return true;
		}
	}

	/**
	 * Count the number of child posts for a specfic post.
	 *
	 * @param int $parent ID of the parent post
	 *
	 * @return int
	 */
	protected function count_children( $parent ) {
		global $wpdb;

		$query = $wpdb->prepare( "SELECT COUNT(ID) FROM $wpdb->posts WHERE post_parent = %d AND post_type = 'post'", $parent );

		$count = wp_cache_get( "child_posts_$parent", 'counts' );
		if ( false !== $count )
			return $count;

		$count = intval( $wpdb->get_var( $query ) );

		wp_cache_set( "child_posts_$parent", $count, 'counts' );

		return $count;
	}

	/**
	 * Get an update to a post from the database.
	 *
	 * @param int $parent_id            Parent post from which to retrieve an update.
	 * @param int $livepress_update_id  ID of the update to retrieve.
	 *
	 * @return null|object Returns null if a post doesn't exist.
	 */
	protected function get_update( $parent_id, $livepress_update_id ) {
		$query = new WP_Query(
			array(
			     'post_type' => 'post',
			     'post_parent' => $parent_id,
			     'meta_query' => array(
				     array(
					     'key'   => '_livepress_update_id',
					     'value' => $livepress_update_id
				     )
			     )
			)
		);

		if ( ! $query->have_posts() ) {
			return null;
		}

		return $query->post;
	}
}

LivePress_PF_Updates::get_instance();
?>

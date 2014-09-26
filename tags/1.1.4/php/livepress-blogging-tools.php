<?php
/**
 * A class representing the Live Blogging Tools tab on the edit post screen.
 *
 * @access public
 * @author Eric Mann
 */

final class LivePress_Blogging_Tools {
	/**
	 * The tab data associated with the edit post screen.
	 *
	 * @var array
	 * @access private
	 */
	private $_tabs = array();

	/**
	 * The sidebar data associated with the edit post screen.
	 *
	 * @var string
	 * @access private
	 */
	private $sidebar = '';

	/**
	 * Constructor
	 *
	 * @uses add_action Adds an action to 'post_submitbox_misc_actions' to add the LivePress indicators.
	 */
	public function __construct() {
		add_action( 'add_meta_boxes',                                 array( $this, 'livepress_status' ) );
		add_action( 'admin_enqueue_scripts',                          array( $this, 'feature_pointer' ) );
		add_filter( 'postbox_classes_post_livepress_status_meta_box', array( $this, 'add_livepress_status_metabox_classes' ) );
		add_filter( 'mce_buttons',                                    array( $this, 'lp_filter_mce_buttons' ) );
		add_filter( 'admin_body_class',                               array( $this, 'lp_admin_body_class' ) );
		add_action( 'wp', array( $this, 'opengraph_request' ) );
	}

  /**
   * Check if the request is from Facebook's Open Graph protocol. If
   * so then just return the basic HTML for embedding. The link to
   * share on Facebook should be:
   * http://host/permalink?lpup=[livepress_update_id]
   */
	function opengraph_request(){
		if ( isset( $_GET['lpup'] ) && ( 1 === preg_match( '/facebookexternalhit(\/[0-9]\.[0-9])?|Facebot/i', $_SERVER['HTTP_USER_AGENT'] ) ) ) {

			$id = absint( $_GET['lpup'] );
			$lp_updates = LivePress_PF_Updates::get_instance();
			remove_action( 'pre_get_posts', array( $lp_updates, 'filter_children_from_query' )  );
			$args = array(
				'posts_per_page'  => 1,
				'nopaging'        => true,
				'no_found_rows'   => true,
				'post_status'     => 'inherit',
				'suppress_filters'=> true,
				'post_type'       => 'post',
				'post_name'       => 'livepress_update__' . $id
			);
			$results = new WP_Query( $args );
			add_action( 'pre_get_posts', array( $lp_updates, 'filter_children_from_query' ) );

			$update = $results->posts[0];

			$data = $this->opengraph_data( $update );

			$canonical_url = get_permalink( $update->ID ) . '&lpup=' . $id . '#livepress-update-' . $id;

			echo "<!DOCTYPE HTML>\n";
			echo "<html>\n";
			echo "<head prefix=\"og: http://ogp.me/ns#\">\n";
			echo "<link rel=\"canonical\" href=\"" .           esc_url( $canonical_url ) . "\">\n";
			echo "<title>" .                                   esc_html( $data->title ) . "</title>\n";
			echo '<meta property="og:title" content="' .       esc_attr( $data->title ) . "\" />\n";
			echo "<meta property=\"og:type\" content=\"" .     esc_attr( $data->type ) . "\" />\n";
			echo '<meta property="og:url" content="' .         esc_attr( $canonical_url ) .	"\" />\n";
			echo '<meta property="og:image" content="' .       esc_attr( $data->img ) . "\" />\n";
			echo '<meta property="og:site_name" content="' .   esc_attr( get_bloginfo( 'name' ) ) . "\" />\n";
			echo '<meta property="og:description" content="' . esc_attr( $data->description ) . "\" />\n";
			echo "</head>\n";
			echo "<body>\n";
			echo '<p>' . esc_html( $data->description ) . "</p>\n";
			echo "</body>\n</html>\n";
			exit( 0 );
		}
	}

	private function opengraph_data( $update ){
		$data = new stdClass();
		$data->description = '';
		$data->type = 'article';
		$content = wp_strip_all_tags(
			preg_replace( "/\[livepress_metainfo.+\]/", '', $update->post_content )
		);
		// Check tweets first since their content is already cached:
		if ( 1 === preg_match( '/https?:\/\/twitter\.com\S*/', $content, $matches ) ){
			// Get embedded tweet from WP
			$tweet_data = wp_oembed_get( $matches[0] );
			$data->description = wp_strip_all_tags( $tweet_data );
			$data->img = $this->og_image( $update );
			$data->title = wp_trim_words( $data->description, 10, esc_html__( '&hellip;', 'livepress' ) );
			return $data;
		} elseif( preg_match( '/^(https?:\/\/)\S*/i', $content, $matches ) ) {
			// oEmbed update:
			$odata = get_transient( 'lpup_' . $update->ID );
			if ( false === $odata ){
				// Get oEmbed data
				$url = $matches[0];
				wp_oembed_get( $url );
				$oembed = _wp_oembed_get_object();
				$provider_url = $oembed->get_provider( $matches[0] );
				$odata = $oembed->fetch( $provider_url, $url );
				// Set the cache to expire in one month
				set_transient( 'lpup_' . $update->ID, $odata, 30 * DAY_IN_SECONDS );
			}
			$data->title = $odata->title;
			$data->description = $data->title;
			$data->img = $odata->thumbnail_url;
			return $data;
		}
		// No oEmbeds:
		$data->img = $this->og_image( $update );
		$data->title = $this->og_title( $update );
		if (count($content) > 0 && $content != '') {
			$data->description = wp_trim_words( $content, 40, esc_html__( '&hellip;', 'livepress' ) );
		} else {
			$data->description = $data->title;
		}
		return $data;
	}

	// Get the image from the update of from the parent post if there's
	// a featured image:
	private function og_image( $update ){
		global $post;
		$img = '';
		preg_match( '/<img.*src=[\'|\"]?(\S+\.{1}[a-z]{3,4})/i', $update->post_content, $matches );
		if( 0 < count($matches) ){
			$img = $matches[1];
		} elseif( has_post_thumbnail( $post->ID ) ){
			$img = wp_get_attachment_url( get_post_thumbnail_id( $post->ID ) );
		}
		return $img;
	}

	// Get the title from the update (once we implement headlines), the
	// content or the post parent's title:
	private function og_title( $update ){
		if ($update->post_title && $update->post_title != '' && ( 1 !== preg_match("/livepress_update__[0-9]+/", $update->post_title ) ) ){
			return $update->post_title;
		} else {
			global $post;
			$content = preg_replace( '/\[livepress_metainfo.+\]/', '', $update->post_content );
			$content = wp_strip_all_tags( $content );
			if ( 0 < count( $content ) && $content != '' ){
				$title = wp_trim_words( $content, 10, esc_html__( '&hellip;', 'livepress' ) );
			} else {
				$title = $post->post_title;
			}
		}
		return $title;
	}

/**
 * Add the livepress-live class to the edit post page when a post is live.
 * @param  Array $classes Array of classes.
 * @return Array          Updated array of classes.
 *
 * @since 1.1.1
 */
function lp_admin_body_class( $classes ) {
	global $post;
	$screen = get_current_screen();
	if ( is_admin() &&                               /* in admin? */
		 'post' === $screen->id &&                   /* on edit post page? */
		 $this->get_post_live_status( $post->ID ) && /* is this post live */
		 ! strstr( $classes, ' livepress-live')) {   /* only add once at most */

		// Add the livepress-live class
		$classes .= ' livepress-live';
	}
	return $classes;
}

	/**
	 * Check if a post has the Live Post Header feature enabled.
	 *
	 * @param  int $post_id The post id.
	 * @return boolean      True if the header is enabled, false if not.
	 *
	 * @since  1.0.9
	 */
	public function is_post_header_enabled( $post_id ){
		return ( '1' === ( $this->get_option( 'post_header_enabled', $post_id, '0' ) ) );
	}

	/**
	 * Set if a post has the Live Post Header feature enabled.
	 *
	 * @param int     $post_id The post id.
	 * @param boolean $enable  Enable (true) or disable (false) the feature.
	 *
	 * @since  1.0.9
	 */
	public function set_post_header_enabled( $post_id, $enable = true ){

		$this->save_option( 'post_header_enabled', $enable, $post_id );
	}
	/**
	 * Check to see if we have previously saved a password for the user
	 *
	 * @param  int     $user_id The id of the user to check.
	 * @return boolean True if we have a paassword save, otherwise false
	 *
	 * @since 1.0.9
	 */
	public function get_have_user_pass( $user_id ) {
		$users_with_passwords = get_option( 'livepress_users_with_passwords', array() );
		return in_array( $user_id, $users_with_passwords );
	}

	/**
	 * Set the status of the saved user password.
	 *
	 * @param int     $user_id The id of the user to check.
	 * @param boolean $status Whether the password bas been saved
	 *
	 * @since 1.0.9
	 */
	public function set_have_user_pass( $user_id, $status = false ){
		$users_with_passwords = get_option( 'livepress_users_with_passwords', array() );
			if ( $status && ! in_array( $user_id, $users_with_passwords ) ){
				array_push( $users_with_passwords, $user_id );
			} else {
				// Remove post id if setting status not live
				if ( ! $status && in_array( $user_id, $users_with_passwords ) ){
					$users_with_passwords = array_diff( $users_with_passwords, array( $user_id ) );
				}
			}
		update_option( 'livepress_users_with_passwords', $users_with_passwords );
	}

	/**
	 * Clear the livepress_users_with_passwords option
	 *
	 * @since 1.0.9
	 */
	public function clear_have_user_pass() {
		delete_option( 'livepress_users_with_passwords' );
	}

	/**
	 * Check the live status of a post.
	 *
	 * @param  int $post_id The post id.
	 * @return boolean      True if the post is live, false if not live.
	 *
	 * @since  1.0.7
	 */
	public function get_post_live_status( $post_id ){
		$live_posts = get_option( 'livepress_live_posts', array() );
		// Search for the post id among the live posts
		return in_array( $post_id, $live_posts );
	}

	/**
	 * Set the live status of a post.
	 *
	 * @param int  $post_id The post id.
	 * @param bool $status  Status - True to set the post is live, false to set not live.
	 *
	 * @since  1.0.7
	 */
	public function set_post_live_status( $post_id, $status ){
		$live_posts = get_option( 'livepress_live_posts', array() );
			// Add post id if setting status live
			if ( $status && ! in_array( $post_id, $live_posts ) ){
				array_push( $live_posts, $post_id );
			} else {
				// Remove post id if setting status not live
				if ( ! $status && in_array( $post_id, $live_posts ) ){
					$live_posts = array_diff( $live_posts, array( $post_id ) );
				}
			}
		update_option( 'livepress_live_posts', $live_posts );
	}

	/**
	 * Get an array of all posts that are live.
	 *
	 * @return  @param array $args {
	 *     An array of post_ids for all live posts
	 *
	 *     @param int $post_id The post id
	 * }
	 *
	 * @since  1.0.7
	 */
	function get_all_live_posts() {
		return get_option( 'livepress_live_posts', array() );
	}

	/**
	 * Upgrade the live status storage from using post meta for each post.
	 * Instead use a single option that contains a list of live Posts.
	 *
	 * Each option is an array containing a list of live post ids.
	 *
	 * Called when upgrading.
	 *
	 * @since  1.0.7
	 */
	function upgrade_live_status_system() {
		$all_posts = get_posts( array( 'suppress_filters' => false ) );
		foreach( $all_posts as $post ){
			$status = $this->get_option( 'live_status', $post->ID );
			if ( ( isset( $status['live'] ) ) && 1 === (int) $status['live'] ) {
				$this->set_post_live_status( $post->ID, true );
				$this->save_option( 'live_status', false, $post->ID );
			}
		}
	}

	/**
	 * Filter the default mce editor icons to exclude the fullscreen button.
	 */
	public function lp_filter_mce_buttons( $buttons ) {
		global $post;

		$remove = 'fullscreen';
		$is_live = $this->get_post_live_status( $post->ID );

		if ( $is_live && false !==( $key = array_search( $remove, $buttons ) ) ) {
			//Find the array key and then unset
			unset($buttons[$key]);
		}

		return $buttons;
	}

	/**
	 * Add appropriate classes to the meta box for proper diaplay of LivePress status.
	 *
	 * Adds one of 'live' or 'not-live'
	 *
	 * @param array $classes existing classes for the meta box
	 * @return array ammended classes for the meta box
	 */
	public function add_livepress_status_metabox_classes( $classes ) {
		global $post;

		$is_live = $this->get_post_live_status( $post->ID );

		if ( $is_live ) {
			$toggle = 'live';
			// Also delete the post lock since the post is live - allow simultaneous editing
			delete_post_meta( $post->ID, '_edit_lock' );

		} else {
			$toggle = 'not-live';
		}

		if( ! in_array( $toggle, $classes ) ) {
			array_push( $classes, $toggle );
		}

		$pin_header = $this->is_post_header_enabled( $post->ID );
		if ( $pin_header ){
			$toggle = 'pinned-header';
			if( ! in_array( $toggle, $classes ) ) {
				array_push( $classes, $toggle );
			}
		}

		return $classes;
	}

	/**
	 * Display the LivePress meta box above the Post Publish meta box.
	 */
	public function livepress_status_meta_box() {
		global $post;

		$pin_header = $this->is_post_header_enabled( $post->ID );

		echo '<div id="lp-pub-status-bar" class="major-publishing-actions">';
		echo '<div class="info">';
		echo '<span class="first-line">';
		echo "<span class=\"lp-on\">" . sprintf( '%s <strong>%s</strong>', esc_html__( 'This Post is', 'livepress' ), esc_html__( 'LIVE' ) ) . '</span>';
		echo "<span class=\"lp-off\">" . sprintf( '%s <strong>%s</strong>', esc_html__( 'This Post is', 'livepress' ), esc_html__( 'NOT LIVE' ) ) . '</span>';
		echo "<span class=\"disabled\">" . esc_html__( 'LivePress is Disabled', 'livepress' ) . '</span>';
		echo sprintf( ' <a class="toggle-live button turnoff">%s</a>', esc_html__( 'Turn off live', 'livepress' ) );
		echo sprintf( ' <a class="toggle-live button turnon">%s</a>', esc_html__( 'Turn on live', 'livepress' ) );
		echo '</span>';
		echo '</div>';
		echo '</div>';
		echo '<div class="pinned-first-option">';
		echo '<label class="pinnit"><input id="pinfirst" type="checkbox" ' . ( $pin_header ? 'checked="checked" ' : '' ) . ' name="pinfirst" value="1">';
		//echo ;
		echo esc_html__('First update sticky', 'livepress' );
		echo '</label></div>';
		}

	/**
	 * Add the LivePress meta box above the Post Publish meta box.
	 */
	public function livepress_status() {
		global $post;

		// Only show on post_type == 'post'
		if( 'post' != $post->post_type ) {
			return;
		}
		if ( LP_LIVE_REQUIRES_ADMIN ) {
			// Only allow enabling live for posts to admins
			// If post is already live, allow anyone to live blog
			$is_live = $this->get_post_live_status( $post->ID );
			if ( ! current_user_can( 'manage_options' ) && ! $is_live ) {
				return;
			}
		}

		add_meta_box(
			'livepress_status_meta_box',
			esc_html__( 'LivePress Status', 'livepress' ),
			array( $this, 'livepress_status_meta_box' ),
			'post',
			'side',
			'high'
		);
	}

	/**
	 * Get all of the tabs for the Live Blogging Tools section.
	 *
	 * @return array All tabs with arguments.
	 */
	public function get_tabs() {
		return $this->_tabs;
	}

	/**
	 * Get the arguments for a specifc tab.
	 *
	 * @param string $id Tab ID.
	 * @return array Tab arguments
	 */
	public function get_tab( $id ) {
		if ( ! isset( $this->_tabs[ $id ] ) )
			return null;

		return $this->_tabs[ $id ];
	}

	/**
	 * Add a tab to the Live Blogging Tools section.
	 *
	 * @param array $args {
	 *     Array of arguments for a Live Blogging Tools tab.
	 *
	 *     @type string   $title    Title for the tab.
	 *     @type string   $id       Tab ID. Must be HTML-safe.
	 *     @type string   $content  HTML content for the tab.
	 *     @type callback $callback Optional. Callback function to generate tab content.
	 * }
	 */
	public function add_tab( $args ) {
		$defaults = array(
			'title'    => false,
			'id'       => false,
			'content'  => '',
			'callback' => false
		);
		$args = wp_parse_args( $args, $defaults );

		$args['id'] = sanitize_html_class( $args['id'] );

		// Ensure we have a title and ID
		if ( ! $args['id'] || ! $args['title'] )
			return;

		// Allows for overriding an existing tab with that id.
		$this->_tabs[ $args['id'] ] = $args;
	}

	/**
	 * Remove the identified tab from the Live Blogging Tools section.
	 *
	 * @param string $id The tab id.
	 */
	public function remove_tab( $id ) {
		unset( $this->_tabs[ $id ] );
	}

	/**
	 * Remove all tabs from the Live Blogging Tools section.
	 */
	public function  remove_tabs() {
		$this->_tabs = array();
	}

	/**
	 * Get the content from the Live Blogging Tools sidebar.
	 *
	 * @users apply_filters() Calls 'livepress_blogging_tools_sidebar' to get the remaining markup of the sidebar.
	 */
	public function get_sidebar() {
		return apply_filters( 'livepress_blogging_tools_sidebar', $this->sidebar );
	}

	/**
	 * Add a sidebar to the Live Blogging Tools section.
	 *
	 * @param string $content Sidebar content in plaintext or HTML.
	 */
	public function set_sidebar( $content ) {
		$this->sidebar = $content;
	}

	/**
	 * Get either a global option or one tied to a specific post.
	 *
	 * @param  string $option_name    Name of the option to retrieve.
	 * @param  int    $post           Post ID (optional).
	 * @param  mixed  $default_return Default value to return if option is not set, empty string by default
	 *
	 * @return mixed|null Stored option.
	 */
	public function get_option( $option_name, $post = null, $default_return = '' ) {
		if ( $post != null ) {
			$to_return = get_post_meta( $post, '_livepress_' . $option_name, true );
			if ( '' == $to_return ){
				$to_return = $default_return;
		}
		} else{
			$to_return = get_option( 'livepress_' . $option_name );
		}
		return $to_return;
	}

	/**
	 * Save an option, either as a global or for a specific post.
	 *
	 * @param string $option_name Name of the option to save.
	 * @param mixed  $value       Option value
	 * @param int $post Post ID (optional).
	 */
	public function save_option( $option_name, $value, $post = null ) {
		if ( $post != null ) {
			update_post_meta( $post, '_livepress_' . $option_name, $value );
			return;
		}

		update_option( 'livepress_' . $option_name, $value );
	}

	/**
	 * Render the screen's Live Blogging Tools section.
	 *
	 * @users add_filter() Adds a filter to the get_sidebar class method to load the current post's live status.
	 */
	public function render_tabs() {
		$sidebar = $this->get_sidebar();

		$section_class = 'hidden';
		if ( ! $sidebar )
			$section_class .= ' no-sidebar';

		// Render the section
		?>
		<div id="blogging-tools-back"></div>
		<div id="blogging-tools-columns">
			<div class="blogging-tools-tabs">
				<ul>
				<?php
				$class = ' class=active';
				foreach ( $this->get_tabs() as $tab ) :
					$link_id  = "tab-link-{$tab['id']}";
					$panel_id = "tab-panel-{$tab['id']}";
					?>
					<li id="<?php echo esc_attr( $link_id ); ?>"<?php echo esc_attr( $class ); ?>>
						<a href="<?php echo esc_url( "#$panel_id" ); ?>" aria-controls="<?php echo esc_attr( $panel_id ); ?>">
							<?php echo esc_html( $tab['title'] ); ?>
						</a>
						<span class="count-update">0</span>
					</li>
					<?php
					$class = '';
				endforeach;
				?>
				</ul>
			</div>

			<?php if ( $sidebar ) : ?>
			<div class="blogging-tools-sidebar">
				<?php echo wp_kses_post( $sidebar ); ?>
			</div>
			<?php endif; ?>

			<div class="blogging-tools-tabs-wrap">
				<?php
				$classes = 'blogging-tools-content active';
				foreach ( $this->get_tabs() as $tab ):
					$panel_id = "tab-panel-{$tab['id']}";
					?>
					<div id="<?php echo esc_attr( $panel_id ); ?>" class="<?php echo esc_attr( $classes ); ?>">
						<?php
						echo wp_kses_post( $tab['content'] );

						if ( ! empty( $tab['callback'] ) )
							call_user_func_array( $tab['callback'], array( $this, $tab ) );
						?>
					</div>
					<?php
					$classes = 'blogging-tools-content';
				endforeach;
				?>
			</div>
		</div>
		<?php
	}

	/**
	 * AJAX short-circuit function to render tabs and immediately die().
	 */
	public function ajax_render_tabs() {
		global $current_post_id;

		check_ajax_referer( 'render_tabs_nonce' );

		if ( isset( $_POST['post_id'] ) ) {
			$current_post_id = (int) $_POST['post_id'];
		} else {
			$current_post_id = null;
		}

		if (! current_user_can( 'edit_post', $current_post_id ) ) {
			die();
		}

		$this->render_tabs();
		die();
	}

	/**
	 * Add the default tabs required by the UI.
	 *
	 * @uses apply_filters() Calls 'livepress_sidebar_top' to allow adding items to the "This post at a glance" section.
	 * @uses do_action() Calls 'livepress_setup_tabs' to allow adding new tabs to the tools palette.
	 */
	public function setup_tabs() {
		$this->add_tab( array(
			'id'       => 'live-comments',
			'title'    => esc_attr__( 'Comments', 'livepress' ),
			'callback' => array( $this, 'live_comments' )
		) );

		$this->add_tab( array(
			'id'    => 'live-twitter-search',
			'title' => esc_attr__( 'Twitter Search', 'livepress' ),
			'callback' => array( $this, 'live_twitter_search' )
		) );

		$this->add_tab( array(
			'id'       => 'live-remote-authors',
			'title'    => esc_attr__( 'Manage Remote Authors', 'livepress' ),
			'callback' => array( $this, 'remote_authors' )
		) );

		$this->add_tab( array(
			'id'       => 'live-notes',
			'title'    => esc_attr__( 'Author Notes', 'livepress' ),
			'callback' => array( $this, 'author_notes' )
		) );

		$sidebar  = '<p><strong>' . esc_html__( 'This post at a glance:', 'livepress' ) . '</strong></p>';
		$sidebar .= '<p><span class="dashicons dashicons-admin-comments"></span> <span id="livepress-comments_num">0</span> <span class="label">'. esc_html__( 'Comments', 'livepress' ) . '</span></p>';
		$sidebar .= '<p><span class="icon-remote-authors"></span> <span id="livepress-authors_num">0</span> <span class="label">' . esc_html__( 'Remote Authors', 'livepress' ) . '</span></p>';
		$sidebar .= '<p><span class="icon-people-online"></span> <span id="livepress-online_num">0</span> <span class="label">' . esc_html__( 'People Online', 'livepress' ) . '</span></p>';

		apply_filters( 'livepress_sidebar_top', $sidebar );

		$this->set_sidebar( $sidebar );

		do_action( 'livepress_setup_tabs', $this );
	}

	/**
	 * Render the markup of the per-post author notes section.
	 *
	 * @param LivePress_Blogging_Tools $blogging_tools Class instance.
	 * @param array                    $tab            Arguments with which the tab was registered.
	 */
	private function author_notes( $blogging_tools, $tab ) {
		global $current_post_id;
		?>
		<p>
			<?php esc_html_e( 'These notes are for reference and will not be published. They will be saved with the post for future reference for sharing with co-authors.', 'livepress' ); ?>
		</p>
		<textarea rows="4" cols="10" id="live-notes-text" name="live-notes-text"><?php echo esc_textarea( $this->get_option( 'live-note', $current_post_id ) ); ?></textarea>
		<input type="submit" id="live-notes-submit" name="live-notes-submit" class="button-secondary" value="<?php esc_html_e( 'Save', 'livepress' ); ?>" />
		<div class="live-notes-status"><?php esc_html_e( 'Notes Saved', 'livepress' ); ?></div>
		<?php
	}

	/**
	 * Update a post's author notes via AJAX.
	 */
	public function update_author_notes() {
		$post_id = (int) $_POST['post_id'];
		$content = wp_kses_post( $_POST['content'] );
		$nonce   = $_POST['ajax_nonce'];

		if ( ! wp_verify_nonce( $nonce, 'livepress-update_live-notes-' . $post_id ) )
			die();

		if ( ! current_user_can( 'edit_post', $post_id ) ){
			die();
		}

		$this->save_option( 'live-note', $content, $post_id );

		die();
	}

	/**
	 * Render the markup of the live comment feed section.
	 *
	 * @param LivePress_Blogging_Tools $blogging_tools Class instance.
	 * @param array                    $tab            Arguments with which the tab was registered.
	 */
	private function live_comments( $blogging_tools, $tab ) {
		global $current_post_id;
		?>
		<div id="live-comments-pane">
            <div id="lp-comments-results">
				<div id="lp-new-comments-notice">
					<p><?php esc_html_e( 'New comments will be shown here.', 'livepress' ); ?></p>
				</div>
			</div>
		</div>
		<?php
	}

	/**
	 * Update the live comment feed section.
	 */
	public function update_live_comments() {
		check_ajax_referer( 'update_live_comments_nonce' );

		$post_id = (int) $_POST['post_id'];

		if ( ! current_user_can( 'edit_post', $post_id ) ){
			die();
		}

		Collaboration::get_live_edition_data();
		die();
	}

	/**
	 * Render the markup for the live Twitter search section.
	 *
	 * @todo Remove it truly not in use.
	 *
	 * @param LivePress_Blogging_Tools $blogging_tools Class instance.
	 * @param array                    $tab            Arguments with which the tab was registered.
	 */
	private function live_twitter_search( $blogging_tools, $tab ) {
		?>
		<div id="live-search-column">
			<p><?php esc_html_e( 'Updates in real-time using your search terms.', 'livepress' ); ?></p>
			<p>
				<input type="text" id="live-search-query" name="live-search-query" />
				<input type="submit" class="button-secondary" value="<?php esc_html_e( 'Add Search Term', 'livepress' ); ?>" />
				<a id="lp-tweet-player" class="streamcontrol button-secondary icon-pause" href="#" title="<?php esc_attr_e( 'Click to pause the tweets so you can decide when to display them', 'livepress' ); ?>">
					<span class="screen-reader-text"><?php esc_html_e( 'play/pause', 'livepress' ); ?><span>
				</a>
			</p>
            <div id="lp-twitter-search-terms">
            </div>
		</div>
		<div id="lp-hidden-tweets"></div>
		<div id="lp-twitter-results">

		</div>
		<?php
	}

	/**
	 * Render the markup for the remote authors section.
	 *
	 * @param LivePress_Blogging_Tools $blogging_tools Class instance.
	 * @param array                    $tab            Arguments with which the tab was registered.
	 */
	private function remote_authors( $blogging_tools, $tab) {
		?>
		<div id="remote-authors">
            <p><?php echo sprintf( '<strong>%s</strong> %s', esc_html__( 'All', 'livepress' ), esc_html__( 'tweets from these remote authors will automatically be published as updates to this blog post until removed..', 'livepress' ) ); ?></p>
			<div class="configure">
				<span class="add-on">@</span>
				<input type="text" name="new_term" id="new-twitter-account" class="new-term lp-input form-input-tip" size="16" autocomplete="off" placeholder="<?php esc_html_e( 'Account Name', 'livepress' ); ?>" />
				<input class="button-secondary termadd" value="<?php esc_html_e( 'Add Remote Author', 'livepress' ); ?>" type="submit" />
				<div id="termadderror" class="lp-message lp-error"><?php esc_html_e( 'Author error: ', 'livepress' ); ?><span id="errmsg"></span></div>
				<div class="clean lp-tweet-cleaner">
					<p><?php esc_html_e( 'Done live blogging on this post?', 'livepress' ); ?></p>
					<input class="button-secondary cleaner" value="<?php esc_html_e( 'Remove All', 'livepress'); ?>" type="submit" />
				</div>
			</div>
            <ul id="lp-account-list"></ul>
		</div>
		<?php
	}

	/**
	 * Toggle the live status of the current post via AJAX.
	 */
	public function toggle_live_status() {
		$post_id = (int) $_POST['post_id'];
		$nonce   = $_POST['ajax_nonce'];

		if ( ! wp_verify_nonce( $nonce, 'livepress-update_live-status-' . $post_id ) )
			die();

		if ( ! current_user_can( 'edit_post', $post_id ) ){
			die();
		}

		$is_live = $this->get_post_live_status( $post_id );

		$this->set_post_live_status( $post_id, ! $is_live );

		die();
	}

	/**
	 * Make a feature pointer available so that users can find
	 * the Blogging Tools Palette.
	 */
	public function feature_pointer() {
		$dismissed = explode( ',', (string) get_user_meta( get_current_user_id(), 'dismissed_wp_pointers', true ) );

		if ( ! in_array( 'livepress_pointer', $dismissed ) ) {
			$enqueue = true;
			// Enqueue pointers
			wp_enqueue_script( 'wp-pointer' );
			wp_enqueue_style( 'wp-pointer' );

			if ( LivePress_Config::get_instance()->debug() ) {
				wp_enqueue_script( 'livepress-pointer', LP_PLUGIN_URL . 'js/admin/livepress-pointer.full.js', array( 'wp-pointer' ), LP_PLUGIN_VERSION, true );
			} else {
				wp_enqueue_script( 'livepress-pointer', LP_PLUGIN_URL . 'js/admin/livepress-pointer.min.js', array( 'wp-pointer' ), LP_PLUGIN_VERSION, true );
			}

			// Initialize JS Options
			$pointer = array();
			$pointer['ajaxurl'] = admin_url( 'admin-ajax.php' );

			$html = array();
			$html[] = '<h3>' . esc_html__( 'New Real-Time Writing Tools!', 'livepress' ) . '</h3>';
			$html[] = '<p>' . esc_html__( 'Click the above link to expand a set of tools for managing comments, searching Twitter, adding remote authors, and saving notes. &mdash; All in real-time!', 'livepress' ) . '</p>';
			$pointer['content'] = implode( '', $html );

			wp_localize_script( 'livepress-pointer', 'livepress_pointer', $pointer );
		}
	}

	/**
	 * Display custom column on the Post list page.
	 */
	function display_posts_livestatus( $column, $post_id ) {

		if ( 'livepress_status' !== $column ) {
			return;
		}
		$is_live = $this->get_post_live_status( $post_id );
		$status = $this->get_option( 'live_status', $post_id );

		if ( $is_live ) {
			$toggle = 'enabled';
			$title  = esc_html__( 'This Post is LIVE', 'livepress' );
		} else {
			$toggle = 'disabled';
			$title  = esc_html__( 'This Post is NOT LIVE', 'livepress' );
		}

		echo sprintf( '<div title="%s" class="live-status-circle live-status-%s"></div>', esc_attr( $title ), esc_attr( $toggle ) ) ;
	}

}

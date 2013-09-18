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
		add_action( 'add_meta_boxes', array( $this, 'livepress_status' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'feature_pointer' ) );
		add_filter( 'postbox_classes_post_livepress_status_meta_box', array( $this, 'add_livepress_status_metabox_classes' ) );
	}
	
	/**
	 * Add appropriate classes to the meta box for proper diaplay of LivePress status
	 * Adds one of 'live','not-live' or 'globally_disabled'
	 * 
	 * @param array $classes existing classes for the meta box
	 * @return array ammended classes for the meta box 
	 */
	public function add_livepress_status_metabox_classes( $classes ) {
		global $post;

		$globally_enabled = get_option( 'livepress_globally_enabled', "enabled" );
		$globally_enabled = 'enabled' === $globally_enabled;

		$status = $this->get_option( 'live_status', $post->ID );
		if ( ! isset( $status['live'] ) ) {
			$status['live'] = 0;
		}

		if ( $globally_enabled ) {
			if ( 1 === (int) $status['live'] ) {
				$toggle = 'live';
			} else {
				$toggle = 'not-live';
			}
		} else {
			$toggle = 'globally_disabled';
		}
		array_push( $classes, $toggle );
	    return $classes;
	}
	
	/**
	 * Display the LivePress meta box above the Post Publish meta box
	 */
	public function livepress_status_meta_box() {
		echo '<div id="lp-pub-status-bar" class="major-publishing-actions">';
		echo '<div class="info">';
		echo '<span class="first-line">';
		echo "<span class=\"lp-on\">" . wp_kses_post( 'This Post is <strong>LIVE</strong>', 'livepress' ) . '</span>';
		echo "<span class=\"lp-off\">" . wp_kses_post( 'This Post is <strong>NOT LIVE</strong>', 'livepress' ) . '</span>';
		echo "<span class=\"disabled\">" . wp_kses_post( 'LivePress is Disabled', 'livepress' ) . '</span>';
		echo sprintf( ' <a class="toggle-live button turnoff">%s</a>', esc_html__( 'Turn off live', 'livepress' ) );
		echo sprintf( ' <a class="toggle-live button turnon">%s</a>', esc_html__( 'Turn on live', 'livepress' ) );
		echo '</span>';
		echo '</div>';
		echo '</div>';
		}
	
	/**
	 * Add the LivePress meta box above the Post Publish meta box
	 */
	public function livepress_status() {
		
		$screens = array( 'post' );
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
	 *  @param array $args
	 *  - string   - title   - Title for the tab.
	 *  - string   - id      - Tab ID. Must be HTML-safe.
	 *  - string   - content  - HTML content for the tab.
	 *  - callback - callback - Callback function to generate tab content. Optional.
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
	 * Removes the identified tab from the Live Blogging Tools section.
	 *
	 * @param string $id The tab id.
	 */
	public function remove_tab( $id ) {
		unset( $this->_tabs[ $id ] );
	}

	/**
	 * Removes all tabs from the Live Blogging Tools section.
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
	 * @param string $option_name Name of the option to retrieve.
	 * @param int $post Post ID (optional).
	 * @return mixed|null Stored option.
	 */
	public function get_option( $option_name, $post = null ) {
		if ( $post != null ) {
			return get_post_meta( $post, '_livepress_' . $option_name, true );
		}

		return get_option( 'livepress_' . $option_name );
	}

	/**
	 * Save an option, either as a global or for a specific post.
	 *
	 * @param string $option_name Name of the option to save.
	 * @param mixed $value Option value
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
				$class = ' class="active"';
				foreach ( $this->get_tabs() as $tab ) :
					$link_id = "tab-link-{$tab['id']}";
					$panel_id = "tab-panel-{$tab['id']}";
					?>
					<li id="<?php echo esc_attr( $link_id ); ?>"<?php echo $class; ?>>
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
				<?php echo $sidebar; ?>
			</div>
			<?php endif; ?>

			<div class="blogging-tools-tabs-wrap">
				<?php
				$classes = 'blogging-tools-content active';
				foreach ( $this->get_tabs() as $tab ):
					$panel_id = "tab-panel-{$tab['id']}";
					?>
					<div id="<?php echo esc_attr( $panel_id ); ?>" class="<?php echo $classes; ?>">
						<?php
						echo $tab['content'];

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

		if ( isset( $_POST['post_id'] ) ) {
			$current_post_id = (int) $_POST['post_id'];
		} else {
			$current_post_id = null;
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

		$sidebar = '<p><strong>' . esc_html__( 'This post at a glance:', 'livepress' ) . '</strong></p>';
		$sidebar .= '<p class="live-highlight"><span id="livepress-comments_num">0</span> <span class="label">'. esc_html__( 'Comments', 'livepress' ) . '</span></p>';
		$sidebar .= '<p class="live-highlight"><span id="livepress-authors_num">0</span> <span class="label">' . esc_html__( 'Remote Authors', 'livepress' ) . '</span></p>';
		$sidebar .= '<p class="live-highlight"><span id="livepress-online_num">0</span> <span class="label">' . esc_html__( 'People Online', 'livepress' ) . '</span></p>';

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
			<?php _e( 'These notes are for reference and will not be published. They will be saved with the post for future reference for sharing with co-authors.', 'livepress' ); ?>
		</p>
		<textarea rows="4" cols="10" id="live-notes-text" name="live-notes-text"><?php echo $this->get_option( 'live-note', $current_post_id ); ?></textarea>
		<input type="submit" id="live-notes-submit" name="live-notes-submit" class="button-secondary" value="<?php _e( 'Save', 'livepress' ); ?>" />
		<div class="live-notes-status"><?php _e( 'Notes Saved', 'livepress' ); ?></div>
		<?php
	}

	/**
	 * Update a post's author notes via AJAX.
	 */
	public function update_author_notes() {
		$post_id = (int) $_POST['post_id'];
		$content = esc_html( $_POST['content'] );
		$nonce = $_POST['ajax_nonce'];

		if ( ! wp_verify_nonce( $nonce, 'livepress-update_live-notes-' . $post_id ) )
			die();

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
					<p><?php _e( 'New comments will be shown here.', 'livepress' ); ?></p>
				</div>
			</div>
		</div>
		<?php
	}

	/**
	 * Update the live comment feed section.
	 */
	public function update_live_comments() {
		$post_id = (int) $_POST['post_id'];

		Collaboration::get_live_edition_data();
		die();
	}

	/**
	 * Render the markup for the live Twitter search section.
	 *
	 * @param LivePress_Blogging_Tools $blogging_tools Class instance.
	 * @param array                    $tab            Arguments with which the tab was registered.
	 */
	private function live_twitter_search( $blogging_tools, $tab ) {
		?>
		<div id="live-search-column">
			<p><?php _e( 'Updates in real-time using your search terms.', 'livepress' ); ?></p>
			<p>
				<input type="text" id="live-search-query" name="live-search-query" />
				<input type="submit" class="button-secondary" value="<?php _e( 'Add Search Term', 'livepress' ); ?>" />
				<a id="lp-tweet-player" class="streamcontrol" href="#" title="<?php _e( 'Click to pause the tweets so you can decide when to display them', 'livepress' ); ?>">play/pause</a>
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
            <p><?php _e( '<strong>All</strong> tweets from these remote authors will automatically be published as updates to this blog post until removed..', 'livepress' ); ?></p>
			<div class="configure">
				<span class="add-on">@</span>
				<input type="text" name="new_term" id="new-twitter-account" class="new-term lp-input form-input-tip" size="16" autocomplete="off" placeholder="<?php _e( 'Account Name', 'livepress' ); ?>" />
				<input class="button-secondary termadd" value="<?php _e( 'Add Remote Author', 'livepress' ); ?>" type="submit" />

				<div class="clean lp-tweet-cleaner">
					<p><?php _e( 'Done live blogging on this post?', 'livepress' ); ?></p>
					<input class="button-secondary cleaner" value="<?php _e( 'Remove All', 'livepress'); ?>" type="submit" />
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
		$nonce = $_POST['ajax_nonce'];

		if ( ! wp_verify_nonce( $nonce, 'livepress-update_live-status-' . $post_id ) )
			die();

		$status = $this->get_option( 'live_status', $post_id );

		$status['automatic'] = 0;

		if ( isset( $status['live'] ) ) {
			$status['live'] = (int) ( ! $status['live']);
		} else {
			$status['live'] = 0;
		}

		$this->save_option( 'live_status', $status, $post_id );

		die();
	}

	/**
	 * Make a feature pointer available so that users can find the Blogging Tools Palette.
	 */
	public function feature_pointer() {
		$dismissed = explode( ',', (string) get_user_meta( get_current_user_id(), 'dismissed_wp_pointers', true ) );

		if ( ! in_array( 'livepress_pointer', $dismissed ) ) {
			$enqueue = true;
			// Enqueue pointers
			wp_enqueue_script( 'wp-pointer' );
			wp_enqueue_style( 'wp-pointer' );

			if ( livepress_config::get_instance()->debug() ) {
				wp_enqueue_script( 'livepress-pointer', LP_PLUGIN_URL_BASE . 'js/admin/livepress-pointer.full.js', array( 'wp-pointer' ), LP_PLUGIN_VERSION, true );
			} else {
				wp_enqueue_script( 'livepress-pointer', LP_PLUGIN_URL_BASE . 'js/admin/livepress-pointer.min.js', array( 'wp-pointer' ), LP_PLUGIN_VERSION, true );
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
	 * Display custom column on the Post list page
	 */
	function display_posts_livestatus( $column, $post_id ) {
	    
	    $status = $this->get_option( 'live_status', $post_id );
		if ( ! isset( $status['live'] ) ) {
			$status['live'] = 1;
		}

		if ( 1 === (int) $status['live'] ) {
			$toggle = 'enabled';
			$title = esc_html__( 'This Post is LIVE', 'livepress' );
		} else {
			$toggle = 'disabled';
			$title = esc_html__( 'This Post is NOT LIVE', 'livepress' );
		}

	    echo sprintf( '<div title="%s" class="live-status-circle live-status-%s"></div>', $title, $toggle );
	}
	
}

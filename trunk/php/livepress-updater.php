<?php
/**
 * Core file of the livepress plugin.
 *
 * @package Livepress
 */

require_once 'livepress-config.php';
require_once 'livepress-communication.php';
require_once 'livepress-config_file.php';
require_once 'livepress-live-update.php';
require_once 'livepress-post.php';
require_once 'livepress-javascript-config.php';
require_once 'lp-wp-utils.php';
require_once 'lp-comment.php';

class livepress_updater {
	const LIVEPRESS_ONCE = 'admin-options';
	private $options = array();
	private $livepress_config;
	private $livepress_communication;
	private $lp_comment;

	private $old_post;

	private $title_css_selectors;
	private $background_colors;

	/**
	 * Contructor that assigns the wordpress hooks, initialize the
	 * configurable options and gets the wordpress options set.
	 */
	function __construct() {
		global $current_user;

		$this->options = get_option(livepress_administration::$options_name);
		$this->options['ajax_nonce'] = wp_create_nonce(self::LIVEPRESS_ONCE);
		$this->user_options = get_user_option(livepress_administration::$options_name, $current_user->ID, false);
		$this->lp_comment = new lp_comment($this->options);

		add_action( 'delete_post',            array( $this, 'remove_related_followers' ) );
		add_action( 'transition_post_status', array( $this, 'send_to_livepress_new_post' ), 10, 3 );
		add_action( 'private_to_publish',     array( $this, 'livepress_publish_post' ) );

		add_action( 'wp_ajax_twitter_search_term', array( $this, 'twitter_search_callback' ) );
		add_action( 'wp_ajax_twitter_follow',      array( $this, 'twitter_follow_callback' ) );
		add_action( 'wp_ajax_lp_status',           array( $this, 'status' ) );

		$this->lp_comment->do_wp_binds( isset($_POST["livepress_update"]) );
		if ( !isset($_POST["livepress_update"]) ) {
			$livepress_enabled = $this->has_livepress_enabled();
			if ($livepress_enabled) {
				add_action('admin_head', array(&$this, 'embed_constants'));
				//add_action('wp_print_scripts', array(&$this, 'add_js_config'));

				add_action( 'admin_enqueue_scripts', array( &$this, 'add_js_config' ) );
				add_action( 'wp_enqueue_scripts', array( &$this, 'add_js_config' ) );

				add_action( 'admin_enqueue_scripts', array( &$this, 'add_css_and_js_on_header' ) );
				add_action( 'wp_enqueue_scripts', array( &$this, 'add_css_and_js_on_header' ) );

				// Adds the modified tinyMCE
				if ( get_user_option('rich_editing') == 'true') {
					add_filter("mce_external_plugins", array(&$this, 'add_modified_tinymce'));
				}
			}

			add_action('pre_post_update', array(&$this, 'save_old_post'),  999);
			//add_action('save_post',       array(&$this, 'send_to_livepress_post_update'));
			// Ensuring that the post is divided into micro-post livepress chunks
			$live_update = $this->init_live_update();
			add_filter('content_save_pre', array($live_update, 'fill_livepress_shortcodes'), 5);
		}

		$this->livepress_config = livepress_config::get_instance();
		$this->livepress_communication = new livepress_communication($this->options['api_key']);

		// Get the CSS selectors for title updates (non default themes)
		$css_selectors_filepath = dirname(__FILE__) .'/../css_selectors_for_title_update.txt';
		$this->title_css_selectors = new livepress_config_file($css_selectors_filepath);

		$background_colors_filepath = dirname(__FILE__) .'/../background_colors.txt';
		$this->background_colors = new livepress_config_file($background_colors_filepath);
	}

	public function twitter_search_callback() {
	  global $current_user;
	  $action = $_POST["action_type"];
	  $term = $_POST["term"];
	  $postId = $_POST["post_id"];

	  check_ajax_referer('twitter_search_term');
	  if(Collaboration::twitter_search($action, $postId, $current_user->ID, $term)) {
		  echo "{\"success\":\"OK\"}";
	  } else {
		  echo "{\"errors\":\"FAIL\"}";
	  }
	  die;
	}

	public function twitter_follow_callback() {
	  global $current_user;
	  $login = $current_user->user_login;
	  $action = $_POST["action_type"];
	  $term = $_POST["username"];
	  $postId = $_POST["post_id"];

	  check_ajax_referer('twitter_follow');
	  $ret = $this->livepress_communication->send_to_livepress_handle_twitter_follow($action, $term, $postId, $login);

	  if ($ret == '{"errors":{"username":"[not_exists]"}}') {
		$la = new livepress_administration();
		if ($la->enable_remote_post($current_user->ID)) {
		  $ret = $this->livepress_communication->send_to_livepress_handle_twitter_follow($action, $term, $postId, $login);
		}
	  }
	  echo $ret;
	  die;
	}

	public function status() {
	  check_ajax_referer('lp_status');
	  $post_id = isset( $_GET['post_id'] ) ? $_GET['post_id'] : null;
	  $uuid = lp_wp_utils::get_from_post($post_id, 'status_uuid', true);
	  if ($uuid) {
		try {
		  $status = $this->livepress_communication->get_job_status($uuid);
		  if ($status == "completed" || $status == "failed") {
			$this->delete_from_post($post_id, 'status_uuid');
		  }
		  echo $status;
		} catch (livepress_communication_exception $e) {
		  $this->delete_from_post($post_id, 'status_uuid');
		  echo "lp_failed";
		}
	  } else {
		echo "empty";
	  }
	  die;
	}

	// called on delete_post
	public function remove_related_followers($postId) {
	  global $current_user;
	  $login = $current_user->user_login;
	  $this->livepress_communication->send_to_livepress_handle_twitter_follow("clear", "", $postId, $login); // TODO: Handle error
	}

	// Returns is comments enabled for blog
	public function is_comments_enabled() {
	  return !isset($this->options['disable_comments'])||!$this->options['disable_comments'];
	}

	/**
	 * Checks if the current user is allowed to use the livepress features
	 *
	 * @return  boolean
	 */
	public function has_livepress_enabled() {
		return  current_user_can('manage_options')      // the user is admin
				&&  $this->options['enabled_to'] != 'none'    // and not blocked for everyone
			||  $this->options['enabled_to'] == 'all'   // everybody is allowed
			||      $this->options['enabled_to'] == 'registered'
				&&  current_user_can('edit_posts') // the user is registered
		;
	}

	static private $updater = null;
	static function instance() {
		if (self::$updater == null) {
			self::$updater = new livepress_updater();
		}
		return self::$updater;
	}

	function embed_constants() {
		echo "<script>\n";
		echo "var LIVEPRESS_API_KEY = '" . $this->options["api_key"] . "';\n";
		echo "var WP_PLUGIN_URL = '" . WP_PLUGIN_URL . "';\n";
		echo "var OORTLE_STATIC_SERVER = '" . $this->livepress_config->static_host() . "';\n";
		echo "</script>\n";
	}

	function is_livepress_page() {
	  if (isset($_GET) && isset($_GET['page']) && ($_GET['page'] == 'livepress' || $_GET['page'] == 'livepress_author')) {
		return true;
	  } else {
		return false;
	  }
	}

	function add_css_and_js_on_header( $hook = null ) {
		if ( $hook != null && $hook != 'post-new.php' && $hook != 'post.php' && $hook != 'settings_page_livepress-settings' )
			return;

		wp_register_style( 'livepress_main_sheets', LP_PLUGIN_URL_BASE . 'css/livepress.css' );
		wp_enqueue_style( 'livepress_main_sheets' );

		wp_register_style( 'wordpress_override', LP_PLUGIN_URL_BASE . 'css/wordpress_override.css' );
		wp_enqueue_style( 'wordpress_override' );

		wp_register_style( 'livepress_ui', LP_PLUGIN_URL_BASE . 'css/ui.css', array(), false, 'screen' );

		wp_register_style( 'soundmanager_flashblock', LP_PLUGIN_URL_BASE . 'css/flashblock.css', array(), false, 'screen' );
		wp_enqueue_style( 'soundmanager_flashblock' );

		// FIXME: temporary import of this script. It must be sent by Oortle
		// on the next versions
		$static_host = $this->livepress_config->static_host();

		if ($this->livepress_config->script_debug()) {
			$mode = "full";
		} else {
			$mode = "min";
		}

		if ( is_page() || is_single() || is_home() ) {
			wp_enqueue_script( 'livepress-plugin-loader', LP_PLUGIN_URL_BASE . 'js/plugin_loader_release.' . $mode . '.js', array(), LP_PLUGIN_VERSION );
			wp_enqueue_style( 'livepress_ui' );
		} elseif (is_admin()) {
			wp_register_style( 'lp_admin', LP_PLUGIN_URL_BASE . 'css/post_edit.css' );
			wp_enqueue_style( 'lp_admin' );

			wp_enqueue_script( 'lp-admin', LP_PLUGIN_URL_BASE . 'js/admin/livepress-admin.' . $mode . '.js', array('jquery'), LP_PLUGIN_VERSION );
			wp_enqueue_script( 'dashboard-dyn', LP_PLUGIN_URL_BASE . '/js/dashboard-dyn.' . $mode . '.js', array( 'jquery', 'lp-admin' ), LP_PLUGIN_VERSION );
		}

		$current_theme = str_replace(' ', '-', strtolower( wp_get_theme()->Name ));
		if ( file_exists( dirname( __FILE__ ) . "/../css/themes/" . $current_theme . ".css" ) ) {
			wp_register_style( 'livepress_theme_hacks', LP_PLUGIN_URL_BASE . 'css/themes/' . $current_theme . '.css' );
			wp_enqueue_style( 'livepress_theme_hacks' );
		}
	}

	function add_js_config( $hook = null ) {
		if ( $hook != null && $hook != 'post-new.php' && $hook != 'post.php' && $hook != 'settings_page_livepress-settings' )
			return;

		global $post;

		$ljsc = new LivepressJavascriptConfig();

		if ($this->livepress_config->debug()) {
			$ljsc->new_value('debug', true, ConfigurationItem::$BOOLEAN);
		}
		$ljsc->new_value('ajax_nonce', $this->options['ajax_nonce']);
		$ljsc->new_value('ver', LP_PLUGIN_VERSION);
		$ljsc->new_value('oover', $this->livepress_config->lp_ver(), ConfigurationItem::$ARRAY);
		{
			global $wp_scripts;
			if ($wp_scripts === null) {
				$wp_scripts = new WP_Scripts();
				wp_default_scripts($wp_scripts);
			}
			if ( is_a($wp_scripts, 'WP_Scripts') ) {
				$src = $wp_scripts->query('jquery');
				$src = $src->src;
				if ( !preg_match('|^https?://|', $src) && ! ( $wp_scripts->content_url && 0 === strpos($src, $wp_scripts->content_url) ) ) {
					$src = $wp_scripts->base_url . $src;
				}
				$ljsc->new_value('jquery_url', $src."?");
			}
		}

		if ( function_exists( 'get_current_screen' ) ) {
			$ljsc->new_value( 'current_screen', array(
				"base" => get_current_screen()->base,
				"id"   => get_current_screen()->id
			), ConfigurationItem::$ARRAY );
		}

		$ljsc->new_value('wpstatic_url', LP_PLUGIN_URL_BASE);
		$ljsc->new_value('static_url', $this->livepress_config->static_host());
		$ljsc->new_value('lp_plugin_url', LP_PLUGIN_URL_BASE);

		$ljsc->new_value('blog_gmt_offset', get_option('gmt_offset'),
				ConfigurationItem::$LITERAL);

		$theme_name = strtolower( wp_get_theme()->Name);
		$ljsc->new_value('theme_name', $theme_name);
		try {
			$title_css_selector = $this->title_css_selectors->get_option($theme_name);
			$title_css_selector = apply_filters('livepress_title_css_selector', $title_css_selector, $theme_name);
			$ljsc->new_value('custom_title_css_selector', $title_css_selector);
		} catch (livepress_invalid_option_exception $e) {}
		try {
			$background_color = $this->background_colors->get_option($theme_name);
			$background_color = apply_filters('livepress_background_color', $background_color, $theme_name);
			$ljsc->new_value('custom_background_color', $background_color);
		} catch (livepress_invalid_option_exception $e) {}

		if (is_home()) {
			$page_type = 'home';
		} elseif (is_page()) {
			$page_type = 'page';
		} elseif (is_single()) {
			$page_type = 'single';
		} elseif (is_admin()) {
			$page_type = 'admin';
		} else {
			$page_type = 'undefined';
		}
		$ljsc->new_value('page_type', $page_type);

		// Comments
		$args = array('post_id' => ( isset( $post->ID ) ? $post->ID : null ) );
		$post_comments = get_comments($args);
		$old_comments = isset( $GLOBALS['wp_query']->comments ) ? $GLOBALS['wp_query']->comments : null;
		$GLOBALS['wp_query']->comments = $post_comments;
		$comments_per_page = get_comment_pages_count($post_comments, get_option("comments_per_page"));
		$GLOBALS['wp_query']->comments = $old_comments;
		$this->lp_comment->js_config($ljsc, $post, intval(get_query_var('cpage')), $comments_per_page);

		$ljsc->new_value('new_post_msg_id', get_option(PLUGIN_NAME."_new_post"));

		$ljsc->new_value('sounds_default', in_array("audio", $this->options['notifications']), ConfigurationItem::$BOOLEAN);
		$ljsc->new_value('autoscroll', in_array("scroll", $this->options['notifications']), ConfigurationItem::$BOOLEAN);

		if (is_page() || is_single() || is_admin()) {
			if (isset($post->ID)&&$post->ID) {
				$args = array('post_id' => $post->ID);
				$post_comments = get_comments($args);
				if(!empty($post_comments)) {
					$ljsc->new_value('comment_pages_count',
							get_comment_pages_count($post_comments, get_option("comments_per_page")),
							ConfigurationItem::$LITERAL);
				}

				$feed_link = $this->get_current_post_feed_link();
				if(sizeof($feed_link)) {
					$ljsc->new_value('feed_sub_link', $feed_link[0]);
					$ljsc->new_value('feed_title', livepress_feed::feed_title());
				}

				$ljsc->new_value('post_id', $post->ID);

				$post_update_msg_id = lp_wp_utils::get_from_post($post->ID, "post_update", true);
				$ljsc->new_value('post_update_msg_id', $post_update_msg_id);
				/* post_edit_msg_id not sent there, since post_edit_msg_id are returned from start_ee AJAX call */
			}

			$author = "";
			$user = wp_get_current_user();
			if ( $user->ID ) {
				if ( empty( $user->display_name ) ) {
					$author = $user->user_login;
				} else {
					$author = $user->display_name;
				}
			}

			$ljsc->new_value('current_user', $author);

			if (is_admin()) {
				// Is post_from turned on
				if($this->user_options['remote_post']) {
				  $ljsc->new_value('remote_post', true, ConfigurationItem::$BOOLEAN);
				} else {
				  $ljsc->new_value('remote_post', false, ConfigurationItem::$BOOLEAN);
				}

				$ljsc->new_value("PostMetainfo", "", ConfigurationItem::$BLOCK);
				// Set if the live updates should display the timestamp
				if ($this->options['timestamp']) {
					$template = livepress_live_update::timestamp_template();
					$ljsc->new_value('timestamp_template', $template);
				}

				// Set url for the avatar
				$ljsc->new_value('has_avatar', $this->options['include_avatar'],
						ConfigurationItem::$BOOLEAN);

				// Set the author name
				if ($this->options['update_author']) {
					$author_display_name = livepress_live_update::get_author_display_name($this->options);
					$ljsc->new_value('author_display_name', $author_display_name);
				}
				// The last attribute shouldn't have a comma
				// Set where the live updates should be inserted (top|bottom)
				$ljsc->new_value('placement_of_updates', $this->options['feed_order']);
				$ljsc->new_value("PostMetainfo", "", ConfigurationItem::$ENDBLOCK);

				$ljsc->new_value("allowed_chars_on_post_update_id",
						implode(livepress_post::$ALLOWED_CHARS_ON_ID));
				$ljsc->new_value("num_chars_on_post_update_id",
						livepress_post::$NUM_CHARS_ID,
						ConfigurationItem::$LITERAL);
			}
		}

		$ljsc->new_value("site_url", site_url());
		$ljsc->new_value("ajax_url", site_url()."/wp-admin/admin-ajax.php");

		$ljsc->flush();
	}

	/**
	 * Adds the modified tinyMCE for collaborative editing and livepress
	 *
	 * @param   array   $plugin_array   Contains the enabled plugins
	 * @return  array   The plugin_array with the modified tinyMCE added
	 */
	public function add_modified_tinymce($plugin_array) {
		if ($this->livepress_config->debug()) {
			$plugin_array['livepress'] = LP_PLUGIN_URL_BASE . 'js/src/editor_plugin.js?rnd='.rand();
		} else {
			if ($this->livepress_config->script_debug()) {
				$plugin_array['livepress'] = LP_PLUGIN_URL_BASE . 'js/editor_plugin_release.full.js?v='.LP_PLUGIN_VERSION;
			} else {
				$plugin_array['livepress'] = LP_PLUGIN_URL_BASE . 'js/editor_plugin_release.min.js?v='.LP_PLUGIN_VERSION;
			}
		}
		return $plugin_array;
	}

	function init_live_update() {
		$live_update = livepress_live_update::instance();
		if (isset($this->custom_author_name)) {
			$live_update->use_custom_author_name($this->custom_author_name);
		}
		if (isset($this->custom_timestamp)) {
			$live_update->use_custom_timestamp($this->custom_timestamp);
		}
		if (isset($this->custom_avatar_url)) {
			$live_update->use_custom_avatar_url($this->custom_avatar_url);
		}
		return $live_update;
	}

	var $inject = false;
	function inject_widget( $do_inject ) {
		$this->inject = $do_inject;
	}

	/* Adds a div tag surrounding the post text so oortle dom manipulator
	 * can find where it should do the changes */
	function add_global_post_content_tag($content){
		global $post;
		$div_id = null;
		if ( is_page() || is_single() ) {
		  $div_id = "post_content_livepress";
		}

		if ( is_home() ) {
		  $div_id = 'post_content_livepress_' . $post->ID;
		}

		if ( $div_id ) {
		  $content = '<div id="' . esc_attr( $div_id  ) . '" class="livepress_content">'.$content.'</div>';
		}

		if ( $this->inject ) {
			$modified = new DateTime( $post->post_modified_gmt );
			$since = $modified->diff( new DateTime() );

			// If an update is more than an hour old, we don't care how old it is ... it's out-of-date.
			$last_update = $since->h * 60;
			$last_update += $since->i;

			$content = livepress_themes_helper::instance()->inject_widget( $content, $last_update );
		}

		return $content;
	}

	/**
	 * Set a custom author name to be used instead of the current author name
	 * @param <string> $name The custom author name
	 */
	public function set_custom_author_name($name) {
		$this->custom_author_name = $name;
		$this->init_live_update();
	}

	/**
	 * Set a custom timestamp to be used instead of the current time
	 * @param <string> $time The custom time
	 */
	public function set_custom_timestamp($time) {
		$this->custom_timestamp = $time;
		$this->init_live_update();
	}

	/**
	 * Set a custom avatar url to be used instead of saved avatar image
	 * that's currently used in the autotweet feature
	 * @param <string> $avatar_url The avatar url
	 */
	public function set_custom_avatar_url($avatar_url) {
		$this->custom_avatar_url = $avatar_url;
		$this->init_live_update();
	}

	public function save_old_post($post_id) {
		$this->old_post = get_post($post_id);
	}

	/**
	 * @param int $post_id
	 * @return boolean true if post has just been created.
		 *
		 * Todo: applied fix so that errors aren't thrown when count($updates) == 1, but not sure in what context this plugin is working. TDD
	 */
	private function post_is_new($post_id) {
		$options = array(
			'post_parent' => $post_id,
			'post_type'   => 'revision',
			'numberposts' => -1,
			'post_status' => 'any',
		);

		$updates = get_children($options);
		if (count($updates) == 0) {
			 return true;
		} elseif ( count( $updates ) >= 2 ) {
			$first = array_shift($updates);
			$last = array_pop($updates);
			return ($last->post_modified_gmt == $first->post_modified_gmt);
		} else {
			return true;
		}
	}

	/**
	 * Push out updates to all subscribers.
	 *
	 * @param string  $new_status
	 * @param string  $old_status
	 * @param WP_Post $post
	 */
	public function send_to_livepress_new_post( $new_status, $old_status, $post ) {
		if ( 'publish' !== $new_status || 'post' !== $post->post_type || 0 !== $post->post_parent ) {
			return;
		}

		$alert_sent = get_post_meta( $post->ID, 'livepress_alert_sent', true );
		if ( 'yes' === $alert_sent ) {
			return;
		}

		$then = strtotime($post->post_date_gmt . ' +0000');

		// check if post has been posted less than 10 seconds ago. If so, let's send the warn
		if (time() - $then < 10) {
			$this->livepress_publish_post( $post );

			update_post_meta( $post->ID, 'livepress_alert_sent', 'yes' );
		}
	}

	public function get_current_post_feed_link() {
		global $post;
		return lp_wp_utils::get_from_post($post->ID, "feed_link");
	}

	public function current_post_updates_count() {
		global $post;
		$lp_post = new livepress_post($post->post_content, $post->ID);
		return $lp_post->get_updates_count();
	}

	/**
	 * Gets the comments count of the current post
	 * @return integer
	 */
	public function current_post_comments_count() {
		global $post;
		return $post->comment_count;
	}

	public function livepress_publish_post($post) {
		$permalink = get_permalink($post->ID);
		$data_to_js = array(
			'title'       => $post->post_title,
			'author'      => get_the_author_meta("login", $post->post_author),
			'updated_at_gmt' => $post->post_modified_gmt . "Z", //Z stands for utc/gmt
			'link'        => $permalink,
		);
		$params = array(
			'post_id'     => $post->ID,
			'post_title'  => $post->post_title,
			'post_link'   => $permalink,
			'data'        => JSON_encode($data_to_js),
			'blog_public' => get_option('blog_public'),
		);

		try {
			$return = $this->livepress_communication->send_to_livepress_new_post($params);
			update_option(PLUGIN_NAME."_new_post", $return['oortle_msg']);
			lp_wp_utils::save_on_post($post->ID, "feed_link", $return['feed_link']);
		} catch (livepress_communication_exception $e) {
			$e->log("new post");
		}
	}

	/**
	 * Deletes from the WP DB the matching value
	 *
	 * @param   int     $post_id        The ID of the post from which you will delete a field.
	 * @param   string  $key            The key of the field you will delete.
	 * @param   string (optional)       The value of the field you will delete.
	 *                                  This is used to differentiate between several fields
	 *                                  with the same key. If left blank, all fields with
	 *                                  the given key will be deleted.
	 * @return  string  The value
	 */
	private function delete_from_post($post_id, $key, $value = null) {
		return delete_post_meta($post_id, "_".PLUGIN_NAME."_". $key, $value);
	}
}
?>

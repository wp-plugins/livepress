<?php
/**
 * Handles the wordpress options of the plugin
 * and creates the menus.
 *
 * @package Livepress
 */

/**
 * This file has all the code that does the
 * communication with the livepress service.
 */
require_once 'livepress-communication.php';

class livepress_administration {
	public static $options_name = 'livepress';

	var $bool_options = array(
		'timestamp' => TRUE,
		'timestamp_24' => TRUE,
		'update_author' => TRUE,
		'include_avatar' => FALSE,
		'post_to_twitter' => FALSE,
		'error_api_key' => TRUE,
		'comment_live_updates_default' => TRUE,
		'sounds_default' => TRUE,
		'disable_comments' => FALSE,
	);
	var $string_options = array(
		'feed_order' => 'top', // bottom - top
		'author_display' => 'default', // default - custom
		'author_display_custom_name' => '',
		'api_key' => '',
		'oauth_authorized_user' => '',
		'blog_shortname' => '',
		'enabled_to' => 'all', // all - registered - administrators - none,
	);

	// Add default empty array value for notification options, otherwise initial checks throws PHP errors
	var $array_options = array(
		'notifications' => array(),
	);


	var $user_bool_options = array(
	);
	var $user_string_options = array(
		'post_from_twitter_username' => '',
		'twitter_avatar_username' => '',
		'twitter_avatar_url' => '',
		'avatar_display' => 'wp', // wp - twitter
	);

	var $IM_services = array('gtalk', 'aim', 'yahoo', 'msn');
	var $IM_services_label = array(
		'aim' => 'AIM',
		'yahoo' => 'Yahoo',
		'msn' => 'Windows Live Messenger',
		'gtalk' => 'Gtalk'
	);

	var $IM_services_url = array(
		'aim' => 'http://www.aim.com/',
		'yahoo' => 'http://messenger.yahoo.com/',
		'msn' => 'http://messenger.live.com/',
		'gtalk' => 'http://www.google.com/talk/'
	);

	/** Used in the view */
	var $im_changed = array();

	// All variables that don't go to the form needs to be here to hold their
	// value between saves.
	var $internal_options = array('error_api_key', 'oauth_authorized_user');

	public $messages = array(
		'updated' => array(),
		'error' => array(),
	);

	var $options;
	var $user_options;
	var $old_options;
	var $old_user_options;
	private static $admin_link_name = "livepress";

	/* Call the wordpress hooks */
	function __construct() {
		$title = 'LivePress';
		$admin_settings_title = 'Administrator Settings';
		$author_settings_title = 'Author Settings';

		$current_user = wp_get_current_user();

		if ( current_user_can( 'edit_plugins' ) ) {
			$link = self::$admin_link_name;
			$action = 'render_livepress_administration';
		} else {
			$link = self::$admin_link_name . "_author";
			$action = 'render_livepress_administration_author';
		}

		/*add_menu_page( $title, $title, 'publish_posts', $link,
			array(&$this, $action), LP_PLUGIN_URL_BASE . 'img/icon.png' );
		$admin_page = add_submenu_page( $link, $admin_settings_title,
			$admin_settings_title, 'edit_plugins', self::$admin_link_name,
			array(&$this, 'render_livepress_administration') );
		$author_page = add_submenu_page( $link, $author_settings_title,
			$author_settings_title, 'publish_posts',
			self::$admin_link_name . "_author",
			array(&$this, 'render_livepress_administration_author') );
		add_action( 'admin_print_scripts-' . $admin_page, array(&$this, 'add_css_and_js') );
		add_action( 'admin_print_scripts-' . $author_page, array(&$this, 'add_css_and_js') );*/


		add_action( 'load-post-new.php', array($this, 'load_post') );
		add_action( 'load-post.php', array($this, 'load_post') );

		foreach ( $this->IM_services as $IM_service ) {
			$this->string_options['im_bot_username_' . $IM_service] = '';
			$this->string_options['im_bot_password_' . $IM_service] = '';
			$this->user_string_options['im_enabled_user_' . $IM_service] = false;
			$this->user_bool_options['im_send_comments_' . $IM_service] = false;
		}
	}

	function load_post() {
		add_action( 'admin_footer', array($this, 'admin_footer') );
	}

	function admin_footer() {
		global $post;
		$change = wp_create_nonce( 'livepress-change_post_update-' . $post->ID );
		$append = wp_create_nonce( 'livepress-append_post_update-' . $post->ID );
		$delete = wp_create_nonce( 'livepress-delete_post_update-' . $post->ID );
		$live_notes = wp_create_nonce( 'livepress-update_live-notes-' . $post->ID );
		$live_comments = wp_create_nonce( 'livepress-update_live-comments-' . $post->ID );
		$live_toggle = wp_create_nonce( 'livepress-update_live-status-' . $post->ID );
		printf( '<span id="livepress-nonces" style="display:none" data-change-nonce="%s" data-append-nonce="%s" data-delete-nonce="%s"></span>', $change, $append, $delete );
		printf( '<span id="blogging-tool-nonces" style="display:none" data-live-notes="%s" data-live-comments="%s" data-live-status="%s"></span>', $live_notes, $live_comments, $live_toggle );
	}

	public function enable_remote_post($user_id) {
		$user = get_userdata($user_id);
		$this->options = get_option( self::$options_name );
		$livepress_com = new livepress_communication($this->options['api_key']);
		$user_pass = wp_generate_password( 20, false );
		$lp_key = wp_hash_password( $user_pass );
		/* Avoid race condition by enabling two passwords at that point */
		update_user_meta( $user_id, 'livepress-access-key-new', $lp_key );
		$return_code = $livepress_com->remote_post( true, $user->user_login, $user_pass);
		if ( $return_code != 200 ) {
			$this->add_error( "Can't enable remote post feature, so the remote post updates for this user will not work." );
			$res = false;
		} else {
			update_user_meta( $user_id, 'livepress-access-key', $lp_key );
			$res = true;
		}
		delete_user_meta( $user_id, 'livepress-access-key-new' );
		return $res;
	}

	public static function twitter_avatar_url() {
		global $current_user;
		$options = get_user_option( self::$options_name, $current_user->ID, false );
		return $options['twitter_avatar_url'];
	}

	function merge_default_values() {
		$options = get_option( self::$options_name, array() );
		$this->options = array_merge( $this->bool_options, $this->string_options, $this->array_options, $options );
		update_option( self::$options_name, $this->options );
	}

	static function initialize() {
		$postUpdater = new livepress_administration();
	}

	// Install/upgrade required tables
	static function install_or_upgrade() {
		if ( get_option( self::$options_name . "_version" ) != LP_PLUGIN_VERSION ) {
			Collaboration::install();
			$postUpdater = new livepress_administration();
			$postUpdater->merge_default_values();
			update_option( self::$options_name . "_version", LP_PLUGIN_VERSION );
		}
	}

	// Remove all info added by plugin
	static function uninstall() {
		global $wpdb;

		Collaboration::uninstall();

		$options = get_option( self::$options_name );
		$livepress_com = new livepress_communication($options['api_key']);
		$livepress_com->reset_blog();

		$users = get_users();
		foreach ( $users as $user ) {
			$option_name = $wpdb->prefix . self::$options_name;
			delete_user_meta( $user->ID, $option_name );
		}
		delete_option( self::$options_name );
	}

	function add_css_and_js() {
		if (livepress_config::get_instance()->script_debug()) {
			wp_enqueue_script( 'livepress_admin_ui_js', LP_PLUGIN_URL_BASE . 'js/admin_ui.full.js', array('jquery') );
		} else {
			wp_enqueue_script( 'livepress_admin_ui_js', LP_PLUGIN_URL_BASE . 'js/admin_ui.min.js', array('jquery') );
		}

		wp_register_style( 'livepress_facebox', LP_PLUGIN_URL_BASE . 'css/facebox.css' );
		wp_register_style( 'livepress_admin', LP_PLUGIN_URL_BASE . 'css/admin.css' );
		wp_print_styles( 'livepress_facebox' );
		wp_print_styles( 'livepress_admin' );
	}

	function render_livepress_administration( $author_view = false ) {
		global $current_user;

		// Retrieve options from the database
		$this->options = get_option( self::$options_name );
		$this->user_options = get_user_option(
			self::$options_name, $current_user->ID, false );

		// Update options that aren't set with default value
		if ( $this->options == FALSE ) {
			$this->options = array_merge(
				$this->bool_options, $this->string_options );
		} else {
			$this->options = array_merge(
				array_merge( $this->bool_options, $this->string_options ),
				$this->options );
		}
		if ( $this->user_options == FALSE ) {
			$this->user_options = array_merge(
				$this->user_bool_options, $this->user_string_options );
		} else {
			$this->user_options = array_merge(
				array_merge( $this->user_bool_options, $this->user_string_options ),
				$this->user_options
			);
		}

		$options = $this->options;
		try {
			// Handle an update in the options
			if ( isset($_POST['action']) && $_POST['action'] == 'update' ) {
				// Save the old options
				$this->old_options = $this->options;
				$this->old_user_options = $this->user_options;

				// Update all options
				$this->update_bool_options(
					$this->user_options, $this->user_bool_options );
				$this->update_string_options(
					$this->user_options, $this->user_string_options );
				if ( $this->can_manage_options() ) {
					$this->update_bool_options( $this->options, $this->bool_options );
					$this->update_string_options( $this->options, $this->string_options );
				}

				$this->livepress_updates( $author_view );

				if ( $author_view ) {
					update_user_option( $current_user->ID, self::$options_name, $this->user_options );
				} else if ( $this->can_manage_options() ) {
					$options = $this->options;
					update_option( self::$options_name, $this->options );
				}

				$this->add_warning( __( 'Options saved.', 'livepress' ) );
			}

			// Handle yet not authorized twitter OAuth
			if ( !$author_view
				&& ($this->old_options == NULL || $this->old_options['post_to_twitter'])
				&& $this->options['oauth_authorized_user'] == ''
				&& $this->options['post_to_twitter']
				&& $this->can_manage_options()
			) {
				$livepress_com = new livepress_communication($this->options['api_key']);

				$authorized_user = $livepress_com->get_authorized_user();
				if ( $authorized_user ) {
					$this->options['oauth_authorized_user'] = $authorized_user;
					$options = $this->options;
					update_option( self::$options_name, $this->options );
				} else {
					$this->add_error( $this->get_oauth_authorization_url_message( $livepress_com ) );
				}
			}
		} catch ( livepress_communication_exception $e ) {
			$this->add_error( 'Connection to livepress service failed.' );
		}

		// Some debug info
		$config = livepress_config::get_instance();
		if ( $config->debug() ) {
			$this->add_warning( 'Livepress Webservice Host: ' . $config->livepress_service_host() );
			$this->add_warning( 'Static Host: ' . $config->static_host() );
		}

		$current_user = wp_get_current_user();
		$admin_user = current_user_can( 'manage_options' );

		$authenticated = $options['api_key'] && !$options['error_api_key'];
		$user_options = $this->user_options;
		$messages = $this->messages;
		$admin_path = site_url() . "/wp-admin/admin.php?page=livepress";

		$admin_view = !$author_view;
		require(dirname( __FILE__ ) . '/livepress-administration-view.php');
	}

	function render_livepress_administration_author() {
		$this->render_livepress_administration( true );
	}

	private function livepress_updates( $author_view ) {
		global $current_user;
		// Call the livepress API to add/del/enable/disable twitter, IM users.
		$livepress_com = new livepress_communication($this->options['api_key']);

		if ( $this->has_changed( 'api_key' ) ) {
			$validation = $livepress_com->validate_on_livepress( site_url() );
			$api_key = $this->options['api_key'];
			$this->options = $this->old_options;
			$this->options['api_key'] = $api_key;
			$this->options['error_api_key'] = ($validation != 1);
			if ( $validation == 1 ) {
				// We pass validation, update blog parameters from LP side
				$blog = $livepress_com->get_blog();
				$this->options['blog_shortname'] = $blog->shortname;
				$this->options['post_from_twitter_username'] = $blog->twitter_username;
			}
			return; // If only api_key changed, no more changes possible -- that are separate forms in html
		}

		if ( $this->has_changed( 'twitter_avatar_username', TRUE ) ) {
			if ( empty($this->user_options['twitter_avatar_username']) ) {
				$this->user_options['twitter_avatar_url'] = "";
			} else {
				$url = $livepress_com->get_twitter_avatar( $this->user_options['twitter_avatar_username'] );
				if ( empty($url) ) {
					$error_message = "Failed to get avatar for ";
					$error_message .= $this->user_options['twitter_avatar_username'];
					$error_message .= ".";
					$this->add_error( $error_message );
					$this->user_options['twitter_avatar_username'] = $this->old_user_options['twitter_avatar_username'];
				} else {
					$this->user_options['twitter_avatar_url'] = $url;
				}
			}
		}

		$this->update_im_bots( $livepress_com );
		if ( !$author_view ) {
			$this->update_post_to_twitter( $livepress_com );
		}

		$return_code = 200;
		// Unused part of code: only for author view
		/*
		if ( $this->has_changed( 'post_from_twitter_username', true ) ) {
			$screen_name = $this->user_options['post_from_twitter_username'];
			if ( $screen_name == "" ) {
				$return_code =
					$livepress_com->manage_remote_post_from_twitter( "", $current_user->user_login );
			} else {
				try {
					$return_code = $livepress_com->manage_remote_post_from_twitter( $screen_name, $current_user->user_login );
				} catch ( livepress_communication_exception $e ) {
					$return_code = $e->get_code();
					$this->add_error( $e->getMessage() );
				}
			}
		}

		if ( $return_code != 200 && $return_code != "OK." ) {
			$this->user_options['post_from_twitter_username'] = $this->old_user_options['post_from_twitter_username'];
			$error_message = $livepress_com->get_last_error_message();
			if ( strlen( $error_message ) > 0 ) {
				$this->add_error( "Problem with twitter user: " . $livepress_com->get_last_error_message() );
			}
		}

		// Always update im users, since remote_post turn on/off doesn't change user settings
		$this->update_im_users( $livepress_com );
		// Disabled remote post
		if ( $this->has_turned_off( 'remote_post', true ) && $author_view ) {
			$livepress_com->remote_post( false, $current_user->user_login );
		}
		*/
	}

	private function update_bool_options( &$options, $bool_options ) {
		foreach ( $bool_options as $option => $value ) {
			if ( !in_array( $option, $this->internal_options ) ) {
				if ( isset($_POST[$option]) ) {
					$options[$option] = TRUE;
				} else {
					$options[$option] = FALSE;
				}
			}
		}
	}

	private function update_string_options( &$options, $string_options ) {
		foreach ( $string_options as $option => $value ) {
			if ( isset($_POST[$option]) ) {
				$options[$option] = stripslashes( $_POST[$option] );
			}
		}
	}

	/* Receives an ajax request to validate the api key on the
		 * livepress webservice */
	/**
	 * Validate the user's API key both with the LivePress webservice and the plugin update service.
	 *
	 * @return string
	 */
	public static function api_key_validate() {
		if ( !current_user_can( 'manage_options' ) ) {
			return 'Ouch';
		}
		$api_key = stripslashes( $_GET['api_key'] );
		$site_url = get_bloginfo( 'url' );

		// Validate with the LivePress webservice
		$livepress_communication = new livepress_communication( $api_key );
		$status = $livepress_communication->validate_on_livepress( $site_url );

		$options = get_option( self::$options_name );
		$options['api_key'] = esc_html( $api_key );
		$options['error_api_key'] = ( 1 != $status && 2 != $status );
		if ( $status == 1 ) {
			// We pass validation, update blog parameters from LP side
			$blog = $livepress_communication->get_blog();
			$options['blog_shortname'] = $blog->shortname;
			$options['post_from_twitter_username'] = $blog->twitter_username;
		}
		update_option( self::$options_name, $options );

		if ( false == $options['error_api_key'] ) {
			// Validate with plugin update service
			$api_params = array(
				'edd_action' => 'activate_license',
				'license'    => $api_key,
				'item_name'  => urlencode( LP_ITEM_NAME )
			);
			$response = wp_remote_get( add_query_arg( $api_params, LP_STORE_URL ), array( 'reject_unsafe_urls' => false ) );
			if ( is_wp_error( $response ) ) {
				die( 'Ouch' );
			}
			$license_data = json_decode( wp_remote_retrieve_body( $response ) );
			update_option( 'livepress_license_status', $license_data->license );
		}

		if ( 2 == $status || 1 == $status || 0 == $status ) {
			header( 'Content-Type: application/json' );
			die( json_encode( $options ) );
		} else {
			die( 'Ouch' );
		}
	}

	public static function get_twitter_avatar() {
		$livepress_com = new livepress_communication();
		$url = $livepress_com->get_twitter_avatar( $_GET['username'] );
		if ( empty($url) ) {
			header( 'HTTP/1.1 403 Forbidden' );
			die();
		} else {
			@die($url);
		}
	}

	/**
	 * Receives an ajax request to enable/disable the post to twitter feature, then dies returning
	 * the url for OAuth validation.
	 */
	public static function post_to_twitter_ajaxed() {
		self::die_if_not_allowed();
		$options = get_option( self::$options_name );

		if ( !isset($_POST['change_oauth_user'])
			&& (isset($_POST['enable']) && $options['post_to_twitter']
				|| !isset($_POST['enable']) && !$options['post_to_twitter'])
		) {
			// Requesting to enable when it's already enabled and vice-versa
			header( 'HTTP/1.1 409 Conflict' );
			die();
		}

		$livepress_com = new livepress_communication($options['api_key']);

		if ( isset($_POST['enable']) ) {
			if ( isset($_POST['change_oauth_user']) ) {
				$livepress_com->destroy_authorized_twitter_user();
				$options['oauth_authorized_user'] = '';
			}
			try {
				$url = $livepress_com->get_oauth_authorization_url();
				$options['post_to_twitter'] = TRUE;
			} catch ( livepress_communication_exception $e ) {
				header( 'HTTP/1.1 502 Bad Gateway' );
				echo $e->get_code();
				die();
			}
		} else {
			$livepress_com->destroy_authorized_twitter_user();
			$options['post_to_twitter'] = FALSE;
			$options['oauth_authorized_user'] = '';
		}

		update_option( self::$options_name, $options );
		@die($url);
	}

	/**
	 * Print to ajax the status of the last OAuth request
	 */
	public static function check_oauth_authorization_status() {
		self::die_if_not_allowed();
		$options = get_option( self::$options_name );

		$livepress_com = new livepress_communication($options['api_key']);
		$status = $livepress_com->is_authorized_oauth();

		if ( $status->status == "authorized" ) {
			$options['post_to_twitter'] = TRUE;
			$options['oauth_authorized_user'] = $status->username;
			update_option( self::$options_name, $options );
		} else if ( $status->status == "unauthorized" ) {
			$options['post_to_twitter'] = FALSE;
			$options['oauth_authorized_user'] = '';
			update_option( self::$options_name, $options );
		}

		header( 'Content-Type: application/json' );
		echo json_encode( $status );
		die();
	}

	private static function die_if_not_allowed() {
		if ( !current_user_can( 'manage_options' ) ) {
			@die();
		}
	}

	private function add_error( $msg ) {
		$this->messages['error'][] = $msg;
	}

	private function add_warning( $msg ) {
		$this->messages['updated'][] = $msg;
	}

	// Functions that handle the changes
	private function update_im_bots( $livepress_com ) {
		global $current_user;

		if ( $this->options['blog_shortname'] != $this->old_options['blog_shortname'] ) {
			$livepress_com->set_blog_shortname( $this->options['blog_shortname'] );
		}

		foreach ( $this->IM_services as $im_service ) {
			$username = 'im_bot_username_' . $im_service;
			$password = 'im_bot_password_' . $im_service;

			$return_code = 200;

			$email_regex = "^([_a-z0-9-]+)(\.[_a-z0-9-]+)*@([a-z0-9-]+)(\.[a-z0-9-]+)*(\.[a-z]{2,4})$";
			if ( $username == 'im_bot_username_msn' && $this->options[$username] != "" && !eregi( $email_regex, $this->options[$username] ) ) {
				$this->options[$username] = "";
				$this->options[$password] = "";
				$this->add_error( "The Windows Live Messager username needs to be complete e.g user@hotmail.com" );
			}

			if ( $this->options[$username] != $this->old_options[$username]
				&& $this->options[$username] != ""
				|| $this->options[$password] != $this->old_options[$password]
					&& $this->options[$password] != ""
			) {
				$this->im_changed[$im_service] = true;
			} else {
				$this->im_changed[$im_service] = false;
			}

			if ( $this->options[$username] != "" && $this->options[$password] != "" ) {
				// $enabled was false -> true
				if ( $this->old_options[$username] == "" || $this->old_options[$password] == "" ) {
					$return_code = $livepress_com->im_bot( true,
						$im_service,
						$this->options[$username],
						$this->options[$password]
					);
				} // Changed username or password
				elseif ( $this->old_options[$username]
					!= $this->options[$username]
					|| $this->old_options[$password]
						!= $this->options[$password]
				) {
					$return_code = $livepress_com->im_bot_update( $im_service,
						$this->options[$username],
						$this->options[$password]
					);
				}
			} // $enabled was true -> false
			elseif ( $this->old_options[$username] != "" && $this->old_options[$password] != "" ) {
				$return_code = $livepress_com->im_bot( false,
					$im_service,
					$this->old_options[$username]
				);
			}

			if ( $return_code == 404 ) {
				$this->options[$username] = '';
				$this->options[$password] = '';
			}

			if ( $return_code == 403 ) {
				// Rollback the options
				$this->options[$username] = $this->old_options[$username];
				$this->options[$password] = $this->old_options[$password];

				$this->add_error( "$im_service IM bot error: "
					. $livepress_com->get_last_error_message() );
			}
		}
	}

	private function update_im_users( $livepress_com ) {
		global $current_user;
		foreach ( $this->IM_services as $im_service ) {
			$username = 'im_enabled_user_' . $im_service;
			$send_comments = 'im_send_comments_' . $im_service;
			if ( $this->user_options['remote_post'] ) {
				$return_code = 200;
				if ( $this->user_options[$username] != ""
					&& $this->old_user_options[$username] == ""
				) {
					$return_code = $livepress_com->im_authorized_user( true,
						$im_service,
						$current_user->user_login,
						$this->user_options[$username],
						$this->user_options[$send_comments]
					);
				} elseif ( ($this->has_changed( $username, true ) || $this->has_changed( $send_comments, true ))
					&& $this->user_options[$username] != ""
					&& $this->old_user_options[$username] != ""
				) {
					$return_code = $livepress_com->im_authorized_user_update(
						$im_service,
						$current_user->user_login,
						$this->old_user_options[$username],
						$this->user_options[$username],
						$this->user_options[$send_comments]
					);
				} elseif ( $this->user_options[$username] == ""
					&& $this->old_user_options[$username] != ""
				) {
					$return_code = $livepress_com->im_authorized_user( false,
						$im_service,
						$current_user->user_login,
						$this->old_user_options[$username]
					);
				}

				if ( $return_code != 200 ) {
					// Rollback the options
					$this->user_options[$username] = $this->old_user_options[$username];
					$this->user_options[$send_comments] = $this->old_user_options[$send_comments];

					$this->add_error( "$im_service IM user error: "
						. $livepress_com->get_last_error_message() );
				}
			} else {
				if ( $this->has_changed( $username, true ) || $this->has_changed( $send_comments, true ) ) {
					$this->add_error(
						"$im_service IM user error: Can't change user if remote post is disabled" );
				}
				$this->user_options[$username] = $this->old_user_options[$username];
				$this->user_options[$send_comments] = $this->old_user_options[$send_comments];
			}
		}
	}

	private function update_post_to_twitter( $livepress_com ) {
		$option = 'post_to_twitter';

		if ( $this->has_turned_on( $option ) ) {
			$this->add_warning( $this->get_oauth_authorization_url_message( $livepress_com ) );
		} elseif ( $this->has_turned_off( $option ) ) {
			$livepress_com->destroy_authorized_twitter_user();
			$this->options['oauth_authorized_user'] = '';
		}
	}

	private function get_oauth_authorization_url_message( $livepress_com ) {
		$auth_url = $livepress_com->get_oauth_authorization_url();
		$msg = 'To enable the "Post to twitter" you still need to ';
		$msg .= 'authorize the livepress webservice to post in your ';
		$msg .= 'twitter account, to do it please click on the following ';
		$msg .= 'link and then on "Allow"<br />';
		$msg .= '<a href="' . $auth_url . '" ';
		$msg .= 'id="lp-post-to-twitter-not-authorized" ';
		$msg .= 'target="_blank">';
		$msg .= $auth_url . '</a>';
		return $msg;
	}

	private function has_changed( $option, $user = false ) {
		if ( $user ) {
			return $this->old_user_options[$option]
				!= $this->user_options[$option];
		} else {
			return $this->old_options[$option] != $this->options[$option];
		}
	}

	private function has_turned_on( $option, $user = false ) {
		if ( $user ) {
			return !$this->old_user_options[$option]
				&& $this->user_options[$option];
		} else {
			return !$this->old_options[$option] && $this->options[$option];
		}
	}

	private function has_turned_off( $option, $user = false ) {
		if ( $user ) {
			return $this->old_user_options[$option]
				&& !$this->user_options[$option];
		} else {
			return $this->old_options[$option] && !$this->options[$option];
		}
	}

	private function can_manage_options() {
		return current_user_can( 'manage_options' );
	}

	private function get_im_bots_set() {
		$im_bots = array();
		foreach ( $this->IM_services as $im_service ) {
			$username = 'im_bot_username_' . $im_service;
			$password = 'im_bot_password_' . $im_service;

			if ( $this->options[$username] != "" && $this->options[$password] != "" ) {
				$im_bots[$im_service] = $this->options[$username];
			}
		}
		if ( !empty($this->options["blog_shortname"]) ) {
			$im_service = 'gtalk';
			$username = 'im_bot_username_' . $im_service;
			$password = 'im_bot_password_' . $im_service;
			$config = livepress_config::get_instance();
			$im_bots[$im_service] = $this->options["blog_shortname"] . "@blogs." . $config->get_option( 'JABBER_DOMAIN' );
		}

		return $im_bots;
	}
}

if ( !function_exists( 'check_ajax_referer' ) ) :
	function check_ajax_referer( $action = -1, $query_arg = false, $die = true ) {
		if ( $query_arg )
			$nonce = $_REQUEST[$query_arg];
		else
			$nonce = isset($_REQUEST['_ajax_nonce']) ? $_REQUEST['_ajax_nonce'] : $_REQUEST['_wpnonce'];

		$result = wp_verify_nonce( $nonce, (isset($_REQUEST['livepress_action']) ? livepress_updater::LIVEPRESS_ONCE : $action) );

		if ( $die && false == $result )
			die('-1');

		do_action( 'check_ajax_referer', $action, $result );

		return $result;
	}endif;

?>
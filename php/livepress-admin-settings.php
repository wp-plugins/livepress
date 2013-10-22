<?php
/**
 * Adds the LivePress menu to the settings screen, uses the settings API to display form fields,
 * validates and saves those fields.
 */

class livepress_admin_settings {

	public $settings = array();

	function __construct() {
		add_action( 'admin_init', array($this, 'admin_init') );
		add_action( 'admin_enqueue_scripts', array($this, 'admin_enqueue_scripts') );
		add_action( 'admin_menu', array($this, 'admin_menu') );

		$this->settings = $this->get_settings();
	}

	function admin_init() {
		$this->setup_settings();
	}

	/**
	 * Gets the current settings
	 */
	function get_settings() {
		$settings = get_option( 'livepress' );

		return (object) wp_parse_args(
			$settings,
			array(
				'api_key'                      => '',
				'feed_order'                   => 'top',
				'notifications'                => array( 'tool-tip' ),
				'byline_style'                 => '',
				'allow_remote_twitter'         => true,
				'allow_sms'                    => true,
				'enabled_to'                   => 'all',
				'disable_comments'             => false,
				'comment_live_updates_default' => false,
				'timestamp'                    => get_option( 'time_format' ),
				'include_avatar'               => false,
				'update_author'                => true,
				'author_display'               => ''
			)
		);
	}

	/**
	 * Enqueue some styles on the profile page to display our LP form a little nicer
	 *
	 * @param $hook string page hook
	 *
	 * @author tddewey
	 * @return string $hook, unaltered regardless.
	 */
	function admin_enqueue_scripts( $hook ) {
		if ( $hook != 'settings_page_livepress-settings' )
			return $hook;

		wp_enqueue_script( 'livepress_admin_ui_js', LP_PLUGIN_URL_BASE . 'js/admin_ui.full.js', array( 'jquery' ) );

		wp_enqueue_style( 'livepress_admin', LP_PLUGIN_URL_BASE . 'css/wp-admin.css' );
		return $hook;
	}

	/**
	 * Add a menu to the settings page
	 * @author tddewey
	 * @return void
	 */
	function admin_menu() {
		add_options_page( 'LivePress Settings', 'LivePress', 'manage_options', 'livepress-settings', array($this, 'render_settings_page') );
	}

	/**
	 * Sets up all the settings, fields, and sections
	 * @author tddewey
	 * @return void
	 */
	function setup_settings() {
		register_setting( 'livepress', 'livepress', array($this, 'sanitize') );

		// Add sections
		add_settings_section( 'lp-connection', 'Connection to LivePress', '__return_null', 'livepress-settings' );
		add_settings_section( 'lp-appearance', 'Appearance', '__return_null', 'livepress-settings' );
		add_settings_section( 'lp-remote', 'Remote Publishing', '__return_null', 'livepress-settings' );

		// Add setting fields
		add_settings_field( 'api_key', 'Authorization Key', array($this, 'api_key_form'), 'livepress-settings', 'lp-connection' );
		add_settings_field( 'feed_order', 'When using the real-time editor, place new updates on', array($this, 'feed_order_form'), 'livepress-settings', 'lp-appearance' );
		add_settings_field( 'notifications', 'Readers receive these notifications when you update or publish a post', array($this, 'notifications_form'), 'livepress-settings', 'lp-appearance' );
		//add_settings_field( 'byline_style', 'Byline and Timestamp Format', array($this, 'byline_style_form'), 'livepress-settings', 'lp-appearance' );
		add_settings_field( 'allow_remote_twitter', 'Allow authors to publish via Twitter', array($this, 'allow_remote_twitter_form'), 'livepress-settings', 'lp-remote' );
		add_settings_field( 'allow_sms', 'Allow authors to publish via SMS', array($this, 'allow_sms_form'), 'livepress-settings', 'lp-remote' );
		add_settings_field( 'post_to_twitter', 'Publish Updates to Twitter', array( $this, 'push_to_twitter_form' ), 'livepress-settings', 'lp-remote' );
		// add_settings_field( 'enabled_to', 'Enabled_to?', array( $this, 'enabled_to_form' ), 'livepress-settings', 'lp-appearance' ); // Whitelist, but don't expose a UI
	}

	function api_key_form() {
		$settings = $this->settings;
		echo '<input type="text" name="livepress[api_key]" id="api_key" value="' . esc_attr( $settings->api_key ) . '">';
		echo '<input type="submit" class="button-secondary" id="api_key_submit" value="' . __( 'Check', 'livepress' ) . '" />';

		$options = get_option( 'livepress', array() );
		$authenticated = $options['api_key'] && !$options['error_api_key'];

		if ( $options['api_key'] && $options['error_api_key'] ) {
			$api_key_status_class = 'invalid_api_key';
			$api_key_status_text = 'Key not valid';
		} elseif ( $authenticated ) {
			$api_key_status_class = 'valid_api_key';
			$api_key_status_text = 'Authenticated!';
		} else {
			$api_key_status_class = '';
			$api_key_status_text = 'Found in your welcome email!';
		}

		echo '<span id="api_key_status" class="' . esc_attr( $api_key_status_class ) . '" >';
		echo $api_key_status_text;
		echo '</span>';
	}

	function feed_order_form() {
		$settings = $this->settings;
		?>
	<p>
		<label>
			<input type="radio" name="livepress[feed_order]" id="feed_order" value="top" <?php echo checked( 'top', $settings->feed_order, false ); ?> />
			<?php _e( 'Top (reverse chronological order, newest first)', 'livepress' ); ?>
		</label>
	</p>
    <p>
        <label>
            <input type="radio" name="livepress[feed_order]" id="feed_order" value="bottom" <?php echo checked( 'bottom', $settings->feed_order, false ); ?> />
			<?php _e( 'Bottom (chronological order, oldest first)', 'livepress' ); ?>
        </label>
    </p>
		<?php
	}

	function notifications_form() {
		$settings = $this->settings;
		echo '<p><label><input type="checkbox" name="livepress[notifications][]" id="lp-notifications" value="tool-tip"
		' . checked( true , in_array( 'tool-tip', $settings->notifications ), false ) . '> Tool-tip style popups
	</label></p>';
		echo '<p><label><input type="checkbox" name="livepress[notifications][]" id="lp-notifications" value="audio" ' .
		checked( true, in_array( 'audio', $settings->notifications ), false ) . '> A soft chime (audio)</label></p>';
		echo '<p><label><input type="checkbox" name="livepress[notifications][]" id="lp-notifications" value="scroll" '
		. checked( true, in_array( 'scroll', $settings->notifications ), false ) . '> Autoscroll to update </label></p>';
	}

	function byline_style_form() {
		echo 'This setting may be removed in favor of a filter hook.';
	}

	function allow_remote_twitter_form() {
		$settings = $this->settings;
		echo '<p><label><input type="checkbox" name="livepress[allow_remote_twitter]" id="lp-remote" value="allow"' .
		checked( 'allow', $settings->allow_remote_twitter, false ) . '"> Allow</label></p>';
	}

	function allow_sms_form() {
		$settings = $this->settings;
		echo '<p><label><input type="checkbox" name="livepress[allow_sms]" id="lp-sms" value="allow"' .
		checked( 'allow', $settings->allow_sms, false ) . '"> Allow</label></p>';
	}

	function push_to_twitter_form() {
		$options = get_option( 'livepress' );
		$authorized = '' !== trim( $options['oauth_authorized_user'] );

		echo '<script type="text/javascript">var livepress_twitter_authorized=' . ($authorized ? 'true' : 'false') . ';</script>';

		echo '<input type="submit" class="button-secondary" id="lp-post-to-twitter-change" value="' . __( 'Authorize', 'livepress' ) . '" />';
		echo '<div class="post_to_twitter_messages">';
		echo '<span id="post_to_twitter_message">';
		if ( $authorized ) {
			echo __( 'Sending out alerts on Twitter account:', 'livepress' ) . ' <strong>' . $options['oauth_authorized_user'] . '</strong>.';
		}
		echo '</span>';
		echo '<br /><a href="#" id="lp-post-to-twitter-change_link" style="display: none">' . __( 'Click here to change accounts.', 'livepress' ).  '</a>';
	}

	function enabled_to_form() {
		$settings = $this->settings;
		echo '<p><input type="text" name="livepress[enabled_to]" value="' . esc_attr( $settings->enabled_to ) . '"></p>';
	}

	function sanitize( $input ) {

		if ( isset( $input['api_key'] ) ) {
			$api_key = sanitize_text_field( $input['api_key'] );

			if ( ! empty( $input['api_key'] ) ) {
					$livepress_com = new livepress_communication($api_key);

					$validation = $livepress_com->validate_on_livepress( site_url() );
					$sanitized_input['api_key'] = $api_key;
					$sanitized_input['error_api_key'] = ($validation != 1);
					if ( $validation == 1 ) {
						// We pass validation, update blog parameters from LP side
						$blog = $livepress_com->get_blog();

						$sanitized_input['blog_shortname'] = $blog->shortname;
						$sanitized_input['post_from_twitter_username'] = $blog->twitter_username;
						$sanitized_input['api_key'] = $api_key;
					} else {
						add_settings_error('api_key', 'invalid', "Key is not valid");
					}
			} else {
					$sanitized_input['api_key'] = $api_key;
			}
		}

		if ( isset( $input['feed_order'] ) && $input['feed_order'] == 'bottom' ) {
			$sanitized_input['feed_order'] = 'bottom';
		} else {
			$sanitized_input['feed_order'] = 'top';
		}

		if ( isset( $input['notifications'] ) && ! empty( $input['notifications'] ) ) {
			$sanitized_input['notifications'] = array_map( 'sanitize_text_field',  $input['notifications'] );
		} else {
			$sanitized_input['notifications'] = array();
		}

		if ( isset( $input['allow_remote_twitter'] ) ) {
			$sanitized_input['allow_remote_twitter'] = 'allow';
		} else {
			$sanitized_input['allow_remote_twitter'] = 'deny';
		}

		if ( isset( $input['oauth_authorized_user'] ) ) {
			$sanitized_input['oauth_authorized_user'] = sanitize_text_field( $input['oauth_authorized_user'] );
		}

		if ( isset( $input['allow_sms'] ) ) {
			$sanitized_input['allow_sms'] = 'allow';
		} else {
			$sanitized_input['allow_sms'] = 'deny';
		}

		if ( isset( $input['post_to_twitter'] ) ) {
			$sanitized_input['post_to_twitter'] = (bool) $input['post_to_twitter'];
		}

		$merged_input = wp_parse_args( $sanitized_input, (array) $this->settings ); // For the settings not exposed

		return $merged_input;
	}

	function render_settings_page( ) {
		?>
		<div class="wrap">
			<form action="options.php" method="post">
				<?php echo screen_icon( 'livepress-settings' ); ?><h2>LivePress Settings</h2>
				<?php settings_fields( 'livepress' ); ?>
				<?php do_settings_sections( 'livepress-settings' ); ?>
				<?php wp_nonce_field( 'activate_license', '_lp_nonce' ); ?>
				<?php submit_button(); ?>
			</form>
		</div>
		<?php
	}


}

$livepress_admin_settings = new livepress_admin_settings();

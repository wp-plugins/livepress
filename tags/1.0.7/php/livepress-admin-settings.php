<?php
/**
 * Adds the LivePress menu to the settings screen, uses the settings API to display form fields,
 * validates and saves those fields.
 */

class LivePress_Admin_Settings {

	/**
	 * @access public
	 * @var array $settings Settings array.
	 */
	public $settings = array();

	/**
	 * Constructor.
	 */
	function __construct() {
		add_action( 'admin_init',            array( $this, 'admin_init' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'admin_enqueue_scripts' ) );
		add_action( 'admin_menu',            array( $this, 'admin_menu' ) );

		$this->settings = $this->get_settings();
	}

	/**
	 * Set up settings.
	 */
	function admin_init() {
		$this->setup_settings();
	}

	/**
	 * Get the current settings.
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
	 * Enqueue some styles on the profile page to display our LP form
	 * a little nicer.
	 *
	 * @param string $hook Page hook.
	 *
	 * @author tddewey
	 * @return string $hook, unaltered regardless.
	 */
	function admin_enqueue_scripts( $hook ) {
		if ( $hook != 'settings_page_livepress-settings' )
			return $hook;

		wp_enqueue_script( 'livepress_admin_ui_js', LP_PLUGIN_URL . 'js/admin_ui.full.js', array( 'jquery' ) );

		wp_enqueue_style( 'livepress_admin', LP_PLUGIN_URL . 'css/wp-admin.css' );
		return $hook;
	}

	/**
	 * Add a menu to the settings page.
	 *
	 * @author tddewey
	 * @return void
	 */
	function admin_menu() {
		add_options_page( esc_html__( 'LivePress Settings', 'livepress' ), esc_html__( 'LivePress', 'livepress' ), 'manage_options', 'livepress-settings', array( $this, 'render_settings_page' ) );
	}

	/**
	 * Set up all the settings, fields, and sections.
	 *
	 * @author tddewey
	 * @return void
	 */
	function setup_settings() {
		register_setting( 'livepress', 'livepress', array( $this, 'sanitize' ) );

		// Add sections
		add_settings_section( 'lp-connection', esc_html__( 'Connection to LivePress', 'livepress' ), '__return_null', 'livepress-settings' );
		add_settings_section( 'lp-appearance',  esc_html__( 'Appearance', 'livepress' ), '__return_null', 'livepress-settings' );
		add_settings_section( 'lp-remote',  esc_html__( 'Remote Publishing', 'livepress' ), '__return_null', 'livepress-settings' );

		// Add setting fields
		add_settings_field( 'api_key',  esc_html__( 'Authorization Key', 'livepress' ), array( $this, 'api_key_form' ), 'livepress-settings', 'lp-connection' );
		add_settings_field( 'feed_order',  esc_html__( 'When using the real-time editor, place new updates on', 'livepress' ), array( $this, 'feed_order_form' ), 'livepress-settings', 'lp-appearance' );
		add_settings_field( 'notifications',  esc_html__( 'Readers receive these notifications when you update or publish a post', 'livepress' ), array( $this, 'notifications_form' ), 'livepress-settings', 'lp-appearance' );
		add_settings_field( 'allow_remote_twitter',  esc_html__( 'Allow authors to publish via Twitter', 'livepress' ), array( $this, 'allow_remote_twitter_form' ), 'livepress-settings', 'lp-remote' );
		add_settings_field( 'allow_sms',  esc_html__( 'Allow authors to publish via SMS', 'livepress' ), array( $this, 'allow_sms_form' ), 'livepress-settings', 'lp-remote' );
		add_settings_field( 'post_to_twitter',  esc_html__( 'Publish Updates to Twitter', 'livepress' ), array( $this, 'push_to_twitter_form' ), 'livepress-settings', 'lp-remote' );
	}

	/**
	 * API key form output.
	 */
	function api_key_form() {
		$settings = $this->settings;
		echo '<input type="text" name="livepress[api_key]" id="api_key" value="' . esc_attr( $settings->api_key ) . '">';
		echo '<input type="submit" class="button-secondary" id="api_key_submit" value="' . esc_html__( 'Check', 'livepress' ) . '" />';

		$options = get_option( 'livepress', array() );
		$authenticated = $options['api_key'] && !$options['error_api_key'];

		if ( $options['api_key'] && $options['error_api_key'] ) {
			$api_key_status_class = 'invalid_api_key';
			$api_key_status_text  = esc_html__( 'Key not valid', 'livepress' );
		} elseif ( $authenticated ) {
			$api_key_status_class = 'valid_api_key';
			$api_key_status_text  = esc_html__( 'Authenticated!', 'livepress' );
		} else {
			$api_key_status_class = '';
			$api_key_status_text  = esc_html__( 'Found in your welcome email!', 'livepress' );
		}

		echo '<span id="api_key_status" class="' . esc_attr( $api_key_status_class ) . '" >';
		echo esc_html( $api_key_status_text );
		echo '</span>';
	}

	/**
	 * Feed order form output.
	 */
	function feed_order_form() {
		$settings = $this->settings;
		?>
	<p>
		<label>
			<input type="radio" name="livepress[feed_order]" id="feed_order" value="top" <?php echo esc_attr( checked( 'top', $settings->feed_order, false ) ); ?> />
			<?php esc_html_e( 'Top (reverse chronological order, newest first)', 'livepress' ); ?>
		</label>
	</p>
    <p>
        <label>
            <input type="radio" name="livepress[feed_order]" id="feed_order" value="bottom" <?php echo esc_attr( checked( 'bottom', $settings->feed_order, false ) ); ?> />
			<?php esc_html_e( 'Bottom (chronological order, oldest first)', 'livepress' ); ?>
        </label>
    </p>
		<?php
	}

	/**
	 * Notifications form.
	 */
	function notifications_form() {
		$settings = $this->settings;
		echo '<p><label><input type="checkbox" name="livepress[notifications][]" id="lp-notifications" value="tool-tip"
		' . checked( true , in_array( 'tool-tip', $settings->notifications ), false ) . '> ' . esc_html__( 'Tool-tip style popups', 'livepress' ) . '</label></p>';
		echo '<p><label><input type="checkbox" name="livepress[notifications][]" id="lp-notifications" value="audio" ' .
		checked( true, in_array( 'audio', $settings->notifications ), false ) . '> ' . esc_html__( 'A soft chime (audio)', 'livepress' ) . '</label></p>';
		echo '<p><label><input type="checkbox" name="livepress[notifications][]" id="lp-notifications" value="scroll" '
		. checked( true, in_array( 'scroll', $settings->notifications ), false ) . '> ' . esc_html__( 'Autoscroll to update', 'livepress' ) . ' </label></p>';
	}

	/**
	 * Byline style form.
	 */
	function byline_style_form() {
		echo esc_html__( 'This setting may be removed in favor of a filter hook.', 'livepress' );
	}

	/**
	 * Allow remote Twitter form output.
	 */
	function allow_remote_twitter_form() {
		$settings = $this->settings;
		echo '<p><label><input type="checkbox" name="livepress[allow_remote_twitter]" id="lp-remote" value="allow"' .
		checked( 'allow', $settings->allow_remote_twitter, false ) . '"> ' . esc_html__( 'Allow', 'livepress' ) . '</label></p>';
	}

	/**
	 * Allow SMS form output.
	 */
	function allow_sms_form() {
		$settings = $this->settings;
		echo '<p><label><input type="checkbox" name="livepress[allow_sms]" id="lp-sms" value="allow"' .
		checked( 'allow', $settings->allow_sms, false ) . '"> ' . esc_html__( 'Allow', 'livepress' ) . '</label></p>';
	}

	/**
	 * Push to Twitter form output.
	 */
	function push_to_twitter_form() {
		$options    = get_option( 'livepress' );
		$oauth      = isset( $options['oauth_authorized_user'] ) ? trim( $options['oauth_authorized_user'] ) : '';
		$authorized = empty( $oauth ) ? 'false' : 'true';

		echo '<script type="text/javascript">var livepress_twitter_authorized=' . esc_js( $authorized ) . ';</script>';

		echo '<input type="submit" class="button-secondary" id="lp-post-to-twitter-change" value="' . esc_html__( 'Authorize', 'livepress' ) . '" />';
		echo '<div class="post_to_twitter_messages">';
		echo '<span id="post_to_twitter_message">';
		if ( 'true' == $authorized ) {
			echo esc_html__( 'Sending out alerts on Twitter account:', 'livepress' ) . ' <strong>' . esc_html( $options['oauth_authorized_user'] ) . '</strong>.';
		}
		echo '</span>';
		echo '<br /><a href="#" id="lp-post-to-twitter-change_link" style="display: none">' . esc_html__( 'Click here to change accounts.', 'livepress' ).  '</a>';
	}

	/**
	 * Enabled-to form output.
	 */
	function enabled_to_form() {
		$settings = $this->settings;
		echo '<p><input type="text" name="livepress[enabled_to]" value="' . esc_attr( $settings->enabled_to ) . '"></p>';
	}

	/**
	 * Sanitize form data.
	 *
	 * @param array $input Raw form input.
	 * @return array Sanitized form input.
	 */
	function sanitize( $input ) {

		if ( isset( $input['api_key'] ) ) {
			$api_key = sanitize_text_field( $input['api_key'] );

			if ( ! empty( $input['api_key'] ) ) {
					$livepress_com = new LivePress_Communication($api_key);

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
						add_settings_error('api_key', 'invalid', esc_html__( "Key is not valid", 'livepress' ) );
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

	/**
	 * Settings page display.
	 */
	function render_settings_page( ) {
		?>
		<div class="wrap">
			<form action="options.php" method="post">
				<?php echo wp_kses_post( get_screen_icon( 'livepress-settings' ) ); ?><h2><?php esc_html_e( 'LivePress Settings', 'livepress' ); ?></h2>
		<?php
			$this->options = get_option( LivePress_Administration::$options_name );
			// If the API key is blank and the show=enetr-api-key toggle is not passed, prompt the user to register
			if ( ( ! ( isset( $_GET['show'] ) && 'enter-api-key' ==  $_GET['show'] ) ) && empty( $this->options['api_key'] ) && ! isset( $_POST[ 'submit' ] ) ) {
				echo '<div class="updated" style="padding: 0; margin: 0; border: none; background: none;">
							<div class="livepress_admin_warning">
								<div class="aa_button_container" onclick="window.open(\'http://www.livepress.com/wordpress\', \'_blank\' );">
									<div class="aa_button_border">
										<div class="aa_button">'. esc_html__('Sign up for LivePress').'</div>
									</div>
								</div>
								<div class="aa_description">
									<a href = "' . esc_url( add_query_arg( array( 'page' => 'livepress-settings' ), admin_url( 'options-general.php' ) ) ) .
									'&show=enter-api-key">' .
									esc_html__('I have already activated my LivePress account', 'livepress' ).'</a></div>
							</div>
					</div>
				';
			} else {
				// Otherwise, display the settings page as usual
		?>
				<?php settings_fields( 'livepress' ); ?>
				<?php do_settings_sections( 'livepress-settings' ); ?>
				<?php wp_nonce_field( 'activate_license', '_lp_nonce' ); ?>
				<?php submit_button(); ?>
			</form>
		</div>
		<?php
			}
	}

}

$livepress_admin_settings = new LivePress_Admin_Settings();
<?php
/**
 * Uses the settings/author API to add settings for individual authors.
 * Generally found under Users->Your Profile
 */

class livepress_user_settings {

	public $messages = array(
		'updated' => array(),
		'error' => array(),
	);

	function __construct() {
		add_action( 'admin_enqueue_scripts', array( $this, 'admin_enqueue_scripts' ) );
		add_action( 'show_user_profile', array( $this, 'user_fields' ) );
		add_action( 'edit_user_profile', array( $this, 'user_fields' ) );
		add_action( 'personal_options_update', array( $this, 'save_fields' ) );
		add_action( 'edit_user_profile_update', array( $this, 'save_fields' ) );
		add_action( 'user_profile_update_errors', array( $this, 'save_fields_err'), 0, 3 );
	}

	private function add_error( $msg ) {
		$this->messages['error'][] = $msg;
	}

	private function add_warning( $msg ) {
		$this->messages['updated'][] = $msg;
	}

	function save_fields_err(&$errors, $update, &$user) {
		foreach($this->messages['error'] as $err) {
			$errors->add('lp_twitter', $err);
		}
		return $errors;
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
		if ( $hook != 'profile.php' )
			return $hook;

		wp_enqueue_style( 'livepress_admin', LP_PLUGIN_URL_BASE . 'css/wp-admin.css' );
		return $hook;
	}

	/**
	 * Extends a user's profile with some user-specific options
	 * @author tddewey
	 *
	 * @param $user object WP User object for the user being edited
	 */
	function user_fields( $user ) {

		// Hide form based on permission to edit this profile or edited user to publish posts
		if ( ! current_user_can( 'edit_user', $user->ID ) && user_can( $user, 'publish_posts' ) )
			return;

		$lp_twitter = get_user_meta( $user->ID, 'lp_twitter', true ); // returns empty string if not set, perfect

		$lp_options = get_option('livepress');

		// Only display this form if remote twitter is allowed by an admin.
		if ( isset( $lp_options['allow_remote_twitter'] ) && $lp_options['allow_remote_twitter'] == 'allow' ):
		?>
		<h3>LivePress</h3>
		<table class="form-table">
			<tr>
				<th><label for="lp_twitter">Publish from Twitter</label></th>
				<td class="input-prepend">
					<span class="add-on">@</span><input type="text" name="lp_twitter" id="lp_twitter" value="<?php echo esc_attr( $lp_twitter ); ?>" class="regular-text" />
					<table class="description">
						<tr>
							<td><code>#lpon</code></td>
							<td>Tweet this with a blog title to start publishing from Twitter</td>
						</tr>
						<tr>
							<td></td>
							<td>All tweets in between are live published to one post</td>
						</tr>
						<tr>
							<td><code>#lpoff</code></td>
							<td>Tweet this on your last update to stop</td>
						</tr>
					</table>
				</td>
			</tr>
		</table>
		<?php
		endif;
	}

	/**
	 * Save the user settings
	 * @author tddewey
	 *
	 * @param $user_id integer user ID being updated
	 *
	 * @return integer returns the $user_id regardless of success or failure.
	 */
	function save_fields( $user_id ) {

		// Check permissions and nonce.
		if ( ! current_user_can( 'edit_user', $user_id ) && wp_verify_nonce( $_POST['_wpnonce'] ) )
			return $user_id;

		$old_lp_twitter = get_user_meta( $user_id, 'lp_twitter', true ); // returns empty string if not set, perfect
		$lp_twitter = sanitize_text_field( $_POST['lp_twitter'] );
		if($old_lp_twitter != $lp_twitter) {
			$user = get_userdata( $user_id );

			$options = get_option(livepress_administration::$options_name);
			$livepress_com = new livepress_communication($options['api_key']);

			$error_message = ''; 
			try {
				$return_code = $livepress_com->manage_remote_post_from_twitter( $lp_twitter, $user->user_login );
			} catch ( livepress_communication_exception $e ) {
				$return_code = $e->get_code();
				$error_message = $e->getMessage();
			}

			if ( $return_code == 403 ) { /* User not found at livepress, or password invalid */
				$la = new livepress_administration();
				$error_message = $livepress_com->get_last_error_message();
				if ( ! $la->enable_remote_post( $user_id ) ) {
					$this->add_error( "Can't create user at livepress side: ", $error_message );
				} else {
					$error_message = '';
					try {
						$return_code = $livepress_com->manage_remote_post_from_twitter( $lp_twitter, $user->user_login );
					} catch ( livepress_communication_exception $e ) {
						$return_code = $e->get_code();
						$error_message = $e->getMessage();
					}
				}
			}

			if ( $return_code != 200 && $return_code != "OK." ) {
				if ( strlen( $error_message ) > 0 ) {
					$this->add_error( "Problem with setting twitter user: " . $error_message ); // Show existing error
				} else {
					$this->add_error( "Problem with setting twitter user: error #" . $return_code ); // Show error code if no msg
				}
			} else { // No error
				if ( empty( $lp_twitter ) ) { // None left, delete meta
					delete_user_meta( $user_id, 'lp_twitter' );
				} else { // Update meta with current lp_twitter
					update_user_meta( $user_id, 'lp_twitter', $lp_twitter );
				}
			}
		}

		return $user_id;
	}

}

$livepress_user_settings = new livepress_user_settings();

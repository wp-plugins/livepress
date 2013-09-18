<?php
/**
 * Creates and populates the menu items for the admin bar status menu.
 * The status menu displays a different icon depending on the status and, on hover,
 * provides status information.
 */

require_once 'livepress-config.php';

class livepress_admin_bar_status_menu {

	private $options = array();

	function __construct() {
		add_action( 'admin_bar_menu', array( $this, 'admin_bar_menu' ), 100, 1 ); // priority influences position
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue' ) );

		add_action( 'wp_ajax_check_status', array( $this, 'ajax_status' ) );

		add_action( 'wp_ajax_livepress-disable-global', array( $this, 'disable' ) );
		add_action( 'wp_ajax_livepress-enable-global', array( $this, 'enable' ) );

		$this->livepress_config = livepress_config::get_instance();
		$this->options = get_option( livepress_administration::$options_name );
	}

	/**
	 * Enqueue a stylesheets and scripts to handle the LivePress toolbar.
	 */
	function enqueue() {
		if ($this->livepress_config->script_debug()) {
			wp_enqueue_script( 'livepress-toolbar', LP_PLUGIN_URL_BASE . 'js/livepress-admin-bar.full.js', array( 'jquery' ) );
		} else {
			wp_enqueue_script( 'livepress-toolbar', LP_PLUGIN_URL_BASE . 'js/livepress-admin-bar.min.js', array( 'jquery' ) );
		}

		wp_enqueue_style( 'livepress_main_sheets', LP_PLUGIN_URL_BASE . 'css/livepress.css' );
	}

	/**
	 * Adds status menu to the admin bar.
	 * Ideally, each status comes with an action to take. The action requires permission.
	 *
	 * Also ideally, this just hooks into a LivePress status API.
	 *
	 * @author tddewey
	 *
	 * @param $wp_admin_bar object the WP_Admin_Bar object
	 *
	 * @return void
	 */
	function admin_bar_menu( $wp_admin_bar ) {

		$class = 'livepress-status-menu';

		// TODO: Ideally there would be central API for getting the LivePress status. ~tddewey
		$status = self::get_status();

		$wp_admin_bar->add_menu( array(
			'id'     => 'livepress-status',
			'title'  => '<span class="ab-icon"></span><span class="ab-label">' . __( 'LivePress', 'livepress' ) . '</span>',
			'href'   => '',
			'sticky' => true,
			'meta'   => array(
				'title' => 'connected' == $status ? 
					__( 'LivePress connected.', 'livepress' ) :
					__( 'LivePress connection error.', 'livepress' ),
				'class' => $class . ' ' . $status,
			),
		) );
	}

	/**
	 * Check the status of the LivePress Server API.
	 *
	 * Method makes a GET request to check the current blog status.  If the request
	 * returns OK, it's assumed that the server is fine. On error, assume an arror. If
	 * LivePress is disabled, return disabled  .
	 *
	 * @author Eric Mann
	 *
	 * @return string Current API status. connected|disconnected|disabled
	 */
	private function get_status() {
		$api_key = $this->options['api_key'];

		$status = 'disconnected';
		$enabled = get_option( 'livepress_globally_enabled', "enabled" );

		// Check if the system is disabled
		if ( $enabled === "disabled" ) {
			$status = 'disabled';
		} else {
			if ( ! class_exists( 'WP_Http' ) )
				include_once( ABSPATH . WPINC. '/class-http.php' );

			$post_vars = array(
				'address' => get_bloginfo( 'url' ),
				'api_key' => $api_key
			);

			//request_content_from_livepress('/blog/get', 'post', $post_vars)
			$response = wp_remote_post(
				$this->livepress_config->livepress_service_host() . '/blog/get',
				array( 'reject_unsafe_urls' => false, 'body' => $post_vars )
			);

			if ( !  is_wp_error( $response ) && $response['response']['code'] < 300 ) {
				$status = 'connected';
			}
		}

		return $status;
	}

	/**
	 * AJAX overload of get_status() for immediately returning the API's current status. Enables checking status via JS.
	 *
	 * @author Eric Mann
	 */
	public function ajax_status() {
		echo $this->get_status();

		die();
	}

	public function enable() {
		if ( ! wp_verify_nonce( $_POST['nonce'], 'livepress-enable-global' ) ) {
			echo 'invalid';
			die();
		}

		update_option( 'livepress_globally_enabled', "enabled" );

		$this->ajax_status();
	}

	public function disable() {
		if ( ! wp_verify_nonce( $_POST['nonce'], 'livepress-disable-global' ) ) {
			echo 'invalid';
			die();
		}

		$post_id = (int) $_POST['post_id'];

		$status = array();
		$status['automatic'] = 0;
		$status['live'] = 0;

		update_post_meta( $post_id, '_livepress_live_status', $status );

		update_option( 'livepress_globally_enabled', "disabled" );

		$this->ajax_status();
	}
}

$livepress_admin_bar_status_menu = new livepress_admin_bar_status_menu();
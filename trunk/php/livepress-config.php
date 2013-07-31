<?php
/**
 * Livepress configuration
 *
 * @package Livepress
 */

/**
 * This file centralizes configuration options read from the config file or the host framework.
 */

require_once 'livepress-config_file.php';

class livepress_config {
	private $configurable_options = array (
		'STATIC_HOST'               => 'http://static.livepress.com',
		'LIVEPRESS_SERVICE_HOST'    => 'http://api.livepress.com:3000',
		'OORTLE_VERSION'            => '1.5',
		'LIVEPRESS_CLUSTER'         => 'livepress.com',
		'LIVEPRESS_VERSION'         => '1.0',
		'TIMESTAMP_HTML_TEMPLATE'   => '<span class="livepress-timestamp">###TIME###</span>',
		'TIMESTAMP_TEMPLATE'        => 'G:i',
		'AUTHOR_TEMPLATE'           => '<span class="livepress-update-author">###AUTHOR###</span>',
		'DEBUG'                     => FALSE,
		'SCRIPT_DEBUG'              => FALSE,
		'JABBER_DOMAIN'             => 'livepress.com',
		'PLUGIN_SYMLINK'            => FALSE,
		'SCRAPE_HOOKS'              => FALSE,
	);
	private static $singleton_instance = null;

	public static function get_instance() {
		if(!isset(self::$singleton_instance)) {
			self::$singleton_instance = new self;
		}
		return self::$singleton_instance;
	}

	/**
	 * Contructor that assigns the wordpress hooks, initialize the
	 * configurable options and gets the wordpress options set.
	 */
	private function __construct() {
		$this->initialize_configurable_options();
	}

	private function initialize_configurable_options() {
		$config_file = new livepress_config_file(dirname(__FILE__) .'/../config');
		$options = $config_file->get_options();
		$this->configurable_options = array_merge($this->configurable_options, $options);
	}

	public function static_host() {
		return $this->configurable_options['STATIC_HOST'];
	}

	public function lp_ver() {
		return array(
			$this->configurable_options['OORTLE_VERSION'],
			$this->configurable_options['LIVEPRESS_CLUSTER'],
			$this->configurable_options['LIVEPRESS_VERSION']
		);
	}

	public function livepress_service_host() {
		return $this->configurable_options['LIVEPRESS_SERVICE_HOST'];
	}

	public function debug() {
		return $this->configurable_options['DEBUG'];
	}

	public function script_debug() {
		return $this->configurable_options['SCRIPT_DEBUG'] || (defined('SCRIPT_DEBUG') && SCRIPT_DEBUG === true);
	}

	public function plugin_symlink() {
		return $this->configurable_options['PLUGIN_SYMLINK'];
	}

	public function scrape_hooks() {
		return $this->configurable_options['SCRAPE_HOOKS'];
	}

	public function get_option($option_name) {
		$option_name = strtoupper($option_name);

		if (!isset($this->configurable_options[$option_name])) {
			throw new Exception("Invalid livepress option.");
		}

		return $this->configurable_options[$option_name];
	}

	/**
	 * Get the option from the host framework (currently only WP)
	 * @param string $option_name
	 * @return mixed anything that can be saved
	 */
	public function get_host_option($option_name) {
		return get_option($option_name);
	}
}
?>

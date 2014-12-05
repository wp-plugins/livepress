<?php
/*
Plugin Name: LivePress
Plugin URI:  http://www.livepress.com
Description: Richly-featured live blogging for WordPress.
Version:     1.1.0
Author:      LivePress Inc.
Author URI:  http://www.livepress.com
*/

define( 'LP_PLUGIN_VERSION', '1.1.0' ); // Please sync this with Version in header
define( 'PLUGIN_NAME', 'livepress' );
define( 'LP_PLUGIN_SYMLINK', FALSE );
define( 'LP_PLUGIN_PATH', plugin_dir_path( __FILE__ ) );

if ( LP_PLUGIN_SYMLINK  ) {
	define( 'LP_PLUGIN_URL', plugins_url( PLUGIN_NAME . '/' ) );
} else if ( defined( 'WPCOM_IS_VIP_ENV' ) && false !== WPCOM_IS_VIP_ENV ) {
	define( 'LP_PLUGIN_URL', plugins_url( PLUGIN_NAME . '/', __DIR__ ) );
} else {
	define( 'LP_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
}

define( 'LP_STORE_URL', 'http://livepress.com/' ); // Store powered by Easy Digital Downloads
define( 'LP_ITEM_NAME', 'LivePress' );

function livepress_load_plugin_textdomain() {
	load_plugin_textdomain( 'livepress', false, plugin_basename( LP_PLUGIN_PATH ) . '/languages/' );
}

add_action( 'init', 'livepress_load_plugin_textdomain' );

require 'php/livepress-boot.php';

<?php
/*
Plugin Name: LivePress
Plugin URI:  http://www.livepress.com
Description: Enables WordPress to post live using the LivePress API.
Version:     1.0.4
Author:      LivePress Inc.
Author URI:  http://www.livepress.com
*/

define( 'LP_PLUGIN_VERSION', '1.0.4' ); // Please sync this with Version in header
define( 'PLUGIN_NAME', 'livepress' );

define( 'LP_STORE_URL', 'http://livepress.com/' ); // Store powered by Easy Digital Downloads
define( 'LP_ITEM_NAME', 'LivePress' );

function livepress_load_plugin_textdomain() {
	load_plugin_textdomain( 'livepress', false, plugin_basename( dirname( __FILE__ ) ) . '/languages/' );
}

add_action( 'init', 'livepress_load_plugin_textdomain' );

require 'php/livepress-boot.php';

?>
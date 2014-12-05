<?php
if ( !defined( 'WP_UNINSTALL_PLUGIN' ) )
	exit();

require_once 'php/livepress-collaboration.php';
require_once 'php/livepress-blogging-tools.php';
require_once 'php/livepress-administration.php';
require_once 'php/livepress-post-format-controller.php';

global $wpdb;

// Merge children of all live posts
$lp_updater = LivePress_PF_Updates::get_instance();
$blogging_tools = new LivePress_Blogging_Tools();
$live_posts = $blogging_tools->get_all_live_posts();
foreach( $live_posts as $the_post ){
	$lp_updater->merge_children( $the_post );
}
// Clear the list of live posts
delete_option( 'livepress_live_posts' );
delete_option( 'livepress_version' );
delete_option( 'livepress_license_status' );

Collaboration::uninstall();

$options = get_option( LivePress_Administration::$options_name );
$livepress_com = new LivePress_Communication($options['api_key']);
$livepress_com->reset_blog();

$users = get_users();
foreach ( $users as $user ) {
	$option_name = $wpdb->prefix . LivePress_Administration::$options_name;
	delete_user_meta( $user->ID, $option_name );
}
delete_option( LivePress_Administration::$options_name );

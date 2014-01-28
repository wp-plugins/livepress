<?php
/**
 * LivePress boot.
 */

// @todo Add comments for each require.
require_once( 'livepress-updater.php' );
require_once( 'livepress-compatibility-fixes.php' );
require_once( 'livepress-administration.php' );
require_once( 'livepress-collaboration.php' );
require_once( 'livepress-template.php' );
require_once( 'livepress-feed.php' );
require_once( 'livepress-xmlrpc.php' );
require_once( 'livepress-themes-helper.php' );
require_once( 'livepress-wp-utils.php' );
require_once( 'livepress-admin-bar-status-menu.php' );
require_once( 'livepress-user-settings.php' );
require_once( 'livepress-admin-settings.php' );
require_once( 'livepress-blogging-tools.php' );
require_once( 'livepress-post-format-controller.php' );
require_once( 'livepress-fix-twitter-oembed.php' );

// Handle i10n/i18n
add_action( 'plugins_loaded', 'livepress_init' );

// Handle plugin install / upgrade
add_action( 'activate_' . PLUGIN_NAME . '/livepress.php', 'LivePress_Administration::plugin_install' );
add_action( 'plugins_loaded',                             'LivePress_Administration::install_or_upgrade' );

if ( ! defined( 'WPCOM_IS_VIP_ENV' ) || false === WPCOM_IS_VIP_ENV ) {
	add_action( 'deactivate_' . PLUGIN_NAME . '/livepress.php', 'LivePress_Administration::deactivate_livepress' );
}

add_action( 'init', 'LivePress_Updater::instance' );

// The fixes should run after all plugins are initialized
add_action( 'init', 'LivePress_Compatibility_Fixes::instance', 100 );

if ( defined( 'XMLRPC_REQUEST' ) && constant( 'XMLRPC_REQUEST' ) ) {
	add_action( 'init', 'LivePress_XMLRPC::initialize' );
}

add_action( 'init', 'LivePress_Themes_Helper::instance' );

// Custom Feeds (PuSH)
add_action( 'wp', 'LivePress_Feed::initialize' );

// Admin menu
add_action( 'admin_menu', 'LivePress_Administration::initialize' );


// Ajax response on server-side
add_action( 'wp_ajax_api_key_validate',                    'LivePress_Administration::api_key_validate' );
add_action( 'wp_ajax_post_to_twitter',                     'LivePress_Administration::post_to_twitter_ajaxed' );
add_action( 'wp_ajax_get_twitter_avatar',                  'LivePress_Administration::get_twitter_avatar' );
add_action( 'wp_ajax_check_oauth_authorization_status',    'LivePress_Administration::check_oauth_authorization_status' );
add_action( 'wp_ajax_collaboration_comments_number',       'Collaboration::comments_number' );
add_action( 'wp_ajax_collaboration_get_live_edition_data', 'Collaboration::get_live_edition_data' );
add_action( 'wp_ajax_im_integration',                      'LivePress_IM_Integration::initialize' );

//add_action('init', 'register_im_follower_handler');

// Live Blogging Tools
$blogging_tools = new LivePress_Blogging_Tools();
$blogging_tools->setup_tabs();
add_action( 'wp_ajax_get_blogging_tools',   array( $blogging_tools, 'ajax_render_tabs' ) );
add_action( 'wp_ajax_update-live-notes',    array( $blogging_tools, 'update_author_notes' ) );
add_action( 'wp_ajax_update-live-comments', array( $blogging_tools, 'update_live_comments' ) );
add_action( 'wp_ajax_update-live-status',   array( $blogging_tools, 'toggle_live_status' ) );

add_action( 'manage_posts_custom_column' , array( $blogging_tools, 'display_posts_livestatus' ) , 10, 2 );

add_action( 'init', 'alter_category_update_count_callback', 100 );

/**
 * Override the default update_count_callback for the category taxonomy
 *
 * @since  1.0.6
 */
function alter_category_update_count_callback() {
	global $wp_taxonomies;
	if ( ! taxonomy_exists( 'category' ) )
		return false;

	$cat_tax_callback = &$wp_taxonomies['category']->update_count_callback;
	$cat_tax_callback = 'livepress_category_update_count_callback';
}

/**
 * Alter the category post counts to exclude the live subposts
 *
 * Note: Only called when counts are updated (eg. post added or removed)
 *
 * @param  String $terms    Array of terms
 * @param  Object $taxonomy Passed taxonomy
 *
 * @since  1.0.6
 */
function livepress_category_update_count_callback( $terms, $taxonomy ) {
	global $wpdb;
	foreach ( (array) $terms as $term ) {
		do_action( 'edit_term_taxonomy', $term, $taxonomy );

		$count = (int) $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM $wpdb->term_relationships, $wpdb->posts WHERE $wpdb->posts.ID = $wpdb->term_relationships.object_id AND post_parent=0 AND term_taxonomy_id = %d", $term ) );

		$wpdb->update( $wpdb->term_taxonomy, array( 'count' => (int) $count ), array( 'term_taxonomy_id' => $term ) );

		do_action( 'edited_term_taxonomy', $term, $taxonomy );
	}
}

/**
 * Add custom column to post list.
 *
 * @param array  $columns   Array of columns
 * @param string $post_type Post type.
 * @return array Filtered array of columns.
 */
function add_livepress_status_column( $columns, $post_type ) {
	if ( 'post' == $post_type ) {
		$columns = array_merge( $columns, array( 'livepress_status' => esc_html__( 'LivePress Status', 'livepress' ) ) );
	}
	return $columns;
}
add_filter( 'manage_posts_columns' , 'add_livepress_status_column', 10, 2 );

/**
 * When the site's URL changes, automatically inform
 * the LivePress API of the change.
 */
function livepress_update_blog_name() {
	$settings = get_option( 'livepress' );
	$api_key  = isset( $settings['api_key'] ) ? $settings['api_key'] : '';
	$comm     = new LivePress_Communication( $api_key );

	$comm->validate_on_livepress( site_url() );
}
add_action( 'update_option_blogname', 'livepress_update_blog_name' );

/**
 * Add content CSS.
 *
 * @param $init
 * @return mixed
 */
function add_content_css( $init ) {
	$css_for_tinymce     = LP_PLUGIN_URL . 'tinymce/css/inside.css';
	$css                 = LP_PLUGIN_URL . 'css/livepress.css';
	$init['content_css'] = $css . ',' . $css_for_tinymce;
	return $init;
}

/**
 * Render LivePress Real-time Tools.
 */
function livepress_render_dashboard() {
	global $post_type;
	if($post_type != 'post') return;

	add_meta_box(
		'lp-dashboard',
		esc_html__( 'LivePress Real-time Tools', 'livepress' ),
		'livepress_dashboard_template',
		'post',
		'side',
		'high'
	);
}
add_filter( "tiny_mce_before_init", "add_content_css" );

function livepress_init() {
	load_plugin_textdomain( 'livepress', false, plugin_basename( LP_PLUGIN_PATH ) . '/languages/' );
}

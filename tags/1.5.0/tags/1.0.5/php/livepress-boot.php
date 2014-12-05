<?php
require_once 'livepress-updater.php';
require_once 'livepress-compatibility-fixes.php';
require_once 'livepress-administration.php';
require_once 'livepress-collaboration.php';
require_once 'livepress-im_integration.php';
require_once 'livepress-template.php';
require_once 'livepress-feed.php';
require_once 'livepress-xmlrpc.php';
require_once 'livepress-themes-helper.php';
require_once 'lp-wp-utils.php';
require_once 'livepress-admin-bar-status-menu.php';
require_once 'livepress-user-settings.php';
require_once 'livepress-admin-settings.php';
require_once 'livepress-blogging-tools.php';
require_once 'livepress-post-format-controller.php';

// Handle i10n/i18n
add_action( 'plugins_loaded', 'livepress_init' );

// Handle plugin install / upgrade
add_action( 'activate_' . PLUGIN_NAME . '/livepress.php', 'livepress_administration::install_or_upgrade' );
add_action( 'plugins_loaded',                             'livepress_administration::install_or_upgrade' );

add_action( 'init', 'livepress_updater::instance' );
// The fixes should run after all plugins are initialized
add_action( 'init', 'livepress_compatibility_fixes::instance', 100 );
if ( defined( 'XMLRPC_REQUEST' ) && constant( 'XMLRPC_REQUEST' ) ) {
	add_action( 'init', 'livepress_xmlrpc::initialize' );
}
add_action( 'init', 'livepress_themes_helper::instance' );

// Custom Feeds (PuSH)
add_action( 'wp', 'livepress_feed::initialize' );

// Admin menu
add_action( 'admin_menu', 'livepress_administration::initialize' );

// Ajax response on server-side
add_action( 'wp_ajax_api_key_validate',                    'livepress_administration::api_key_validate' );
add_action( 'wp_ajax_post_to_twitter',                     'livepress_administration::post_to_twitter_ajaxed' );
add_action( 'wp_ajax_get_twitter_avatar',                  'livepress_administration::get_twitter_avatar' );
add_action( 'wp_ajax_check_oauth_authorization_status',    'livepress_administration::check_oauth_authorization_status' );
add_action( 'wp_ajax_collaboration_comments_number',       'Collaboration::comments_number' );
add_action( 'wp_ajax_collaboration_get_live_edition_data', 'Collaboration::get_live_edition_data' );
add_action( 'wp_ajax_im_integration',                      'ImIntegration::initialize' );

add_action('init', 'register_im_follower_handler');

// Live Blogging Tools
$blogging_tools = new LivePress_Blogging_Tools();
$blogging_tools->setup_tabs();
add_action( 'wp_ajax_get_blogging_tools',   array( $blogging_tools, 'ajax_render_tabs' ) );
add_action( 'wp_ajax_update-live-notes',    array( $blogging_tools, 'update_author_notes' ) );
add_action( 'wp_ajax_update-live-comments', array( $blogging_tools, 'update_live_comments' ) );
add_action( 'wp_ajax_update-live-status',   array( $blogging_tools, 'toggle_live_status' ) );
//add_action( 'wp_ajax_merge-children',       array( $blogging_tools, 'ajax_merge_children' ) );

add_action( 'manage_posts_custom_column' , array( $blogging_tools, 'display_posts_livestatus' ) , 10, 2 );

/* Add custom column to post list */
function add_livepress_status_column( $columns ) {
    return array_merge( $columns,
        array( 'livepress_status' => __( 'LivePress Status', 'livepress' ) ) );
}
add_filter( 'manage_posts_columns' , 'add_livepress_status_column' );


/**
 * When the site's URL changes, automatically inform the LivePress API of the change.
 */
function livepress_update_blog_name() {
	$settings = get_option( 'livepress' );
	$api_key = isset( $settings['api_key'] ) ? $settings['api_key'] : '';
	$comm = new livepress_communication( $api_key );

	$comm->validate_on_livepress( site_url() );
}
add_action( 'update_option_blogname', 'livepress_update_blog_name' );

function register_im_follower_handler() {
	if ( is_user_logged_in() ) {
		add_action( 'wp_ajax_new_im_follower', 'ImIntegration::static_subscribe_im_follower' );
	} else {
		add_action( 'wp_ajax_nopriv_new_im_follower', 'ImIntegration::static_subscribe_im_follower' );
	}
}

function add_content_css( $init ) {
    $css_for_tinymce = LP_PLUGIN_URL_BASE . 'tinymce/css/inside.css';
    $css = LP_PLUGIN_URL_BASE . 'css/livepress.css';
    $init['content_css'] = $css . ',' . $css_for_tinymce;
    //$init['theme_advanced_styles'] = “Feature Headline=feature; Large Paragraph=lgTxt”;
    return $init;
}

function livepress_render_dashboard() {
    global $post_type;
    if($post_type != 'post') return;
    // add_meta_box( $id, $title, $callback, $page, $context, $priority, $callback_args );
    // http://codex.wordpress.org/Function_Reference/add_meta_box
    add_meta_box(
        'lp-dashboard',
        'LivePress Real-time Tools',
        'livepressDashboardTemplate',
        'post',
        'side',
        'high'
    );
}

add_filter( "tiny_mce_before_init", "add_content_css" );
if ( livepress_config::get_instance()->plugin_symlink() ) {
    define( 'LP_PLUGIN_URL_BASE', plugins_url( PLUGIN_NAME . '/' ) );
} else {
    define( 'LP_PLUGIN_URL_BASE', trailingslashit( plugin_dir_url( dirname(__FILE__) ) ) );
}

function livepress_init() {
	load_plugin_textdomain( 'livepress', false, dirname( plugin_basename( __FILE__ ) ) . '/languages/' );
}
?>
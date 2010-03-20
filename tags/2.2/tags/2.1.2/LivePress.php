<?php
/*
Plugin Name: Live+Press
Version: 2.1.2
Plugin URI: http://code.google.com/p/livepress/
Description: Live+Press allows Wordpress posts to be automatically crossposted to a LiveJournal user blogs. This fork of the plugin is licensed under GPLv3. All contributions and suggestions are welcome.  More plugin details and help can be found at the plugin home page on google code. Originally written by <a href="http://jason.goldsmith.us/">Jason Goldsmith</a>
Author URI: http://digsite.net/livepress
Author: Tania Morell (aka digsite)
*/

//require_once(ABSPATH . '/wp-includes/pluggable-functions.php');
require_once(ABSPATH . '/wp-includes/class-IXR.php');

// Add LivePress Styles
function LivePress_Style($postID)
{
    echo '<link rel="stylesheet" href="wp-content/plugins/livepress/LivePress/LivePress.css" type="text/css" />';
}

$unt_lp_clientid = 'WordPress-LivePress/2.0';
$unt_livepress_options = get_option("unt_livepress_options");
$unt_livepress_logins = get_option("unt_livepress_logins");
if (!isset($unt_livepress_logins)) {
    $journals = array();
} else {
    $journals = $unt_livepress_logins;
}

require_once('LivePress/lpadmin.php');

if($unt_livepress_options['general']['usetags'])
{
	require_once('LivePress/lptags.php');
}
if($unt_livepress_options['general']['usemoods'])
{
	require_once('LivePress/lpmoods.php');
}
if($unt_livepress_options['general']['usemusic'])
{
	require_once('LivePress/lpmusic.php');
}
//if($unt_livepress_options['general']['useextras'])
//{
	require_once('LivePress/lpextras.php');
//}
//if($unt_livepress_options['general']['usesynch'])
//{
	require_once('LivePress/lpsynch.php');
//}

add_action('wp_head', 'LivePress_Style');
?>

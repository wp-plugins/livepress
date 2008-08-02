<?php
/*
Plugin Name: Live+Press
Version: 2.0.2
Plugin URI: http://www.digsite.net/livepress/
Description: Live Press is a Live Journal compatibility plugin for Word Press. Features include support for Live Journal Tags, Moods, Music, User Pictures, Posting to a Live Journal account and Editing Entries on Live Journal (if they have been posted with Live Press). Version 2.0 is an update of Version 1.99.9 what is an updated version of Unteins' LivePress 1.5.2 and 1.99 (my initial 'fixes' were incorporated into the latter version). The original plugin can be found here: http://somuchgeek.com/code/livepress/
Author: Unteins (Jason Goldsmith), with compatibility fixes by CreepiGurl, and additional fixes and enhancements for Wordpress 2.5.x by Digsite (Tania Morell)
Author URI: http://somuchgeek.com
*/

//require_once(ABSPATH . '/wp-includes/pluggable-functions.php');
require_once(ABSPATH . '/wp-includes/class-IXR.php');

// Add LivePress Styles
function LivePress_Style($postID)
{
    echo '<link rel="stylesheet" href="wp-content/plugins/LivePress_2.0/LivePress/LivePress.css" type="text/css" />';
}

$unt_lp_clientid = 'WordPress-LivePress/1.99.9';
$unt_livepress_options = get_option("unt_livepress_options");
$journals = $unt_livepress_options['journals'];

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
if($unt_livepress_options['general']['useextras'])
{
	require_once('LivePress/lpextras.php');
}
if($unt_livepress_options['general']['usesynch'])
{
	require_once('LivePress/lpsynch.php');
}

add_action('wp_head', 'LivePress_Style');
?>

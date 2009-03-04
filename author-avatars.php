<?php
/*
Plugin Name: Author avatars
Plugin URI: http://wordpress.org/extend/plugins/author-avatars/
Description: Adds a <a href="widgets.php">widget</a> that shows avatars of the blog users so that people can see what you look like. This uses the standard avatar to retrieve the images. You can size, label, filter by roles/usernames, order...
Version: 0.6
Author: <a href="http://mind2.de">Benedikt Forchhammer</a>, Idea: <a href="http://bearne.com">Paul Bearne</a>
*/

// The current version of the author avatars plugin. Needs to be updated every time we do a version step.
define('AUTHOR_AVATARS_VERSION', '0.6');
// List of all version, used during update check. (Append new version to the end and write an update__10_11 method on AuthorAvatars class if needed)
define('AUTHOR_AVATARS_VERSION_HISTORY', serialize(Array('0.1', '0.2', '0.3', '0.4', '0.5', '0.5.1', '0.6')));

require_once('lib/AuthorAvatars.class.php');
new AuthorAvatars();

?>
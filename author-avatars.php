<?php
/*
Plugin Name: Author avatars
Plugin URI: http://wordpress.org/extend/plugins/author-avatars/
Description: Adds a <a href="widgets.php">widget</a> that shows avatars of the blog users so that people can see what you look like. This uses the standard avatar to retrieve the images. You can size, label, filter by roles/usernames, order...
Version: 0.2
Author: <a href="http://mind2.de">Benedikt Forchhammer</a>, Idea: <a href="http://bearne.com">Paul Bearne</a>
*/

// The current version of the author avatars plugin. Needs to be updated every time we do a version step.
define('AUTHOR_AVATARS_VERSION', '0.2');

require_once('lib/AuthorAvatars.class.php');
new AuthorAvatars();

?>
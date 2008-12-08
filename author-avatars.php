<?php
/*
Plugin Name: Author avatars
Plugin URI: http://wordpress.org/extend/plugins/author-avatars/
Description: Adds a <a href="widgets.php">widget</a> that shows avatars of the blog users so that people can see what you look like. This uses the standard avatar to retrieve the images. You can size, label, filter by roles/usernames, order...
Version: 0.2
Author: <a href="http://mind2.de">Benedikt Forchhammer</a>, Idea: <a href="http://bearne.com">Paul Bearne</a>
*/

require_once('lib/AuthorAvatarsWidget.class.php');

// Create an object for the widget and register it.
$author_avatars_multiwidget = new AuthorAvatarsWidget();
add_action( 'widgets_init', array($author_avatars_multiwidget,'register') );

?>
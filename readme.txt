=== Plugin Name ===
Contributors: bforchhammer, pbearne
Donate link:
Tags: Avatar, Author, Editor, Image, Photo, Picture, Profile, Random, Sidebar, Thumbnail, User, Widget, Wpmu
Requires at least: 2.6
Tested up to: 2.7
Stable tag: 0.3

Adds a widget that shows avatars of the blog users so that people can see what you look like...

== Description ==

This plugin provides a widget which allows you to show avatars of blog users.

The widget can be configured to

*   Show a custom title
*   Only show specific user groups and/or hide certain users
*   Limit the number of users shown
*   Change the sort order of users or show in random order
*   Adjust the size of user avatars

The plugin makes use of built in wordpress (core) functions to retrieve user information / get avatars.

The plugin has been developed for wpmu 2.6. and tested on wp 2.6. and wp 2.7.

As of version 0.2 the plugin uses [Alex Tingle's "MultiWidget" class](http://blog.firetree.net/2008/11/30/wordpress-multi-widget/). The plugin should automatically upgrade widgets from the old version (0.1), if anyone has any problem drop us a note. In the worst case you will have to reconfigure the widget(s).

Planned Features/Ideas:

*   Provide tag to display widget content in pages/posts
*   Show users from multiple blogs (wpmu)

== Installation ==

1. Upload the `author-avatars` folder to the `/wp-content/plugins/` directory
1. Activate the plugin through the 'Plugins' menu in WordPress
1. Enable and configure the widget as usual on the Design / Widgets page.

== Changelog ==

Version 0.3

*    Fixed error that broke some javascript on "edit post" pages in wordpress 2.7

Version 0.2:

*    Widget: added avatar preview image to the control panel
*    Widget: added option to link the user/avatar to their respective "author page"
*    Widget: hiddenusers also allows user ids now (e.g. 1 for "admin")
*    Refactored the plugin to use Alex Tingle's MultiWidget class

== Screenshots ==

1. Very simple set up of the widget on an empty blog.
2. The Widget configuration panel.

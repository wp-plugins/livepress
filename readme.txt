=== Plugin Name ===
Contributors: bforchhammer, pbearne
Donate link:
Tags: Avatar, Author, Editor, Image, Photo, Picture, Profile, Shortcode, Random, Sidebar, Thumbnail, User, Widget, Wpmu
Requires at least: 2.6
Tested up to: 2.7
Stable tag: 0.5

Display lists of avatars from blog users using widgets or shortcodes.


== Description ==

This plugin provides a widget and a [shortcode](http://codex.wordpress.org/User:Bforchhammer/Author_Avatars_ShortCode_Documentation) which allow you to show lists of avatars of blog users.

The widget can be configured to

*   Show a custom title
*   Only show specific user groups and/or hide certain users
*   Limit the number of users shown
*   Change the sort order of users or show in random order
*   Adjust the size of user avatars
*   Show users from the current blog, all blogs or a selection of blogs (on WPMU)
*   Group users by their blog (when showing from multiple blogs), and show the blog name above each grouping (experimental).

All features available in the widget are also available using a shortcode which means you can insert avatar lists whereever you want!

The plugin makes use of built in wordpress (core) functions to retrieve user information and get avatars.

The plugin has been developed for wpmu 2.6. and tested on wp 2.6. and wp 2.7.

Planned Features/Ideas:

*   Shortcode creation wizard for WYSIWYG Editor
*   User information popup on rollover
*   Advanced user display configuration / templates
*   Any more ideas or suggestions? [tell us about it](mailto:b.forchhammer@mind2.de)!



== Installation ==

1. Upload the `author-avatars` folder to the `/wp-content/plugins/` directory
1. Activate the plugin through the 'Plugins' menu in WordPress
1. Enable and configure the widget as usual on the Design / Widgets page.

[Look at this page](http://codex.wordpress.org/User:Bforchhammer/Author_Avatars_ShortCode_Documentation) to find out how to use the [authoravatars] shortcode.

[Changelog](http://codex.wordpress.org/User:Bforchhammer/Author_Avatars_Changelog)

== Screenshots ==

1. Very simple set up of the widget on an empty blog.
2. The Widget configuration panel.
3. Examples of what the [authoravatars] shortcode can do


== Frequently asked questions ==

= Shortcode, huh? =

A shortcode is a tag like <code>[authoravatars]</code> which you can insert into a page or post to display a list of users on that post/page. You can read more about shortcodes in general in the wordpress codex, for example [here](http://codex.wordpress.org/Using_the_gallery_shortcode) or [here](http://codex.wordpress.org/Shortcode_API).

= How do I use the author avatar shortcode? =

It's simple: just add [authoravatars] into your post and hit save!
There's also a number of [parameters](http://codex.wordpress.org/User:Bforchhammer/Author_Avatars_ShortCode_Documentation) available!

= I can't get my widget to show users from multiple blogs! =

Make sure you have enabled the "blog filter" in Site Admin / Author Avatars for the blog on which you are trying to use this feature on. By default this is only enabled for the root blog (blog id = 1).

And you are running [Wordpress MU](http://mu.wordpress.org/), right?
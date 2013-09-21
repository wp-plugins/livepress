=== LivePress ===
Requires at least: 3.5
Tested up to: 3.6
Tags: LivePress, live, live blogging, liveblogging, realtime, collaboration, Twitter
Stable tag: 1.0.4

LivePress is a hosted live blogging solution that integrates seamlessly with your WordPress blog.

== Description ==

LivePress converts your blog into a fully real-time information resource.  Your visitors see posts update in real-time.  Comments are pushed out immediately as well.

Take advantage of an enhanced mode for the WordPress editor featuring live comment moderation, streaming Twitter search and more.  Or, live blog entirely via Twitter.

To use LivePress, you must register for an authorization key at https://livepress.com

== Installation ==

1. Upload `livepress-wp` folder into `/wp-content/plugins/` directory.
2. Activate the plugin through the 'Plugins' menu in WordPress.
3. Register for a LivePress API key from https://livepress.com
4. Go to Settings >> LivePress, enter your authorization key into field, and press "Check".
5. Configure settings as you wish and press save. You can use all the power of LivePress now!

== Frequently Asked Questions ==

= How do I add a header with an avatar image, time and author's name on updates? =
Use the shortcode [livepress_metainfo].  There is a button to automatic add it to the TinyMCE editor. You can use it in 2 ways:

* Without any attributes. Then the plugin will add the info based on the settings you choose.
* With the attributes already filled in.  This allows you to specify only the elements you would like to appear.

= My theme best looks if LivePress tags are placed at some other place =
You can disable automatic livepress tags injection, by adding into theme's functions.php this line:
    define("LIVEPRESS_THEME", true);
After that, you must edit theme files and add at places you think best this tags:
    <?php do_action('livepress_update_box') ?> -- on index and single page, where notification about new posts arrived should appears
    <?php do_action('livepress_widget') ?> -- on single page, where livepress widget should appears
To fine-tune options, add in CSS file required overrides for #livepress{} selector. Please note, that styles for theme are loaded before styles of plugin, so your overrides should be marked as !important.

= How to set different live update background color =
Define filter "livepress_background_color", that should return color you need.

= Live post title update not working! =
Define filter "livepress_title_css_selector", it should return CSS celector, that should be used to get title to update.
Filter must be exact for current post, so include post id if need. Default are #post-{post_id} (where {post_id} are current post id).

= Javascript files are loaded from strange looking paths with result 404 =
It seems that you have symlinked plugin directory instead of copying it.
To fix this behavior rename config.sample to config and check PLUGIN_SYMLINK value.

== Hooks and Filters ==

LivePress is fully extensible by third-party applications using WordPress-style action hooks and filters.

= Add a Tab to the Live Blogging Tools Palette =

The "livepress_setup_tabs" hook will pass an instance of the LivePress_Blogging_Tools class to your function.  You can
add a tab by calling the `add_tab()` method of that class and passing in the title of the tab, its ID, and either content
for the tab or a reference to a callback function that generates output.

Example:

    add_action( 'livepress_setup_tabs', 'my_setup_tabs' );
    function my_setup_tabs( $tools ) {
        $tools->add_tab( array(
            'id'      => 'my_custom_tab',
            'title'   => __( 'My Custom Tab' ),
            'content' => '<div><p>This is some custom content.</p></div>'
        ) );
    }

= Remove a Tab to the Live Blogging Tools Palette =

All of the default tabs in the toole palette can be removed by name using the "livepress_setup_tabs" action hook and calling
the `remove_tab()` method of the passed class.

Example:

    add_action( 'livepress_setup_tabs', 'remove_author_notes' );
    function remove_author_notes( $tools ) {
        $tools->remove_tab( 'live-notes' );
    }

The default tab IDs used in LivePress are:

* Comments               => 'live-comments'
* Twitter Search         => 'live-twitter-search'
* Manage Remove Authors  => 'live-remote-authors'
* Author Notes           => 'live-notes'

== Screenshots ==

1. Just create a new post with livepress enabled.  Anyone who has the main blog page open will see the notification.
2. New update sent -- it appears for all readers of this post at the same time.

== Changelog ==

= 1.0.4 =
* Miscellaneous bug fixes

= 1.0.3 =
* Update connection to LivePress api to use port 80
* Display post live or not live status on post list page
* Make post status live or not live more visible in post editor
* Fix issue where a large number of comments would cause live blogging tools tab to grow too large
* Better notifications when adding new Twitter handle
* Fix Facebook embedding issue

= 1.0.2 =
* Reduce Twitter search history from 500 to 200 items
* Attempt to fix discrepancy between autoscroll/chime settings
* Rename 'Post' to 'Send to Editor' in live Twitter search
* Improve JS binding on live update editor
* Miscellaneous UI refinements

= 1.0.1 =
* Patch remote author count returning invalid data
* Pluralize HUD counts (remote authors, comments, visitors)
* Allow Twitter feed to pause on click of appropriate button or hover

= 1.0 =
* Initial public release

= 0.7.4 =
* Update API server references for staging

= 0.7.3 =
* Debug remote, automatic updates

= 0.7.2 =
* Update translation file

= 0.7.1 =
* Various UI tweaks to rectify user test errors and misses

= 0.7 =
* Implement post "regions" as post formats of "Aside"
* Modify HTMLPurifier to use a custom post type for storing the definition cache

= 0.6 =
* Fix a JS inclusion bug causing issues on the admin screen

== Upgrade Notice ==

= 1.0 =
None

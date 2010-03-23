=== Live+Press ===
Contributors: Tania Morell (aka "digsite")
Donate link: https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=YPPLF9T3ZFT28
Tags: crossposting, cross post, livejournal, livepress, crosspost
Requires at least: 2.3
Tested up to: 2.9.2
Stable tag: 2.2.1

Crosspost blog entries to LiveJournal automatically or on a post by post basis. Crosspostable options include user pic, current music, current mood, security "friends" group, with ability to disable comments on LJ side, and insert a linkback to original wordpress post.


== Description ==

Live+Press allows you to crosspost Wordpress entries to a LiveJournal account either automatically or on a post by post basis. Crosspostable options include user pic, current music, current mood, custom friends lists, disable or enable comments, and insertion of a link back to the original wordpress entry.  


= Support =

This plugin is licensed under GPLv3. All contributions and suggestions are welcome.

Please report bugs to the <a href="http://groups.google.com/group/livepressplugin">Support Forum</a>


= Features =

Current version features list:

    * cross posting full posts or exerpts with lj_cuts tags
    * cross posting of User Pics, Moods, Music, and Tags
    * choose LiveJournal security level and custom friends lists
    * enable / disable comments on livejournal side
    * include a link back to the original wordpress post
    * cross posts either Tags or Categories as tags on LiveJournal
    * post delete also deletes livejournal post
    * automatic crosspost email and cell phone text (multimedia posts possible with PostMaster plugin)    
    * non-roman alphabet support: Ie, Cyrillic, Kanji, Sanskrit, Greek, Arabic, Hebrew, etc



= Known Caveats =

*	Quick edits will not update a crossposted entry


== Upgrade Notice ==

= 2.2.1 =
Upgrade because it's shiny and new! 


== Installation ==

Using FTP

    * download the plugin to your local computer
    * Extract the plugin archive
    * ftp the entire livepress/ directory to your wordpress plugin directory
    * Go to your WordPress Dashboard -> General -> Writing and make sure XML-RPC is enabled.
    * Go to your plugins admin page and activate the LivePress plugin
    * Go to the Settings -> LivePress to configure your plugin on the admin page 

Using shell access

    * cd to your wp-contents/plugins directory of your wordpress installation
    * download the plugin archive directly
    * # wget http://downloads.wordpress.org/plugin/livepress.x.x.x.zip
    * unzip the files
    * unzip livepress.x.x.x.zip
    * If you ran this as root, you may need to fix file ownerships
    * chown -R <wpuser> livepress
    * again, check file ownership
    * Go to your WordPress Dashboard -> General -> Writing and make sure XML-RPC is enabled.
    * Go to your plugins admin page and activate the LivePress plugin
    * Go to the Settings -> LivePress to configure your plugin on the admin page 

Crossposting Text Via Email

    * Configure wordpress to use email to post to the blog (http://codex.wordpress.org/Post_to_your_blog_using_email)
    * Configure the "Email Crossposting" section in the LP admin page

Crossposting Image/Video Via Email 

    * Follow instruction above, plus..
    * Install and configure the PostMaster plugin. 
    * LivePress will crosspost the entry to Livejournal along with the multimedia content.


== Screenshots ==

1. Screenshot Live+Press Extras
2. Screenshot Admin Page


== Frequently Asked Questions ==

= How do I crosspost an excerpt? =

Type in an excerpt in the "exerpt" section of wordpress' new-post page then select "excerpt only" in the lj extras section of the page.


== Change Log ==

= Current version: =

= 2.2.1 =
*	Added stripslashes to LP data on its way out of the database to prevent recursive backslashes
*	Removed Userpic text box option. No longer used.
*	Corrected bug with e-mail crossposting 


= Older Versions: =

= _by Tania Morell (aka "digsite")_ =

= 2.2 =
* 	LJ logins beyond the first one failed to authenticate.
*	Saving a draft no longer triggers a crosspost.
*	Replaced SCRIPT_URI with is_admin in two places in lpextras.php
*	A broken LJ site no longer affects LP or WP as a result of LP
*	Added CSS style formatting on the admin page to make options easier to follow
*	Changed how LP processes post content before crossposting - using apply_filters
*	Added support for Cyrillic alphabet / Russian language
*	Addressed complaints with apostrophes, commas, slashes in the body and title

= 2.1.11 =
* fixed unpopulated dropdowns, uncommented switcher.

= 2.1.10 =
* too many connection attempts by the plugin cause livejournal to block the source IP.

= 2.1.9 =
* LiveJournal linkback links directly to the post page instead of the blog main page.
* fixed problem where saving a draft would result in a published post to livejournal.

= 2.1.8 =
* fixed problem with breaking blog when lj is down

= 2.1.7 =

= 2.1.6 =
* fixed problem getting and storing postid from LJ when posting via email.
* fixed missing linkbacktext from email post.

= 2.1.5 =
= 2.1.4 =
= 2.1.3 =
= 2.1.2 =
= 2.1.1 =
= 2.1.0 =
= 2.0.7 =
= 2.0.6 =
= 2.0.5 =
= 2.0.4 =
= 2.0.3 =
= 2.0.2 =
= 2.0.1 =
= 2.0 =

= _by creepigurl_ =

= 1.99.9 =

= _by Jason Goldsmith (aka "unteins")_ =

= 1.99 =
= 1.5.2 =
= 1.5.1.3 =
= 1.2.0 =


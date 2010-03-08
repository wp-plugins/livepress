=== Live+Press ===
Contributors: Tania Morell (aka "digsite")
Donate link: none
Tags: crossposting, cross post, livejournal, livepress
Requires at least: 2.3
Tested up to: 2.9.2
Stable tag: 2.1.10

Crosspost blog entries to LiveJournal automatically or on a post by post basis. Crosspostable options include user pic, current music, current mood, security "friends" group, with ability to disable comments on LJ side, and insert a linkback to original wordpress post.

== Description ==

Livepress is a plugin for wordpress which allows the user to crosspost journal entries to a LiveJournal blog account.

You can crosspost blog entries automatically or on a post by post basis. Crosspostable options include user pic, current music, current mood, security "friends" group, with ability to disable comments on LJ side, and insert a linkback to original wordpress post.

This fork of the plugin is licensed under GPLv3. All contributions and suggestions are welcome.

Originally written by <a href="http://jason.goldsmith.us/>Jason Goldsmith (aka "unteins")</a>

Please report bugs to the <a href="http://groups.google.com/group/livepressplugin">Support Forum</a>


== Features ==

Current version features list:

    * cross posting full posts or exerpts with lj_cuts tags
    * cross posting of User Pics, Moods, Music, and Tags
    * choose LJ security level and custom friends lists
    * enable / disable comments on livejournal side
    * include a link back to the original wordpress post
    * (new with 2.0) cross posts Tags instead of Categories
    * (new with 2.0) post delete also deletes livejournal post
    * (new with 2.0) automatic crosspost email and cell phone text and multimedia posts 


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


== Screenshots ==

1. Screenshot Live+Press Extras
2. Screenshot Admin Page


== Frequently Asked Questions ==

Q: How do I crosspost an excerpt.
A: Type in an excerpt in the "exerpt" section of wordpress' new-post page then select "excerpt only" in the lj extras section of the page.

== Releases ==
Current version: 2.1.10

Older Versions:

_by digsite_
  * 2.1.10
	- too many connection attempts by the plugin cause livejournal to block the source IP.
  * 2.1.9
	- LiveJournal linkback links directly to the post page instead of the blog main page.
	- fixed problem where saving a draft would result in a published post to livejournal.
  * 2.1.8
	- fixed problem with breaking blog when lj is down
  * 2.1.7
  * 2.1.6
	- fixed problem getting and storing postid from LJ when posting via email.
	- fixed missing linkbacktext from email post.
  * 2.1.5
  * 2.1.4
  * 2.1.3
  * 2.1.2
  * 2.1.1
  * 2.1.0
  * 2.0.7
  * 2.0.6
  * 2.0.5
  * 2.0.4
  * 2.0.3
  * 2.0.2
  * 2.0.1
  * 2.0

_by creepigurl_
  * 1.99.9 

_by unteins_
  * 1.99
  * 1.5.2
  * 1.5.1.3
  * 1.2.0



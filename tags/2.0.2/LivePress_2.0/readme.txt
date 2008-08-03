=== Live+Press 2.0.2 ===
Contributors: digsite
Previous Contributors: unteins, creepigurl
Tags: crossposting, livejournal, livepress
Requires at least: 2.2
Tested up to: 2.6
Stable tag: 2.0.2
Donate link: none

LiveJournal Crosspost Plugin for WordPress

-------------------------------------------------------

== Description ==

Livepress is a plugin for wordpress which allows the user to automatically crosspost journal entries to a LiveJournal? account.

This fork of the plugin is licensed under GPLv3. All contributions and suggestions are welcome.

Please report bugs under "Issues" section. 


== Features ==

Current version features list: (2.0.2)

    * (Tested with Wordpress 2.5.1 and 2.6)
    * cross posting full posts or exerpts with lj_cuts tags
    * cross posting of User Pics, Moods, Music, and Tags
    * choose LJ security level and custom friends lists
    * enable / disable comments on livejournal side
    * include a link back to the original wordpress post
    * (new) cross posts Tags instead of Categories
    * (new) post delete also deletes livejournal post
    * (new) automatic crosspost email and cell phone text and multimedia posts 


== Installation ==

Using FTP

    * download the plugin to your local computer
    * Extract the plugin archive
    * ftp the entire LivePress_2?.0 directory to your wordpress plugin directory
    * ftp LivePress_2?.0/class-IXR.php to your wordpress wp-includes/ directory
    * Go to your plugins admin page and activate the LivePress? plugin
    * Go To the Settings -> LivePress? to configure your plugin on the admin page 

Using shell access

    * cd to your wp-contents/plugins directory of your wordpress installation
    * download the plugin archive directly
    * wget http://livepress.googlecode.com/files/livepress_2.0.1.tar.gz
    * untar the files
    * tar -xvzf livepress_2.0.1.tar.gz
    * If you ran this as root, you may need to fix file ownerships
    * chown -R <wpuser> LivePress_2.0
    * copy ./LivePress_2?.0/class-IXR.php to ../../wp-includes/
    * again, check file ownership
    * Go to your plugins admin page and activate the LivePress? plugin
    * Go To the Settings -> LivePress? to configure your plugin on the admin page 


== Frequently Asked Questions ==

For a FAQ visit: http://code.google.com/p/livepress/


== Screenshots ==

For a Screenshots visit: http://code.google.com/p/livepress/


== Releases ==
Current version
Version 2.0.2

Older Versions
Version 2.0.1
Version 2.0
Version 1.99.9
Version 1.99
Version 1.5.2
Version 1.5.1.3
Version 1.2.0
<?php
/**
 * Author Avatars class
 * 
 * Performs updates and initialises widgets.
 */
class AuthorAvatars {
	/**
	 * Constructor
	 */	
	function AuthorAvatars() {
		if (!$this->system_check()) {
			echo 'Author avatars: system check failed.';
		}
		elseif(!$this->install_check()) {
			echo 'Author avatars: install check failed.';
		}
		elseif(!$this->update_check()) {
			echo 'Author avatars: update check failed.';			
		}
		else {
			$this->init_widgets();
		}
	}
	
	/**
	 * Check we got everything we need to use the plugin
	 */
	function system_check() {
		if (!defined('AUTHOR_AVATARS_VERSION')) die('Author Avatars: constant AUTHOR_AVATARS_VERSION is not defined.');
		return true;
	}
	
	/**
	 * Init author avatar widget
	 */
	function init_widgets() {
		// include necessary file(s).
		require_once('AuthorAvatarsWidget.class.php');
		
		// Create an object for the widget and register it.
		$author_avatars_multiwidget = new AuthorAvatarsWidget();
		add_action( 'widgets_init', array($author_avatars_multiwidget,'register') );
	}
		
	/**
	 * Number of the currently installed version of the plugin.
	 * @access private
	 */
	var $__version_installed = null;
	
	/**
	 * returns the version number of the currently installed plugin.
	 */ 
	function get_installed_version($reset = false) {
		if ($this->__version_installed == null || $reset) {
			$this->__version_installed = get_option('author_avatars_version');
		}
		return $this->__version_installed;
	}
	
	/**
	 * updates the number of the currently installed version.
	 */
	function set_installed_version($value) {
		$oldversion = $this->get_installed_version();
		if (empty($oldversion)) {
			add_option('author_avatars_version', $value);
		}
		else {
			update_option('author_avatars_version', $value);
		}
		$this->__version_installed = $value;
	}
	
	/**
	 * Check if author avatars is installed and install it if necessary
	 * @return false if an error occured, true otherwise
	 */
	function install_check() {
		$version = $this->get_installed_version(true);
		
		// Version not empty -> plugin already installed
		if (!empty($version)) return true;
		
		// Version empty: this means we are either on version 0.1 (which didn't have this option) or on a fresh install.
		else {
			// check if the 0.1 version is installed
			if (get_option('widget_blogauthors')) {
				// set installed version to 0.1
				$this->set_installed_version('0.1');
				return true;
			}
			// else it's probably a new/fresh install
			else {
				if ($this->install()) {
					$this->set_installed_version(AUTHOR_AVATARS_VERSION);
					return true;
				}
				else {
					echo 'are we in here??';
					return false; // install failed.
				}
			}
		}
	}
	
	/**
	 * install the plugin
	 * @return true if install was successful, false otherwise
	 */
	function install() {
		// nothing to install
		return true;
	}
	
	/**
	 * Check if there's any need to do updates and start updates if necessary
	 * @return false if an error occured, true otherwise
	 */
	function update_check() {
		if ($this->get_installed_version() != AUTHOR_AVATARS_VERSION) $this->do_updates();
		return true;
	}
	
	/**
	 * tries to do all updates until we're up to date
	 */
	function do_updates() {
		$step_count = 0;
		$max_number_updates = 10;
		while ($this->get_installed_version() != AUTHOR_AVATARS_VERSION) {
			if ($step_count >= $max_number_updates) {
				break;
				die('more than 10 updates.. something might be wrong...'); // FIXME: change error handling!?
			}
			$this->do_update_step();
			$step_count++;
		}
	}
	
	/**
	 * Does one version update, for example from version 0.1 to version 0.2, and updates the version number in the end.
	 */
	function do_update_step() {
		switch($this->get_installed_version()) {
			// update 0.1 -> 0.2
			case '0.1':
				if($this->update__01_02()) $this->set_installed_version('0.2');	
				else die('Author Avatars: update 0.1 to 0.2 failed.');
				break;
			
			// update 0.2 -> 0.3
			/*case '0.2':
				$this->set_installed_version('0.3');
				break;*/

			default: 
				die('Author Avatars: not good... not good at all. '); // FIXME: change error handling!?
		}
	}
	
	/**
	 * Do update step 0.1 to 0.2
	 */
	function update__01_02() {
		// update database: convert old widgets to new ones using the "MultiWidget" class.
		$old_widget = get_option('widget_blogauthors');
		$new_widget = $old_widget;
		foreach ($new_widget as $id => $widget) {
			$new_widget[$id]['__multiwidget'] = $id;
		}
		
		delete_option('widget_blogauthors');
		add_option('multiwidget_author_avatars', $new_widget);

		// update sidebar option
		$sidebars = get_option('sidebars_widgets');
		foreach ($sidebars as $i => $sidebar) {
			if(is_array($sidebar)) {
				foreach ($sidebar as $k => $widget) {
					$sidebars[$i][$k] = str_replace('blogauthors-', 'author_avatars-', $widget);
				}
			}
		}
		
		update_option('sidebars_widgets', $sidebars);
		
		// return true if update successful (FIXME)
		return true;
	}
}

?>
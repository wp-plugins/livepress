<?php 
/**
 * Class providing a sitewide settings page on WPMU systems.
 * Sitewide settings pages can only be seen by 
 */
class AuthorAvatarsSitewideAdminPanel {

	/**
	 * Holds a reference to the AuthorAvatarSettings class
	 */
	var $settings = null;
	
	/**
	 * Constructor
	 */
	function AuthorAvatarsSitewideAdminPanel() {
		// only init on wpmu sites...
		if (AA_is_wpmu()) $this->init();
	}
	
	/**
	 * Initialise the sitewide admin panel: register actions and filters
	 */
	function init() {
		if (is_null($this->settings)) $this->settings = AA_settings();
		add_action('admin_menu', array(&$this, 'add_submenu'));
	}
	
	/**
	 * Adds the settings page to the "Site Admin" menu 
	 */
	function add_submenu() {
		get_currentuserinfo();
		if (!is_site_admin()) return false; // only for site admins
		add_submenu_page('wpmu-admin.php', 'Sitewide Author Avatars Configuration', 'Author Avatar', 10, 'wpmu_author_avatars', array(&$this,'config_page'));
	}
	
	/**
	 * Renders the sitewide configuration page
	 */
	function config_page() {
		if ($_POST['action'] == 'update') $updated = $this->save_settings();
		else $updated = false;
		
		$this->render_config_page($updated);
	}
	
	function save_settings() {
		check_admin_referer();
		$settings = $_POST['settings_sitewide'];
		return $this->settings->save_sitewide($settings);
	}
	
	function render_config_page($updated) {
		echo '<div class="wrap">';
		
		if ($updated === true) {
			echo '<div id="message" class="updated fade"><p>'. __('Options saved.') .'</p></div>';
		}
		elseif (is_array($updated)) {
			echo '<div class="error"><p>'. implode('<br />',$updated) .'</p></div>';
		}
		
		echo '<h2>'. __('Sitewide Author Avatars Options') .'</h2>';
		
		echo '<form method="post" id="wpmu_author_avatars_settings">';
		echo '<h3>'. __('Avatar list settings') .'</h3>';
		echo '<table class="form-table">';
		$this->_render_blogfilter_active_setting();

		echo '</table>';
		echo FormHelper::input('hidden', 'action', 'update');
		echo '<p class="submit">';
		echo FormHelper::input('submit', 'wpmu_author_avatars_settings_save', __('Save Changes'));
		echo '</p>';
		echo '</form>';
		echo '</div>';
	}
	
	function _render_blogfilter_active_setting() {
		echo '<tr valign="top">';
		echo '<th scope="row">Enable blog filter</th><td>';
		_e('Select the blogs which you would like the blog filter to be enabled. Only blogs selected here can display users from other blogs.');
		echo '<br/>' . FormHelper::choice(
			'settings_sitewide[blog_filters_enabled]',
			AuthorAvatarsWidget::_get_all_blogs(),
			$this->settings->get_sitewide('blog_filters_enabled'),
			array('multiple' => true));
		echo '</td>';
		echo '</tr>';
	}
}

?>
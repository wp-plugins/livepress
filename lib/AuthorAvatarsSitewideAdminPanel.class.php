<?php 
/**
 * Class providing a sitewide settings page on WPMU systems.
 * Sitewide settings pages can only be seen by 
 */
class AuthorAvatarsSitewideAdminPanel {
	
	/**
	 * Constructor
	 */
	function AuthorAvatarsSitewideAdminPanel() {
		// only init on wpmu sites...
		if (is_wpmu()) $this->init();
	}
	
	/**
	 * Initialise the sitewide admin panel: register actions and filters
	 */
	function init() {
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
		
		return AA_settings()->save_sitewide($settings);
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
		echo '<input type="hidden" name="action" value="update" />';
		echo '<p class="submit"><input type="submit" name="wpmu_author_avatars_settings_save" value="'. __('Save Changes') .'" /></p>';
		echo '</form>';
		echo '</div>';
	}
	
	function _render_blogfilter_active_setting() {
		echo '<tr valign="top">';
		echo '<th scope="row">Enable blog filter</th><td>';
		_e('Select the blogs which you would like the blog filter to be enabled. Only blogs selected here can display users from other blogs.');
		echo $this->_form_select(
			'settings_sitewide[blog_filters_enabled]',
			AuthorAvatarsWidget::_get_all_blogs(),
			AA_settings()->get_sitewide('blog_filters_enabled'),
			true);
		echo '</td>';
		echo '</tr>';
	}
	
	/**
	 * Renders the given array $rows as a html <select> element.
	 *
	 * @access private
	 * @param $varname The name of the (form) element.
	 * @param $rows Associative array to build the select elements from. Array keys are the input "value"s, array values the input "label"s.
	 * @param $values Array of active values. For any keys in the $rows array that are present in this array, the element gets rendered as "selected".
	 * @param $multiple Boolean flag whether multiple values are allowed (true) or not (false, default).
	 * @return void
	 * @todo This method is a copy of AuthorAvatarsWidget::_form_select, therefore should be refactored according to DRY
	 */
	function _form_select($varname, $rows, $values=array(), $multiple = false) {
		$id = str_replace('--', '-', preg_replace('/[\W]/', '-', $varname));
		$name = $varname;
		if (!is_array($values)) $values = array($values);

		echo '<select id="'.$id.'" name="'.$name;
		if ($multiple) echo '[]" multiple="multiple" style="height: auto;';
		echo '">';
		foreach ($rows as $key => $label) {
			if (in_array($key, $values)) $selected = ' selected="selected"';
			else $selected = "";
			echo '<option value="'.$key.'"'.$selected.'>'.$label.'</option>';
		}
		echo '</select>';
	}
}

?>
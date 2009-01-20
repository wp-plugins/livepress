<?php
require_once('MultiWidget.class.php');

/**
 * Author Avatars Widget: displays avatars of blog users.
 */
class AuthorAvatarsWidget extends MultiWidget
{
	/**
	 * Default widget options
	 */
	var $defaults = array();
	
	/**
	 * Sets the defaults.
	 */
	function _setDefaults() {
		$this->defaults = Array(
			'title' => __('Blog Authors'),
			'hiddenusers' => '',
			'roles' => array('administrator', 'editor'),
			'blogs' => array(),
			'display' => array(
				0 => 'link_to_authorpage',
				'avatar_size' => '',
				'limit' => '',
				'order' => 'display_name',
			),
		);
	}
	
	/**
	 * Constructor: set up multiwidget (id_base, name and description)
	 */	
	function AuthorAvatarsWidget()
	{
		$this->_setDefaults();

		$this->MultiWidget(
			'author_avatars', // id_base
			'AuthorAvatars', // name
			array('description'=>__('Displays avatars of blog users.')), // widget options
			array('width' => '500px') // control options
		);
		
		add_action('wp_head', array(get_class($this), 'print_css_link'));
		add_action('wp_print_scripts', array(get_class($this), 'attach_scripts'));
	}
	
	/**
	 * Prints a <link> element pointing to the authoravatars widget stylesheet.
	 * This function is executed on the "wp_head" action.
	 *
	 * @return void
	 */
	function print_css_link() {
		echo '<link type="text/css" rel="stylesheet" href="' . WP_PLUGIN_URL . '/author-avatars/css/widget.css" />' . "\n";
	}
	
	/**
	 * Attaches scripts (using wp_enqueue_script) to the wp_print_scripts action.
	 *
	 * Note: the personalised jquery library includes jquery.ui.resizable. The files
	 * are only included on the widget admin pages, as they appear to conflict with
	 * some javascript on the post edit pages (wordpress 2.7).
	 *
	 * @return void
	 */
	function attach_scripts() {
		// only load the scripts on the widget admin page
		if (is_admin() && basename($_SERVER['PHP_SELF']) == 'widgets.php') { 
			wp_enqueue_script('author-avatars-jquery-ui', WP_PLUGIN_URL .'/author-avatars/js/jquery-ui-personalized-1.5.3.packed.js');
			wp_enqueue_script('author-avatars-widget-admin', WP_PLUGIN_URL .'/author-avatars/js/widget.admin.js');
		}
	}

	/**
	 * Echo widget content = list of blog users.
	 */
	function widget($args,$instance)
	{
		require_once('UserList.class.php');
	
		// parse hidden users string
		if (!empty($instance['hiddenusers'])) {
			$hiddenusers = explode(',', $instance['hiddenusers']);
			$hiddenusers = array_map('trim', $hiddenusers);
		}
		else {
			$hiddenusers = array();
		}
		
		$userlist = new UserList();
		
		$userlist->roles = $instance['roles'];
		$userlist->blogs = $instance['blogs'];
		$userlist->hiddenusers = $hiddenusers;
		
		if (is_array($instance['display'])) {
			$userlist->show_name = in_array('show_name', $instance['display']);
			$userlist->link_to_authorpage = in_array('link_to_authorpage', $instance['display']);
			$userlist->avatar_size = $instance['display']['avatar_size'];
			$userlist->limit = $instance['display']['limit'];
			$userlist->order = $instance['display']['order'];
		}
		
		// extract widget arguments
		extract($args, EXTR_SKIP);
		
		// build the widget html
		echo $before_widget;
		echo $before_title . $instance['title'] . $after_title;

		$userlist->output();
		
		echo $after_widget;
	}
	

	
	/**
	 * Updates a particular instance of the widget.
	 * This function is called every time the widget is saved, and used to validate the data.
	 *
	 * @access protected
	 * @param $new_instance The new widget options, sent from the widget control form.
	 * @param $old_instance The options of the old instance in case we're updating a widget. This is empty if we're creating a new widget.
	 * @param The instance of widget options which is saved to the database.
	 */
	function control_update($new_instance, $old_instance)
	{
		$instance = $old_instance;		
		$instance['title'] = wp_specialchars( $new_instance['title'] );
		$instance['hiddenusers'] = wp_specialchars ( $new_instance['hiddenusers'] );
		$instance['roles'] = (array) $new_instance['roles'];
		$instance['blogs'] = (array) $new_instance['blogs'];
		$instance['display'] = (array) $new_instance['display'];
		return $instance;
	}

	/**
	 * Builds the widget control form.
	 *
	 * @access protected
	 * @param $instance Array of widget options. If empty then we're creating a new widget.
	 * @return void
	 */
	function control_form($instance)
	{
		$instance = array_merge($this->defaults, $instance);
		extract($instance);
		
		$display_options = Array(
			'show_name' => __('Show Name'),
			'link_to_authorpage' => __('Link avatar to <a href="http://codex.wordpress.org/Author_Templates" target="_blank">author page</a>.'),
		);
		$order_options = Array(
			'user_id' => __('User Id'),
			'user_login' => __('Login Name'),
			'display_name' => __('Display Name'),
			'random' => __('Random'),
		);

		echo '<p>';
		$this->_form_input('text', 'title', 'Title: ', $title, array('class' => 'widefat') );
		echo '</p>';
		
		if ($this->_blog_selection_allowed()) {
			echo '<label><strong>Show users from blogs:</strong><br />';
			$this->_form_select('blogs', Array(-1 => "All") + $this->_get_all_blogs(), $blogs, true);
			echo '<br/><small>If no blog is selected only users from the current blog are displayed. </small></label>';
		}

		echo '<p><strong>Show roles:</strong><br />';
		$this->_form_checkbox_matrix('roles', $this->_get_all_roles(), $roles);
		echo '</p>';

		echo '<p>';
		$this->_form_input('text', 'hiddenusers', '<strong>Hidden users:</strong> ', $hiddenusers, array('class' => 'widefat'));
		echo '<small>(Comma separate list of user login ids)</small></p>';

		echo '<p><strong>Display options:</strong><br />';
		$this->_form_checkbox_matrix('display', $display_options, $display);
		//echo '<br />';
		echo '<label>Sorting order: <br />';
		$this->_form_select('display][order', $order_options, $display['order']);
		echo '</label>';
		echo '<br />';
		$this->_form_input('text', 'display][limit', 'Max. number of avatars shown:<br /> ', $display['limit']);
		echo '<br />';	
		$this->_form_input('text', 'display][avatar_size', 'Avatar Size:<br /> ', $display['avatar_size'], array('class' => 'avatar_size_input'));
		echo 'px';
		global $user_email;
		get_currentuserinfo();
		echo '<div class="avatar_size_preview" style="background-color: #666; border: 1px solid #eee; width: 200px; height: 200px; padding: 10px;">'. get_avatar($user_email, $display['avatar_size']) .'</div>'; 
		echo '</p>';
		
		$this->_form_input('hidden', 'submit', '', '1');
	}
	
	/**
	 * Renders the given array $rows as a list of checkboxes. If 
	 *
	 * @access private
	 * @param $varname The name of the (form) element.
	 * @param $rows Associative array to build the checkboxes from. Array keys are the input "value"s, array values the input "label"s.
	 * @param $values Array of active values. For any keys in the $rows array that are present in this array, the checkbox gets rendered as "checked".
	 * @return void
	 */
	function _form_checkbox_matrix($varname, $rows, $values) {
		foreach($rows as $key => $label) {
			$id = $this->get_field_id($varname);
			$name = $this->get_field_name($varname);
			$checked = in_array($key, $values) ? ' checked="checked"' : '';
			echo '<label><input id="'.$id.'" name="'.$name.'[]" type="checkbox" value="'.$key.'"'.$checked.' /> '.$label.'</label><br />';
		}
	}

	/**
	 * Renders a html <input> element.
	 *
	 * @access private
	 * @param $type The type of the input element.
	 * @param $varname The name of the (form) element.
	 * @param $label The label for the element.
	 * @param $value The value of the element.
	 * @param $htmlattr An optional array of html attributes.
	 * @return void
	 */
	function _form_input($type, $varname, $label="", $value="", $htmlattr = array()) {
		$id = $this->get_field_id($varname);
		$name = $this->get_field_name($varname);
		$attr = $this->_buildHtmlAttributes($htmlattr);
		
		$html = '<input id="'.$id.'" name="'.$name.'" type="'.$type.'" value="'.$value.'"'.$attr.' />';
		if (!empty($label)) $html = '<label>'.$label.$html.'</label>';
		echo $html;
	}
	
	/**
	 * Builds a string of html attributes from an associative array.
	 * 
	 * Example: 
	 * Array('title' => 'My title'); will be transformed into this string: [ title="My title"]
	 * 
	 * All attribute values are cleaned up using the function wp_specialchars().
	 *
	 * @access private
	 * @param $attributes Array of attributes
	 * @return string 
	 */
	function _buildHtmlAttributes($attributes) {
		if (!is_array($attributes)) return "";
		
		$string = "";
		foreach ($attributes as $key => $value) {
			$string .= ' '. $key . '="'. wp_specialchars($value) .'"';
		}
		return $string;
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
	 */
	function _form_select($varname, $rows, $values=array(), $multiple = false) {
		$id = $this->get_field_id($varname);
		$name = $this->get_field_name($varname);
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
	
	/** 
	 * Return true if we're on a wpmu site and the we're allowed to show users from multiple blogs.
	 */
	function _blog_selection_allowed() {
		require_once('helper.functions.php');
		return is_wpmu();
	}
	
	/**
	 * Override MultiWidget::get_field_id(). Cleans up the id before returning it as the form element id.
	 */
	function get_field_id($varname) {
		$varname = preg_replace('/[\W]/', '-', $varname);
		$varname = str_replace('--', '-', $varname);
		return parent::get_field_id($varname);
	}

	/**
	 * Retrieves all roles, and returns them as an associative array (key -> role name) 
	 *
	 * @access private
	 * @return Array of role names.
	 */
	function _get_all_roles() {
		global $wpdb;

		$roles_data = get_option($wpdb->prefix.'user_roles');
		$roles = array();
		foreach($roles_data as $key => $role) {
			$roles[$key] = $this->_strip_level($role['name']);
		}
		return $roles;
	}
	
	/**
	 * Retrieves all blogs, and returns them as an associative array (blog id -> blog name)
	 *
	 * The list only contains public blogs which are not marked as archived, deleted
	 * or spam and the list is ordered by blog name.
	 *
	 * @see http://codex.wordpress.org/WPMU_Functions/get_blog_list
	 * @access private
	 * @return Array of blog names
	 */
	function _get_all_blogs() {
		global $wpdb;

		$blogs = get_site_option( "author_avatars_blog_list_cache" );
		$update = false;
		if( is_array( $blogs ) ) {
			if( ( $blogs['time'] + 60 ) < time() ) { // cache for 60 seconds.
				$update = true;
			}
		} else {
			$update = true;
		}

		if( $update == true ) {
			$blogs = $wpdb->get_results( $wpdb->prepare("SELECT blog_id, path FROM $wpdb->blogs WHERE site_id = %d AND public = '1' AND archived = '0' AND mature = '0' AND spam = '0' AND deleted = '0'", $wpdb->siteid), ARRAY_A );

			$blog_list = array();
			foreach ( (array) $blogs as $details ) {
				$blog_list[ $details['blog_id'] ] = get_blog_option( $details['blog_id'], 'blogname', $details['path']) .' ('. $details['blog_id'] .')';
			}
			asort($blog_list);
			
			$blogs = $blog_list;
			unset($blog_list);
			
			update_site_option( "author_avatars_blog_list_cache", $blogs );			
		}
		
		return $blogs;
	}
	
	/**
	 * Strips the user level from a role name (see option user_roles)
	 *
	 * @access private
	 * @param $element A role name, $role['name']
	 * @return the clean role name without user level added on the end.
	 */
	function _strip_level($element) {
		$parts = explode('|', $element);
		return $parts[0];
	}
}
?>
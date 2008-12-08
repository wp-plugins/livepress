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
			'display' => array(
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
			array('description'=>__('Displays avatars of blog users.'))
		);
		
		add_action('wp_head', array(get_class($this), 'print_css_link'));
	}
	
	/**
	 * Prints a <link> element pointing to the authoravatars stylesheet.
	 * This function is executed on the "wp_head" action.
	 *
	 * @return void
	 */
	function print_css_link() {
		echo '<link type="text/css" rel="stylesheet" href="' . WP_PLUGIN_URL . '/author-avatars/css/widget.css" />' . "\n";
	}

	/**
	 * Echo widget content = list of blog users.
	 */
	function widget($args,$instance)
	{	
		// parse hidden users string
		if (!empty($instance['hiddenusers'])) {
			$hiddenusers = explode(',', $instance['hiddenusers']);
			$hiddenusers = array_map('trim', $hiddenusers);
		}
		else {
			$hiddenusers = array();
		}
		
		// get users
		$users = (array) $this->get_users_by_role($instance['roles']);
		// sort 'em
		$this->_sort($users, $instance['order']);
		
		// extract widget arguments
		extract($args, EXTR_SKIP);
		
		// build the widget html
		echo $before_widget;
		if (!empty($instance['title'])) echo $before_title . $instance['title'] . $after_title;

		$count = 0;
		echo '<div class="author-list">';
		foreach ($users as $user) {
			if (in_array($user->user_login, $hiddenusers)) continue;
			if ($limit > 0 && $count >= $instance['limit']) break;
			echo $this->format_user($user, $instance);
			$count++;
		}
		echo '</div>';	
		
		echo $after_widget;
	}
	
	
	
	/**
	 * Formats the given user as html.
	 *
	 * @param $user The user to format (object of type WP_User).
	 * @param $options The widget options.
	 * @return html string
	 */
	function format_user($user, $options = array()) {
		if (!is_array($options['display'])) $options['display'] = array();
		$show_name = in_array('show_name', $options['display']);
		$avatar_size = intval($options['display']['avatar_size']);
		if (!$avatar_size) $avatar_size = false;

		$roles = unserialize($user->meta_value);
		$role = implode(' ', array_keys($roles));
		$name = $user->display_name;

		$avatar = get_avatar($user->user_email, $avatar_size);
		$avatar = preg_replace('@alt=["\'][\w]*["\'] ?@', '', $avatar);
		$avatar = preg_replace('@ ?\/>@',' alt="'.$name.' ('.$role.')" title="'.$name.' ('.$role.')" />',$avatar);

		$divcss = array('user');
		if ($show_name) $divcss[] = 'with-name';

		$html = '<div class="'.implode($divcss, ' ').'">';
		$html .= '<span class="avatar">'. $avatar .'</span>';
		if ($show_name) $html .= '<span class="name">'. $name . '</span>';
		$html .= '</div>';

		return $html;
	}

	/**
	 * Returns a list of all users matching roles passed to this function.
	 *
	 * @param $roles array of roles, e.g. Array('contributor', 'subscriber', 'author', ...)
	 * @return array list of users
	 */
	function get_users_by_role($roles=false) {
		if (!is_array($roles)) return;
		$users_of_blog = (array) get_users_of_blog();

		$users = array();
		foreach ( $users_of_blog as $b_user ) {
			$b_roles = unserialize($b_user->meta_value);
			if (count(array_intersect(array_keys($b_roles), $roles))) {
				$users[] = $b_user;
			}
		}
		return $users;
	}
	
	/**
	 * Sorts the given array of users.
	 * 
	 * @access private
	 * @param $users Array of users (WP_User objects).
	 * @param $order The key to sort by. Can be one of the following: random, user_id, user_login, display_name.
	 * @param Sorted array of users.
	 */
	function _sort(&$users, $order) {
		switch ($order) {
			case 'random':
				shuffle($users);
				break;
			case 'user_id':
				usort($users, array('authoravatars', '_users_cmp_id'));
				break;
			case 'user_login':
				usort($users, array('authoravatars', '_users_cmp_login'));
				break;
			case 'display_name':
				usort($users, array('authoravatars', '_users_cmp_name'));
				break;
		}
	}

	/**
	 * Given two users, this function compares the user_ids
	 * 
	 * @access private
	 * @param $a of type WP_User
	 * @param $b of type WP_User
	 * @return result of a string compare of the user_ids.
	 */
	function _users_cmp_id($a, $b) {
		return strcmp($a->user_id, $b->user_id);
	}

	/**
	 * Given two users, this function compares the user_logins
	 * 
	 * @access private
	 * @param $a of type WP_User
	 * @param $b of type WP_User
	 * @return result of a string compare of the user_logins.
	 */

	function _users_cmp_login($a, $b) {
		return strcmp($a->user_login, $b->user_login);
	}

	/**
	 * Given two users, this function compares the user's display names
	 * 
	 * @access private
	 * @param $a of type WP_User
	 * @param $b of type WP_User
	 * @return result of a string compare of the user display names.
	 */

	function _users_cmp_name($a, $b) {
		return strcmp($a->display_name, $b->display_name);
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
		);
		$order_options = Array(
			'user_id' => __('User Id'),
			'user_login' => __('Login Name'),
			'display_name' => __('Display Name'),
			'random' => __('Random'),
		);

		echo '<p>';
		$this->_form_input('text', 'title', 'Title: ', $title, 'widefat' );
		echo '</p>';

		echo '<p><strong>Show roles:</strong><br />';
		$this->_form_checkbox_matrix('roles', $this->_get_all_roles(), $roles);
		echo '</p>';

		echo '<p>';
		$this->_form_input('text', 'hiddenusers', '<strong>Hidden users:</strong> ', $hiddenusers, 'widefat');
		echo '<small>(Comma separate list of user login ids)</small></p>';

		echo '<p><strong>Display options:</strong><br />';
		$this->_form_checkbox_matrix('display', $display_options, $display);
		//echo '<br />';
		echo '<label>Sorting order:<br />';
		$this->_form_select('display][order', $order_options, $display['order']);
		echo '</label>';
		echo '<br />';
		$this->_form_input('text', 'display][limit', 'Max. number of avatars shown:<br /> ', $display['limit']);
		echo '<br />';
		$this->_form_input('text', 'display][avatar_size', 'Avatar Size:<br /> ', $display['avatar_size']);
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
	 * @param $cssclass An optional css class for the element.
	 * @return void
	 */
	function _form_input($type, $varname, $label="", $value="", $cssclass = '') {
		$id = $this->get_field_id($varname);
		$name = $this->get_field_name($varname);
		if (!empty($cssclass)) $cssclass = ' class="'.$cssclass.'"';
		if ($checked) $checked = ' checked="checked"';
		$html = '<input id="'.$id.'" name="'.$name.'" type="'.$type.'" value="'.$value.'"'.$cssclass.' />';
		if (!empty($label)) $html = '<label>'.$label.$html.'</label>';
		echo $html;
	}

	/**
	 * Renders the given array $rows as a html <select> element.
	 *
	 * @access private
	 * @param $varname The name of the (form) element.
	 * @param $rows Associative array to build the select elements from. Array keys are the input "value"s, array values the input "label"s.
	 * @param $values Array of active values. For any keys in the $rows array that are present in this array, the element gets rendered as "selected".
	 * @return void
	 */
	function _form_select($varname, $rows, $values="") {
		$id = $this->get_field_id($varname);
		$name = $this->get_field_name($varname);
		if (!is_array($values)) $values = array($values);

		echo '<select id="'.$id.'" name="'.$name.'">';
		foreach ($rows as $key => $label) {
			if (in_array($key, $values)) $selected = ' selected="selected"';
			else $selected = "";
			echo '<option value="'.$key.'"'.$selected.'>'.$label.'</option>';
		}
		echo '</select>';
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
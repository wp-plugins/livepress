<?php
/*
Plugin Name: Author avatars
Plugin URI: http://wordpress.org/extend/plugins/author-avatars/
Description: Adds a <a href="widgets.php">widget</a> that shows avatars of the blog users so that people can see what you look like. This uses the standard avatar to retrieve the images. You can size, label, filter by roles/usernames, order...
Version: 0.1
Author: <a href="http://mind2.de">Benedikt Forchhammer</a>, Idea: <a href="http://bearne.com">Paul Bearne</a>
*/

authoravatars::init();

class authoravatars {

	/**
	 * Constructor: register widget functions with wordpress
	 */
	function init() {
		add_action('init', array('authoravatars', 'widget_register'));
		add_action('wp_head', array('authoravatars', 'print_css_link'));
	}

	/**
	 * Registers each instance of our widget on startup
	 * This function is executed on the "init" action.
	 */
	function widget_register() {
		if ( !$options = get_option('widget_authoravatars') ) $options = array();

		$widget_ops = array('classname' => 'widget_authoravatars', 'description' => __('Displays avatars of blog users...'));
		$control_ops = array('height' => 350, 'id_base' => 'authoravatars');
		$name = __('Blog Authors');

		$id = false;
		foreach ( array_keys($options) as $o ) {
			// Old widgets can have null values for some reason
			if ( !isset($options[$o]['title']) ) continue;

			// $id should look like {$id_base}-{$o}
			$id = "authoravatars-$o"; // Never never never translate an id
			wp_register_sidebar_widget( $id, $name, array('authoravatars', 'widget_output'), $widget_ops, array( 'number' => $o ));
			wp_register_widget_control( $id, $name, array('authoravatars', 'widget_control'), $control_ops, array( 'number' => $o ));
		}

		// If there are none, we register the widget's existance with a generic template
		if ( !$registered ) {
			wp_register_sidebar_widget( 'authoravatars-1', $name, array('authoravatars', 'widget_output'), $widget_ops, array( 'number' => -1 ) );
			wp_register_widget_control( 'authoravatars-1', $name, array('authoravatars', 'widget_control'), $control_ops, array( 'number' => -1 ) );
		}
	}

	/**
	 * Prints a <link> element pointing to the authoravatars stylesheet.
	 * This function is executed on the "wp_head" action.
	 */
	function print_css_link() {
		echo '<link type="text/css" rel="stylesheet" href="' . WP_PLUGIN_URL . '/author-avatars/css/widget.css" />' . "\n";
	}

	/**
	 * Builds widget output.
	 */
	function widget_output( $args, $widget_args = 1 ) {
		extract( $args, EXTR_SKIP );
		if ( is_numeric($widget_args) ) $widget_args = array( 'number' => $widget_args );
		$widget_args = wp_parse_args( $widget_args, array( 'number' => -1 ) );
		extract( $widget_args, EXTR_SKIP );

		// Data should be stored as array:  array( number => data for that instance of the widget, ... )
		$options = get_option('widget_authoravatars');
		if ( !isset($options[$number]) ) return;
		if ( !is_array($options[$number]['display'])) $options[$number]['display'] = array();
		$title = !empty($options[$number]['title']) ? $options[$number]['title'] : __('Blog Authors');
		$roles = $options[$number]['roles'];
		$limit = intval($options[$number]['display']['limit']);
		$order = $options[$number]['display']['order'];

		$hiddenusers = $options[$number]['hiddenusers'];
		if (!empty($hiddenusers)) {
			$hiddenusers = explode(',', $hiddenusers);
			$hiddenusers = array_map('trim', $hiddenusers);
		}
		else {
			$hiddenusers = array();
		}

		$users = (array) authoravatars::get_users_by_role($roles);
		authoravatars::_sort($users, $order);

		echo $before_widget;
		echo $before_title . $title . $after_title;

		$count = 0;
		echo '<div class="author-list">';
		foreach ($users as $user) {
			if (in_array($user->user_login, $hiddenusers)) continue;
			if ($limit > 0 && $count >= $limit) break;
			echo authoravatars::format_user($user, $options[$number]);
			$count++;
		}
		echo '</div>';
		echo $after_widget;
	}

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
	 * returns a list of all users matching roles passed to this function
	 * available roles are e.g. 'contributor', 'subscriber', 'author', ...
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

	function _users_cmp_id($a, $b) {
		return strcmp($a->user_id, $b->user_id);
	}

	function _users_cmp_login($a, $b) {
		return strcmp($a->user_login, $b->user_login);
	}

	function _users_cmp_name($a, $b) {
		return strcmp($a->display_name, $b->display_name);
	}

	function widget_control( $widget_args = 1 ) {
		global $wp_registered_widgets;
		static $updated = false; // Whether or not we have already updated the data after a POST submit

		if ( is_numeric($widget_args) ) $widget_args = array( 'number' => $widget_args );
		$widget_args = wp_parse_args( $widget_args, array( 'number' => -1 ) );
		extract( $widget_args, EXTR_SKIP );

		// Data should be stored as array:  array( number => data for that instance of the widget, ... )
		$options = get_option('widget_authoravatars');
		if ( !is_array($options) ) $options = array();

		// We need to update the data
		if ( !$updated && !empty($_POST['sidebar']) ) {
			// Tells us what sidebar to put the data in
			$sidebar = (string) $_POST['sidebar'];

			$sidebars_widgets = wp_get_sidebars_widgets();
			if ( isset($sidebars_widgets[$sidebar]) )
				$this_sidebar =& $sidebars_widgets[$sidebar];
			else
				$this_sidebar = array();

			foreach ( $this_sidebar as $_widget_id ) {
				// Remove all widgets of this type from the sidebar.  We'll add the new data in a second.  This makes sure we don't get any duplicate data
				// since widget ids aren't necessarily persistent across multiple updates
				if ( 'widget_authoravatars' == $wp_registered_widgets[$_widget_id]['callback'] &&
						isset($wp_registered_widgets[$_widget_id]['params'][0]['number']) ) {
					$widget_number = $wp_registered_widgets[$_widget_id]['params'][0]['number'];
					// the widget has been removed. "many-$widget_number" is "{id_base}-{widget_number}
					if ( !in_array( "authoravatars-$widget_number", $_POST['widget-id'] ) ) unset($options[$widget_number]);
				}
			}

			foreach ( (array) $_POST['widget-authoravatars'] as $widget_number => $widget_many_instance ) {
				// compile data from $widget_many_instance
				if ( !isset($widget_many_instance['title']) && isset($options[$widget_number]) ) // user clicked cancel
					continue;
				$title = wp_specialchars( $widget_many_instance['title'] );
				$hiddenusers = wp_specialchars ( $widget_many_instance['hiddenusers'] );
				$roles = (array) $widget_many_instance['roles'];
				$display = (array) $widget_many_instance['display'];
				$options[$widget_number] = array( 'title' => $title, 'roles' => $roles, 'hiddenusers' => $hiddenusers, 'display' => $display);
			}

			update_option('widget_authoravatars', $options);

			$updated = true; // So that we don't go through this more than once
		}

		// Here we echo out the form
		if ( -1 == $number ) { // We echo out a template for a form which can be converted to a specific form later via JS
			$title = $avatar_size = $limit = $hiddenusers = '';
			$roles = array('administrator', 'editor');
			$display = array();
			$number = '%i%';
			$order = 'display_name';
		} else {
			$title = attribute_escape($options[$number]['title']);
			$roles = (array) $options[$number]['roles'];
			$display = (array) $options[$number]['display'];
			$avatar_size = $display['avatar_size'];
			$limit = $display['limit'];
			$order = $display['order'];
			$hiddenusers = attribute_escape($options[$number]['hiddenusers']);
		}

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
		authoravatars::_form_input($number, 'text', 'title', 'Title: ', $title, 'widefat' );
		echo '</p>';

		echo '<p><strong>Show roles:</strong><br />';
		authoravatars::_form_checkbox_matrix($number, 'roles', authoravatars::_get_all_roles(), $roles);
		echo '</p>';

		echo '<p>';
		authoravatars::_form_input($number, 'text', 'hiddenusers', '<strong>Hidden users:</strong> ', $hiddenusers, 'widefat');
		echo '<small>(Comma separate list of user login ids)</small></p>';

		echo '<p><strong>Display options:</strong><br />';
		authoravatars::_form_checkbox_matrix($number, 'display', $display_options, $display);
		//echo '<br />';
		echo '<label>Sorting order:<br />';
		authoravatars::_form_select($number, 'display][order', $order_options, $order);
		echo '</label>';
		echo '<br />';
		authoravatars::_form_input($number, 'text', 'display][limit', 'Max. number of avatars shown:<br /> ', $limit);
		echo '<br />';
		authoravatars::_form_input($number, 'text', 'display][avatar_size', 'Avatar Size:<br /> ', $avatar_size);
		echo '</p>';

		authoravatars::_form_input($number, 'hidden', 'submit', '', '1');
	}


	function _form_checkbox_matrix($number, $varname, $rows, $values) {
		foreach($rows as $key => $label) {
			$id = authoravatars::_form_id($number, $key);
			$name = authoravatars::_form_name($number, $varname, true);
			$checked = in_array($key, $values) ? ' checked="checked"' : '';
			echo '<label><input id="'.$id.'" name="'.$name.'" type="checkbox" value="'.$key.'"'.$checked.' /> '.$label.'</label><br />';
		}
	}

	function _form_input($number, $type, $varname, $label="", $value="", $cssclass = '') {
		$id = authoravatars::_form_id($number, $varname);
		$name = authoravatars::_form_name($number, $varname);
		if (!empty($cssclass)) $cssclass = ' class="'.$cssclass.'"';
		if ($checked) $checked = ' checked="checked"';
		$html = '<input id="'.$id.'" name="'.$name.'" type="'.$type.'" value="'.$value.'"'.$cssclass.' />';
		if (!empty($label)) $html = '<label>'.$label.$html.'</label>';
		echo $html;
	}

	function _form_select($number, $varname, $rows, $values="") {
		$id = authoravatars::_form_id($number, $varname);
		$name = authoravatars::_form_name($number, $varname);
		if (!is_array($values)) $values = array($values);

		echo '<select id="'.$id.'" name="'.$name.'">';
		foreach ($rows as $key => $label) {
			if (in_array($key, $values)) $selected = ' selected="selected"';
			else $selected = "";
			echo '<option value="'.$key.'"'.$selected.'>'.$label.'</option>';
		}
		echo '</select>';
	}

	function _form_id($number, $key) {
		$key = preg_replace('/[\W]/', '-', $key);
		$key = str_replace('--', '-', $key);
		$id = 'widget-authoravatars-display-'.$number.'-'.$key;
		return $id;
	}

	function _form_name($number, $key, $array=false) {
		$name = 'widget-authoravatars['.$number.']['.$key.']';
		if ($array) $name .= '[]';
		return $name;
	}

	function _get_all_roles() {
		global $wpdb;

		$roles_data = get_option($wpdb->prefix.'user_roles');
		$roles = array();
		foreach($roles_data as $key => $role) {
			$name = explode('|', $role['name']);
			$roles[$key] = $name[0];
		}
		return $roles;
	}

	function _strip_level($element) {
		$parts = explode('|', $element);
		return $parts[0];
	}
}

?>
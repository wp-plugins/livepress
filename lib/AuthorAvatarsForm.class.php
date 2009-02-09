<?php

/**
 * Collection of functions for form fields used in author avatars widget and shortcode wizard
 */
class AuthorAvatarsForm {
	
	/**
	 * @var callback Callback for field "id" attributes.
     * @access private
	 */
	var $field_id_callback = false;
	
	/**
	 * @var callback Callback for field "name" attributes.
     * @access private
	 */
	var $field_name_callback = false;
	
	/**
	 * @var AuthorAvatarsSettings Reference to AuthorAvatarsSettings instance.
     * @access private
	 */
	var $settings = null;
	
	/**
	 * Constructor
	 */
	function AuthorAvatarsForm() {
		require_once('FormHelper.class.php');
		$this->settings = AA_settings();
	}
	
	/**
	 * Set a field id callback handler
	 *
	 * @access public
	 * @param callback $callback
	 * @return void
	 */
	function setFieldIdCallback($callback) {
		if (is_callable($callback)) {
			$this->field_id_callback = $callback;
		}
		else {
			echo 'Error: callback function is not callable in AuthorAvatarsForm::setFieldIdCallback().';
			$this->field_id_callback = null;
		}
	}

	/**
	 * Set a field id callback handler
	 *
	 * @access public
	 * @param callback $callback
	 * @return void
	 */
	function setFieldNameCallback($callback) {
		if (is_callable($callback)) {
			$this->field_name_callback = $callback;
		}
		else {
			echo 'Error: callback function is not callable in AuthorAvatarsForm::setFieldNameCallback().';
			$this->field_name_callback = null;
		}
	}

	/**
	 * Return the field id 
	 *
	 * @access protected
	 * @param string $id
	 * @return string
	 */
	function _getFieldId($id) {
		if ($this->field_id_callback != null) {
			$id = call_user_func($this->field_id_callback, $id);
		}
		return $id;
	}
	
	/**
	 * Return the field name 
	 *
	 * @access protected
	 * @param string $name
	 * @return string
	 */
	function _getFieldName($name) {
		if ($this->field_name_callback != null) {
			$name = call_user_func($this->field_name_callback, $name);
		}
		return $name;
	}
	
	/**
	 * Renders the blog filter select field.
	 */
	function renderFieldBlogs($values, $name = 'blogs') {
		$html = '';
		if ($this->settings->blog_selection_allowed()) {
			$id = $this->_getFieldId($name);
			$name = $this->_getFieldName($name);
		
			$html .= FormHelper::choice($name, Array(-1 => "All") + $this->_getAllBlogs(), $values, array(
				'id' => $id,
				'multiple' => true, 
				'label' => '<strong>Show users from blogs:</strong><br />',
				'help' => '<br/><small>If no blog is selected only users from the current blog are displayed. </small>',
			));
		}
		return $html;
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
	 * @todo move this to helpers function file (?)
	 */
	function _getAllBlogs() {
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
	 * Renders the group by field, which is either a dropdown field or a single checkbox if only one option is available.
	 */
	function renderFieldGroupBy($value, $name='group_by') {
		$group_by_options = Array();
		if ($this->settings->blog_selection_allowed()) {
			$group_by_options['blog'] = __('Group by blogs');
		}
		
		$html = '';
		if (!empty($group_by_options)) {
			$attributes = array();
			$attributes['id'] = $this->_getFieldId($name);
			$attributes['expanded'] = true;
			
			if (count($group_by_options) > 1) {
				$attributes['label'] = 'User list Grouping: <br/>';
			}
			else {
				$attributes['wrapper_tag'] = 'p';
			}
			
			$name = $this->_getFieldName($name);
			$html = FormHelper::choice($name, $group_by_options, $value, $attributes);
		}
		return $html;
	}
	
	/**
	 * Renders the roles field
	 */
	function renderFieldRoles($values, $name='roles') {
		$roles = $this->_getAllRoles();
		
		$html = '';
		if (!empty($roles)) {		
			$attributes = array(
				'id' => $this->_getFieldId($name),
				'expanded' => true,
				'multiple' => true,
				'wrapper_tag' => 'p',
				'label' => '<strong>Show roles:</strong><br/>',
			);
			$name = $this->_getFieldName($name);
			$html .= FormHelper::choice($name, $roles, $values, $attributes);
		}
		
		return $html;
	}
	
	/**
	 * Retrieves all roles, and returns them as an associative array (key -> role name) 
	 *
	 * @access private
	 * @return Array of role names.
	 */
	function _getAllRoles() {
		global $wpdb;

		$roles_data = get_option($wpdb->prefix.'user_roles');
		$roles = array();
		foreach($roles_data as $key => $role) {
			$roles[$key] = $this->__roleStripLevel($role['name']);
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
	function __roleStripLevel($element) {
		$parts = explode('|', $element);
		return $parts[0];
	}

	
	/**
	 * Renders the hiddenusers input text field.
	 */
	function renderFieldHiddenUsers($value, $name='hiddenusers') {
		$attributes = array(
			'id' => $this->_getFieldId($name),
			'label' => '<strong>Hidden users:</strong> ',
			'class' => 'widefat',
			'help' => '<small>(Comma separate list of user login ids)</small>',
		);
		$name = $this->_getFieldName($name);
		return '<p>' . FormHelper::input('text', $name, $value, $attributes) . '</p>';
	}

	/**
	 * Renders the set of display options (as it's used in the widget atm)
	 */
	function renderDisplayOptions ($display_values, $name_base='display') {
		$html = '';
		$html .= $this->renderFieldDisplayOptions($display_values, $name_base);
		$html .= $this->renderFieldOrder($display_values['order'], $name_base .'][order');
		$html .= '<br />';
		$html .= $this->renderFieldLimit($display_values['limit'], $name_base .'][limit');
		$html .= '<br />';
		$html .= $this->renderFieldAvatarSize($display_values['avatar_size'], $name_base . '][avatar_size');
		return $html;
	}
	
	/**
	 * Renders the display options checkbox matrix (show name?, link to author page?)
	 */
	function renderFieldDisplayOptions($values, $name='display') {
		$display_options = Array(
			'show_name' => __('Show Name'),
			'link_to_authorpage' => __('Link avatar to <a href="http://codex.wordpress.org/Author_Templates" target="_blank">author page</a>.'),
		);
		
		$attributes = array(
			'id' => $this->_getFieldId($name),
			'expanded' => true,
			'multiple' => true,
			'label' => '<strong>Display options</strong><br/>',
			'wrapper_tag' => 'p',
		);
		$name = $this->_getFieldName($name);
		return FormHelper::choice($name, $display_options, $values, $attributes);
	}

	/**
	 * Renders the "order by" dropdown
	 */
	function renderFieldOrder($values, $name='order') {
		$order_options = Array(
			'user_id' => __('User Id'),
			'user_login' => __('Login Name'),
			'display_name' => __('Display Name'),
			'random' => __('Random'),
		);
		
		$attributes = array(
			'id' => $this->_getFieldId($name),
			'label' => 'Sorting order: <br />',
			
		);
		$name = $this->_getFieldName($name);
		return FormHelper::choice($name, $order_options, $values, $attributes);
	}
	
	/**
	 * Renders the "limit" input field
	 */
	function renderFieldLimit($value, $name='limit') {
		$attributes = array(
			'id' => $this->_getFieldId($name),
			'label' => 'Max. number of avatars shown:<br /> ',
		);
		$name = $this->_getFieldName($name);
		return FormHelper::input('text', $name, $value, $attributes);
	}
	
	/**
	 * Renders the avatar size input field.
	 *
	 * @param string $value the field value
	 * @param string $name the field name
	 * @param bool $preview If set to true (default) the "avatar_size_preview" div is rendered. jQuery UI and "js/widget.admin.js" needs to included in order for this to work.
	 */
	function renderFieldAvatarSize($value, $name='avatar_size', $preview=true) {
		$attributes = array(
			'id' => $this->_getFieldId($name),
			'label' => 'Avatar Size:<br /> ',
			'help' => 'px',
			'class' => 'avatar_size_input',
		);
		$name = $this->_getFieldName($name);
		$html = FormHelper::input('text', $name, $value, $attributes);
		if ($preview == true) {
			global $user_email;
			get_currentuserinfo();
			$html .= '<div class="avatar_size_preview" style="background-color: #666; border: 1px solid #eee; width: 200px; height: 200px; padding: 10px;">'. get_avatar($user_email, $value) .'</div>'; 
		}
		return $html;
	}

}


?>
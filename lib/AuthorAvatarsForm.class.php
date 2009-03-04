<?php

/**
 * Collection of functions for form fields used in author avatars widget and shortcode wizard
 */
class AuthorAvatarsForm {
	
	/**
	 * @var callback Callback for field "id" attributes.
	 * @access private
	 */
	var $field_id_callback = null;
	
	/**
	 * @var callback Callback for field "name" attributes.
	 * @access private
	 */
	var $field_name_callback = null;
	
	/**
	 * @var AuthorAvatarsSettings Reference to AuthorAvatarsSettings instance.
	 * @access private
	 */
	var $settings = null;
	
	/**
	 * @var List of all tabs created by renderTabStart().
	 * @access private
	 */
	var $tabs = null;
	
	/**
	 * Constructor
	 */
	function AuthorAvatarsForm() {
		require_once('FormHelper.class.php');
		$this->settings = AA_settings();
		$this->tabs = array();
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
			trigger_error('Error: callback function is not callable.', E_USER_ERROR);
			$this->field_id_callback = null;
		}
	}

	/**
	 * Set a field name callback handler
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
			trigger_error('Error: callback function is not callable.', E_USER_ERROR);
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
	 *
	 * @param mixed $values the field values
	 * @param string $name the field name
	 * @return string
	 */
	function renderFieldBlogs($values=array(), $name = 'blogs') {
		$html = '';
		if ($this->settings->blog_selection_allowed()) {
			$id = $this->_getFieldId($name);
			$name = $this->_getFieldName($name);
		
			$html .= '<p>' . FormHelper::choice($name, Array(-1 => "All") + $this->_getAllBlogs(), $values, array(
				'id' => $id,
				'multiple' => true, 
				'label' => '<strong>Show users from blogs:</strong><br />',
				'help' => '<br/><small>If no blog is selected only users from the current blog are displayed. </small>',
			)) . '</p>';
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
		if( !is_array( $blogs ) || ( $blogs['time'] + 60 ) < time() ) { // cache for 60 seconds.
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
	 *
	 * @param mixed $values the field values
	 * @param string $name the field name
	 * @return string
	 */
	function renderFieldGroupBy($values=array(), $name='group_by') {
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
				$attributes['label'] = 'User list grouping: <br/>';
			}
			else {
				$attributes['wrapper_tag'] = 'p';
			}
			
			$name = $this->_getFieldName($name);
			$html = FormHelper::choice($name, $group_by_options, $values, $attributes);
		}
		return $html;
	}
	
	/**
	 * Renders the roles field
	 *
	 * @param mixed $values the field values
	 * @param string $name the field name
	 * @return string
	 */
	function renderFieldRoles($values=array(), $name='roles') {
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
	 *
	 * @param string $value the field value
	 * @param string $name the field name
	 * @return string
	 */
	function renderFieldHiddenUsers($value='', $name='hiddenusers') {
		$attributes = array(
			'id' => $this->_getFieldId($name),
			'label' => '<strong>Hidden users:</strong><br/>',
			'help' => '<br/><small>(Comma separate list of user login ids)</small>',
			'rows' => 2,
			'style' => 'width:95%;'
		);
		$name = $this->_getFieldName($name);
		return '<p>' . FormHelper::input('text', $name, $value, $attributes) . '</p>';
	}

	/**
	 * Renders the set of display options (as it's used in the widget atm)
	 *
	 * @param string $display_values 
	 * @param string $name_base
	 * @return string
	 * @deprecated this is used on the old widget admin should be replaced by the new tab base one...
	 */
	function renderDisplayOptions ($display_values=array(), $name_base='display') {
		$html = '';
		$html .= $this->renderFieldDisplayOptions($display_values, $name_base);
		$html .= $this->renderFieldOrder($display_values['order'], $name_base .'[order]');
		$html .= '<br />';
		$html .= $this->renderFieldLimit($display_values['limit'], $name_base .'[limit]');
		$html .= '<br />';
		$html .= $this->renderFieldAvatarSize($display_values['avatar_size'], $name_base . '[avatar_size]');
		return $html;
	}
	
	/**
	 * Renders the display options checkbox matrix (show name?, link to author page?)
	 *
	 * @param mixed $values the field values
	 * @param string $name the field name
	 * @return string
	 */
	function renderFieldDisplayOptions($values=array(), $name='display') {
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
	 *
	 * @param mixed $values the field values
	 * @param string $name the field name
	 * @return string
	 */
	function renderFieldOrder($values=array(), $name='order') {
		$order_options = Array(
			'user_id' => __('User Id'),
			'user_login' => __('Login Name'),
			'display_name' => __('Display Name'),
			'random' => __('Random'),
		);
		
		$attributes = array(
			'id' => $this->_getFieldId($name),
			'label' => 'Sorting order: ',
			
		);
		$name = $this->_getFieldName($name);
		return '<p>'. FormHelper::choice($name, $order_options, $values, $attributes) .'</p>';
	}
	
	/**
	 * Renders the "limit" input field
	 *
	 * @param string $value the field value
	 * @param string $name the field name
	 * @return string
	 */
	function renderFieldLimit($value='', $name='limit') {
		$attributes = array(
			'id' => $this->_getFieldId($name),
			'label' => 'Max. number of avatars shown: ',
			'size' => '5'
		);
		$name = $this->_getFieldName($name);
		return '<p>'. FormHelper::input('text', $name, $value, $attributes) .'</p>';
	}
	
	/**
	 * Renders the avatar size input field.
	 *
	 * @param string $value the field value
	 * @param string $name the field name
	 * @param bool $preview If set to true (default) the "avatar_size_preview" div is rendered. jQuery UI and "js/widget.admin.js" needs to included in order for this to work.
	 */
	function renderFieldAvatarSize($value='', $name='avatar_size', $preview=true) {
		$attributes = array(
			'id' => $this->_getFieldId($name),
			'label' => 'Avatar Size: ',
			'help' => 'px',
			'class' => 'avatar_size_input',
			'size' => '5'
		);
		$name = $this->_getFieldName($name);
		$html = '<p>'. FormHelper::input('text', $name, $value, $attributes) .'</p>';
		if ($preview == true) {
			global $user_email;
			get_currentuserinfo();
			$html .= '<div class="avatar_size_preview" style="background-color: #666; border: 1px solid #eee; width: 200px; height: 200px; padding: 10px;">'. get_avatar($user_email, $value) .'</div>'; 
		}
		return $html;
	}
	
	/**
	 * Renders the shortcode type selection field
	 *
	 * @param mixed $values the field values
	 * @param string $name the field name
	 * @return string
	 */
	function renderFieldShortcodeType($values=array(), $name='shortcode_type') {
		$type_options = array(
			'show_avatar' => 'Single Avatar',
			'authoravatars' => 'List of Users',
		);
		
		$attributes = array(
			'id' => $this->_getFieldId($name),
			'label' => '<strong>Shortcode Type:</strong><br/>',
			'expanded' => true,
			'inline' => true,
		);
		$name = $this->_getFieldName($name);
		
		return '<p>'. FormHelper::choice($name, $type_options, $values, $attributes) .'</p>';
	}
	
	/**
	 * Renders the email/userid input field for the show_avatar wizard
	 *
	 * @param string $value the field value
	 * @param string $name the field name
	 * @return string
	 */
	function renderFieldEmail($value='', $name='email') {
		$attributes = array(
			'id' => $this->_getFieldId($name),
			'label' => '<strong>Email address or user id:</strong><br/>',
			'style' => 'width: 95%;',
		);
		$name = $this->_getFieldName($name);
		return '<p>'. FormHelper::input('text', $name, $value, $attributes) .'</p>';
	}
	
	/**
	 * Renders the alignment radio fields for the show_avatar wizard
	 *
	 * @param mixed $values the field values
	 * @param string $name the field name
	 * @return string
	 */
	function renderFieldAlignment($values='', $name='alignment') {
		$alignment_options = array(
			'' => 'None',
			'left' => 'Left',
			'center' => 'Center',
			'right' => 'Right'
		);
		
		$attributes = array(
			'id' => $this->_getFieldId($name),
			'label' => '<strong>Alignment</strong><br/>',
			'expanded' => true,
			'inline' => true,
			'class' => 'alignment',
		);
		$name = $this->_getFieldName($name);
		
		return '<p>'. FormHelper::choice($name, $alignment_options, $values, $attributes) .'</p>';
	}
	
	/**
	 * Renders an opening tab div
	 * 
	 * @param string $title The tab title
	 * @param string $id tab id (optional). Generated from $title if empty.
	 * @return string
	 */
	function renderTabStart($title, $id = '') {
		if (empty($id)) $id = 'tab-'. $title;
		$id = FormHelper::cleanHtmlId($id);
		
		if (isset($this->tabs[$id])) {
			trigger_error('Warning: id "'. $id .'" has already been used as tab identifier.', E_USER_WARNING);
		}
		else {
			$this->tabs[$id] = $title;
		}
		return '<div id="'. $id .'">';
	}
	
	/**
	 * Renders a closing tab div.
	 *
	 * @return string
	 */
	function renderTabEnd() {
		return '</div>';
	}
	
	/**
	 * Renders the list of all tabs 
	 *
	 * @return string
	 */
	function renderTabList() {
		if (empty($this->tabs)) {
			trigger_error('Tabs array is empty. Nothing to render.', E_USER_WARNING);
			return;
		}
		
		$html = "\n".'<ol>';
		foreach ($this->tabs as $id => $title) {
			$html .= "\n\t".'<li><a href="#'. $id .'">'. $title .'</a></li>';
		}
		$html .= "\n".'</ol>';
		
		return $html;
	}
	
	/**
	 * Renders the two given bits of html in columns next to each other.
	 *
	 * @param string $left Contents of the left column
	 * @param string $right Contents of the right column
	 * @param string html
	 */
	function renderColumns($left='', $right='') {
		if (empty($left) || empty($right)) return $left . $right;
		
		$html = '<div class="aa-columns aa-clearfix">';
		$html .= '<div class="column-left">'. $left .'</div>';
		$html .= '<div class="column-right">'. $right .'</div>';
		$html .= '</div>';
		
		return $html;
	}
}

?>
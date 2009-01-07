<?php

/**
 * Author Avatars Shortcode: provides a shortcode for displaying avatars of blog users
 */
class AuthorAvatarsShortcode {

	/**
	 * Constructor
	 */
	function AuthorAvatarsShortcode() {
		$this->register();
	}
	
	/**
	 * register shortcode 
	 */
	function register() {
		// authoravatars shortcode
		add_shortcode('authoravatars', array($this, 'shortcode_handler_authoravatars'));
		add_action('wp_head', array($this, 'print_css_link'));
		
		// avatar
		add_shortcode('show_avatar', array($this, 'shortcode_handler_showavatar'));
	}
	
	/**
	 * Add css stylesheets (using wp_enqueue_style()).
	 */
	function print_css_link() {
		echo '<link type="text/css" rel="stylesheet" href="' . WP_PLUGIN_URL . '/author-avatars/css/shortcode.css" />' . "\n";
	}
	
	/**
	 * The shortcode handler for the [show_avatar] shortcode.
	 * 
	 * Example: [show_avatar id=pbearne@tycoelectronics.com avatar_size=30 align=right]
	 */	
	function shortcode_handler_showavatar($atts, $content=null) {
	
		// get id or email
		$id = '';
		if (!empty($atts['id'])) {
			$id = preg_replace('[^\w\.\@\-]', '', $atts['id']);
		}
		if (empty($id) && !empty($atts['email'])) {
			$id = preg_replace('[^\w\.\@\-]', '', $atts['email']);
		}
		
		// get avatar size
		if (!empty($atts['avatar_size'])) {
			$avatar_size = intval($atts['avatar_size']);
		}
		if (!$avatar_size) $avatar_size = false;
		
		// get alignment
		if (!empty($atts['align'])) {
			switch ($atts['align']) {
				case 'left':
					$style = "float: left; margin-right: 10px;";
					break;
				case 'right':
					$style = "float: right; margin-left: 10px;";
					break;
				case 'center':
					$style = "text-align: center; width: 100%;";
					break;
			}
		}
		
		if (!empty($id)) {
			$avatar = get_avatar($id, $avatar_size);
		}
		else {
			$avatar = "[show_author shortcode: please specify id or email]";
		}
	
		if (!empty($style)) $style = ' style="'. $style .'"';
		return '<div class="avatar"'. $style .'>'. $avatar .'</div>' . $content;
	}
	
	/**
	 * The shortcode handler for the [authoravatars] shortcode.
	 */
	function shortcode_handler_authoravatars($atts, $content=null) {
		require_once('UserList.class.php');
		$userlist = new UserList();
		
		// roles
		$roles = array(); // default value: no restriction -> all users
		if (!empty($atts['roles'])) {
			$roles = explode(',', $atts['roles']);
			$roles = array_map('trim', $roles);
		}
		$userlist->roles = $roles;
		
		// hidden users 
		$hiddenusers = array(); // default value: no restriction -> all users
		if (!empty($atts['hiddenusers'])) {
			$hiddenusers = explode(',', $atts['hiddenusers']);
			$hiddenusers = array_map('trim', $hiddenusers);
		}
		$userlist->hiddenusers = $hiddenusers;
		
		// link to author page?
		if (isset($atts['link_to_authorpage'])) {
			// by default always true, has to be set explicitly to not link the users
			$set_to_false = ($atts['link_to_authorpage'] == 'false' || (bool) $atts['link_to_authorpage'] == false);
			if ($set_to_false) $userlist->link_to_authorpage = false;
		}
		
		// show author name?
		if (isset($atts['show_name'])) {
			$set_to_false = ($atts['show_name'] == 'false');
			if ($set_to_false) $userlist->show_name = false;
			else $userlist->show_name = true;
		}
		
		// avatar size
		if (!empty($atts['avatar_size'])) {
			$size = intval($atts['avatar_size']);
			if ($size > 0) $userlist->avatar_size = $size;
		}
		
		// max. number of avatars
		if (!empty($atts['limit'])) {
			$limit = intval($atts['limit']);
			if ($limit > 0) $userlist->limit = $limit;
		}
		
		// display order
		if (!empty($atts['order'])) {
			$userlist->order = $atts['order'];
		}
		
		// render as a list?
		if (isset($atts['render_as_list'])) {
			$set_to_false = ($atts['render_as_list'] == 'false');
			if (!$set_to_false) $userlist->use_list_template();
		}
		
		return '<div class="shortcode-author-avatars">' . $userlist->get_output() . $content . '</div>';
	}
}

?>
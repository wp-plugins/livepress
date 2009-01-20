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
		add_shortcode('authoravatars', array($this, 'shortcode_handler'));
		add_action('wp_head', array($this, 'print_css_link'));
	}
	
	/**
	 * Add css stylesheets (using wp_enqueue_style()).
	 */
	function print_css_link() {
		echo '<link type="text/css" rel="stylesheet" href="' . WP_PLUGIN_URL . '/author-avatars/css/shortcode.css" />' . "\n";
	}
	
	/**
	 * The shortcode handler for the [authoravatars] shortcode.
	 */
	function shortcode_handler($atts, $content=null) {
		require_once('UserList.class.php');
		$userlist = new UserList();
		
		// roles
		$roles = array(); // default value: no restriction -> all users
		if (!empty($atts['roles'])) {
			$roles = explode(',', $atts['roles']);
			$roles = array_map('trim', $roles);
		}
		$userlist->roles = $roles;
		
		// blogs
		$blogs = array(); // default value: empty -> only current blog
		if ($this->_blog_selection_allowed() && !empty($atts['blogs'])) {
			if (strtolower($atts['blogs']) == 'all') {
				$blogs = array(-1);
			}
			else {
				$blogs = explode(',', $atts['blogs']);
				$blogs = array_map('intval', $blogs);
			}
		}
		$userlist->blogs = $blogs;
		
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
	
	/** 
	 * Return true if we're on a wpmu site and the we're allowed to show users from multiple blogs.
	 */
	function _blog_selection_allowed() {
		require_once('helper.functions.php');
		return is_wpmu();
	}
}

?>
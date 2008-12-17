<?php

/**
 * User list class: provides a filtered and ordered list of users and different ways of outputting them.
 */
class UserList {

	/**
	 * Constructor
	 */
	function UserList() {
	}
	
	/**
	 * Array of users that are not displayed
	 */ 
	var $hiddenusers = array();
	
	/**
	 * Array of role names. Only users belonging to one of these roles are displayed.
	 */
	var $roles = array('administrator', 'editor');
	
	/**
	 * Flag whether to link user avatars to the respective user pages.
	 */
	var $link_to_authorpage = true;
	
	/**
	 * Flag whether to show the username underneith their avatar.
	 */
	var $show_name = false;
	
	/**
	 * Size of avatars.
	 */
	var $avatar_size = 0;
	
	/**
	 * Maximum number of users.
	 */
	var $limit = 0;
	
	/**
	 * The order which the users are shown in.
	 */
	var $order = 'display_name';
	
	/**
	 * Echos the list of users.
	 */
	function output() {
		echo $this->get_output();
	}
	
	/**
	 * Returns the list of users.
	 */
	function get_output() {
		$html = '';
	
		// get users
		$users = $this->get_users();

		$html .= '<div class="author-list">';
		
		if (empty($users)) {
			$html .= '<p class="no_users">No users found.</p>';
		}
		else {
			foreach ($users as $user) {
				$html .= $this->format_user($user);
			}
		}
		$html .= '</div>';
		
		return $html;
	}
	
	/**
	 * Formats the given user as html.
	 *
	 * @param $user The user to format (object of type WP_User).
	 * @return html string
	 */
	function format_user($user) {
		$avatar_size = intval($this->avatar_size);
		if (!$avatar_size) $avatar_size = false;

		$roles = unserialize($user->meta_value);
		$role = implode(' ', array_keys($roles));
		$name = $user->display_name;

		$avatar = get_avatar($user->user_email, $avatar_size);
		$avatar = preg_replace('@alt=["\'][\w]*["\'] ?@', '', $avatar);
		$avatar = preg_replace('@ ?\/>@', ' alt="'.$name.' ('.$role.')" title="'.$name.' ('.$role.')" />', $avatar);

		$divcss = array('user');
		if ($this->show_name) $divcss[] = 'with-name';

		$html = '<div class="'.implode($divcss, ' ').'">';
		if ($this->link_to_authorpage) $html .= '<a href="'. get_author_posts_url($user->user_id).'">';
		$html .= '<span class="avatar">'. $avatar .'</span>';
		if ($this->show_name) $html .= '<span class="name">'. $name . '</span>';
		if ($this->link_to_authorpage) $html .= '</a>';
		$html .= '</div>';

		return $html;
	}
	
	/**
	 * Returns a filtered and sorted list of users
	 *
	 * @return Array of users (WP_User objects), filtered, sorted and limited to the maximum number.
	 */
	function get_users() {
		// get all users
		$users = (array) $this->get_blog_users();

		// filter them by roles and remove hiddenusers
		$this->_filter($users);
		
		// sort them
		$this->_sort($users);

		// and limit the number
		if (intval($this->limit) > 0) {
			$users = array_slice($users, 0, intval($this->limit), true);
		}
		
		return $users;
	}
	
	/**
	 * Returns array of all users of the current blog.
	 * 
	 * @return Array of users (WP_User objects).
	 */
	function get_blog_users() {
		$users = (array) get_users_of_blog();
		return $users;
	}
	
	/**
	 * Filters the given array of users by $roles and $hiddenusers if set.
	 *
	 * @access private
	 * @param $users Array of users (WP_User objects). (by reference)
	 * @return void
	 */
	function _filter(&$users) {
		if (is_array($users)) {
			foreach($users as $id => $user) {
				if ( (
					// if we have set some roles to restrict by
					is_array($this->roles) && !empty($this->roles) &&
					// and the current user does not have one of those roles
					count(array_intersect(array_keys(unserialize($user->meta_value)), $this->roles)) == 0)
				|| (
					// if we have set some users which we want to hide
					is_array($this->hiddenusers) && !empty($this->hiddenusers) &&
					// and the current user is one of them
					(in_array($user->user_login, $this->hiddenusers) || in_array($user->user_id, $this->hiddenusers))
				))
				// then remove the current user from the array
				unset($users[$id]);
			}
		}
	}
	
	/**
	 * Sorts the given array of users.
	 * 
	 * @access private
	 * @param $users Array of users (WP_User objects). (by reference)
	 * @param $order The key to sort by. Can be one of the following: random, user_id, user_login, display_name.
	 * @return void
	 */
	function _sort(&$users, $order=false) {
		if (!$order) $order = $this->order;
		
		switch ($order) {
			case 'random':
				shuffle($users);
				break;
			case 'user_id':
				usort($users, array($this, '_users_cmp_id'));
				break;
			case 'user_login':
				usort($users, array($this, '_users_cmp_login'));
				break;
			case 'display_name':
				usort($users, array($this, '_users_cmp_name'));
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
}

?>
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
			'group_by' => '',
			'display' => array(
				0 => 'link_to_authorpage',
				'avatar_size' => '',
				'limit' => '',
				'order' => 'display_name',
			),
		);
		
		if (AA_is_wpmu()) {
			global $blog_id;
			if (intval($blog_id) > 0) $this->defaults['blogs'] = Array(intval($blog_id));
		}
	}
	
	/**
	 * Constructor: set up multiwidget (id_base, name and description)
	 */	
	function AuthorAvatarsWidget()
	{
        add_action( 'widgets_init', array($this, 'init') );
	}

    /**
     * Widget initialisation
     */
    function init() {
		$this->_setDefaults();

		$this->MultiWidget(
			'author_avatars', // id_base
			'AuthorAvatars', // name
			array('description'=>__('Displays avatars of blog users.')), // widget options
			array('width' => '500px') // control options
		);

		add_action('wp_head', array($this, 'print_css_link'));
		add_action('wp_print_scripts', array($this, 'attach_scripts'));

        $this->register();
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
		$userlist->group_by = $instance['group_by'];
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
		$instance['group_by'] = wp_specialchars ($new_instance['group_by']);
		$instance['display'] = (array) $new_instance['display'];
		
		if (empty($instance['blogs'])) $instance['blogs'] = $this->defaults['blogs'];
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
		
		require_once('AuthorAvatarsForm.class.php');
		$form = new AuthorAvatarsForm();
		$form->setFieldIdCallback(array($this, 'get_field_id'));
		$form->setFieldNameCallback(array($this, 'get_field_name'));
	
		// widget title
		echo '<p>'. FormHelper::input(
			'text',
			$this->get_field_name('title'),
			$instance['title'],
			array(
				'label' => 'Title: ',
				'class' => 'widefat',
				'id' => $this->get_field_id('title'),
			)
		) .'</p>';
		
		// blog selection, group by, roles selection, hiddenusers, display options
		echo $form->renderFieldBlogs($instance['blogs']);
		echo $form->renderFieldGroupBy($instance['group_by']);
		echo $form->renderFieldRoles($instance['roles']);
		echo $form->renderFieldHiddenUsers($instance['hiddenusers']);
		echo $form->renderDisplayOptions($instance['display']);
		
		// hidden "submit=1" field (do we still need this?, FIXME)
		echo FormHelper::input('hidden', $this->get_field_name('submit'), '1', array('id' => $this->get_field_id('submit')));
	}
		
	/**
	 * Override MultiWidget::get_field_id(). Cleans up the id before returning it as the form element id.
	 */
	function get_field_id($varname) {
		$varname = preg_replace('/[\W]/', '-', $varname);
		$varname = str_replace('--', '-', $varname);
		return parent::get_field_id($varname);
	}
}
?>
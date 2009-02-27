<?php
/**
 * This class adds a button to the post editor for inserting author avatars
 * shortcodes
 */
class AuthorAvatarsEditorButton {

    /**
     * Constructor
     */
    function AuthorAvatarsEditorButton() {
        $this->register();
    }

    /**
     * Register init function
     */
    function register() {
        add_action('init', Array($this, 'init'));
        add_action('wp_ajax_author-avatars-editor-popup', array($this, 'render_tinymce_popup'));
    }

    /**
     * Register button filters and actions
     */
    function init() {
        // Don't bother adding the button if the current user lacks permissions
        if ( current_user_can('edit_posts') || current_user_can('edit_pages') ) {
            // Add only in Rich Editor mode
            if ( get_user_option('rich_editing') == 'true') {
                add_filter('mce_external_plugins', array($this, 'add_tinymce_plugin'));
                add_filter('mce_buttons', array($this, 'add_tinymce_button'));
            }
			
			// fix ajax post parameter
			if (defined('DOING_AJAX') && DOING_AJAX == true) {
				$p = 'author-avatars-editor-popup';
				if ($_GET['action'] == $p && !isset($_POST['action'])) {
					$_POST['action'] = $_GET['action'];
				}
			}
        }
    }

    /**
     * Filter 'mce_external_plugins': add the authoravatars tinymce plugin
     */
    function add_tinymce_plugin() {
        $plugin_array['authoravatars'] = WP_PLUGIN_URL.'/author-avatars/tinymce/editor_plugin.js';
        return $plugin_array;
    }

    /**
     * Filter 'mce_buttons': add the authoravatars tinymce button
     */
    function add_tinymce_button($buttons) {
        array_push($buttons, "separator", "authoravatars");
        return $buttons;
    }

    /**
     * Renders the tinymce editor popup
     */
    function render_tinymce_popup() {
        print $this->get_tinymce_popup();
        exit();
    }
    
    /**
     * Builds the tinymce editor popup
     */
    function get_tinymce_popup() {
        $html = '<html xmlns="http://www.w3.org/1999/xhtml">' ."\n";
        $html .= $this->get_tinymce_popup_head() . "\n";
        $html .= $this->get_tinymce_popup_body() . "\n";
        $html .= '</html>';
        
        return $html;
    }

    /**
     * Builds the html head for the tinymce popup
     *
     * @access private
     * @return string Popup head
     */
    function get_tinymce_popup_head() {
        $html = '';
        $html .= "\n\t".'<title>Author avatars shortcodes</title>';
        $html .= "\n\t".'<meta http-equiv="Content-Type" content="'. get_bloginfo('html_type').'; charset='. get_option('blog_charset').'" />';
        $html .= "\n\t".'<script language="javascript" type="text/javascript" src="'. get_option('siteurl') .'/wp-includes/js/tinymce/tiny_mce_popup.js"></script>';
        $html .= "\n\t".'<script language="javascript" type="text/javascript" src="'. get_option('siteurl') .'/wp-includes/js/jquery/jquery.js"></script>';
        //$html .= "\n\t".'<script language="javascript" type="text/javascript" src="'. WP_PLUGIN_URL .'/author-avatars/js/jquery-ui-personalized-1.5.3.min.js"></script>';
        //$html .= "\n\t".'<script language="javascript" type="text/javascript" src="'. WP_PLUGIN_URL .'/author-avatars/js/widget.admin.js"></script>';
        $html .= "\n\t".'<script language="javascript" type="text/javascript" src="'. WP_PLUGIN_URL .'/author-avatars/js/tinymce.popup.js"></script>';

        return '<head>' . $html . "\n" . '</head>';
    }

    /**
     * Builds the html body for the tinymce popup
     *
     * @access private
     * @return string Popup body
     */
    function get_tinymce_popup_body() {
        require_once('AuthorAvatarsForm.class.php');
        $form = new AuthorAvatarsForm();
        $html = '';

		$html .= $form->renderFieldBlogs(array());
		$html .= $form->renderFieldGroupBy(array());
		$html .= $form->renderFieldRoles(array());
		$html .= $form->renderFieldHiddenUsers('');
		$html .= $form->renderDisplayOptions(array());

        /*$html .= '<script language="javascript" type="text/javascript">
setupAvatarSizePreview();
</script>';*/

        $html .= "\n\t".'<div class="mceActionPanel">';
	    $html .= "\n\t".'<div style="float: left">';
	    $html .= "\n\t".'<input type="button" id="cancel" name="cancel" value="'. __("Cancel", "Author Avatars") .'" onclick="tinyMCEPopup.close();" />';
	    $html .= "\n\t".'</div>';
        $html .= "\n\t".'<div style="float: right">';
	    $html .= "\n\t".'<input type="submit" id="insert" name="insert" value="'. __("Insert", "Author Avatars") .'" onclick="insertAuthorAvatarsCode();" />';
	    $html .= "\n\t".'</div>';
        $html .= "\n\t".'</div>';

        return '<body class="tinymce_popup">'. $html . "\n" .'</body>';
    }
}
?>
<?php
require_once 'livepress-config.php';

/**
 * A piece of post content
 *
 * @author fgiusti
 */
class livepress_live_update {
    /** Tag used to mark the metainfo inside a live update */
    private static $metainfo_tag = 'span';
    /** Class of the tag used  to mark the metainfo inside a live update */
    private static $metainfo_class = 'livepress-meta';
    
    private static $instance = NULL;

    public static function instance() {
        if (self::$instance == NULL) {
            self::$instance = new livepress_live_update();
        }
        return self::$instance;
    }

    private function __construct() {
        $this->options = get_option(livepress_administration::$options_name);
        global $current_user;
        $this->user_options = get_user_option(livepress_administration::$options_name, $current_user->ID, false);

        add_shortcode("livepress_metainfo", array(&$this, 'shortcode'));
        if (is_admin()) {
            // setup WYSIWYG editor
            $this->add_editor_button();
        }
    }
	
    private function add_editor_button() {
        // Don't bother doing this stuff if the current user lacks permissions
        if ( ! current_user_can('edit_posts') && ! current_user_can('edit_pages') )
            return;

        // Add only in Rich Editor mode
        if ( get_user_option('rich_editing') == 'true' ) {
            add_filter( 'teeny_mce_buttons', array(&$this, 'register_tinymce_button') );
            add_filter( 'mce_buttons', array(&$this, 'register_tinymce_button') );
        }
    }

    public function register_tinymce_button($buttons) {
        array_push($buttons, 'separator', 'livepress');
        return $buttons;
    }
	
    public function shortcode($atts) {
        // Extract the attributes
        extract(shortcode_atts(array(
            "author"      => "",
            "time"        => "",
            "avatar_url"  => NULL,
            "has_avatar"  => FALSE
        ), $atts));
        
        $options = $this->options;
        $metainfo = "";
        if ($has_avatar || $avatar_url) {
            if ($avatar_url == null) {
                $metainfo .= self::get_avatar_img_tag($this->user_options['avatar_display']);
            } else {
                $metainfo .= self::avatar_img_tag($avatar_url);
            }
        }

	    if ($author) {
		    $metainfo .= $this->format_author($author)." ";
	    }

        if ($time) {
	        if ($author) $metainfo .= " <strong>|</strong> ";
            $metainfo .= str_replace('###TIME###', $time, self::timestamp_html_template())." ";
        }

        if ($metainfo) {
            $metainfo = '<'. self::$metainfo_tag .' class="'. self::$metainfo_class .'">'
                . $metainfo
                . '</'. self::$metainfo_tag .'>';
        }
        
        return $metainfo;
    }
    
    /**
     * Add user options to blank shortcode
     * @param   $content    string  Post content
     */
    public function fill_livepress_shortcodes($content) {
        $options = $this->options;
        
        $new_shortcode = "[livepress_metainfo";
        
        if ($options["update_author"]) {
            if (isset($this->custom_author_name)) {
                $authorname = $this->custom_author_name;
            } else {
                $authorname = self::get_author_display_name($options);
            }
            if ($authorname) {
                $new_shortcode .= ' author="'.$authorname.'"';
            }
        }
        
        $current_time_attr = ' time="'. $this->format_timestamp(current_time('timestamp')) .'" ';
        if ($options['timestamp']) {
            if (isset($this->custom_timestamp)) {
                $custom_timestamp = strtotime($this->custom_timestamp);
                $new_shortcode .= ' time="'. $this->format_timestamp($custom_timestamp) .'"';
            } else {
                $new_shortcode .= $current_time_attr;
            }
        }
        
        if ($options["include_avatar"]) {
            $new_shortcode .= ' has_avatar="1"';
            if (isset($this->custom_avatar_url)) {
                $new_shortcode .= ' avatar_url="'.$this->custom_avatar_url.'"';
            }
        }
        
        $new_shortcode .= "]";
        // Replace empty livepress_metainfo with calculated one
        $content = preg_replace('/\[livepress_metainfo\s*\]/s', $new_shortcode, $content);
        // Replace POSTTIME inside livepress_metainfo with current time
        return preg_replace('/(\[livepress_metainfo[^\]]*)POSTTIME([^\]]*\])/s', "$1".$current_time_attr."$2", $content);
    }

    /**
     * Set a custom author name to be used instead of the current author name
     * @param <string> $name The custom author name
     */
    public function use_custom_author_name($name) {
        $this->custom_author_name = $name;
    }

    /**
     * Set a custom timestamp to be used instead of the current time
     * @param <string> $time timestamp
     */
    public function use_custom_timestamp($time) {
        $this->custom_timestamp = $time;
    }

    /**
     * Set a custom avatar url to be used instead of selected one
     * @param <string> $avatar_url avatar url
     */
    public function use_custom_avatar_url($avatar_url) {
        $this->custom_avatar_url = $avatar_url;
    }

    /**
     * Return the formatted HTML for the author of the livepress update
     *
     * @param   string  $author The author display name.
     *
     * @return  string  HTML formatted author
     */
    private function format_author($author) {
        $config = livepress_config::get_instance();
        return str_replace('###AUTHOR###', $author, $config->get_option('author_template'));
    }
    
    /**
     * The HTML image tag for the avatar from WP or Twitter based on user configuration.
     *
     * @param   string  $from   The source of the avatar, can be "twitter" or "native"
     * @return  string  HTML image tag
     */
    public static function get_avatar_img_tag($from) {
        $avatar_img_tag = get_avatar($user->ID, 30);
        if ($from === 'twitter' && livepress_administration::twitter_avatar_url()) {
            $avatar_img_tag = self::avatar_img_tag(livepress_administration::twitter_avatar_url());
        }
        return $avatar_img_tag;
    }

    public static function avatar_img_tag($url) {
        return "<img src='{$url}' class='avatar avatar-30 photo avatar-default' height='30' width='30' />";
    }

    /**
     * The author name choosen by the user to be displayed
     *
     * @param   array   $options    author_display should be "custom" or "native"
     *                               if "custom", author_display_custom_name should contain the name
     * @return  string  the name to be displayed or FALSE if something goes wrong
     */
    public static function get_author_display_name($options) {
        $author = FALSE;
        if ($options['author_display'] == 'custom') {
            $author = $options['author_display_custom_name'];
        } else {
            // TODO: decouple
            $user = wp_get_current_user();
            if ( $user->ID ) {
                if ( empty( $user->display_name ) ) {
                    $author = $user->user_login;
                } else {
                    $author = $user->display_name;
                }
            }
        }
        return $author;
    }

    /**
     * Return the HTML for the timestamp
     *
     * @param   int     $timestamp  Unix timestamp that defaults to current local time, if not given
     *
     * @return  string  HTML formatted timestamp
     */
    private function format_timestamp($timestamp = NULL) {
        $config = livepress_config::get_instance();
        return date($config->get_option('timestamp_template'), $timestamp);
    }

    /**
     * The user defined or default HTML template for the post timestamp
     *
     * @return  string  HTML for the timestamp with ###TIME### where should go the formatted time
     */
    public static function timestamp_html_template() {
        $config = livepress_config::get_instance();
        return $config->get_option('timestamp_html_template');
    }

    /**
     * The timestamp template
     *
     * @return  string  Timestamp to be formatted as PHP date() function
     */
    public static function timestamp_template() {
        $config = livepress_config::get_instance();
        return $config->get_option('timestamp_template');
    }

    /**
     * The author template
     *
     * @return  string  Author template
     */
    public static function author_template() {
        $config = livepress_config::get_instance();
        return $config->get_option('author_template');
    }
}
?>

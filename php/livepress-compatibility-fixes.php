<?php
/**
 * Fixes compatibility problems with 3rd party plugins
 *
 * @package livepress
 */

class livepress_compatibility_fixes {
    private static $instance = NULL;

    public static function instance() {
        if (self::$instance == NULL) {
            self::$instance = new livepress_compatibility_fixes();
        }
        return self::$instance;
    }

    private function __construct() {
        $this->fix_plugin_blackbird_pie();
    }

    public function is_active_plugin_blackbird_pie() {
        global $BlackbirdPie;
        return isset($BlackbirdPie);
    }

    /**
     * Needs to register blackbirdpie shortcode when in admin mode
     */
    public function fix_plugin_blackbird_pie() {
        if ($this->is_active_plugin_blackbird_pie()) {
            global $BlackbirdPie;

            if (is_admin()) {
                //register shortcode
                add_shortcode(BBP_NAME, array(&$BlackbirdPie, 'shortcode'));
                //register auto embed
                wp_embed_register_handler( BBP_NAME, BBP_REGEX, array(&$BlackbirdPie, 'blackbirdpie_embed_handler') );

            }
            if ( !has_filter('bbp_create_tweet') ) {
                add_filter('bbp_create_tweet', 'livepress_compatibility_fixes::patch_tweet_details');
                add_filter('bbp_create_tweet', array( &$BlackbirdPie, 'create_tweet_html' ));
            }
        }
    }

    static function esc_amp_html($html) {
        return preg_replace("/&(?![a-z]+;|#[0-9]+;)/", "&amp;", $html);
    }
    
    static function patch_tweet_details( $tweet_details, $options = array()) {
        $tweet_details['tweet_text'] = self::esc_amp_html($tweet_details['tweet_text']);
        return $tweet_details;
    }
}

?>

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

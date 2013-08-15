<?php
/**
 * Try to automagically inject livepress widget into theme.
 * Magic can be removed by adding into functions.php of theme:
 *    define('LIVEPRESS_THEME', true)
 *
 * @package livepress
 */

class livepress_themes_helper {
    private static $instance = NULL;

    public static function instance() {
        if (self::$instance == NULL) {
            self::$instance = new livepress_themes_helper();
        }
        return self::$instance;
    }

    private function __construct() {
        add_action( 'loop_start', array( $this, 'inject_updatebox' ) );
    }

    function inject_updatebox() {
        static $did_output = false;
        if ( ! defined( 'LIVEPRESS_THEME' ) || ! constant( 'LIVEPRESS_THEME' ) ) {
            if ( ! $did_output && ( is_single() || is_home() ) ) {
                livepressUpdateBox();
                if ( is_single() )
                    //add_action( 'the_content', array($this, 'inject_widget'), 99999);
                    livepress_updater::instance()->inject_widget( true );
                $did_output = true;
            }
        }
    }

    function inject_widget( $content, $last_update = 0 ) {
        static $did_output = false;
        if ( ! defined( 'LIVEPRESS_THEME' ) || ! constant( 'LIVEPRESS_THEME' ) ) {
            if ( ! $did_output ) {
                $livepress_template = livepressTemplate( true, $last_update );
                $content = $livepress_template . $content;
                $did_output = true;
            }
        }
        return $content;
    }
}

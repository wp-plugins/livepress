<?php
/**
 * Fixes compatibility problems with 3rd party plugins
 *
 * @package livepress
 */

class LivePress_Compatibility_Fixes {
	/**
	 * Static instance.
	 *
	 * @static
	 * @access private
	 * @var null
	 */
	private static $instance = NULL;

	/**
	 * Instance.
	 *
	 * @static
	 * @access public
	 *
	 * @return LivePress_Compatibility_Fixes|null
	 */
	public static function instance() {
		if (self::$instance == NULL) {
			self::$instance = new LivePress_Compatibility_Fixes();
		}
		return self::$instance;
	}


	private function __construct() {
		add_filter('embed_oembed_html', array( $this, 'embed_oembed_html' ), 1000, 4 );
		add_filter('the_content', array( $this, 'inject_twitter_script' ), 1000 );
	}

	static function embed_oembed_html($content, $url, $attr, $post_id) {
		return preg_replace('!<script[^>]*twitter[^>]*></script>!i', '', $content);
		return $content;
	}

	static function esc_amp_html($html) {
		return preg_replace("/&(?![a-z]+;|#[0-9]+;)/", "&amp;", $html);
	}

	static function patch_tweet_details( $tweet_details, $options = array()) {
		$tweet_details['tweet_text'] = self::esc_amp_html($tweet_details['tweet_text']);
		return $tweet_details;
	}

	static function inject_twitter_script( $content ) {
		if (preg_match('/class="twitter-tweet"/i', $content)) {
			wp_enqueue_script( 'platform-twitter', "//platform.twitter.com/widgets.js", array() );
		}
		return $content;
	}
}

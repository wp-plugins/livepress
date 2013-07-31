<?php
/**
 * The feeds served from LivePress!
 */
class livepress_feed {
	private $name;

	/**
	 * @param string $name The post identifier
	 */
	public function  __construct( $name ) {
		$this->name = $name;
		if ( is_single() ) {
			add_action( 'wp_print_scripts', array(&$this, 'feed_link'), 4 );
		}
	}

	public static function initialize() {
		new livepress_feed('push-rss');
	}

	/**
	 * Print the feed link tag
	 */
	public function feed_link() {
		$post_title = self::feed_title();
		$feed_link = livepress_updater::instance()->get_current_post_feed_link();

		if ( count( $feed_link ) > 0 ) {
			$tag = '<link rel="alternate" type="' . feed_content_type( 'rss2' ) . '" ';
			$tag .= 'title="' . get_bloginfo( 'name' ) . ' &raquo; ' . $post_title . '" ';
			$tag .= 'href="' . $feed_link[0] . '" />' . "\n";
			echo $tag;
		}
	}

	public static function feed_title() {
		global $post;
		return $post->post_title . ' Post Updates Feed';
	}
}

?>

<?php
/**
 * Some utility functions around WP global functions
 */

require_once 'lib/HTMLPurifier/HTMLPurifier.auto.php';
require_once 'livepress-htmlpurifier-cache.php';

class lp_wp_utils {
    /**
     * Saves in the WP DB of post hidden, the key/value
     *
     * @param   int     $post_id        The post id that the message belongs
     * @param   string  $key            The key to retrieve the value later
     * @param   string  $value          The value to be saved
     */
    public static function save_on_post($post_id, $key, $value) {
        return update_post_meta($post_id, "_".PLUGIN_NAME."_". $key, $value);
    }

    /**
     * Retrieves from the WP DB the matching value
     *
     * @param   int     $post_id        The post id that the message belongs
     * @param   string  $key            The key of the value to be retrieved
     * @param   string  $single         If true it will return string with value
     *                                  of first meta found, array otherwise
     *
     * @return  array|string  The value
     */
    public static function get_from_post($post_id, $key, $single = false) {
        return get_post_meta($post_id, "_".PLUGIN_NAME."_". $key, $single);
    }


	/**
	 * Purifies HTML in string, that already slashed for database.
	 * this hooks operates on slashed strings:
	 *      title_save_pre, content_save_pre, excerpt_save_pre,
	 *      content_filtered_save_pre, pre_comment_content
	 *
	 * @return string
	 */
	public static function purifySlashedHTML( $slashed_content ) {
		return addslashes( self::purifyHTML( stripslashes( $slashed_content ) ) );
	}

	/**
	 * Purifies HTML on HTMLPurifier with special settings
	 *
	 * @param string $content
	 *
	 * @return string
	 */
	public static function purifyHTML( $content ) {
		/** @var $config HTMLPurifier_Config */
		$config = HTMLPurifier_Config::createDefault();
		$config->set( 'Attr.EnableID', true );
		$config->set( 'HTML.SafeObject', true );
		$config->set( 'HTML.SafeEmbed', true );
		$config->set( 'HTML.Trusted', true );
		$config->set( 'Cache.DefinitionImpl', 'WPDatabase' );

		$allowed_comments = apply_filters( 'livepress_allowed_comment_tags', array( 'more', 'nextpage', 'livepress', 'cforms' ) );
		$comment_regex = implode( '|', $allowed_comments );
		//$config->set( 'HTML.AllowedCommentsRegexp', '/.*(' . $comment_regex . ')/' );
		$config->set( 'HTML.AllowedCommentsRegexp', '/.*/' );

		$def = $config->getHTMLDefinition( true );
		self::append_purified_element_set( $def );

		$purifier = new HTMLPurifier( $config );
		$content  = $purifier->purify( $content );

		return $content;
	}

	protected static function append_purified_element_set( &$def ) {
		// <iframe src="" width="" height="" frameborder="">
		$def->addElement(
			'iframe',
			'Inline',
			'Flow',
			'Common',
			array(
			     'src'          => 'URI#embedded',
			     'width'        => 'Length',
			     'height'       => 'Length',
			     'name'         => 'ID',
			     'scrolling'    => 'Enum#yes,no,auto',
			     'frameborder'  => 'Enum#0,1',
			     'longdesc'     => 'URI',
			     'marginheight' => 'Pixels',
			     'marginwidth'  => 'Pixels',
			)
		);

		// <blockquote width="" cite="">
		$def->addElement(
			'blockquote',
			'Block',
			'Optional: Heading | Block | List',
			'Common',
			array(
			     'width' => 'Text',
			     'cite' => 'URI'
			)
		);
	}
}
?>

<?php
/**
 * Custom implementation of HTMLPurifier_DefinitionCache that uses a WordPress custom post type for data storage.
 *
 * @since 0.7
 * @author 10up
 */
class HTMLPurifier_DefinitionCache_WPDatabase extends HTMLPurifier_DefinitionCache {
	public static $caching = false;

	/**
	 * Adds a definition object to the cache
	 *
	 * @param HTMLPurifier_Definition $def
	 * @param HTMLPurifier_Config     $config
	 *
	 * @return bool
	 */
	public function add( $def, $config ) {
		if ( ! $this->checkDefType( $def ) ) {
			return;
		}

		self::$caching = true;

		$definition = wp_insert_post(
			array(
			     'post_type'    => 'livepress_html_def',
			     'post_status'  => 'publish',
			     'post_content' => base64_encode( serialize( $def ) ),
			     'post_title'   => $this->generateKey( $config )
			),
			true // Return WP_Error on failure
		);

		self::$caching = false;

		return ! is_wp_error( $definition );
	}

	/**
	 * Unconditionally saves a definition object to the cache
	 *
	 * @param HTMLPurifier_Definition $def
	 * @param HTMLPurifier_Config     $config
	 *
	 * @return bool
	 */
	public function set( $def, $config ) {
		if ( ! $this->checkDefType( $def ) ) {
			return;
		}

		$definition = get_page_by_title( $this->generateKey( $config ), OBJECT, 'livepress_html_def' );

		if ( null === $definition ) {
			// No object is set in the cache. Create one instead
			return $this->add( $def, $config );
		}

		$definition->post_content = base64_encode( serialize( $def ) );

		$definition_id = wp_update_post( $definition, true );

		return ! is_wp_error( $definition_id );
	}

	/**
	 * Replace an object in the cache
	 *
	 * @param HTMLPurifier_Definition $def
	 * @param HTMLPurifier_Config     $config
	 *
	 * @return bool
	 */
	public function replace( $def, $config ) {
		if ( ! $this->checkDefType( $def ) ) {
			return;
		}

		return $this->set( $def, $config );
	}

	/**
	 * Retrieves a definition object from the cache
	 *
	 * @param HTMLPurifier_Config $config
	 *
	 * @return bool|HTMLPurifier_Definition
	 */
	public function get( $config ) {
		$definition = get_page_by_title( $this->generateKey( $config ), OBJECT, 'livepress_html_def' );

		if ( null === $definition ) {
			return false;
		}

		return unserialize( base64_decode( $definition->post_content ) );
	}

	/**
	 * Removes a definition object to the cache
	 *
	 * @param HTMLPurifier_Config $config
	 *
	 * @return bool
	 */
	public function remove( $config ) {
		$definition = get_page_by_title( $this->generateKey( $config ), OBJECT, 'livepress_html_def' );

		if ( null !== $definition ) {
			wp_delete_post( $definition->ID, true );
		}

		return true;
	}

	/**
	 * Clears all objects from cache
	 *
	 * @param HTMLPurifier_Config $config
	 *
	 * @return bool
	 */
	public function flush( $config ) {
		global $wpdb;

		$result = $wpdb->query( "DELETE FROM $wpdb->posts WHERE `post_type`='livepress_html_def'" );

		if ( false === $result ) {
			return false;
		}

		return true;
	}

	/**
	 * Clears all expired (older version or revision) objects from cache
	 *
	 * @param HTMLPurifier_Config $config
	 *
	 * @return bool
	 */
	public function cleanup( $config ) {
		return $this->flush( $config );
	}

	/**
	 * Generates a unique key based on a configuration parameter passed in.
	 *
	 * @param HTMLPurifier_Config $config
	 *
	 * @return string
	 */
	protected function getKey( $config ) {
		return $this->type . "/" . $this->generateKey( $config );
	}

	/**
	 * Static method used to register the custom post type that acts as storage for the definition cache.
	 */
	public static function register_storage() {
		$args = array(
			'public' => false
		);

		register_post_type( 'livepress_html_def', $args );
	}
}

add_action( 'init', array( 'HTMLPurifier_DefinitionCache_WPDatabase', 'register_storage' ) );

HTMLPurifier_DefinitionCacheFactory::instance()->register( "WPDatabase", "HTMLPurifier_DefinitionCache_WPDatabase" );
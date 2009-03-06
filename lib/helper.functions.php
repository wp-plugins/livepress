<?php

/**
 * Helper function which checks whether we are running wpmu
 *
 * @return bool true if we are on a wordpress mu system, false otherwise.
 */
if (!function_exists('AA_is_wpmu')):
function AA_is_wpmu() {
	global $wpmu_version, $wp_version;
	return (bool) ( (isset($wpmu_version)) || (strpos($wp_version, 'wordpress-mu')) );
}
endif;

?>
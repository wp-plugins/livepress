<?php

/**
 * Helper function which checks whether we are running wpmu
 *
 * @return bool true if we are on a wordpress mu system, false otherwise.
 */
if (!function_exists('AA_is_wpmu')):
function AA_is_wpmu() {
	return function_exists('wpmu_validate_blog_signup');
}
endif;

?>
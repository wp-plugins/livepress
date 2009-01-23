<?php

/**
 * helper function which checks whether we are running wpmu
 */
if (!function_exists('is_wpmu')):
function is_wpmu() {
	return function_exists('wpmu_validate_blog_signup');
}
endif;

?>
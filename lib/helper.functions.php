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

/**
 * Case insensitive version of in_array().
 *
 * @see http://us2.php.net/manual/en/function.in-array.php#88844
 * @return bool true if $needle is in $haystack, false otherwise.
 */
if (!function_exists('in_arrayi')):
function in_arrayi( $needle, $haystack ) {
	foreach( $haystack as $value )
		if( strtolower( $value ) == strtolower( $needle ) )
			return true;
	return false;
}
endif;

/**
 * A simple function to type less when wanting to check if any one of many values is in a single array.
 *
 * @see http://us2.php.net/manual/en/function.in-array.php#75263
 * @uses in_arrayi()
 * @return bool true if at least one value is in both arrays, false otherwise.
 */
if (!function_exists('array_in_array')):
function array_in_array($needle, $haystack) {
    //Make sure $needle is an array for foreach
    if(!is_array($needle)) $needle = array($needle);
    //For each value in $needle, return TRUE if in $haystack
    foreach($needle as $pin)
        if(in_arrayi($pin, $haystack)) return TRUE;
    //Return FALSE if none of the values from $needle are found in $haystack
    return FALSE;
}
endif;

?>
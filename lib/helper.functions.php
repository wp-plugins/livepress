<?php

/**
 * Helper function which checks whether we are running wpmu
 *
 * @return bool true if we are on a wordpress mu system, false otherwise.
 */
if (!function_exists('AA_is_wpmu')):
function AA_is_wpmu() {
	// Wordpress 3.0+
	if (function_exists('is_multisite')) {
		return is_multisite();
	}
	// Old WordpressMU versions
	else {
		global $wpmu_version, $wp_version;
		return (bool) ( (isset($wpmu_version)) || (strpos($wp_version, 'wordpress-mu')) );
	}
}
endif;

/**
 * Helper function which checks whether we are running buddypress
 *
 * @return bool true if we are on a system running buddypress, false otherwise.
 */
if (!function_exists('AA_is_bp')):
function AA_is_bp() {
	return defined('BP_VERSION')
		|| defined('BP_CORE_VERSION'); // buddypress versions < 1.0 (?)
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

/**
 * A simple implementation of "array_slice()" which preserves array keys.
 *
 * @see http://www.php.net/manual/en/function.array-slice.php#75865
 * @param $a array
 * @param $num number of items which to limit the array to
 * @return array with $num
 */
if (!function_exists('atrim')):
function atrim( $a, $num ) {
    while( sizeof( $a ) > $num ) array_pop( $a );
    return $a;
}
endif;
?>
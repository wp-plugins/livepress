<?php
//Live+Press_2.1.7

$ljmoods = $unt_livepress_options['moods']['file'];
$ljmoods = file($ljmoods, 1);
$mood_text = $unt_livepress_options['moods']['text']; 
$mood_theme = $unt_livepress_options['moods']['theme'];
$mood_image_base_url = $unt_livepress_options['moods']['imagebaseurl'];
$unt_lp_mood_position = $unt_livepress_options['moods']['position']; 
$unt_lp_mood_xhtml = $unt_livepress_options['moods']['xhtml'];

//if ($unt_livepress_options['moods']['fixincludepath']) {
//	ini_set('include_path', '.:' . ini_get('include_path'));
//}

function add_mood ($text)
{
        global $mood_text, $unt_lp_mood_position, $unt_lp_mood_xhtml;

        $opentag = "<$unt_lp_mood_xhtml class=\"unt_lp_mood\">";
		$closetag = "</$unt_lp_mood_xhtml>";
        $content = '';

        $cur_mood = get_post_custom_values('unt_lj_mood');
        $cur_mood = $cur_mood[0];
        if ($cur_mood != '') {
                $content .= $opentag . $mood_text . $cur_mood . $closetag;
		}
		else {
        	$cur_moodid = get_post_custom_values('unt_lj_moodid');
			$cur_moodid = $cur_moodid[0];
    		if ($cur_moodid != '') {
				$content .= $opentag . $mood_text . get_mood($cur_moodid) . $closetag;
			}
		}
		
		switch ($unt_lp_mood_position) {
			case 'after' : 
				$text .= $content;
				break;
			case 'before' : 
				$text = $content . $text;
				break;
			default : 
				$text .= $content;
				break;
		}
        return $text;
}

function list_moods($num='') {
	//lists all moods in file by text and number
	global $ljmoods;

	//sort the array to make moods easier to find
	sort($ljmoods);

	foreach($ljmoods as $line_num => $mood) {
		$mood_info = explode(":",$mood);
		if (number_format($num) == number_format($mood_info[1])) {
			$content .= '<strong>' . $mood_info[1] . ' - ' .$mood_info[0] . '</strong>';
		}else {
			$content .= $mood_info[1] . ' - ' .$mood_info[0];
		}
	}
	return $content;
}

function get_mood($num) {
	//returns the markup for the text and image of mood $num
	global $ljmoods, $mood_theme, $mood_image_base_url, $mood_list_file;

	foreach($ljmoods as $line_num=>$mood) {
		$mood_info = explode(":",$mood);
		if (number_format($mood_info[1]) == number_format($num)) 
		{
			if (strlen($mood_info[2]) > 4)
			{
                $content .= '<img src="' . $mood_image_base_url . $mood_theme . '/' . $mood_info[2] . '"';
                $content .= 'alt="('. trim($mood_info[0]) .')" />&nbsp;';
            }
			$content .= trim($mood_info[0]);
	  		break;
		}
	}
	return $content;
}


function LJ_Moods_Style() {
	echo '<link rel="stylesheet" href="wp-content/plugins/livepress/LivePress/LivePress.css" type="text/css" />';
}

if( $unt_livepress_options['general']['usemoods'])
{	
	add_action('wp_head', 'LJ_Moods_Style');
	add_filter ($unt_livepress_options['moods']['location'], 'add_mood');
}
?>

<?php
//Live+Press_2.1.0

function add_music ($text)
{
        global $unt_livepress_options;
        $unt_lp_music_text = $unt_livepress_options['music']['text']; 
        $unt_lp_music_position = $unt_livepress_options['music']['position'];
        $unt_lp_music_xhtml = $unt_livepress_options['music']['xhtml'];

        $opentag = "<$unt_lp_music_xhtml class=\"unt_lp_music\">";
		$closetag = "</$unt_lp_music_xhtml>";
		        
        $content = '';
        $cur_music = get_post_custom_values('unt_lj_music');
        $cur_music = $cur_music[0];
        if ($cur_music != '') {
                $content .= $opentag . $unt_lp_music_text . $cur_music . $closetag;
		}
		switch ($unt_lp_music_position) {
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

function LJ_Music_Style() {
	echo '<link rel="stylesheet" href="wp-content/plugins/livepress/LivePress/LivePress.css" type="text/css" />';
}


if($unt_livepress_options['general']['usemusic']){
	add_action('wp_head', 'LJ_Music_Style');
	add_filter ($unt_livepress_options['music']['location'], 'add_music');
}
?>

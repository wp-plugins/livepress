<?php
//Live+Press_2.0.5

function parse_lj_tags($text)
{
global $id, $unt_livepress_options, $single;
$siteurl = get_settings('siteurl');
if ($unt_livepress_options['tags']['parse_cut'] = True)
{
	preg_match_all("/([[\{<~](lj-cut)( text=\"(.+)\")?[\]\}>~])(.*)([[\{<~]\/\\2[\]\}>~])/isU", $text, $matches);

	if ($single)
	{
		for ($i=0; $i< count($matches[5]); $i++)
		{
  			$result = '<a class="cutid" name="cutid' . (string)($i + 1) . "\"></a>" . $matches[5][$i];
			$text = str_replace($matches[5][$i], $result, $text);
		}
	}
	else
	{
                for ($i=0; $i< count($matches[5]); $i++)
                {
                        $result = '<b>(&nbsp;<a class="cutid" href="' . trim(get_permalink($id), "/") . '#cutid' . (string)($i + 1) . '">'. (isset($matches[4][$i]) ? $matches[4][$i] : 'Read More...') . '</a>&nbsp;)</b>';
			$text =  str_replace($matches[5][$i], $result, $text);
                }
	}
	$text = preg_replace('/([[\{<~]\/?lj-cut[^\]\}>~]*[\]\}>~])/i', '', $text);
}

if ($unt_livepress_options['tags']['parse_user'] = True)
{
	$text = preg_replace('/[[\{<]lj user=\"(.+)\"[]\}>]/iU', '<a class="ljuserinfo" href="http://www.livejournal.com/userinfo.bml?user=\1"><img class="ljusertagimg" src="http://stat.livejournal.com/img/userinfo.gif" alt="[info]" width="17" height="17" style="vertical-align: bottom; border: 0;"  /></a><a class="ljuser" href="http://www.livejournal.com/users/\1/"><b>\1</b></a>', $text);
}

return $text;
}

add_filter('the_content', 'parse_lj_tags');
add_filter('comment_text', 'parse_lj_tags');
?>

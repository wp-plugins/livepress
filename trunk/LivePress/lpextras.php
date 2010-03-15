<?php
//Live+Press_2.1.11

require_once(ABSPATH . 'wp-admin/admin-functions.php');


if (!function_exists('array_combine')) 
{
	function array_combine($array_keys, $array_values) {
	    $new_array = array();
	    reset($array_values);
	    if (count($array_keys) != count($array_values) || count($array_keys) == 0 || count($array_values) == 0) {
		return FALSE;
	    } else {
		foreach(array_values($array_keys) as $value) {
		    $new_array[$value] = current($array_values);
		    next($array_values);
		}
		return $new_array;
	    }
	}
}


function array_to_options($array,$selected = '') {
	if (is_array($array)) {
	    foreach($array as $key => $value) {
		$text .= "<option value=\"$key\"".(!strcmp($key, $selected) ? ' selected' : '').">$value</option>";
	    }
	}
	return $text;
}


function array_to_checkboxes($array, $checked_arr, $as_array = '') {
	if ($as_array != '') {
	    foreach($array as $key => $value) {
	        $text .= '&nbsp;&nbsp;&nbsp; ';
		$text .= "<input type=\"checkbox\"" . ($checked_arr[$key] ? ' checked' : '') . " name=\"" . $as_array . "[$key]\" /><label for=\"" . $as_array . "[$key]\">$value</label>";
	    }
	}
//	else{} /* why? *//
	return $text;
}


function bits_to_array($number) {
	If ($number == 0) {
	    return array(0 => false);
	} else {
	    $i = 0;
	    $power = 0;
	    $setbits = array();
	    while($i <= $number) {
		$i = 1 << $power;
		$setbits[$power] = checkbit($number, $power);
		$power++;
	    }
	    return $setbits;
	}
}

function array_to_bits($array) {
	$bits = 0;
	if (isset($array) && is_array($array)) {
	    foreach($array as $key => $value) {
		if ($value) {
		    $bits += 1 << $key;
		}
	    }
	}
	return $bits;
}


function checkbit($number, $bit) {
	$mask = 1 << $bit;
	return (boolean) ($number & $mask);
}


function get_LJ_login_data() {
	global $unt_livepress_options, $unt_lp_clientid, $user_login, $journals;

	require_once(ABSPATH . '/wp-includes/class-IXR.php');
	require(ABSPATH . '/wp-includes/version.php');


	if (!empty($journals)) {
	    foreach(array_keys($journals) as $type) {
		if (!strcmp($type, 'livejournal')) {
		    $jurl = "www.livejournal.com";
		} else {
		    echo "invalid journal type";
		}
		$client = new IXR_client($jurl, "/interface/xmlrpc", 80);
		//$client = new IXR_client("http://www.livejournal.com/interface/xmlrpc");
		//$client->debug = true;
//print "A getChallege in lpextras\n";
		if (!$client->query('LJ.XMLRPC.getchallenge')) {
		//    wp_die('Something went wrong - '.$client->getErrorCode().' : '.$client->getErrorMessage());
		}
		$response = $client->getResponse();
		$challenge = $response['challenge'];
/*
echo '<br>reponse : <pre>'. $response;
print_r($response);
echo '<br>jurl : '. $jurl;
echo '<br>challenge : '. $challenge;
print_r($challenge);
echo '</pre>';
*/
	      foreach(array_keys($journals[$type]) as $name) {

		$msg_array = array();
		$msg_array['mode'] = 'login'; //new
		$msg_array['username'] = utf8_encode($name);
		$msg_array['auth_method'] = utf8_encode('challenge');
		$msg_array['auth_challenge'] = utf8_encode($challenge);
		$msg_array['auth_response'] = md5($challenge . $journals[$type][$name]['pass']);
		$msg_array['clientversion'] = utf8_encode($unt_lp_clientid);
		$msg_array['getpickws'] = utf8_encode('1');
		$msg_array['getpickwurls'] = utf8_encode('1');

		//if (!$client->query('LJ.XMLRPC.login', $msg_array)) { //removing mode ' login'
//print "A login in lpextras\n";
		if (!$client->query('LJ.XMLRPC.login', $msg_array)) {
		    return false;
		}
		$journals[$type][$name]['data'] = $client->getResponse();

 	      }
	   }
	}
}


function user_pics($lj_meta) {
	global $unt_livepress_options, $journals;
	$userpics_text = $unt_livepress_options['userpics']['text'];
	$text .= $userpics_text;
	$text .= '<select id="ljuserpics" name="ljuserpics" class="LJExtras_userpics"></select>';
 
	if (!empty($journals)) {
	foreach ($journals as $type => $login) {
	foreach ($journals[$type] as $key => $value) {
	    $username = $key;

	    $lj_picz = $value['data']['pickws'];
	    if (count($lj_picz) <= 0) {
		$lj_picz = array("0"=>"(no pics)");
	    }
	    $lj_pics = array_combine(array_values($lj_picz), $lj_picz);
	    $text .= '<select id="' . $username . '_userpics" name="';
	    $text .= $username . '_userpics" class="LJExtras_userpics" style="display:none;">';
	    $text .= '<option value="">(default)</option>';
	    $text .= array_to_options($lj_pics, $lj_meta['unt_lj_userpic']['value']);
	    $text .= '</select> ' . "\n";
	}
	}
	}
	return $text;
}


function friend_groups($lj_meta) {
	global $unt_livepress_options, $journals;

	$text .= '<select id="ljfriendgroups" name="ljfriendgroups" class="LJExtras_friendgroups" onChange="toggleBoxVis(this);">';
	$text .= '<option value="public"';
	$text .= ($lj_meta['unt_lj_securitylevel']['value'] == 'public' ? ' selected' : '');
	$text .= '>Everyone (Public)</option>';
	$text .= '<option value="friends"';
	$text .= ($lj_meta['unt_lj_securitylevel']['value'] == 'friends' ? ' selected' : '');
	$text .= '>Friends</option>';
	$text .= '<option value="private"';
	$text .= ($lj_meta['unt_lj_securitylevel']['value'] == 'private' ? ' selected' : '');
	$text .= '>Just Me (Private)</option>';
	$text .= '<option value="usemask"';
	$text .= ($lj_meta['unt_lj_securitylevel']['value'] == 'usemask' ? ' selected' : '');
	$text .= '>Custom...</option>';
	$text .= '</select> '; 
	$text .= '<fieldset id="ljfriendboxedset" style="display:none;"></fieldset>';

	/* spit out custom friend lists */
	if (!empty($journals)) {
	foreach ($journals as $type => $login) {
	    foreach ($journals[$type] as $key => $value) {
		$username = $key;
		$lj_friendboxes = $value['data']['friendgroups'];
		$temp_array = array();

		if (!empty($lj_friendboxes)) {
		foreach($lj_friendboxes as $value) {
		    $temp_array[$value['id']] = $value['name'];
	        }
	        }

	        $lj_friendboxes = $temp_array;
	        $text .= '<fieldset id="' . $username . '_friendboxes" ';
	        $text .= 'style="display:none; border: 1px solid #ccc; padding: 7px; margin-top: 5px;">';
	        $text .= '<legend style="left:50px;">Custom Friends List</legend>';

	        if ($username == $lj_meta['unt_lj_username']['value']) {
		    $lj_activegroups = bits_to_array($lj_meta['unt_lj_allowmask']['value']);
		} else {
		    $lj_activegroups = array(); 
	        }

	        $text .= array_to_checkboxes($lj_friendboxes, $lj_activegroups , 'ljfriendboxes');
		$text .= '</fieldset>';
	    }
	}
	}
	return $text;
}


function user_journals($lj_meta) {
	global $unt_livepress_options, $journals;

	$text .= '<select id="ljuserjournals" name="ljuserjournals" class="LJExtras_userjournals"></select>';
	if (!empty($journals)) {
	foreach ($journals as $type => $login) {
	  foreach ($login as $user => $value) {
	    $lj_userjournals = array_keys($journals);
	    $text .= '<select id="'.$user.'_userjournals" name="'.$user.'_userjournals" class="LJExtras_userjournals" style="display:none;">';
	    $text .= '<option value="">LiveJournal (default)</option>';
	    //$text .= array_to_options($lj_userjournals, $lj_meta['unt_lj_journal']['value']);
	    $text .= '</select> ' . "\n";
	  }
	}
	}
	return $text;
}


function get_LJ_meta($post_ID) {
	global $wpdb, $tablepostmeta;
	$meta_array = array();

	if (is_numeric($post_ID)) {
	  $metadata = has_meta($post_ID);
	  if (isset($metadata)) {
	    foreach($metadata as $meta) {
		$meta_array[$meta['meta_key']] = array('id' => $meta['meta_id'], 'value' => $meta['meta_value']);
	    }
	  }
	}
//echo "<pre>";
//print_r($meta_array);
//echo "</pre>";
	return $meta_array;
}


function place_LJ_Extras_GUI () {
	print '<script language="JavaScript" type="text/javascript">';
	echo "\n";

	if ($_GET['action'] == 'edit' || get_option('advanced_edit')) {
	    echo 'var submitButtonPara = document.getElementById("save").parentNode;';
	} else {
	    echo 'var submitButtonPara = document.getElementById("saveasdraft").parentNode;';
	}

	echo "\n";
	echo 'var LJExtras = document.getElementById("unt_lj_extras");
	submitButtonPara.parentNode.insertBefore(LJExtras, submitButtonPara);
  	</script> ';
}



function save_LJ_meta($lj_meta, $name, $value, $post_ID)
{
	global $wpdb, $tablepostmeta;

	$metakey = $name;
	$metavalue = $wpdb->escape( stripslashes( trim($value) ) );
	if (array_key_exists($metakey, $lj_meta)) 
	{
	    //update_post_meta($post_ID, $name, $metavalue, 'true');
	    //update_meta($lj_meta[$name]['id'], $name, $metavalue);
            update_post_meta($post_ID, $metakey, $metavalue);
	    //$result = $wpdb->query(" UPDATE $tablepostmeta set meta_value='$metavalue'
	//			WHERE post_id='$post_ID' and meta_key='$metakey' ");
	}
	else 
	{
            add_post_meta($post_ID,$metakey,$metavalue,true);
	    //$result = $wpdb->query(" INSERT INTO $tablepostmeta (post_id,meta_key,meta_value)
	//				VALUES ('$post_ID','$metakey','$metavalue') ");
	}



            if (array_key_exists('unt_lj_rror', $lj_meta)) {
                update_meta($lj_meta['unt_lj_error']['id'], 'unt_lj_error', $metavalue);
            } else {
                $metakey = 'unt_lj_error';
                add_post_meta($post_ID,$metakey,$metavalue,true);
            }





}


function save_LJ_Extras ($post_ID) 
{
	global $wpdb, $tablepostmeta, $unt_livepress_options;
	$lj_meta = get_LJ_meta($post_ID);

	//if (!$_POST['deletemeta'] && !$_POST['updatemeta'])
	if (!$_POST['deletemeta'])
	{
	    if ($_POST['ljusername'] != '') {
		save_LJ_meta($lj_meta, 'unt_lj_username', $_POST['ljusername'], $post_ID);
	    }
	    if (($unt_livepress_options['general']['usemusic']) && ($_POST['ljmusic'] != '')) {		
		    save_LJ_meta($lj_meta, 'unt_lj_music', $_POST['ljmusic'], $post_ID);
	    }
	    if ($unt_livepress_options['general']['usemoods']) {
		if ($_POST['ljmoodid'] != '') {
		    save_LJ_meta($lj_meta, 'unt_lj_moodid', $_POST['ljmoodid'], $post_ID);
		}
		if ($_POST['ljmood'] != '') {
		    save_LJ_meta($lj_meta, 'unt_lj_mood', $_POST['ljmood'], $post_ID);
		}
	    }

	    //save_LJ_meta($lj_meta, 'unt_lj_nosynch', $_POST['ljnosynch'], $post_ID);
	    //save_LJ_meta($lj_meta, 'unt_lj_excerpt', $_POST['ljexcerptonly'], $post_ID);
	    //save_LJ_meta($lj_meta, 'unt_lj_synchall', $_POST['ljsynchall'], $post_ID);
	    save_LJ_meta($lj_meta, 'unt_lj_synchop', $_POST['lj_synch_op'], $post_ID);
	    //save_LJ_meta($lj_meta, 'unt_lj_cattags', $_POST['lj_synch_cattags'], $post_ID);
/*
	    if (!strcmp($_POST['lj_synch_op'], 'synchexcerpt') )
	    if ($_POST['ljexcerptonly'] != '') 
	    {
		save_LJ_meta($lj_meta, 'unt_lj_synch', 'notchecked', $post_ID);
		save_LJ_meta($lj_meta, 'unt_lj_excerptonly', 'checked', $post_ID);
	    } else {
		save_LJ_meta($lj_meta, 'unt_lj_excerptonly', 'notchecked', $post_ID);
		save_LJ_meta($lj_meta, 'unt_lj_synch', 'checked', $post_ID);
	    }
*/

	    if ($_POST['ljnocomment'] != '') {
		save_LJ_meta($lj_meta, 'unt_lj_nocomment', 'checked', $post_ID);
	    } else {
		save_LJ_meta($lj_meta, 'unt_lj_nocomment', 'notchecked', $post_ID);
	    }
	    if ($_POST['ljuserjournals'] != '') 
	    {
		save_LJ_meta($lj_meta, 'unt_lj_journal', $_POST['ljuserjournals'], $post_ID);
	    }
	    if ($_POST['ljlinkback'] != '' ) {
		save_LJ_meta($lj_meta, 'unt_lj_linkback', 'checked', $post_ID);
	    } else {
		save_LJ_meta($lj_meta, 'unt_lj_linkback', 'notchecked', $post_ID);
	    }
	    if ($_POST['ljlinkbacktext'] != '') 
	    {
		save_LJ_meta($lj_meta, 'unt_lj_linkbacktext', $_POST['ljlinkbacktext'], $post_ID);
	    }
	    if ($_POST['ljentry'] != '') 
	    {
		save_LJ_meta($lj_meta, 'unt_lj_entry', $_POST['ljentry'], $post_ID);
	    }
	    if ($_POST['ljuserpics'] != '') 
	    {
		save_LJ_meta($lj_meta, 'unt_lj_userpic', $_POST['ljuserpics'], $post_ID);
	    }
	    if ($_POST['ljfriendgroups'] != '')
	    {
		save_LJ_meta($lj_meta, 'unt_lj_securitylevel', $_POST['ljfriendgroups'], $post_ID);
	    }
	    if (isset($_POST['ljfriendboxes'])) 
	    {
		save_LJ_meta($lj_meta, 'unt_lj_allowmask', array_to_bits($_POST['ljfriendboxes']), $post_ID);
	    }
	}
	return $post_ID;
}



function mood_list($meta)
{
	//get values from LJ mood config file
	global $unt_livepress_options, $ljmoods;
	$mood_text = $unt_livepress_options['moods']['text'];

	$lj_meta = $meta;

	$text = $mood_text;
	$text .= '<select id="ljmoodid" name="ljmoodid" class="LJExtras_mood">';

	//sort the array to make moods easier to find
	sort($ljmoods);

	foreach($ljmoods as $line_num => $mood) 
	{
	    $mood_info = explode(":",$mood);
	    $text .= '<option ';
	    if (array_key_exists('unt_lj_moodid', $lj_meta) && $mood_info[1] == $lj_meta['unt_lj_moodid']['value'])
            {
		$text .= 'selected ';
	    }
	    $text .= 'value="' . $mood_info[1] . '">';
	    $text .= "<img src=\"" . $unt_livepress_options['moods']['imagebaseurl'] . "/";
	    $text .= $unt_livepress_options['moods']['theme'] . "/" . $mood_info[2] . "\"/> ";
	    $text .= $mood_info[0] . ' </option>\n';

	    //$mood_theme = $unt_livepress_options['moods']['theme'];
	    //$mood_image_base_url = $unt_livepress_options['moods']['imagebaseurl'];
	}

	$text .= '</select> Alt Text <input type="text" id="ljmood" name="ljmood" size="30" value="';
	if (array_key_exists('unt_lj_mood', $lj_meta)) 
	{
	    $text.=  $lj_meta['unt_lj_mood']['value'];
	}
	$text .= '" />' . "\n";
	
	return $text;
}



function build_LJ_Extras_GUI()
{
	global $unt_livepress_options, $journals;
	$unt_lp_music_text	= $unt_livepress_options['music']['text'];
	$excerpt_by_default	= $unt_livepress_options['synch']['excerpt'];
	$insertlinkbackop	= $unt_livepress_options['synch']['insertlinkback'];
	$nocommentbackop	= $unt_livepress_options['synch']['nocommentdefault'];
	$userpics_text		= $unt_livepress_options['userpics']['text'];
	$unt_lp_settings	= $unt_livepress_options;
/*
echo "<pre> unt_livepress_options \n";
print_r($unt_livepress_options['synch']);
echo "</pre>";
*/
	$lj_meta = get_LJ_meta($_GET['post']);
	if (!empty($lj_meta['unt_lj_linkback']['value'])) {
	    $insertlinkbackop = $lj_meta['unt_lj_linkback']['value'];
	}
	echo '<div class="postbox">
	<h3 class="dbx-handle">LivePress Extras</h3><div id="unt_lj_extras" class="inside">';

	#if (!array_key_exists('unt_lj_nosynch', $lj_meta)) {
	#	$lj_meta['unt_lj_synchall']['value']	= $unt_livepress_options['synch']['synchall']; 
	#	$lj_meta['unt_lj_nosynch']['value']	= $unt_livepress_options['synch']['nosynch']; 
	#	$lj_meta['unt_lj_excerptonly']['value']	= $unt_livepress_options['synch']['excerpt']; 
	#}
    if (!empty($journals))  {
	foreach(array_keys($journals) as $type) {
	    if (!strcmp($type, 'livejournal')) {
		$jurl = "www.livejournal.com";
	    } else {
		echo "invalid journal type";
	    }
	}

	$synchoption = $unt_livepress_options['synch']['synchdefault'];

	if (isset($lj_meta['unt_lj_synchop']['value']) && !empty($lj_meta['unt_lj_synchop']['value'])) {
	    $synchoption = $lj_meta['unt_lj_synchop']['value'];
	}
/*
	echo '<br>ljnosynch '. $_POST['ljnosynch'];
	echo '<br>ljsynchall '. $_POST['ljsynchall'];
	echo '<br>ljsynchexcerpt '. $_POST['ljsynchexcerpt'];
	echo '<br>lj_synch_op '. $_POST['lj_synch_op'];
	echo '<br>';
*/
/*
echo "<pre>unt_livepress_options synch <br>";
print_r($unt_livepress_options['synch']);
echo "</pre>";
*/
	/* Display excertp only option box  */ 
	echo '<form>';
	echo '<strong>Syncing Options &raquo;&raquo;</strong>';
	echo '&nbsp;&nbsp;&nbsp;&nbsp; ';
	echo '<input id="ljnosynch" name="lj_synch_op" type="radio" value="nosynch" ';
	echo (strcmp($synchoption, "nosynch") ? '' : 'checked');
	echo ' /> No Synch,';

	echo '&nbsp;&nbsp;&nbsp;&nbsp; ';
        echo '<input id="ljexcerptonly" name="lj_synch_op" type="radio" value="synchexcerpt"';
	echo (strcmp($synchoption, "synchexcerpt") ? '' : 'checked');
	echo  '/> Excerpt Only, ';

	echo '&nbsp;&nbsp;&nbsp;&nbsp; ';
	echo '<input id="ljsynchall" name="lj_synch_op" type="radio" value="synchall" ';
        echo (!strcmp($synchoption, "synchall") ? 'checked' : '') . '/> Entire Post.';
        echo '<hr size=1px; /><br/>';
	echo '</form>';

	/* Journals Drop down box. */
	echo 'Post to: ' . user_journals($lj_meta);
        echo '&nbsp;&nbsp;&nbsp; ';

	/* Journal Accounts Drop down box. */
        echo 'Username: <select id="ljusername" name="ljusername" class="LJExtras_username" onChange="swapLists(this);">';
	if (!empty($journals)) {
	foreach ($journals as $type => $login) {
	    foreach ($journals[$type] as $key => $value) {
        	echo '<option ';
		echo (!strcmp($lj_meta['unt_lj_username']['value'], $key) ? 'selected' : '');
        	echo ' value="' . $key . '">' . $key . '</option>';
            }
        }
        }
        echo '</select>';
        echo '&nbsp;&nbsp;&nbsp; ';

	/* User Pic Drop down box. */
        echo user_pics($lj_meta);
	echo '<br /><br />';

	if($unt_lp_settings['general']['usemoods'])
	{
	    echo mood_list($lj_meta) . '<br />';
	}

	if($unt_lp_settings['general']['usemusic'])
	{
	    echo  $unt_lp_music_text . '<input type="text" id="ljmusic" name="ljmusic" size="53" value="';
	    if (array_key_exists('unt_lj_music', $lj_meta)) 
	    {
		echo $lj_meta['unt_lj_music']['value'];
	    }
	    echo '" /> <br /><br/>';
	}

	echo 'Insert Linkback: <input id="ljlinkback" name="ljlinkback" type="checkbox" ';
	echo (!strcmp($insertlinkbackop, "checked") ? "'checked'" : "''") . '>';
	echo '&nbsp;&nbsp;';

	/* Display linkbacktext textbox  */ 
        echo ' Linkback Text: <input id="ljlinkbacktext" name="ljlinkbacktext" size="40" value="';
	if (array_key_exists('unt_lj_linkbacktext', $lj_meta)) 
	{
	    echo $lj_meta['unt_lj_linkbacktext']['value']; 
	} else {
	    echo $unt_livepress_options['synch']['linkbacktext']; 
	}
	echo '"/><br /><br/>';

	/* LJ Entry ID */
	echo 'LiveJournal Entry ID (read only): <input id="ljentry" name="ljentry" value="';
	if (array_key_exists('unt_lj_entry', $lj_meta))
	{ 
	    echo $lj_meta['unt_lj_entry']['value']; 
	}
	echo '" size=3 readonly/>';
	echo '&nbsp;&nbsp;';

	/* Disable Comments */
	echo '&nbsp;&nbsp;';
	echo '&nbsp;&nbsp;';
	echo '&nbsp;&nbsp;';
	
	if (!empty($lj_meta['unt_lj_nocomment']['value'])) {
	    $nocommentbackop = $lj_meta['unt_lj_nocomment']['value'];
	}
	echo 'Disable Comments: <input id="ljnocomment" name="ljnocomment" type="checkbox" ';
	echo (!strcmp($nocommentbackop, "notchecked") ? "''" : "value='checked' 'checked'");
	echo "><br /><br/>";
        
	echo 'Security: ' . friend_groups($lj_meta) . '<br />';
    } else {
	echo 'There are no journals logins configured. <br /> To configure one, go to the Live+Press Options page';
    }
    echo '</div></div>';
}

function journal_Switcher()
{
	echo '<script language="JavaScript">
function swapLists(theList) {
	var replacement = theList.options[theList.selectedIndex].value;
	changeContent("unt_lj_extras", replacement + \'_userjournals\', "ljuserjournals");
	changeContent("unt_lj_extras", replacement + \'_userpics\', "ljuserpics");
	changeContent("unt_lj_extras", replacement + \'_friendboxes\', "ljfriendboxedset");
	var friendgroups = 	document.getElementById("ljfriendgroups");
	if (friendgroups.options[friendgroups.selectedIndex].text != "Custom...")
	{
		document.getElementById("ljfriendboxedset").style.display = "none";
	}
	else
	{
		document.getElementById("ljfriendboxedset").style.display = "";
	}
}

function toggleBoxVis(theList) {
	var boxes = document.getElementById("ljfriendboxedset");
	if (theList.options[theList.selectedIndex].text == "Custom...")
	{
		boxes.style.display = "";
	}
	else
	{
		boxes.style.display = "none";
	}
}

function changeContent(parent, source, target) {
	var chg_parent = document.getElementById(parent);
	var tempNode = document.getElementById(source).cloneNode(true);
	chg_parent.replaceChild(tempNode, document.getElementById(target));
	tempNode = document.getElementById(source);
	tempNode.id = target
	tempNode.name = target
	tempNode.style.display = "";
}
</script>';
}

function init_LJ_Extras_GUI()
{
	global $unt_livepress_options, $journals;
	if (isset($journals) && (!empty($journals)) ) 
	{
	    $firstJournal = array_keys($journals);
	    $firstUserName = $firstJournal[0];
	    echo '<script language="JavaScript">';
	if (!empty($journals)) {
	    foreach ($journals as $type => $login) {
	    foreach ($journals[$type] as $key => $value) 
	    {
		echo 'document.getElementsByTagName(\'body\')[0].appendChild(document.getElementById("'. $key .'_friendboxes"));' ."\n";
	    }
	    }
	}
	    echo 'swapLists(document.getElementById("ljusername"));
		</script>';
	}
}


if (strpos($_SERVER['PHP_SELF'],'wp-admin/post-new.php') 
	|| strpos($_SERVER['PHP_SELF'],'wp-admin/post.php') 
	|| strpos($_SERVER['PHP_SELF'],'LivePress/lpadmin.php')
	|| strpos($_SERVER['REQUEST_URI'],'wp-admin/options-general.php?page=livepress/LivePress')
	|| strpos($_SERVER['PHP_SELF'],'wp-admin/bookmarklet.php'))
{ 

$tempself = $_SERVER['PHP_SELF'] ;

	get_LJ_login_data();
	//print "Called LJ_login_data because PHP_SELF is $tempself \n";
}


if (strpos($_SERVER['SCRIPT_URI'],'wp-admin'))
{
    //add_action('admin_head', 'LJ_Extras_Style');
    //add_action('admin_footer', 'build_LJ_Extras_GUI');
    //add_action('admin_footer', 'place_LJ_Extras_GUI');
    //add_action('admin_head', 'journal_Switcher');

    add_action('admin_footer', 'init_LJ_Extras_GUI');
    add_action('edit_post', 'save_LJ_Extras');
    add_action('publish_post', 'save_LJ_Extras', 5);
    add_action('simple_edit_form', 'build_LJ_Extras_GUI');
    add_action('edit_form_advanced', 'build_LJ_Extras_GUI');

}

?>

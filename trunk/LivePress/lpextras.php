<?php
//Live+Press_2.0.5

require_once(dirname(__FILE__) . '/../../../../wp-admin/includes/post.php');


if (!function_exists('array_combine')){
	function array_combine($array_keys, $array_values){
		$new_array = array();
		reset($array_values);
		if (count($array_keys) != count($array_values) || count($array_keys) == 0 || count($array_values) == 0) {return FALSE;}
		else {
			foreach(array_values($array_keys) as $value){
				$new_array[$value] = current($array_values);
				next($array_values);
			}
			return $new_array;
		}
	}
}

function array_to_options($array,$selected = '')
{
	if (is_array($array)) {
		foreach($array as $key => $value)
		{
		  $text .= "<option value=\"$key\"".($key == $selected ? ' selected' : '').">$value</option>";
		}
	}
	return $text;
}

function array_to_checkboxes($array, $checked_arr, $as_array = '') {
	if ($as_array != ''){
		foreach($array as $key => $value){
			$text .= "<input type=\"checkbox\"" . ($checked_arr[$key] ? ' checked' : '') . " name=\"" . $as_array . "[$key]\" /><label for=\"" . $as_array . "[$key]\">$value</label>";
		}
	}
	else{}
	return $text;
}

function bits_to_array($number){
	If ($number == 0) {
		return array(0 => false);
	}
	else {
		$i = 0;
		$power = 0;
		$setbits = array();
		while($i <= $number){
			$i = 1 << $power;
			$setbits[$power] = checkbit($number, $power);
			$power++;
		}
		return $setbits;
	}
}

function array_to_bits($array){
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

function get_LJ_login_data()
{
	global $unt_livepress_options, $unt_lp_clientid, $user_login, $journals;
	 //get_currentuserinfo();
	if (isset($journals)) {
	foreach (array_keys($journals) as $name){
		//if (strpos($journals[$name]['allowlist'], $user_login) === False)
		//{
			//unset($journals[$name]);
		//}	
	}
	}
	require_once(ABSPATH . '/wp-includes/class-IXR.php');

	if (isset($journals)) {
	foreach(array_keys($journals) as $name) {
		$msg_array = array();
		$msg_array['username'] = utf8_encode($name);
		$msg_array['auth_method'] = utf8_encode('clear');
		$msg_array['hpassword'] = utf8_encode($journals[$name]['password']);
		$msg_array['clientversion'] = utf8_encode($unt_lp_clientid);
		$msg_array['getpickws'] = utf8_encode('1');
		$msg_array['getpickwurls'] = utf8_encode('1');
		$client = new IXR_client("www.livejournal.com", "/interface/xmlrpc", 80);
		$client->debug = false;

		if (!$client->query('LJ.XMLRPC.login', $msg_array)) {
			return false;
		}
		$journals[$name]['data'] = $client->getResponse();
	}
	}
}

function user_pics($lj_meta){
	global $unt_livepress_options, $journals;
	$userpics_text = $unt_livepress_options['userpics']['text'];
	$text .= $userpics_text;
	$text .= '<select id="ljuserpics" name="ljuserpics" class="LJExtras_userpics"></select>';

	foreach ($journals as $key => $value){
	    $username = $key;
	    $lj_picz = $value['data']['pickws'];
	    if (count($lj_picz) <= 0) {
		$lj_picz = array("0"=>"(no pics)");
	    }
	    $lj_pics = array_combine(array_values($lj_picz), $lj_picz);

	    $text .= '<select id="' . $username . '_userpics" name="' . $username . '_userpics" class="LJExtras_userpics" style="display:none;">';
	    $text .= '<option value="">(default)</option>';
	    $text .= array_to_options($lj_pics, $lj_meta['unt_lj_userpic']['value']);
	    $text .= '</select> ' . "\n";
	}
	return $text;
}

function friend_groups($lj_meta){
	global $unt_livepress_options, $journals;
	$text .= '<select id="ljfriendgroups" name="ljfriendgroups" class="LJExtras_friendgroups" onChange="toggleBoxVis(this);">';
	$text .= '<option value="public"' .($lj_meta['unt_lj_securitylevel']['value'] == 'public' ? ' selected' : '') . '>Public</option>';
	$text .= '<option value="private"' .($lj_meta['unt_lj_securitylevel']['value'] == 'private' ? ' selected' : '') . '>Private</option>';
	$text .= '<option value="friends"' .($lj_meta['unt_lj_securitylevel']['value'] == 'friends' ? ' selected' : '') . '>Friends</option>';
	$text .= '<option value="usemask"' .($lj_meta['unt_lj_securitylevel']['value'] == 'usemask' ? ' selected' : '') . '>Custom</option>';
	$text .= '</select> ' . "\n";
	$text .= '<fieldset id="ljfriendboxedset" style="display:none;"></fieldset>';

	foreach ($journals as $key => $value){
		$username = $key;
		$lj_friendboxes = $value['data']['friendgroups'];
		$temp_array = array();
		foreach($lj_friendboxes as $value) {
			$temp_array[$value['id']] = $value['name'];
		}
		$lj_friendboxes = $temp_array;

		$text .= '<fieldset id="' . $username . '_friendboxes" style="display:none;">';
		if ($username == $lj_meta['unt_lj_username']['value']) {
			$lj_activegroups = bits_to_array($lj_meta['unt_lj_allowmask']['value']);
		}
		else { $lj_activegroups = array(); }
		$text .= array_to_checkboxes($lj_friendboxes, $lj_activegroups , 'ljfriendboxes');
		$text .= '</fieldset>';

	}
	return $text;
}

function user_journals($lj_meta) {
	global $unt_livepress_options, $journals;
	$text .= '<select id="ljuserjournals" name="ljuserjournals" class="LJExtras_userjournals"></select>';
	foreach ($journals as $key => $value){
	    $username = $key;
	    $lj_userjournals = $value['data']['userjournals'];
	    if (count($lj_userjournals) <= 0) {
		$lj_userjournals = array("0"=>"(no journals)");
	    }
	    $lj_userjournals = array_combine(array_values($lj_userjournals), $lj_userjournals);
	    $text .= '<select id="' . $username . '_userjournals" name="' . $username . '_userjournals" class="LJExtras_userjournals" style="display:none;">';
	    $text .= '<option value="">(default)</option>';
	    //$text .= array_to_options($lj_userjournals, $lj_meta['unt_lj_journal']['value']);
	    $text .= '</select> ' . "\n";
	}
	return $text;
}

function get_LJ_meta($post_ID)
{
	global $wpdb, $tablepostmeta;

	$meta_array = array();

	if (is_numeric($post_ID)) {

		//$metadata = get_post_meta($post_ID);
		$metadata = has_meta($post_ID);
		if (isset($metadata)) {
			foreach($metadata as $meta) {
				$meta_array[$meta['meta_key']] = array('id' => $meta['meta_id'], 'value' => $meta['meta_value']);
			}
		}
	}
	return $meta_array;
}

function place_LJ_Extras_GUI ()
{
	print '<script language="JavaScript" type="text/javascript">';
	echo "\n";
	if ($_GET['action'] == 'edit' || get_settings('advanced_edit')) {
		echo 'var submitButtonPara = document.getElementById("save").parentNode;';
	}

	else {
		echo 'var submitButtonPara = document.getElementById("saveasdraft").parentNode;';
	}

		echo "\n";
		echo 'var LJExtras = document.getElementById("unt_lj_extras");
		submitButtonPara.parentNode.insertBefore(LJExtras, submitButtonPara);
  		</script>
  		';
}

function save_LJ_meta($lj_meta, $name, $value, $post_ID)
{
	global $wpdb, $tablepostmeta;

	$metavalue = $wpdb->escape( stripslashes( trim($value) ) );
	if (array_key_exists($name, $lj_meta)) 
	{
		update_meta($lj_meta[$name]['id'], $name, $metavalue);
	}
	else 
	{
		$metakey = $name;
		$result = $wpdb->query("
							INSERT INTO $tablepostmeta
							(post_id,meta_key,meta_value)
							VALUES ('$post_ID','$metakey','$metavalue')
						");
	}
}

function save_LJ_Extras ($post_ID) 
{
	global $wpdb, $tablepostmeta, $unt_livepress_options;
	$lj_meta = get_LJ_meta($post_ID);
	if (!$_POST['deletemeta'] && !$_POST['updatemeta'])
    {
        if ($_POST['ljusername'] != '') 
        {
            save_LJ_meta($lj_meta, 'unt_lj_username', $_POST['ljusername'], $post_ID);
        }
        if($unt_livepress_options['general']['usemusic'])
        {
            if ($_POST['ljmusic'] != '')
            {		
                save_LJ_meta($lj_meta, 'unt_lj_music', $_POST['ljmusic'], $post_ID);
            }
        }
        if($unt_livepress_options['general']['usemoods'])
        {
            if ($_POST['ljmoodid'] != '') 
            {
                save_LJ_meta($lj_meta, 'unt_lj_moodid', $_POST['ljmoodid'], $post_ID);
            }
            if ($_POST['ljmood'] != '')
            {
                save_LJ_meta($lj_meta, 'unt_lj_mood', $_POST['ljmood'], $post_ID);
            }
        }
        if ($_POST['ljsynch']) 
        {
            save_LJ_meta($lj_meta, 'unt_lj_synch', 'checked', $post_ID);
        }
        if ($_POST['ljexcerptonly']) 
        {
            save_LJ_meta($lj_meta, 'unt_lj_excerptonly', 'checked', $post_ID);
        }
        if ($_POST['ljnocomment']) 
        {
            save_LJ_meta($lj_meta, 'unt_lj_nocomment', 'checked', $post_ID);
        }
        if ($_POST['ljuserjournals'] != '') 
        {
            save_LJ_meta($lj_meta, 'unt_lj_journal', $_POST['ljuserjournals'], $post_ID);
        }
        if ($_POST['ljlinkback'] != '') 
        {
            save_LJ_meta($lj_meta, 'unt_lj_linkback', 'checked', $post_ID);
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
		$text .= '<option';
		if (array_key_exists('unt_lj_moodid', $lj_meta) && $mood_info[1] == $lj_meta['unt_lj_moodid']['value'])
        {
			$text .= ' selected';
		}
		$text .= ' value="' . $mood_info[1] . '">'. $mood_info[0]  . "</option>\n";
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
	$unt_lp_music_text = $unt_livepress_options['music']['text'];
    $synch_by_default = $unt_livepress_options['synch']['bydefault'];
    $excerpt_by_default = $unt_livepress_options['synch']['excerptonly'];
    $linkback_by_default = $unt_livepress_options['synch']['insertlinkback'];
    $userpics_text = $unt_livepress_options['userpics']['text'];
    $unt_lp_settings = $unt_livepress_options;

	$lj_meta = get_LJ_meta($_GET['post']);
	echo '<fieldset id="unt_lj_extras" class="lj-dbx-box">
	<h3 class="dbx-handle">LJ Extras</h3>';
	if (isset($journals)) 
	{
        echo 'LJ Username: <select id="ljusername" name="ljusername" class="LJExtras_username" onChange="swapLists(this);">';
        foreach($journals as $key => $value) 
        {
            echo '<option';
            if ($key == $lj_meta['unt_lj_username']['value']) 
            {
                echo ' selected';
            }
            echo ' value="' . $key . '">' . $key . '</option>';
        }
        echo '</select>&nbsp;&nbsp;';
        echo user_pics($lj_meta);
		
        echo '<br />Post to: ';
        echo user_journals($lj_meta);
        echo '&nbsp;&nbsp;
		Security: ';
        echo friend_groups($lj_meta);
		echo '
		&nbsp;&nbsp;Disable Comments: <input id="ljnocomment" name="ljnocomment" type="checkbox" ';
        if (array_key_exists('unt_lj_nocomment', $lj_meta))
        {
            echo $lj_meta['unt_lj_nocomment']['value'] . ' ';
        }
        echo '/>';
		echo '<br /> ';
	if($unt_lp_settings['general']['usemusic'])
	{
		echo  $unt_lp_music_text . '<input type="text" id="ljmusic" name="ljmusic" size="55" value="';
		if (array_key_exists('unt_lj_music', $lj_meta)) 
		{
			echo $lj_meta['unt_lj_music']['value'];
		}
		echo '" /> <br />';
	}
	if($unt_lp_settings['general']['usemoods'])
	{
		echo mood_list($lj_meta);
		echo '<br />';
	}
	echo 'Insert Linkback: <input id="ljlinkback" name="ljlinkback" type="checkbox" ';
        if (array_key_exists('unt_lj_linkback', $lj_meta))
        {
            echo $lj_meta['unt_lj_linkback']['value'] . ' ';
        }
        elseif ($linkback_by_default) 
        {
            echo 'checked'  . ' ';
        }
        echo '/>
	Linkback Text: <input id="ljlinkbacktext" name="ljlinkbacktext" size="40" value="';
	if (array_key_exists('unt_lj_linkbacktext', $lj_meta)) { echo $lj_meta['unt_lj_linkbacktext']['value']; }
	else { echo $unt_livepress_options['synch']['linkbacktext']; }
	echo '"/>';
	echo '<br /> LiveJournal Entry: <input id="ljentry" name="ljentry" value="';
	if (array_key_exists('unt_lj_entry', $lj_meta)){ echo $lj_meta['unt_lj_entry']['value']; }
	echo '" />';
		echo '
		 &nbsp;&nbsp;Synch: Entire Post: <input id="ljsynch" name="ljsynch" type="checkbox" ';
        if (array_key_exists('unt_lj_synch', $lj_meta))
        {
            echo $lj_meta['unt_lj_synch']['value'] . ' ';
        }
        elseif ($synch_by_default) 
        {
            echo 'checked'  . ' ';
        }
        echo '/>
        &nbsp;&nbsp;Exceprt Only: <input id="ljexcerptonly" name="ljexcerptonly" type="checkbox" ';
        if (array_key_exists('unt_lj_excerptonly', $lj_meta))
        {
            echo $lj_meta['unt_lj_excerptonly']['value'] . ' ';
        }
        elseif ($excerpt_by_default) 
        {
            echo 'checked'  . ' ';
        }
        echo '/>';
        
    } else {
            echo 'You have no Journals configured.<br/>Go to the Live+Press settings page to add a journal.';
    }
    echo '</fieldset>';
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
	if (friendgroups.options[friendgroups.selectedIndex].text != "Custom")
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
	if (theList.options[theList.selectedIndex].text == "Custom")
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
	if (isset($journals)) 
	{
		$firstJournal = array_keys($journals);
		$firstUserName = $firstJournal[0];
		echo '<script language="JavaScript">';
		foreach ($journals as $key => $value)
		{
		  echo 'document.getElementsByTagName(\'body\')[0].appendChild(document.getElementById("'. $key .'_friendboxes"));' ."\n";
		}
		echo 'swapLists(document.getElementById("ljusername"));
</script>';
	}
}

if (strpos($_SERVER['PHP_SELF'],'wp-admin/post-new.php') || strpos($_SERVER['PHP_SELF'],'wp-admin/post.php') || strpos($_SERVER['PHP_SELF'],'wp-admin/bookmarklet.php'))
{ 
    get_LJ_login_data();
    //add_action('admin_head', 'LJ_Extras_Style');
    add_action('admin_head', 'journal_Switcher');
    //add_action('admin_footer', 'build_LJ_Extras_GUI');
    //add_action('admin_footer', 'place_LJ_Extras_GUI');
    add_action('admin_footer', 'init_LJ_Extras_GUI');
    add_action('edit_post', 'save_LJ_Extras');
    add_action('publish_post', 'save_LJ_Extras', 5);
    add_action('simple_edit_form', 'build_LJ_Extras_GUI');
    add_action('edit_form_advanced', 'build_LJ_Extras_GUI');
}
?>

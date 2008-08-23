<?php
//Live+Press_2.1.0


require_once("lpextras.php");

/*
function addLinkBack($postID) {
	global $unt_livepress_options;
	$tempreturn  = '<p><font size=-1><a href="' . get_permalink($postID) . '">'; 
	$tempreturn .= $unt_livepress_options['synch']['linkbacktext'];
	$tempreturn .= '</a></font></p>';

	return $tempreturn;
}
*/

function get_category_list($post_ID) {
	global $unt_livepress_options;

	if (!strcmp($unt_livepress_options['synch']['cattags'], "categories")) {
	    $tags = get_the_category($post_ID);
	} elseif (!strcmp($unt_livepress_options['synch']['cattags'], "tags")) {
	    $tags = get_the_tags($post_ID);
	} else {
	    unset($tags);
	}

	if ($tags) {
	    foreach ($tags as $tag) {
        	if (!empty($tag_list)) {
		    $tag_list .= ", ";
		}
            $tag_list .= $tag->name; 
	    }
	}
	return $tag_list;
}


function append_Linkback ($tmpevent, $postmeta, $postid) {

	$tmpevent .= '<!-- Start LivePress linkback -->';
	$tmpevent .= '<center>';
	$tmpevent .= '<div style="padding: 5px; margin: 5px; width: auto; font-size: 11px; font-weight: bold;">';
	$tmpevent .= '<table style="border-top: 1px solid black; border-bottom: 1px solid black; padding: 5px;">';
	$tmpevent .= '<tr><td style="border-right: 1px solid #000; text-align:right; padding-left: 10px;"></td>';
	$tmpevent .= '<td style="padding: 0 15px;">';
	$tmpevent .= 'Originally published at ';
	$tmpevent .= '<a href="' . get_settings('home') . '">' . $postmeta['unt_lj_linkbacktext']['value'] . '</a>.';

	if ($postmeta['unt_lj_nocomment']['value'] == "checked") {
	    $tmpevent .= '<br /><a href="' . get_permalink($postid) . '">&raquo; Click here &laquo;</a> to leave any comments.';
	}

	$tmpevent .= '</td>';
	$tmpevent .= '<td style="border-left: 1px solid #000; text-align:right; padding-left: 10px;"></td>';
	//$tmpevent .= '<a target="_blank" href="http://wordpress.org/extend/plugins/livepress/">';
	//$tmpevent .= '<img border=0px src="http://groups.google.com/group/livepressplugin/web/lp.png"/></a>';
	$tmpevent .= '</tr>';
	$tmpevent .= '</table>';
	$tmpevent .= '</div>';
	$tmpevent .= '</center><br />';
	$tmpevent .= '<!-- End LivePress linkback -->';

	return ($tmpevent);
}


function delete_post_LJ ($post_ID) {
        global $journals, $wpdb, $tablepostmeta, $user_login, $unt_livepress_options;
        get_currentuserinfo();
        $lj_meta   = get_LJ_meta($post_ID);
	$post_data = get_postdata($post_ID);
	$the_event = '';

	$client = new IXR_client("www.livejournal.com", "/interface/xmlrpc", 80);
	if (!$client->query('LJ.XMLRPC.getchallenge')) {
	    wp_die('Something went wrong - '.$client->getErrorCode().' : '.$client->getErrorMessage());
	}
	$response = $client->getResponse();
	$challenge = $response['challenge'];

        $msgpass = $journals['livejournal'][$lj_meta['unt_lj_username']['value']]['pass'];
        $msg_array = array();
        $msg_array['username'] = utf8_encode($lj_meta['unt_lj_username']['value']);
	$msg_array['auth_method'] = utf8_encode('challenge');
	$msg_array['auth_challenge'] = utf8_encode($challenge);
	$msg_array['auth_response'] = md5($challenge . $msgpass);
        $msg_array['event'] = utf8_encode($the_event);
	$msg_array['subject'] = utf8_encode(stripslashes($the_post->post_title));
        $msg_array['lineendings'] = utf8_encode('unix');
        $msg_array['usejournals'] = utf8_encode($lj_meta['unt_lj_journal']['value']);

/*
$myFile = "/tmp/testdelete";
$fh = fopen($myFile, 'a') or die("can't open file");
$stringData = "\n  - - - -- - -  - - - \n";
$stringData .= "msg_array['event']\n";
$stringData .= $the_event;
*/
        if (array_key_exists('unt_lj_entry', $lj_meta) && $lj_meta['unt_lj_entry']['value'] != '') {
            $msg_array['itemid'] = utf8_encode($lj_meta['unt_lj_entry']['value']);
            $xmlrpc_method = 'LJ.XMLRPC.editevent';
            $client->query($xmlrpc_method, $msg_array);
            $return_values = $client->getResponse();
	}
/*
$stringData .= "\n return_values \n";
$stringData .= $return_values;
fwrite($fh, $stringData);
*/
}


function publish_phone_LJ ($post_ID){
	global $journals, $wpdb, $tablepostmeta, $user_login, $unt_livepress_options;
	$the_post = get_postdata($post_ID);

	//$uzer=get_userdata('admin');
	//$user_ID = $uzer->ID;
	//$user_pass_md5 = md5($uzer->user_pass);

	$lj_meta = get_LJ_meta($post_ID);

	$metakey_nosynch	= 'unt_lj_nosynch';
	$metakey_excerpt	= 'unt_lj_excerptonly';
	$metakey_synchall	= 'unt_lj_synchall';
	
	if (!strcmp($unt_livepress_options['email']['nosynch'], "checked")) {
	    $metavalue_nosynch	= 'checked';
	    $metavalue_excerpt	= 'notchecked';
	    $metavalue_synchall	= 'notchecked';
	    $metavalue_synchop	= 'nosynch';
	} elseif (!strcmp($unt_livepress_options['email']['excerpt'], "checked")) {
	    $metavalue_nosynch	= 'nochecked';
	    $metavalue_excerpt	= 'checked';
	    $metavalue_synchall	= 'notchecked';
	    $metavalue_synchop	= 'synchexcerpt';
	} elseif (!strcmp($unt_livepress_options['email']['synchall'], "checked")) {
	    $metavalue_nosynch	= 'notchecked';
	    $metavalue_excerpt	= 'notchecked';
	    $metavalue_synchall	= 'checked';
	    $metavalue_synchop	= 'synchall';
	}
	//add_post_meta($post_ID,$metakey_nosynch,$metavalue_nosynch,true);
	//add_post_meta($post_ID,$metakey_excerpt,$metavalue_excerpt,true);
	//add_post_meta($post_ID,$metakey_synchall,$metavalue_synchall,true);
	add_post_meta($post_ID,$metakey_synchop,$metavalue_synchop,true);

	$lj_meta['unt_lj_username']['value'] = $unt_livepress_options['email']['user'];		// userid
	add_post_meta($post_ID,'unt_lj_username',$unt_livepress_options['email']['user'],true);

	$lj_meta['unt_lj_linkback']['value'] = $unt_livepress_options['email']['linkback'];	// checked
	add_post_meta($post_ID,'unt_lj_linkback',$unt_livepress_options['email']['linkback'],true);

	$lj_meta['unt_lj_securitylevel']['value'] = $unt_livepress_options['email']['security'];// public
	add_post_meta($post_ID,'unt_lj_securitylevel',$unt_livepress_options['email']['security'],true);

	$lj_meta['unt_lj_userpic']['value']   = $unt_livepress_options['email']['userpic'];	// default
	add_post_meta($post_ID,'unt_lj_userpic',$unt_livepress_options['email']['userpic'],true);

	$lj_meta['unt_lj_nocomment']['value'] = $unt_livepress_options['email']['nocomment'];	// checked
	add_post_meta($post_ID,'unt_lj_nocomment',$unt_livepress_options['email']['nocomment'],true);

	if ($lj_meta['unt_lj_excerptonly']['value'] == 'checked') {
	    if (empty($the_post->post_excerpt)) {
		$the_event = substr($the_post->post_content, 0, $unt_livepress_options['synch']['excerptlength']);
	    } else {
	 	$the_event = $the_post->post_excerpt;
	    }
	} else {
	    $the_event = $the_post->post_content;
	}
	if (function_exists("giggle_autolink")) {
	     $the_event .= giggle_autolink($the_event,-1,1);
	}

	$the_event .= '<br /><br />';

	// Add the LinkBack
	if ($lj_meta['unt_lj_linkback']['value'] == 'checked') {
	    $the_event = append_Linkback($the_event, $lj_meta, $post_ID);
	}

	$the_event = preg_replace("/(\r\n|\n|\r)/", "\n", $the_event); // cross-platform newlines
	// Fix lj-tags hack
	$the_event = preg_replace('/([[\{<~])(\/?lj-cut.*)([]\}>~])/i', '<\2>' , $the_event);
        $the_event = convert_chars($the_event, 'html');

	 	    $client = new IXR_client("www.livejournal.com", "/interface/xmlrpc", 80);
		    if (!$client->query('LJ.XMLRPC.getchallenge')) {
		        wp_die('Something went wrong - '.$client->getErrorCode().' : '.$client->getErrorMessage());
		    }
		    $response = $client->getResponse();
		    $challenge = $response['challenge'];

	$msgpass = $journals['livejournal'][$lj_meta['unt_lj_username']['value']]['pass'];
	$msg_array = array();
	$msg_array['username'] = utf8_encode($lj_meta['unt_lj_username']['value']);
	$msg_array['auth_method'] = utf8_encode('challenge');
	$msg_array['auth_challenge'] = utf8_encode($challenge);
	$msg_array['auth_response'] = md5($challenge . $msgpass);
	$msg_array['event'] = utf8_encode($the_event);
	$msg_array['subject'] = utf8_encode(stripslashes($the_post->post_title));
	$msg_array['lineendings'] = utf8_encode('unix');
	$msg_array['usejournals'] = utf8_encode($lj_meta['unt_lj_journal']['value']);

	if ($lj_meta['unt_lj_securitylevel']['value'] == 'friends') {
	    $msg_array['security'] = utf8_encode('usemask');
	    $msg_array['allowmask'] = utf8_encode(1);
	} else {
	    $msg_array['security'] = utf8_encode($lj_meta['unt_lj_securitylevel']['value']);
	    $msg_array['allowmask'] = utf8_encode($lj_meta['unt_lj_allowmask']['value']);
	}

	$post_data = get_postdata($post_ID);
	$post_date = mktime(substr($post_data['Date'],11,2),substr($post_data['Date'],14,2),substr($post_data['Date'],17,2),substr($post_data['Date'],5,2),substr($post_data['Date'],8,2),substr($post_data['Date'],0,4));
	$msg_array['year'] = utf8_encode(date('Y', $post_date));
	$msg_array['mon'] = utf8_encode(date('m', $post_date));
	$msg_array['day'] = utf8_encode(date('d', $post_date));
	$msg_array['hour'] = utf8_encode(date('H', $post_date));
	$msg_array['min'] = utf8_encode(date('i', $post_date));

	$props = array ( "current_mood" => utf8_encode($lj_meta['unt_lj_mood']['value']), "current_moodid" => utf8_encode($lj_meta['unt_lj_moodid']['value']), "current_music" => utf8_encode($lj_meta['unt_lj_music']['value']), "picture_keyword" => utf8_encode($lj_meta['unt_lj_userpic']['value']), "taglist" => utf8_encode(get_category_list($post_ID)), "opt_nocomments" => ($lj_meta['unt_lj_nocomment']['value'] == "checked" ? true : false));
	$msg_array['props'] = $props;

	if (array_key_exists('unt_lj_entry', $lj_meta) && $lj_meta['unt_lj_entry']['value'] != ''){
	    $msg_array['itemid'] = utf8_encode($lj_meta['unt_lj_entry']['value']);
	    $xmlrpc_method = 'LJ.XMLRPC.editevent';
	} else {
	    $xmlrpc_method = 'LJ.XMLRPC.postevent';
	}

	if (!$client->query($xmlrpc_method, $msg_array)) {
	    $metavalue = $wpdb->escape( stripslashes( trim($client->getErrorCode().' : '.$client->getErrorMessage()) ) );
	    if (array_key_exists('unt_lj_error', $lj_meta)) {
		update_meta($lj_meta['unt_lj_error']['id'], 'unt_lj_error', $metavalue);
	    } else {
		$metakey = 'unt_lj_error';
		add_post_meta($post_ID,$metakey,$metavalue,true);
	    }
	}


	$return_values = $client->getResponse();

	$metavalue = $wpdb->escape( stripslashes( trim($return_values['itemid']) ) );
        if (array_key_exists('unt_lj_entry', $lj_meta)) {
	    update_meta($lj_meta['unt_lj_entry']['id'], 'unt_lj_entry', $metavalue);
	} else {
	    $metakey = 'unt_lj_entry';
        }
}


function synch_LJ ($post_ID) {

	global $journals, $wpdb, $tablepostmeta, $user_login, $unt_livepress_options;
	get_currentuserinfo();

	$lj_meta = get_LJ_meta($post_ID);

	if (!$_POST['deletemeta'] && !$_POST['updatemeta']) {
/*
$myFile = "/tmp/test";
$fh = fopen($myFile, 'w') or die("can't open file");
$stringData = "\n  - - - -- - -  - - - \n";
$stringData .= "lj_meta['unt_lj_synchop']['value']\n";
$stringData .= $lj_meta['unt_lj_synchop']['value'];
$stringData .= "\n before the second if \n";
fwrite($fh, $stringData);
*/
	   if (strcmp($lj_meta['unt_lj_synchop']['value'],'nosynch')
		&& $lj_meta['unt_lj_username']['value'] != '') {
/*
$stringData = "\n in the  second if \n";
fwrite($fh, $stringData);
*/
		$ak = $journals['livejournal'][$lj_meta['unt_lj_username']['value']]['allow'];
		if (array_key_exists($user_login, $ak)) {

/*
$stringData = "\n in the third if \n";
fwrite($fh, $stringData);
*/
		    $the_post = get_post($post_ID);

		    if (!strcmp($lj_meta['unt_lj_synchop']['value'], 'synchexcerpt'))
		    {
			if (empty($the_post->post_excerpt))
		        {
			    $the_event = substr($the_post->post_content, 0, $unt_livepress_options['synch']['excerptlength']);
			} else {
			    $the_event = $the_post->post_excerpt;
			}
		    } else {
			$the_event = $the_post->post_content;
		    }
		    if (function_exists("giggle_autolink")) {
	       		$the_event .= giggle_autolink($the_event,-1,1);
		    }
		    $the_event .= '<br /><br />';

		    // Add the LinkBack
		    if (strcmp($lj_meta['unt_lj_linkback']['value'], 'notchecked')) {
			$the_event = append_Linkback($the_event, $lj_meta, $post_ID);
		    }
		    $the_event = preg_replace("/(\r\n|\n|\r)/", "\n", $the_event); // cross-platform newlines

		    // Fix lj-tags hack
		    $the_event = preg_replace('/([[\{<~])(\/?lj-cut.*)([]\}>~])/i', '<\2>' , $the_event);
		    $the_event = preg_replace("/[^\x20-\x7f\t\n\r]+/", "", $the_event);
		    $the_event = convert_chars($the_event, 'html');

	 	    $client = new IXR_client("www.livejournal.com", "/interface/xmlrpc", 80);
		    if (!$client->query('LJ.XMLRPC.getchallenge')) {
		        wp_die('Something went wrong - '.$client->getErrorCode().' : '.$client->getErrorMessage());
		    }
		    $response = $client->getResponse();
		    $challenge = $response['challenge'];

		    $msgpass = $journals['livejournal'][$lj_meta['unt_lj_username']['value']]['pass'];
		    $msg_array = array();
		    $msg_array['username'] = utf8_encode($lj_meta['unt_lj_username']['value']);
		    $msg_array['auth_method'] = utf8_encode('challenge');
		    $msg_array['auth_challenge'] = utf8_encode($challenge);
		    $msg_array['auth_response'] = md5($challenge . $msgpass);
		    $msg_array['event'] = utf8_encode($the_event);
		    $msg_array['subject'] = utf8_encode(stripslashes($the_post->post_title));
		    $msg_array['lineendings'] = utf8_encode('unix');
		    //$msg_array['usejournals'] = utf8_encode($lj_meta['unt_lj_journal']['value']);
		    //$msg_array['event'] = apply_filters('the_content', $the_event);

		    if ($lj_meta['unt_lj_securitylevel']['value'] == 'friends') {
			$msg_array['security'] = utf8_encode('usemask');
			$msg_array['allowmask'] = utf8_encode(1);
		    } else {
			$msg_array['security'] = utf8_encode($lj_meta['unt_lj_securitylevel']['value']);
			$msg_array['allowmask'] = utf8_encode($lj_meta['unt_lj_allowmask']['value']);
		    }

		    $post_data = get_postdata($post_ID);
		    $post_date = mktime(substr($post_data['Date'],11,2),substr($post_data['Date'],14,2),substr($post_data['Date'],17,2),substr($post_data['Date'],5,2),substr($post_data['Date'],8,2),substr($post_data['Date'],0,4));
		    $msg_array['year'] = utf8_encode(date('Y', $post_date));
		    $msg_array['mon'] = utf8_encode(date('m', $post_date));
		    $msg_array['day'] = utf8_encode(date('d', $post_date));
		    $msg_array['hour'] = utf8_encode(date('H', $post_date));
		    $msg_array['min'] = utf8_encode(date('i', $post_date));

		    $props = array ( "current_mood" => utf8_encode($lj_meta['unt_lj_mood']['value']), "current_moodid" => utf8_encode($lj_meta['unt_lj_moodid']['value']), "current_music" => utf8_encode($lj_meta['unt_lj_music']['value']), "picture_keyword" => utf8_encode($lj_meta['unt_lj_userpic']['value']), "taglist" => utf8_encode(get_category_list($post_ID)), "opt_nocomments" => ($lj_meta['unt_lj_nocomment']['value'] == "checked" ? true : false));
		    $msg_array['props'] = $props;

		    if (array_key_exists('unt_lj_entry', $lj_meta) && $lj_meta['unt_lj_entry']['value'] != ''){
			$msg_array['itemid'] = utf8_encode($lj_meta['unt_lj_entry']['value']);
			$xmlrpc_method = 'LJ.XMLRPC.editevent';
		    } else {
			$xmlrpc_method = 'LJ.XMLRPC.postevent';
		    }

	 	    if (!$client->query($xmlrpc_method, $msg_array)) {
			$metavalue = $wpdb->escape( stripslashes( trim($client->getErrorCode().' : '.$client->getErrorMessage())));

			if (array_key_exists('unt_lj_error', $lj_meta)) {
			    update_meta($lj_meta['unt_lj_error']['id'], 'unt_lj_error', $metavalue);
			} else {
			    $metakey = 'unt_lj_error';
			    add_post_meta($post_ID,$metakey,$metavalue,true);
			}
		    }

                        $return_values = $client->getResponse();

                        $metavalue = $wpdb->escape( stripslashes( trim($return_values['itemid']) ) );
                        if (array_key_exists('unt_lj_entry', $lj_meta)) {
                                update_meta($lj_meta['unt_lj_entry']['id'], 'unt_lj_entry', $metavalue);
                        } else {
                                $metakey = 'unt_lj_entry';
				add_post_meta($post_ID,$metakey,$metavalue,true);
                        }
                    }
        	}
        }
//fclose($fh);
}


function test_LJ (){
	$myFile = "/tmp/test";
	$fh = fopen($myFile, 'a') or die("can't open file");
	$stringData = "In the test function\n";
	fwrite($fh, $stringData);
	fclose($fh);
}
	if ((strpos($_SERVER['PHP_SELF'],'wp-admin/post-new.php') != false )
	    || (strpos($_SERVER['PHP_SELF'],'wp-admin/post.php') != false )
	    || (strpos($_SERVER['PHP_SELF'],'wp-admin/bookmarklet.php')!= false )
	    || (strpos($_SERVER['PHP_SELF'],'wp-mail.php') != false )
	    || (strpos($_SERVER['PHP_SELF'],'edit.php') != false)) {

		add_action('publish_phone', 'publish_phone_LJ');
		add_action('edit_post', 'synch_LJ');
		add_action('publish_post', 'synch_LJ', 5);
		add_action('delete_post', 'delete_post_LJ');

		//add_action('wp_insert_post', 'test_LJ');
		//add_action('insertPost-omatic', 'test_LJ');
	}

?>

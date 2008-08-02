<?php
//Live+Press_2.0.3


require_once("lpextras.php");


function addLinkBack($postID) 
{
    global $unt_livepress_options;

	 return '<p><font size=-1><a href="' . get_permalink($postID) . '">' . $unt_livepress_options['synch']['linkbacktext'] . '</a></font></p>';

}

function get_category_list($post_ID)
{
$tags = get_the_tags($post_ID);

if($tags) 
{
    foreach ($tags as $tag)
    {
        if (!empty($tag_list))
        {
            $tag_list .= ", ";
        }
        $tag_list .= $tag->name; 
    }
}
    return $tag_list;
}

function delete_post_LJ ($post_ID) {

        global $journals, $wpdb, $tablepostmeta, $user_login, $unt_livepress_options;
        get_currentuserinfo();
        $lj_meta = get_LJ_meta($post_ID);


    //if (isset($_POST['deletepost'])) {
	$post_data = get_postdata($post_ID);

	$the_event = '';

        $msg_array = array();
        $msg_array['username'] = utf8_encode($lj_meta['unt_lj_username']['value']);
        $msg_array['auth_method'] = utf8_encode('clear');
        $msg_array['hpassword'] = utf8_encode($journals[$lj_meta['unt_lj_username']['value']]['password']);
        $msg_array['event'] = $the_event;
        $msg_array['subject'] = utf8_encode(stripslashes($post_data['Title']));
        $msg_array['lineendings'] = utf8_encode('unix');
        $msg_array['usejournal'] = utf8_encode($lj_meta['unt_lj_journal']['value']);

        $post_date = mktime(substr($post_data['Date'],11,2),substr($post_data['Date'],14,2),substr($post_data['Date'],17,2),substr($post_data['Date'],5,2),substr($post_data['Date'],8,2),substr($post_data['Date'],0,4));
        $msg_array['year'] = utf8_encode(date('Y', $post_date));
        $msg_array['mon'] = utf8_encode(date('m', $post_date));
        $msg_array['day'] = utf8_encode(date('d', $post_date));
        $msg_array['hour'] = utf8_encode(date('H', $post_date));
        $msg_array['min'] = utf8_encode(date('i', $post_date));


        if (array_key_exists('unt_lj_entry', $lj_meta) && $lj_meta['unt_lj_entry']['value'] != ''){
             $msg_array['itemid'] = utf8_encode($lj_meta['unt_lj_entry']['value']);
             $xmlrpc_method = 'LJ.XMLRPC.editevent';
        }

        $client = new IXR_client("www.livejournal.com", "/interface/xmlrpc", 80);
        $client->debug = true;

        $client->query($xmlrpc_method, $msg_array);
        //if (!$client->query($xmlrpc_method, $msg_array)) {
//            $metavalue = $wpdb->escape( stripslashes( trim($client->getErrorCode().' : '.$client->getErrorMessage()) ) );
  //          if (array_key_exists('unt_lj_error', $lj_meta)) {
   //             update_meta($lj_meta['unt_lj_error']['id'], 'unt_lj_error', $metavalue);
      //      } else {
     //           $metakey = 'unt_lj_error';
//                $result = $wpdb->query("
 //                                    INSERT INTO $tablepostmeta
  //                                   (post_id,meta_key,meta_value)
   //                                  VALUES ('$post_ID','$metakey','$metavalue')
    //                           ");
     //        }
//        }


        $return_values = $client->getResponse();

 //       $metavalue = $wpdb->escape( stripslashes( trim($return_values['itemid']) ) );

//        if (array_key_exists('unt_lj_entry', $lj_meta)) {
//            update_meta($lj_meta['unt_lj_entry']['id'], 'unt_lj_entry', $metavalue);
 //       } else {
  //          $metakey = 'unt_lj_entry';
   //         $result = $wpdb->query("
    //                                     INSERT INTO $tablepostmeta (post_id,meta_key,meta_value)
     //                                    VALUES ('$post_ID','$metakey','$metavalue')
      //                     ");
//        }
//    }
}


function publish_phone_LJ ($post_ID){
	global $journals, $wpdb, $tablepostmeta, $user_login, $unt_livepress_options;
	$uzer=get_userdata('admin');
$user_ID = $uzer->ID;
$user_pass_md5 = md5($uzer->user_pass);

	$lj_meta = get_LJ_meta($post_ID);

$lj_meta['unt_lj_synch']['value'] = 'checked';
$lj_meta['unt_lj_username']['value'] = 'doofweed';
$journals[$lj_meta['unt_lj_username']['value']]['allowlist'] = '';
$lj_meta['unt_lj_linkback']['value'] = 'checked';
$lj_meta['unt_lj_excerptonly']['value'] = 'notchecked';
$lj_meta['unt_lj_securitylevel']['value'] = 'private';
$lj_meta['unt_lj_linkbacktext']['value'] = 'www.digsite.net';
$lj_meta['unt_lj_userpic']['value'] = 'chicken';
$lj_meta['unt_lj_nocomment']['value'] = 'checked';

//	if (!$_POST['deletemeta'] && !$_POST['updatemeta']) {

//	    if ($lj_meta['unt_lj_synch']['value'] == 'checked' && $lj_meta['unt_lj_username']['value'] != '') {
//		if ($journals[$lj_meta['unt_lj_username']['value']]['allowlist'] == '' || strpos($journals[$lj_meta['unt_lj_username']['value']]['allowlist'], $user_login) !== False) {
		    $the_post = get_postdata($post_ID);

		    // Add the LinkBack
		    if ($lj_meta['unt_lj_linkback']['value'] == 'checked')
		    {
			$the_event = '<p style="border: 1px solid black; padding: 3px; font-weight: bold;"><font size=-1>Originally published at <a href="' . get_settings('home') . '">' . $lj_meta['unt_lj_linkbacktext']['value'] . '</a>. Please leave any comments <a href="' . get_permalink($post_ID) . '">there</a>.</font></p><br />';
		    }

		    if ($lj_meta['unt_lj_excerptonly']['value'] == 'checked') 
		    {
			if (empty($the_post['Excerpt']))
		        {
			    $the_event .= substr($the_post['Content'], 0, $unt_livepress_options['synch']['excerptlength']);
			} else {
			    $the_event .= $the_post['Excerpt'];
			}
		    } else {
			$the_event .= $the_post['Content'];
		    }
		    if (function_exists("giggle_autolink")) {
	       		$the_event .= giggle_autolink($the_event,-1,1);
		    }
		    $the_event .= '<br /><br /><br />';
		    $the_event = preg_replace("/(\r\n|\n|\r)/", "\n", $the_event); // cross-platform newlines
		    // Fix lj-tags hack
		    $the_event = preg_replace('/([[\{<~])(\/?lj-cut.*)([]\}>~])/i', '<\2>' , $the_event);
	            $the_event = convert_chars($the_event, 'html');

		    $msg_array = array();
		    $msg_array['username'] = utf8_encode($lj_meta['unt_lj_username']['value']);
		    $msg_array['auth_method'] = utf8_encode('clear');
		    $msg_array['hpassword'] = utf8_encode($journals[$lj_meta['unt_lj_username']['value']]['password']);
		    $msg_array['event'] = $the_event;
		    $msg_array['subject'] = utf8_encode(stripslashes($the_post['Title']));
		    $msg_array['lineendings'] = utf8_encode('unix');
		    $msg_array['usejournal'] = utf8_encode($lj_meta['unt_lj_journal']['value']);

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

	 	    $client = new IXR_client("www.livejournal.com", "/interface/xmlrpc", 80);
	 	    $client->debug = true;

	 	    if (!$client->query($xmlrpc_method, $msg_array)) {
			$metavalue = $wpdb->escape( stripslashes( trim($client->getErrorCode().' : '.$client->getErrorMessage()) ) );
			if (array_key_exists('unt_lj_error', $lj_meta)) {
			    update_meta($lj_meta['unt_lj_error']['id'], 'unt_lj_error', $metavalue);
			} else {
			    $metakey = 'unt_lj_error';
			    $result = $wpdb->query("
							INSERT INTO $tablepostmeta
							(post_id,meta_key,meta_value)
							VALUES ('$post_ID','$metakey','$metavalue')
						");
			}
		    }


                        $return_values = $client->getResponse();

                        $metavalue = $wpdb->escape( stripslashes( trim($return_values['itemid']) ) );
                        if (array_key_exists('unt_lj_entry', $lj_meta)) {
                                update_meta($lj_meta['unt_lj_entry']['id'], 'unt_lj_entry', $metavalue);
                        } else {
                                $metakey = 'unt_lj_entry';
                                $result = $wpdb->query("
                                                          INSERT INTO $tablepostmeta
                                                          (post_id,meta_key,meta_value)
                                                           VALUES ('$post_ID','$metakey','$metavalue')
                                                   ");
                        }
  //                  }
 //       	}
      //  }
        //return $post_ID;
}


function synch_LJ ($post_ID){
/*
$myFile = "/tmp/test";
$fh = fopen($myFile, 'w') or die("can't open file");
$stringData = "In the synch function\n";
fwrite($fh, $stringData);
fclose($fh);
*/
	global $journals, $wpdb, $tablepostmeta, $user_login, $unt_livepress_options;
	get_currentuserinfo();

	$lj_meta = get_LJ_meta($post_ID);

	if (!$_POST['deletemeta'] && !$_POST['updatemeta']) {

	    if ($lj_meta['unt_lj_synch']['value'] == 'checked' && $lj_meta['unt_lj_username']['value'] != '') {
		if ($journals[$lj_meta['unt_lj_username']['value']]['allowlist'] == '' || strpos($journals[$lj_meta['unt_lj_username']['value']]['allowlist'], $user_login) !== False) {
		    $the_post = get_postdata($post_ID);

		    // Add the LinkBack
		    if ($lj_meta['unt_lj_linkback']['value'] == 'checked')
		    {
			$the_event = '<p style="border: 1px solid black; padding: 3px; font-weight: bold;"><font size=-1>Originally published at <a href="' . get_settings('home') . '">' . $lj_meta['unt_lj_linkbacktext']['value'] . '</a>. Please leave any comments <a href="' . get_permalink($post_ID) . '">there</a>.</font></p><br />';
		    }

		    if ($lj_meta['unt_lj_excerptonly']['value'] == 'checked') 
		    {
			if (empty($the_post['Excerpt']))
		        {
			    $the_event .= substr($the_post['Content'], 0, $unt_livepress_options['synch']['excerptlength']);
			} else {
			    $the_event .= $the_post['Excerpt'];
			}
		    } else {
			$the_event .= $the_post['Content'];
		    }
		    if (function_exists("giggle_autolink")) {
	       		$the_event .= giggle_autolink($the_event,-1,1);
		    }
		    $the_event .= '<br /><br /><br />';
		    $the_event = preg_replace("/(\r\n|\n|\r)/", "\n", $the_event); // cross-platform newlines
		    // Fix lj-tags hack
		    $the_event = preg_replace('/([[\{<~])(\/?lj-cut.*)([]\}>~])/i', '<\2>' , $the_event);
	            $the_event = convert_chars($the_event, 'html');

		    $msg_array = array();
		    $msg_array['username'] = utf8_encode($lj_meta['unt_lj_username']['value']);
		    $msg_array['auth_method'] = utf8_encode('clear');
		    $msg_array['hpassword'] = utf8_encode($journals[$lj_meta['unt_lj_username']['value']]['password']);
		    $msg_array['event'] = $the_event;
		    $msg_array['subject'] = utf8_encode(stripslashes($the_post['Title']));
		    $msg_array['lineendings'] = utf8_encode('unix');
		    $msg_array['usejournal'] = utf8_encode($lj_meta['unt_lj_journal']['value']);

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

	 	    $client = new IXR_client("www.livejournal.com", "/interface/xmlrpc", 80);
	 	    $client->debug = true;

	 	    if (!$client->query($xmlrpc_method, $msg_array)) {
			$metavalue = $wpdb->escape( stripslashes( trim($client->getErrorCode().' : '.$client->getErrorMessage()) ) );
			if (array_key_exists('unt_lj_error', $lj_meta)) {
			    update_meta($lj_meta['unt_lj_error']['id'], 'unt_lj_error', $metavalue);
			} else {
			    $metakey = 'unt_lj_error';
			    $result = $wpdb->query("
							INSERT INTO $tablepostmeta
							(post_id,meta_key,meta_value)
							VALUES ('$post_ID','$metakey','$metavalue')
						");
			}
		    }


                        $return_values = $client->getResponse();

                        $metavalue = $wpdb->escape( stripslashes( trim($return_values['itemid']) ) );
                        if (array_key_exists('unt_lj_entry', $lj_meta)) {
                                update_meta($lj_meta['unt_lj_entry']['id'], 'unt_lj_entry', $metavalue);
                        } else {
                                $metakey = 'unt_lj_entry';
                                $result = $wpdb->query("
                                                          INSERT INTO $tablepostmeta
                                                          (post_id,meta_key,meta_value)
                                                           VALUES ('$post_ID','$metakey','$metavalue')
                                                   ");
                        }
                    }
        	}
        }
        //return $post_ID;
}


if (strpos($_SERVER['PHP_SELF'],'wp-admin/post-new.php') || strpos($_SERVER['PHP_SELF'],'wp-admin/post.php') || strpos($_SERVER['PHP_SELF'],'wp-admin/bookmarklet.php') || strpos($_SERVER['PHP_SELF'],'wp-mail.php') ) { 
	add_action('edit_post', 'synch_LJ');
	add_action('publish_post', 'synch_LJ', 5);
	add_action('publish_phone', 'publish_phone_LJ');
	add_action('delete_post', 'delete_post_LJ');
}
?>

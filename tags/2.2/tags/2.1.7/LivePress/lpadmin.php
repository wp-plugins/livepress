<?php
//Live+Press_2.1.8

require_once('lpextras.php');
//require_once('jquery-1.2.6.min.js');

function RemoveLogin($journal, $name)
{
    if (isset($journal) && isset($name)) {
        $logsuin = get_option('unt_livepress_logins');
        unset($logsuin[$journal][$name]);
        update_option('unt_livepress_logins', $logsuin);
    }

echo ' <script type="text/javascript">';
echo '   var newurl = "options-general.php?page=livepress/LivePress/lpadmin.php";';
//echo '   var newurl = "'.$_SERVER['SCRIPT_URI'].'\?page=livepress/LivePress/lpadmin.php";';
echo '   window.location=(newurl);';
echo ' </script>';
}


function unt_livepress_admin() 
{
	if (function_exists('add_options_page')) {
	    add_options_page('Live Press+2', 'Live+Press', 5, __FILE__, 'unt_livepress_admin_display');
	}
}


function set_option_defaults()
{
	/* General Options */
	$options_array['general']['usetags'] = true;
	$options_array['general']['usemoods'] = true;
	$options_array['general']['usemusic'] = true;
	//$options_array['general']['useextras'] = true;
	//$options_array['general']['usesynch'] = true;
    
	/* Mood Options */
	$options_array['moods']['position'] = 'after';
	$options_array['moods']['location'] = 'the_content';
	$options_array['moods']['xhtml'] = 'div';
	$options_array['moods']['imagebaseurl'] = 'http://stat.livejournal.com/img/mood/';
	$options_array['moods']['theme'] = 'classic';
	$options_array['moods']['text'] = '<strong>Current Mood: </strong> ';
	$options_array['moods']['file'] = 'moodlist.txt';

	/* Music Options */
	$options_array['music']['position'] = 'after';
	$options_array['music']['location'] = 'the_content';
	$options_array['music']['xhtml'] = 'div';
	$options_array['music']['text'] = '<strong>Current Music: </strong> ';
    
	/* Synch Options */
	$options_array['synch']['nosynch']	= 'checked';
	$options_array['synch']['excerpt']	= 'notchecked';
	$options_array['synch']['synchall']	= 'notchecked';
	$options_array['synch']['excerptlength'] = 250;
	$options_array['synch']['insertlinkback'] = 'checked';
	$options_array['synch']['nocommentdefault'] = 'notchecked';
	$options_array['synch']['linkbacktext'] = get_option('blogname');
	$options_array['synch']['cattags']	= 'categories';
    
	/* LJ Tag Options */
	$options_array['tags']['parse_cut']  = true;
	$options_array['tags']['parse_user'] = true;
    
	/* User Pic Options */
	$options_array['userpics']['text'] = 'User Pic: ';

	/* Email Crosspost Options */
	$options_array['email']['nosynch']	= 'checked';
	$options_array['email']['excerpt']	= 'notchecked';
	$options_array['email']['synchall']	= 'notchecked';
	$options_array['email']['linkback']	= 'checked';
	$options_array['email']['nocomment']	= 'notchecked';
	$options_array['email']['user']		= '';
	$options_array['email']['security']	= 'public';

	return $options_array;
}


function current_uri()
{
        $_SERVER['FULL_URL'] = 'http';
        $script_name = '';
        if(isset($_SERVER['REQUEST_URI'])) {
            $script_name = $_SERVER['REQUEST_URI'];
        } else {
            $script_name = $_SERVER['PHP_SELF'];
            if($_SERVER['QUERY_STRING']>' ') {
                $script_name .=  '?'.$_SERVER['QUERY_STRING'];
            }
        }
        if(isset($_SERVER['HTTPS']) && $_SERVER['HTTPS']=='on') {
            $_SERVER['FULL_URL'] .=  's';
        }
        $_SERVER['FULL_URL'] .=  '://';
        if($_SERVER['SERVER_PORT']!='81')  {
            $_SERVER['FULL_URL'] .=
            $_SERVER['HTTP_HOST'].':'.$_SERVER['SERVER_PORT'].$script_name;
        } else {
            $_SERVER['FULL_URL'] .=  $_SERVER['HTTP_HOST'].$script_name;
        }
	return $_SERVER['FULL_URL'];
}


function unt_livepress_admin_display()
{
	$unt_livepress_options = get_option('unt_livepress_options');
	$unt_livepress_logins = get_option('unt_livepress_logins');
	global $journals;
?>

        <style  type="text/css">
	table.jlist {
        border: 0px;
        margin: 0px;
	float: right;
	}

	form.jlist {
        border: 0px;
        margin: 0px;
	float: left;
	}

	table.jlist tr {
	}

	table.jsublist {
	    border: 1px solid #ccc;
	    margin: 2px;
	    width: 440px;
	}

	table.jlist tr td, table.jlist tr th {
        border: 0px;
        margin: 0px;
	padding: 0px;
	}

	table.jnew {
	border: 1px solid #ccc; 
	padding:0px; 
	margin: 0px;
	width: 320px;
	}

	table.jnew td, table.jnew tr {
	padding:0px; 
	margin: 0px;
	}

	td#lpjbutton {
	text-align: left;
	padding-right: 15px;
	}
	</style>

<?php

	if ( ($_GET['resetLP'] == true ) || ($_GET['installLP'] == true) )  {
	    delete_option('unt_livepress_options');
            $unt_livepress_options = set_option_defaults();
            add_option("unt_livepress_options", $unt_livepress_options, "Option settings for the LivePress Plugin.", true);
            echo '<div style="text-align: center;" class="updated"><p><strong>Live+Press </strong><br />';
	    echo 'Your previously configured plugin options have been wiped. </p> <p><a href="';
	    echo get_option('siteurl') . '/wp-admin/options-general.php?page=livepress/LivePress/lpadmin.php">';
	    echo 'Click Here</a> to reload the Live+Press admin page. </p></div>';
	} elseif ($_GET['resetLPlogins'] == true) {
	    delete_option('unt_livepress_logins');
            echo '<div style="text-align: center;" class="updated"><p><strong>Live+Press </strong><br />';
	    echo 'Your previously configured livejournal login settings have been wiped.</p> <p><a href="';
	    echo get_option('siteurl') . '/wp-admin/options-general.php?page=livepress/LivePress/lpadmin.php">';
	    echo 'Click Here</a> to reload the Live+Press admin page. </p></div>';
	} elseif ($_GET['remove'] == 'true') {
	    $rmjournal = $_GET['journal'];
	    $rmname = $_GET['name'];
	    RemoveLogin($rmjournal, $rmname);
	} else {
	    if ( empty($unt_livepress_options) 
		    || (!isset($unt_livepress_options['email'])) 
		    || empty($unt_livepress_options['email']) ) {
		echo '<div class="updated"><p><strong>Live+Press</strong> ';
		echo 'has not been installed, or has not been installed properly. ';
		echo 'Please <a href="'.current_uri().'&installLP=true">install</a> '; 
		echo 'Live+Press before continuing.</p></div>';
	    } else {
		if (isset($_POST['unt_lp_options'])) {
		    update_option("unt_livepress_options", $_POST['unt_lp_options']);
		    $unt_livepress_options = get_option("unt_livepress_options");

                    if (!strcmp($_POST['lj_synch_default_op'], 'synchall') ) {
                        $unt_livepress_options['synch']['synchall'] = 'checked';
                        $unt_livepress_options['synch']['excerpt'] = 'notchecked';
                        $unt_livepress_options['synch']['nosynch'] = 'notchecked';
                    } elseif (!strcmp($_POST['lj_synch_default_op'], 'synchexcerpt')) {
                        $unt_livepress_options['synch']['synchall'] = 'notchecked';
                        $unt_livepress_options['synch']['excerpt'] = 'checked';
                        $unt_livepress_options['synch']['nosynch'] = 'notchecked';
                    } else {
                        $unt_livepress_options['synch']['nosynch'] = 'checked';
                        $unt_livepress_options['synch']['synchall'] = 'notchecked';
                        $unt_livepress_options['synch']['excerpt'] = 'notchecked';
                    }

		    $unt_livepress_options['email']['user']	 = $_POST['ljusername'];
		    $unt_livepress_options['email']['allowmask'] = $_POST['ljallowmask'];

		    if (isset($_POST['ljfriendboxes'])) {
			$unt_livepress_options['email']['allowmask'] = array_to_bits($_POST['ljfriendboxes']);
		    }

		    $unt_livepress_options['synch']['synchdefault'] = $_POST['lj_synch_op'];

		    if (!strcmp($_POST['lj_synch_op'], 'synchall') ) {
			$unt_livepress_options['email']['synchall'] = 'checked';
			$unt_livepress_options['email']['excerpt'] = 'notchecked';
		        $unt_livepress_options['email']['nosynch'] = 'notchecked';
		    } elseif (!strcmp($_POST['lj_synch_op'], 'synchexcerpt')) {
			$unt_livepress_options['email']['synchall'] = 'notchecked';
			$unt_livepress_options['email']['excerpt'] = 'checked';
		        $unt_livepress_options['email']['nosynch'] = 'notchecked';
		    } else {
		        $unt_livepress_options['email']['nosynch'] = 'checked';
		        $unt_livepress_options['email']['synchall'] = 'notchecked';
		        $unt_livepress_options['email']['excerpt'] = 'notchecked';
		    }

		    $unt_livepress_options['synch']['cattags'] = $_POST['lj_synch_cattags'];

		    if ($_POST['ljnocomment'] != '') {
			$unt_livepress_options['email']['nocomment'] = 'checked';
		    } else {
			$unt_livepress_options['email']['nocomment'] = 'notchecked';
		    }
		    if ($_POST['ljuserjournals'] != '') {
			$unt_livepress_options['email']['type'] = $_POST['ljuserjournals'];
		    }
		    if ($_POST['ljlinkback'] != '' ) {
			$unt_livepress_options['email']['linkback'] = 'checked';
		    } else {
			$unt_livepress_options['email']['linkback'] = 'notchecked';
		    }
		    if ($_POST['ljinsertlinkback'] != '' ) {
			$unt_livepress_options['synch']['insertlinkback'] = 'checked';
		    } else {
			$unt_livepress_options['synch']['insertlinkback'] = 'notchecked';
		    }
		    if ($_POST['ljnocommentdefault'] != '' ) {
			$unt_livepress_options['synch']['nocommentdefault'] = 'checked';
		    } else {
			$unt_livepress_options['synch']['nocommentdefault'] = 'notchecked';
		    }
		    if ($_POST['ljuserpics'] != '') {
			$unt_livepress_options['email']['userpic'] = $_POST['ljuserpics'];
		    }
		    if ($_POST['ljfriendgroups'] != '') {
			$unt_livepress_options['email']['security'] = $_POST['ljfriendgroups'];
		    }

		    update_option("unt_livepress_options", $unt_livepress_options);
		}
		if (!empty($_POST['editjournal']))  { 
			//&& ($_POST['editjournal']['name']) != ''
			//&& ($_POST['editjournal']['pass']) != '' && ($_POST['editjournal']['pscf']) != '') {
		    $nj = $_POST['editjournal'];
		    if (strcmp($nj["pass"], $nj["pscf"])) { 
			$passmatch = false;  
			unset($nj);
			unset($la);
		    } else {
		        $nj["pass"] = md5($nj["pass"]);
			$passmatch = true;  
		        $la[$nj["type"]][$nj["name"]]["pass"]  = $nj["pass"];
		        $la[$nj["type"]][$nj["name"]]["allow"] = $nj["allow"];

		    if (empty($unt_livepress_logins)) {
			$aj = $la;
		    } elseif (key_exists($nj["name"], $unt_livepress_logins[$nj["type"]])) {
			$unt_livepress_logins[$nj["type"]][$nj["name"]]["pass"]  = $nj["pass"];
			$unt_livepress_logins[$nj["type"]][$nj["name"]]["allow"] = $nj["allow"];
			$aj = $unt_livepress_logins;
		    } else {
			$aj = array_merge_recursive($unt_livepress_logins, $la);
		    }
		    natsort($aj);
		    delete_option('unt_livepress_logins');
		    add_option('unt_livepress_logins', $aj);
		    $go = get_option('unt_livepress_logins');

		    }

		} elseif (isset($_POST['newjournal']) && ($_POST['newjournal']['name']) != ''
			&& ($_POST['newjournal']['pass']) != '' && ($_POST['newjournal']['pscf']) != '') {
		    $nj = $_POST['newjournal'];
		    if (strcmp($nj["pass"], $nj["pscf"])) { 
			$passmatch = false;  
			unset($nj);
			unset($la);
		   } else {
			$passmatch = true;  
		    $nj["pass"] = md5($nj["pass"]);
		    $la[$nj["type"]][$nj["name"]]["pass"] = $nj["pass"];
		    $la[$nj["type"]][$nj["name"]]["allow"] = $nj["allow"];

		    if (empty($unt_livepress_logins)) {
			$aj = $la;
		    } elseif (key_exists($nj["name"], $unt_livepress_logins[$nj["type"]])) {
			$unt_livepress_logins[$nj["type"]][$nj["name"]]["pass"] = $nj["pass"];
			$unt_livepress_logins[$nj["type"]][$nj["name"]]["allow"] = $nj["allow"];
			$aj = $unt_livepress_logins;
		    } else {
			$aj = array_merge_recursive($unt_livepress_logins, $la);
		    }
		    natsort($aj);
		    delete_option('unt_livepress_logins');
		    add_option('unt_livepress_logins', $aj);
		    $go = get_option('unt_livepress_logins');
		}
		}

?>		<!-- E N D   P H P -->



		<!--  S T A R T   A D M I N   P A G E  -->

<script type="text/javascript" >

function setPositionAbsolute()
{
document.getElementById("saveit").style.position="absolute";
document.getElementById("saveit").style.top="10px";
}

function change_settings(stuff) 
{ 

var temp	= stuff.split(',');
var user	= temp[0];
var pass	= temp[1];
var edit	= temp[2];
var allu	= temp[3].split(':');
var uall	= temp[4].split(':');

if (edit == 'true') {

var x0=document.getElementById('changesettings_'+ user).insertRow(0);	// journal
var x1=document.getElementById('changesettings_'+ user).rows[1].cells;	// name
var x2=document.getElementById('changesettings_'+ user).rows[2].cells;	// pass
var x3=document.getElementById('changesettings_'+ user).insertRow(3);	// pscf
var x4=document.getElementById('changesettings_'+ user).rows[4].cells;	// allow
var x5=document.getElementById('changesettings_'+ user).rows[5].cells;	// buttons

var y0=x0.insertCell(0);
var z0=x0.insertCell(1);
var y3=x3.insertCell(0);
var z3=x3.insertCell(1);

y0.innerHTML="<label for='editjournal[type]'>Journal Type: (read only) </label>";
z0.innerHTML="<select name='editjournal[type]'><option value='livejournal' 'selected' 'readonly'>LiveJournal(default)</option></select> ";

x1[0].innerHTML="User Login: (read only)";
x1[1].innerHTML="<input id='editjournal[name]' name='editjournal[name]' value='"+user+"' type='text' value='' readonly/>";

x2[1].innerHTML="<input id='editjournal[pass]' name='editjournal[pass]' type='password'/>";// value='"+pass+"'/>";

y3.innerHTML="<label for='editjournal[pscf]'>Confirm Password: </label>";
z3.innerHTML="<input id='editjournal[pscf]' name='editjournal[pscf]' type='password'/>";

var allowlist='';
for (var i=0; i<allu.length; i++) {
   allowlist = allowlist+"<input type='checkbox' name='editjournal[allow]["+allu[i]+"]' '"+uall[i]+"'/>"+allu[i]+"&nbsp;&nbsp";
}
x4[1].innerHTML=allowlist;

x5[0].innerHTML="<input type='submit' value='Save Settings' />";
x5[1].innerHTML="<input type='button' value='Cancel' onclick='change_settings(\""+user+","+pass+",false,"+temp[3]+","+temp[4]+"\")' />";

} else {

document.getElementById('changesettings_'+ user).deleteRow(0);		// journal
var x0=document.getElementById('changesettings_'+ user).rows[0].cells;	// name
var x1=document.getElementById('changesettings_'+ user).rows[1].cells;	// pass
var x2=document.getElementById('changesettings_'+ user).rows[2].cells;	// allow
document.getElementById('changesettings_'+ user).deleteRow(3);		// pscf
var x3=document.getElementById('changesettings_'+ user).rows[3].cells;	// buttons

x0[0].innerHTML='User Login: ';
x0[1].innerHTML=user;

x1[0].innerHTML='User Password: ';
x1[1].innerHTML=' (hidden) ';// + pass;

x2[0].innerHTML='Allowed Users: ';

var allowlist='';
for (var i=0; i<allu.length; i++) {
   allowlist = allowlist+"<input 'disabled' type='checkbox' name='editjournal[allow]["+allu[i]+"]' '"+uall[i]+"'/>"+allu[i]+"&nbsp;&nbsp";
}
x2[1].innerHTML=allowlist;

x3[0].innerHTML="<input type='button' value='Change Settings' onClick=\"change_settings(\'"+user+","+pass+",true,"+temp[3]+","+temp[4]+"\')\" />";
x3[1].innerHTML="<input type='button' value='Remove' onclick='remove_login(\""+user+"\",\"false\")' />";

}
}

function remove_login(delinfo) 
{ 
	var temp	= delinfo.split(',');
	var journ	= temp[0];
	var name	= temp[1];
	var r=confirm("Are you sure you want to delete " + name);
	if (r==true) {
	    var texto = document.open("application/x-httpd-php","replace");
	    var newurl = "options-general.php?page=livepress/LivePress/lpadmin.php&remove=true&journal=" + journ + "&name=" + name;
	    window.location=(newurl);
	    document.close();
	} else{
	    document.close();
	}

}


</script>



		<div  id="lpadminpage" class="wrap" style="padding: 20px;">

		<form method="post"> 
		<h2>Live+Press Options</h2>
		  <div style="position: relative; margin: 0 auto; padding-top: 10px;">
		    <div id="saveit" class="submit" style="border: 0px; position: relative; top: 0; margin: 0 auto;">
		    <input type="submit" value="Save Settings" style="z-index: 100; top: 0px;"/>
		    <?php if (isset($passmatch) && ($passmatch == false)) { ?>
			Passwords don't match, try again.
		    <?php } ?>
		    </div>

		    <table class="form-table">
		    <tbody>
		    <tr class="options" valign="top">
			<th scope="row">LiveJournal Configuration</th>
			<td id="journals">


		<!-- S T A R T   P H P -->
<?php
		global $wpdb;
		global $olympian;
		$users = $wpdb->get_results('SELECT user_login FROM '. $wpdb->prefix . 'users WHERE user_status = 0 ORDER BY user_login');

	    // LIST JOURNAL ENTRIES //

	    $unt_livepress_logins = get_option('unt_livepress_logins');
	    if (isset($unt_livepress_logins) && (!empty($unt_livepress_logins))) {

		foreach ($unt_livepress_logins as $journal => $login) {
                    echo '<table class="jlist">';
			echo '<tr>';
		        echo '<td scope="row" id='.$journal.'>Journal Type: '.$journal.'</td>';
			echo '</tr><tr><td>';

		    foreach ($login as $name => $pass) {
			echo '<form method="post">';

			echo "<table id='changesettings_".$name."' class='jsublist'><tr>";
			$pass = $pass['pass'];
			echo '<td>User Login: </td><td>'.$name. '</td>';

			echo "</tr><tr>";
			echo '<td>User Password: </td><td>(hidden) '; // . $pass ;
			echo '</td>';
			echo "</tr><tr>";
			echo '<td>Allowed Users: </td><td>';

			$av = $unt_livepress_logins[$journal][$name]['allow'];
			$jsu = array();
			$jsa = array();
			foreach ($users as $user) {
			    $u = $user->user_login;
			    array_push($jsu,$u);
			    if (key_exists($u, $av)) { array_push($jsa, 'checked'); }
			    else { array_push($jsa, ''); }
			    echo "<input 'disabled' type='checkbox' name='".$u."' ".(key_exists($u, $av) ? "checked" : "" )."/>".$u;
			    echo '&nbsp;&nbsp;';
			}
			$jsu = implode(":",$jsu);
			$jsa = implode(":",$jsa);
			echo '</td></tr>';
			echo '<tr>'; 
			echo '<td id="lpjbutton">'; 
			echo '<input type="button" value="Change Settings" onClick="change_settings(\''.$name.','.$pass.',true,'.$jsu.','.$jsa.'\')" />';
			echo '</td>';
			echo '<td id="lpjbutton">'; 
			echo '<input type="button" value="Remove" onClick="remove_login(\''.$journal.','.$name.'\')" />';
			echo '</td></tr></table>';
			echo '</div></form>';
		    }
		    echo '</td></tr></table>';
		}
	    }


	//- S T A R T   A D D   N E W   J O U R N A L - VARS//
	$loop_counter = 1;
?>	<!-- E N D   P H P -->

	<!-- S T A R T   A D D   N E W   J O U R N A L -->
	<form method="post"  class="jlist">
	Add a New Journal User
	<table class="jnew" id="newmeta">
	<!--
	    <tr>
		<td  colspan=2 style="font-weight: bold; font-size: 14px;">Add a new journal user</td>
	    </tr>
	-->
	    <tr style="padding:0px margin: 0px;">
		<td><label for="newjournal[type]">Journal Type: </label></td>
		<td>
		    <select name="newjournal[type]">
			<option value="livejournal" "selected">LiveJournal (default)</option>
		    </select>
		</td>
	    </tr>
	    <tr style="padding:0px margin: 0px;">
		<td><label for="newjournal[name]">User Login: </label></td>
		<td><input id="newjournal[name]" name="newjournal[name]" type="text" value=""/></td>
	    </tr style="padding:0px margin: 0px;">
	    <tr style="padding:0px margin: 0px;">
		<td><label for="newjournal[pass]">Password: </label></td>
		<td><input id="newjournal[pass]" name="newjournal[pass]" type="password"/></td>
	    </tr>
	    <tr style="padding:0px margin: 0px;">
		<td><label for="newjournal[pscf]">Confirm Password: </label></td>
		<td><input id="newjournal[pscf]" name="newjournal[pscf]" type="password"/></td>
	    </tr>
	    <tr style="padding:0px margin: 0px;"> 
		<td><label>Allowed Users: </label></td>

		<td>
		<fieldset type="allowedUsers" class="options"> 
		<ul style="list-style-type: none;">

		<?php
		foreach ($users as $user) {
		    if (!($loop_counter % 5)) { 
			echo "<li style='list-style-type: none;'>";
		    } 
		    echo "&nbsp;&nbsp;&nbsp;&nbsp;";
		    echo "<input type='checkbox' value='checked' name='newjournal[allow][".$user->user_login."]'/>";
		    echo "&nbsp;". $user->user_login;
		    $loop_counter++;
		} 
		?>
		</fieldset>
		</td>
	    </tr>
	    <tr class="submit">
		<td colspan="3">

		    <input type="submit" value="Add User" />
<!--
<input type="submit" value="Add User" onClick="addJournal();return false;" />
<input type="submit" id="addmetasub" name="addmeta" class="add:the-list:newmeta" tabindex="9" value="<?php _e( 'Add User' ) ?>" />
<input type="submit" value="Add User" tabindex="9" class="add:the-list:newmeta" name="addmeta" id="addmetasub"/>
-->
		</td>
	    </tr>
	</table>

	<!-- div id="ajax-response"/ -->

	</form>
	<!-- E N D   A D D   N E W   J O U R N A L -->

 </ul>

<?php
	//  THE REST OF THE MESS  //
echo "
	</ul>
	</td>
	</tr>

        <tr valign=\"top\" class=\"options\">
            <th scope=\"row\">Live+Press Modules</th>
            <td><ul><!-- li><input type=\"checkbox\" value=\"true\" " . ($unt_livepress_options['general']['useextras'] == true ? "checked=\"checked\"" : "") . " name=\"unt_lp_options[general][useextras]\">
	    <label for=\"unt_lp_options[general][useextras]\">  Activate Live+Press Extras</label></li -->
	    <input type=\"checkbox\" value=\"true\" " . ($unt_livepress_options['general']['usemoods'] == true ? "checked=\"checked\"" : "") . " name=\"unt_lp_options[general][usemoods]\">
	    <label for=\"unt_lp_options[general][usemoods]\">  Activate Live+Press Moods</label><br>
	    <input type=\"checkbox\" value=\"true\" " . ($unt_livepress_options['general']['usemusic'] == true ? "checked=\"checked\"" : "") . " name=\"unt_lp_options[general][usemusic]\">
	    <label for=\"unt_lp_options[general][usemusic]\">  Activate Live+Press Music</label>
 	    <br>
	    <!-- li><input type=\"checkbox\" value=\"true\" " . ($unt_livepress_options['general']['usesynch'] == true ? "checked=\"checked\"" : "") . " name=\"unt_lp_options[general][usesynch]\">
	    <label for=\"unt_lp_options[general][usesynch]\">  Activate Live+Press Synch</label></li -->
	    <input type=\"checkbox\" value=\"true\" ". ($unt_livepress_options['general']['usetags'] == true ? "checked=\"checked\"" : "") . " name=\"unt_lp_options[general][usetags]\">
	    <label for=\"unt_lp_options[general][usetags]\">  Activate Live+Press Tags</label></ul>
	    </td>
        </tr>
        <tr valign=\"top\" class=\"options\">
            <th scope=\"row\">Live+Press Moods</th>
	    <td><ul>
	    <label for=\"unt_lp_options[moods][position]\">Mood Position:</label> 
	    <select name=\"unt_lp_options[moods][position]\">
            <option value=\"before\" " . ($unt_livepress_options['moods']['position'] == "before" ? "selected=\"selected\"" : "") . ">Before</option>
            <option value=\"after\" " . ($unt_livepress_options['moods']['position'] == "after" ? "selected=\"selected\"" : "") . ">After</option>
            </select>
	    <br>
            <label for=\"unt_lp_options[moods][location]\">Mood Location: </label>
            <select name=\"unt_lp_options[moods][location]\"
            <option value=\"the_content\" " . ($unt_livepress_options['moods']['location'] == "the_content" ? "selected=\"selected\"" : "") . ">the_content</option>
            <option value=\"the_date\" " . ($unt_livepress_options['moods']['location'] == "the_date" ? "selected=\"selected\"" : "") . ">the_date</option>
            <option value=\"the_time\" " . ($unt_livepress_options['moods']['location'] == "the_time" ? "selected=\"selected\"" : "") . ">the_time</option>
            </select>
	    <br>
            <label for=\"unt_lp_options[moods][xhtml]\">XHTML Wrapper: </label>
            <input type=\"text\" value=\"".$unt_livepress_options['moods']['xhtml']."\" name=\"unt_lp_options[moods][xhtml]\"> 
	    <br>
            <label for=\"unt_lp_options[moods][theme]\">Mood Theme: </label>
            <input type=\"text\" value=\"".$unt_livepress_options['moods']['theme']."\" name=\"unt_lp_options[moods][theme]\">
	    <br>
            <label for=\"unt_lp_options[moods][text]\">Mood Text: </label>
            <input type=\"text\" value=\"".$unt_livepress_options['moods']['text']."\" name=\"unt_lp_options[moods][text]\">
	    <br>
            <label for=\"unt_lp_options[moods][file]\">Mood Source File: </label>
            <input type=\"text\" value=\"".$unt_livepress_options['moods']['file']."\" name=\"unt_lp_options[moods][file]\">
	    <br>
	    <label for=\"unt_lp_options[moods][imagebaseurl]\">Image Base URL: </label>
            <input type=\"text\" value=\"".$unt_livepress_options['moods']['imagebaseurl']."\" name=\"unt_lp_options[moods][imagebaseurl]\" size=\"30\"></ul></td>
        </tr>
        <tr valign=\"top\" class=\"options\">
            <th scope=\"row\">Live+Press Music</th>
            <td><ul><label for=\"unt_lp_options[music][position]\">Music Position: </label>
            <select name=\"unt_lp_options[music][position]\">
            <option value=\"before\" " . ($unt_livepress_options['music']['position'] == "before" ? "selected=\"selected\"" : "") . ">Before</option>
            <option value=\"after\" " . ($unt_livepress_options['music']['position'] == "after" ? "selected=\"selected\"" : "") . ">After</option>
            </select>
	    <br>
            <label for=\"unt_lp_options[music][location]\">Music Location: </label>
            <select name=\"unt_lp_options[music][location]\">
            <option value=\"the_content\" " . ($unt_livepress_options['music']['location'] == "the_content" ? "selected=\"selected\"" : "") . ">the_content</option>
            <option value=\"the_date\" " . ($unt_livepress_options['music']['location'] == "the_date" ? "selected=\"selected\"" : "") . ">the_date</option>
            <option value=\"the_time\" " . ($unt_livepress_options['music']['location'] == "the_time" ? "selected=\"selected\"" : "") . ">the_time</option>
            </select>
	    <br>
            <label for=\"unt_lp_options[music][xhtml]\">XHTML Wrapper: </label>
            <input type=\"text\" value=\"" . $unt_livepress_options['music']['xhtml'] . "\" name=\"unt_lp_options[music][xhtml]\">
	    <br>
            <label for=\"unt_lp_options[music][text]\">Music Text: </label>
            <input type=\"text\" value=\"" . $unt_livepress_options['music']['text'] . "\" name=\"unt_lp_options[music][text]\" size=\"30\"></ul></td>
        </tr>
        <tr valign=\"top\" class=\"options\">
            <th scope=\"row\">Live+Press Synch Defaults</th>
	    <td> <ul>";

            echo 'Default Synch Options<br>';
            echo '&nbsp;&nbsp;&nbsp;&nbsp; ';
            echo '<input id="ljnosynch" name="lj_synch_default_op" type="radio" value="nosynch" ';
            echo (!strcmp($unt_livepress_options['synch']['nosynch'], "checked") ? 'checked' : '').'/> No Synch,';
            echo '&nbsp;&nbsp;&nbsp;&nbsp; ';
            echo '<input id="ljexcerptonly" name="lj_synch_default_op" type="radio" value="synchexcerpt" ';
            echo (!strcmp($unt_livepress_options['synch']['excerpt'], "checked") ? 'checked' : '').'/> Excerpt Only, ';
            echo '&nbsp;&nbsp;&nbsp;&nbsp; ';
            echo '<input id="ljsynchall" name="lj_synch_default_op" type="radio" value="synchall" ';
            echo (!strcmp($unt_livepress_options['synch']['synchall'], "checked") ? 'checked' : '') . '/> Entire Post.';
            //echo '<hr size=1px; />';
	    echo '<br/>';
	    echo '<br/>';


            echo 'Category Synch Options<br>';
            echo '&nbsp;&nbsp;&nbsp;&nbsp; ';
            echo '<input id="ljsynchcats" name="lj_synch_cattags" type="radio" value="categories" ';
            echo (!strcmp($unt_livepress_options['synch']['cattags'], "categories") ? 'checked' : '').'/> categories->tags';
            echo '&nbsp;&nbsp;<i>-OR-</i>&nbsp;&nbsp; ';
            echo '<input id="ljsynchtags" name="lj_synch_cattags" type="radio" value="tags" ';
            echo (!strcmp($unt_livepress_options['synch']['cattags'], "tags") ? 'checked' : '').'/> tags->tags. ';
            //echo '<hr size=1px; />';
	    echo '<br/>';
	    echo '<br/>';

	    echo '<input type="checkbox" ';
	    echo (strcmp($unt_livepress_options['synch']['insertlinkback'], 'notchecked') ? 'value="checked" "checked"' : '');
	    echo ' name="ljinsertlinkback" />';
            echo '<label for="ljinsertlinkback">Insert Link Back to WordPress Entry by Default </label>';
	    echo '<br>';

	    echo '<input type="checkbox" ';
	    echo (strcmp($unt_livepress_options['synch']['nocommentdefault'], 'notchecked') ? 'value="checked" "checked"' : '');
	    echo ' name="ljnocommentdefault" />';
            echo '<label for="ljnocommentdefault">Disable Remote Journal Comments by Default </label>';
	    echo '<br>';
	    //echo '<br>';

echo "
            <label for=\"unt_lp_options[synch][linkbacktext]\">Default Link Back Blogname: </label>
            <input type=\"text\" value=\"" . $unt_livepress_options['synch']['linkbacktext'] . "\" name=\"unt_lp_options[synch][linkbacktext]\" size=\"30\"></ul></td>
        </tr>
        <tr valign=\"top\" class=\"options\">
            <th scope=\"row\">Live+Press Tags</th>
	    <td><ul><input type=\"checkbox\" value=\"true\" ". ($unt_livepress_options['tags']['parse_cut'] == true ? "checked=\"checked\"" : "") . " name=\"unt_lp_options[tags][parse_cut]\">
            <label for=\"unt_lp_options[tags][parse_cut]\">Parse Cut Tags</label>
 	    <br>
            <input type=\"checkbox\" value=\"true\" " . ($unt_livepress_options['tags']['parse_user'] == true ? "checked=\"checked\"" : "") . " name=\"unt_lp_options[tags][parse_user]\">
            <label for=\"unt_lp_options[tags][parse_user]\">Parse User Tags</label></ul></td>           
        </tr>
        <tr valign=\"top\" class=\"options\">
            <th scope=\"row\">Live+Press User Pics</th>
            <td><ul><label for=\"unt_lp_options[userpics][text]\">User Pics Text: </label>
            <input type=\"text\" value=\"" . $unt_livepress_options['userpics']['text'] . "\" name=\"unt_lp_options[userpics][text]\" size=\"30\"></ul></td>
        </tr>
	<tr>
	    <th scope=\"row\">Live+Press Email Crossposting</th>
	    <td>
	    <ul>
	    <div id='unt_lj_extras'>
";

	    $tmp_meta['unt_lj_userpic']['value'] = $unt_livepress_options['email']['userpic'];
	    $tmp_meta['unt_lj_allowmask']['value'] = $unt_livepress_options['email']['allowmask'];
	    $tmp_meta['unt_lj_username']['value'] = $unt_livepress_options['email']['user'];
	    $tmp_meta['unt_lj_securitylevel']['value'] = $unt_livepress_options['email']['security'];

            echo 'Auto-Sync Options<br>';
            echo '&nbsp;&nbsp;&nbsp;&nbsp; ';
            echo '<input id="ljnosynch" name="lj_synch_op" type="radio" value="" ';
	    echo (!strcmp($unt_livepress_options['email']['nosynch'], "checked") ? 'checked' : '').'/> No Synch,';
            echo '&nbsp;&nbsp;&nbsp;&nbsp; ';
            echo '<input id="ljexcerptonly" name="lj_synch_op" type="radio" value="synchexcerpt" ';
	    echo (!strcmp($unt_livepress_options['email']['excerpt'], "checked") ? 'checked' : '').'/> Excerpt Only, ';
            echo '&nbsp;&nbsp;&nbsp;&nbsp; ';
            echo '<input id="ljsynch" name="lj_synch_op" type="radio" value="synchall" ';
            echo (!strcmp($unt_livepress_options['email']['synchall'], "checked") ? 'checked' : '') . '/> Entire Post.';
            //echo '<hr size=1px; />';
	    echo '<br/>';
	    echo '<br/>';
echo "

	    <input type=\"checkbox\" ".(strcmp($unt_livepress_options['email']['linkback'], 'notchecked') ? "value='checked' 'checked'" : "")."\" name=\"ljlinkback\">
	    <label for=\"unt_lp_options[email][linkback]\">Include Linkback </label> <br>

	    <input type='checkbox' '".(strcmp($unt_livepress_options['email']['nocomment'], 'notchecked') ? "value='checked' 'checked'" : "value='notchecked'")."' name='ljnocomment'>
	    <label for='unt_lp_options[email][nocomment]'>Disable Remote Comments </label> <br>
";

//	    get_LJ_login_data();
echo"
	    <label for=\"unt_lp_options[email][security]\"><br>Default Friends List: </label>
            " . friend_groups($tmp_meta);

        echo '<br>Post to: ' . user_journals($lj_meta);
        echo ' &nbsp;&nbsp;&nbsp; ';

        echo '<br>Username: <select id="ljusername" name="ljusername" class="LJExtras_username" onChange="swapLists(this);">';
	if (!empty($journals)) {
        foreach ($journals as $type => $login) {
            foreach ($login as $key => $value) {
        	echo '<option ' . (strcmp($unt_livepress_options['email']['user'],$key) ? '' : 'selected');
		echo ' value="' . $key . '">' . $key . '</option>';
            }
        }
        }
        echo '</select>';
        echo '&nbsp;&nbsp;&nbsp; ';

        /* User Pic Drop down box. */
        echo '<br>'.user_pics($tmp_meta);
        echo '<br /><br />';

	echo "
</div>
	    </ul>
	   </td>
	  </tr>
	 </tbody>
	</table>
	
        <p class=\"submit\"><input type=\"submit\" value=\"Save Settings\"/></p>
        <p class=\"eeset\"><a href=\"".current_uri()."&resetLP=true\">Reset Plugin Settings</a></p>
        <p class=\"reset\"><a href=\"".current_uri()."&resetLPlogins=true\">Wipe out Journal Logins</a></p>

        </form>
        </div>
	";

	//  THE END OF THE REST OF THE MESS  //

//  E N D   A D M I N   P A G E  //

	}
    }
}

get_LJ_login_data();
add_action('admin_menu', 'unt_livepress_admin');
add_action('admin_head', 'journal_Switcher');
add_action('admin_footer', 'init_LJ_Extras_GUI');

?>

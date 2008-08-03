<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<title></title>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
</head>
<body>
<script type="text/javascript" >


<?php
require_once("md5.js");
require_once("../../../../wp-config.php");
require_once(ABSPATH . "/wp-admin/admin-functions.php");
require_once(ABSPATH . "/wp-includes/wp-db.php");
?>

function replace(s, t, u) {
  /*
  **  Replace a token in a string
  **    s  string to be processed
  **    t  token to be found and removed
  **    u  token to be inserted
  **  returns new String
  */
  i = s.indexOf(t);
  r = "";
  if (i == -1) return s;
  r += s.substring(0,i) + u;
  if ( i + t.length < s.length)
    r += replace(s.substring(i + t.length, s.length), t, u);
  return r;
  }

function saveJournal() 
{
    if (document.getElementById("journalPassword").value != document.getElementById("confirmPassword").value)
    {
        window.alert("Passwords Do Not Match!\nPlease check your password and try again");
        return false;
    }
    var container = self.opener.document.getElementById("journals");
    var journalP = self.opener.document.createElement("p");
    var addBR = self.opener.document.createElement("br");
    var allowList = '';
    var journalHidden = self.opener.document.createElement("input");
    var text = self.opener.document.createTextNode("Live Journal User: " + document.getElementById("journalName").value);
    
    var checkedUsers = document.getElementsByTagName("input");
    
    var i = 0;

    while (i < checkedUsers.length)
    {
        if (checkedUsers[i].checked)
        {
            if (allowList != '')
                allowList = allowList + ',';    
                
            allowList = allowList + checkedUsers[i].name;
        }
        i++;
    }
    
    var allowedUsers = self.opener.document.createTextNode("Allowed WordPress Users: " + replace(allowList, ',', ', '));
       
    journalP.appendChild(text);
    journalP.appendChild(addBR);
    journalP.appendChild(allowedUsers);
    journalHidden.setAttribute('type', 'hidden');
    journalHidden.setAttribute('name', 'unt_lp_options[journals][' + document.getElementById("journalName").value + '][password]');
    journalHidden.value = hex_md5(document.getElementById("journalPassword").value);
    journalP.appendChild(journalHidden);
    journalHidden = self.opener.document.createElement("input");
    journalHidden.setAttribute('type', 'hidden');
    journalHidden.setAttribute('name', 'unt_lp_options[journals][' + document.getElementById("journalName").value + '][allowlist]');
    journalHidden.value = allowList;
    journalP.appendChild(journalHidden);
    journalP.setAttribute('id', document.getElementById("journalName").value);


    var oldP = self.opener.document.getElementById('<?php echo $_GET['journal']; ?>');
    if (oldP)
    {
        container.replaceChild(journalP, oldP);
    }
    else
    {
        container.appendChild(journalP);
    }

/*
    if (isset($_GET['journal'])) {
	$test = $_GET['journal'];
	if  ($test !~ 'Undefined index') {
    	var oldP = self.opener.document.getElementById("<?php echo $_GET['journal']; ?>");
    	if (oldP)
    	{
        	container.replaceChild(journalP, oldP);
    	}
	}
	else 
	{
        container.appendChild(journalP);
        }   
    }
    else
    {
        container.appendChild(journalP);
    }   

*/


    window.close();
}
</script>
<div class="wrap">
<form name="JournalEditor">
<h2>Live Journal User</h2>
<table>
<tr>
<td><label for="journalName">Live Journal Name: </label></td>
<td><input id="journalName" name="journalName" type="text" value="<?php echo $_GET['journal']; ?>" /></td>
</tr>
<tr>
<td><label for="journalPassword">Live Journal Password: </label></td>
<td><input id="journalPassword" name="journalPassword" type="password" /></td>
</tr>
<tr>
<td><label for="confirmPassword">Confirm Password: </label></td>
<td><input id="confirmPassword" type="password" /></td>
</tr>
</table>
<br />
<?php
global $wpdb;
$users = $wpdb->get_results("SELECT user_login FROM ". $wpdb->prefix . "users WHERE user_status = 0 ORDER BY user_login");
?>
<fieldset class="options">
<?php
$loop_counter = 1
?>
<table>
<tr>
<?php
foreach ($users as $user) 
{
    if (!($loop_counter % 5))
    {
        echo "</tr><tr>";
    }
        echo "<td><input type=\"checkbox\" name=\"" . $user->user_login . "\"" . (strpos($_GET['allowlist'], $user->user_login) !== false ? "checked=\"checked\"" : "") . ">&nbsp;" . $user->user_login . "</td>";
    $loop_counter++;
}
?>
</tr></table>
</fieldset>
<br />
<input type="button" value="Save Changes" onClick="saveJournal();return false;" />
</form>
</div>
</body>
</html>

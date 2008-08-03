<?php
//Live+Press_2.0.3

function unt_livepress_admin() 
{
    if (function_exists('add_options_page'))
    {
        add_options_page('Live Press+2', 'Live+Press', 5, __FILE__, 'unt_livepress_admin_display');
    }
}

function set_defaults()
{
    $options_array['general']['usetags'] = true;
    $options_array['general']['usemoods'] = true;
    $options_array['general']['usemusic'] = true;
    $options_array['general']['useextras'] = true;
    $options_array['general']['usesynch'] = true;
    
    $options_array['moods']['fixincludepath'] = false;
    $options_array['moods']['guessmoodid'] = true;
    $options_array['moods']['correctmoodid'] = true;
    $options_array['moods']['position'] = 'after';
    $options_array['moods']['location'] = 'the_content';
    $options_array['moods']['xhtml'] = 'div';
    $options_array['moods']['imagebaseurl'] = 'http://stat.livejournal.com/img/mood/';
    $options_array['moods']['theme'] = 'classic';
    $options_array['moods']['text'] = '<strong>Current Mood: </strong> ';
    $options_array['moods']['file'] = 'moodlist.txt';

    $options_array['music']['position'] = 'after';
    $options_array['music']['location'] = 'the_content';
    $options_array['music']['xhtml'] = 'div';
    $options_array['music']['text'] = '<strong>Current Music: </strong> ';
    
    $options_array['synch']['bydefault'] = false;
    $options_array['synch']['excerptonly'] = false;
    $options_array['synch']['excerptlength'] = 250;
    $options_array['synch']['insertlinkback'] = false;
    $options_array['synch']['useadvancedlinkback'] = false;
    $options_array['synch']['linkbacktext'] = 'View this post on my blog';
    
    $options_array['tags']['parse_cut'] = true;
    $options_array['tags']['parse_user'] = true;
    
    $options_array['userpics']['text'] = 'User Pic: ';
    
    return $options_array;
}

function unt_livepress_admin_display()
{
    $unt_livepress_options = get_option("unt_livepress_options");
    if (empty($unt_livepress_options))
    {
        if ($_GET['installLP'] == true)
        {
            $unt_livepress_options = set_defaults();
            add_option("unt_livepress_options", $unt_livepress_options, "Option settings for the LivePress Plugin.", true);
        }
        else
        {
            echo "<div class=\"updated\"><p><strong>Live+Press</strong> has not been installed. Please <a href=\"" . $_SERVER['REQUEST_URI'] . "&installLP=true\">install</a> Live+Press before continuing.</p></div>";
        }
    }
    else
    {
        if (isset($_POST['unt_lp_options']))
        {
            update_option("unt_livepress_options", $_POST['unt_lp_options']);
            $unt_livepress_options = get_option("unt_livepress_options");
        }  
        echo "<div class=\"wrap\">
        <script language=\"javascript\">

        function journalEditor(querystring) 
        {

        var editor = window.open(\"../wp-content/plugins/LivePress_2.0/LivePress/lpeditjournal.php\" + querystring, \"Edit Journal\", \"width=800,height=600\");

        }
        
        function deleteJournal(journal)
        {
            var journalP = document.getElementbyId(journal);
            if (journalP)
            {
                document.removeChild(journalP);
            }
        }

        </script>
        <h2>Live+Press Options</h2>
        <form method=\"post\">
        <div class=\"submit\"><input type=\"submit\" value=\"Save Settings\"/></div>
        <fieldset class=\"options\">
            <h3>Live+Press Modules</h3>
            <ul><li><input type=\"checkbox\" value=\"true\" " . ($unt_livepress_options['general']['useextras'] == true ? "checked=\"checked\"" : "") . " name=\"unt_lp_options[general][useextras]\">
			<label for=\"unt_lp_options[general][useextras]\">  Activate Live+Press Extras</label></li>
			<li><input type=\"checkbox\" value=\"true\" " . ($unt_livepress_options['general']['usemoods'] == true ? "checked=\"checked\"" : "") . " name=\"unt_lp_options[general][usemoods]\">
			<label for=\"unt_lp_options[general][usemoods]\">  Activate Live+Press Moods</label></li>
            <li><input type=\"checkbox\" value=\"true\" " . ($unt_livepress_options['general']['usemusic'] == true ? "checked=\"checked\"" : "") . " name=\"unt_lp_options[general][usemusic]\">
			<label for=\"unt_lp_options[general][usemusic]\">  Activate Live+Press Music</label></li>
            <li><input type=\"checkbox\" value=\"true\" " . ($unt_livepress_options['general']['usesynch'] == true ? "checked=\"checked\"" : "") . " name=\"unt_lp_options[general][usesynch]\">
			<label for=\"unt_lp_options[general][usesynch]\">  Activate Live+Press Synch</label></li>
			<li><input type=\"checkbox\" value=\"true\" ". ($unt_livepress_options['general']['usetags'] == true ? "checked=\"checked\"" : "") . " name=\"unt_lp_options[general][usetags]\">
			<label for=\"unt_lp_options[general][usetags]\">  Activate Live+Press Tags</label></li></ul>
        </fieldset>
        <fieldset class=\"options\">
            <h3>Live+Press Moods</h3>
			<ul><li><input type=\"checkbox\" value=\"true\" " . ($unt_livepress_options['moods']['fixincludepath'] == true ? "checked=\"checked\"" : "") . " name=\"unt_lp_options[moods][fixincludepath]\">
            <label for=\"unt_lp_options[moods][fixincludepath]\">Fix Include Path: </label></li>
            <li><input type=\"checkbox\" value=\"true\" " . ($unt_livepress_options['moods']['guessmoodid'] == true ? "checked=\"checked\"" : "") . " name=\"unt_lp_options[moods][guessmoodid]\">
			<label for=\"unt_lp_options[moods][guessmoodid]\">Guess Mood ID: </label></li>            
            <li><input type=\"checkbox\" value=\"true\" " . ($unt_livepress_options['moods']['correctmoodid'] == true ? "checked=\"checked\"" : "") . " name=\"unt_lp_options[moods][correctmoodid]\">
			<label for=\"unt_lp_options[moods][correctmoodid]\">Correct Mood ID: </label></li>            
            <li><label for=\"unt_lp_options[moods][position]\">Mood Position: </label>
            <select name=\"unt_lp_options[moods][position]\">
                <option value=\"before\" " . ($unt_livepress_options['moods']['position'] == "before" ? "selected=\"selected\"" : "") . ">Before</option>
                <option value=\"after\" " . ($unt_livepress_options['moods']['position'] == "after" ? "selected=\"selected\"" : "") . ">After</option>
            </select></li>
            <li><label for=\"unt_lp_options[moods][location]\">Mood Location: </label>
            <select name=\"unt_lp_options[moods][location]\">
                <option value=\"the_content\" " . ($unt_livepress_options['moods']['location'] == "the_content" ? "selected=\"selected\"" : "") . ">the_content</option>
                <option value=\"the_date\" " . ($unt_livepress_options['moods']['location'] == "the_date" ? "selected=\"selected\"" : "") . ">the_date</option>
                <option value=\"the_time\" " . ($unt_livepress_options['moods']['location'] == "the_time" ? "selected=\"selected\"" : "") . ">the_time</option>
            </select></li>
            <li><label for=\"unt_lp_options[moods][xhtml]\">XHTML Wrapper: </label>
            <input type=\"text\" value=\"" . $unt_livepress_options['moods']['xhtml'] . "\" name=\"unt_lp_options[moods][xhtml]\"></li>            
            <li><label for=\"unt_lp_options[moods][theme]\">Mood Theme: </label>
            <input type=\"text\" value=\"" . $unt_livepress_options['moods']['theme'] . "\" name=\"unt_lp_options[moods][theme]\"></li>
            <li><label for=\"unt_lp_options[moods][text]\">Mood Text: </label>
            <input type=\"text\" value=\"" . $unt_livepress_options['moods']['text'] . "\" name=\"unt_lp_options[moods][text]\"></li>
            <li><label for=\"unt_lp_options[moods][file]\">Mood Source File: </label>
            <input type=\"text\" value=\"" . $unt_livepress_options['moods']['file'] . "\" name=\"unt_lp_options[moods][file]\"></li>
			<li><label for=\"unt_lp_options[moods][imagebaseurl]\">Image Base URL: </label>
            <input type=\"text\" value=\"" . $unt_livepress_options['moods']['imagebaseurl'] . "\" name=\"unt_lp_options[moods][imagebaseurl]\" size=\"40\"></li></ul>
        </fieldset>
        <fieldset class=\"options\">
            <h3>Live+Press Music</h3>
            <ul><li><label for=\"unt_lp_options[music][position]\">Music Position: </label>
            <select name=\"unt_lp_options[music][position]\">
                <option value=\"before\" " . ($unt_livepress_options['music']['position'] == "before" ? "selected=\"selected\"" : "") . ">Before</option>
                <option value=\"after\" " . ($unt_livepress_options['music']['position'] == "after" ? "selected=\"selected\"" : "") . ">After</option>
            </select></li>
            <li><label for=\"unt_lp_options[music][location]\">Music Location: </label>
            <select name=\"unt_lp_options[music][location]\">
                <option value=\"the_content\" " . ($unt_livepress_options['music']['location'] == "the_content" ? "selected=\"selected\"" : "") . ">the_content</option>
                <option value=\"the_date\" " . ($unt_livepress_options['music']['location'] == "the_date" ? "selected=\"selected\"" : "") . ">the_date</option>
                <option value=\"the_time\" " . ($unt_livepress_options['music']['location'] == "the_time" ? "selected=\"selected\"" : "") . ">the_time</option>
            </select></li>
            <li><label for=\"unt_lp_options[music][xhtml]\">XHTML Wrapper: </label>
            <input type=\"text\" value=\"" . $unt_livepress_options['music']['xhtml'] . "\" name=\"unt_lp_options[music][xhtml]\"></li>
            <li><label for=\"unt_lp_options[music][text]\">Music Text: </label>
            <input type=\"text\" value=\"" . $unt_livepress_options['music']['text'] . "\" name=\"unt_lp_options[music][text]\" size=\"40\"></li></ul>
        </fieldset>
        <fieldset class=\"options\">
            <h3>Live+Press Synch</h3>
			<ul><li><input type=\"checkbox\" value=\"true\" ". ($unt_livepress_options['synch']['bydefault'] == true ? "checked=\"checked\"" : "") . " name=\"unt_lp_options[synch][bydefault]\">
            <label for=\"unt_lp_options[synch][bydefault]\">Synch by Default</label></li>
			<li><input type=\"checkbox\" value=\"true\" " . ($unt_livepress_options['synch']['excerptonly'] == true ? "checked=\"checked\"" : "") . " name=\"unt_lp_options[synch][excerptonly]\">
            <label for=\"unt_lp_options[synch][excerptonly]\">Only Synch Excerpt by Default</label></li>
            <li><label for=\"unt_lp_options[synch][excerptlength]\">Auto-generated Excerpt Length: </label>
            <input type=\"text\" size=\"5\" value=\"" . $unt_livepress_options['synch']['excerptlength'] . "\" name=\"unt_lp_options[synch][excerptlength]\"></li>
			<li><input type=\"checkbox\" value=\"true\" ". ($unt_livepress_options['synch']['insertlinkback'] == true ? "checked=\"checked\"" : "") . " name=\"unt_lp_options[synch][insertlinkback]\">
            <label for=\"unt_lp_options[synch][useadvancedlinkback]\">Use Advanced Link Back</label></li>
			<li><input type=\"checkbox\" value=\"true\" " . ($unt_livepress_options['synch']['useadvancedlinkback'] == true ? "checked=\"checked\"" : "") . " name=\"unt_lp_options[synch][useadvancedlinkback]\">
            <label for=\"unt_lp_options[synch][insertlinkback]\">Insert Link Back to WordPress Entry by Default</label> </li>   
            <li><label for=\"unt_lp_options[synch][linkbacktext]\">Default Link Back Text: </label>
            <input type=\"text\" value=\"" . $unt_livepress_options['synch']['linkbacktext'] . "\" name=\"unt_lp_options[synch][linkbacktext]\" size=\"40\"></li></ul>
        </fieldset>
        <fieldset class=\"options\">
            <h3>Live+Press Tags</h3>
			<ul><li><input type=\"checkbox\" value=\"true\" ". ($unt_livepress_options['tags']['parse_cut'] == true ? "checked=\"checked\"" : "") . " name=\"unt_lp_options[tags][parse_cut]\">
            <label for=\"unt_lp_options[tags][parse_cut]\">Parse Cut Tags</label></li>
            <li><input type=\"checkbox\" value=\"true\" " . ($unt_livepress_options['tags']['parse_user'] == true ? "checked=\"checked\"" : "") . " name=\"unt_lp_options[tags][parse_user]\">
            <label for=\"unt_lp_options[tags][parse_user]\">Parse User Tags</label></li></ul>           
        </fieldset>
        <fieldset class=\"options\">
            <h3>Live+Press User Pics</h3>
            <ul><li><label for=\"unt_lp_options[userpics][text]\">User Pics Text: </label>
            <input type=\"text\" value=\"" . $unt_livepress_options['userpics']['text'] . "\" name=\"unt_lp_options[userpics][text]\" size=\"40\"></li></ul>
        </fieldset>
        <fieldset id=\"journals\" class=\"options\">
            <h3>LiveJournal Configuration</h3>
            <a href=\"\" onClick=\"journalEditor('');return false;\">Add Journal</a>";
        
        if (isset($unt_livepress_options['journals']))
        {
        foreach (array_keys($unt_livepress_options['journals']) as $name)
        {
            echo "<p id=\"". $name ."\">
            <ul><li>LiveJournal User: " . $name . "<a href=\"\" onClick=\"journalEditor('?allowlist=" . $unt_livepress_options['journals'][$name]['allowlist'] . "&journal=" . $name . "');return false;\">Edit Journal Settings</a> <a href=\"\" onClick=\"deleteJournal('". $name ."');return false;\">Delete</a></li>
            <li>Allowed WordPress Users: " . str_replace( ",", ", ", $unt_livepress_options['journals'][$name]['allowlist']) . 
            "<INPUT type=\"hidden\" name=\"unt_lp_options[journals][". $name . "][password]\" value=\"" . $unt_livepress_options['journals'][$name]['password'] . "\">
            <INPUT type=\"hidden\" name=\"unt_lp_options[journals][" . $name . "][allowlist]\" value=\"" . $unt_livepress_options['journals'][$name]['allowlist'] . "\"></li></ul></P>";
        }
        }    
            
        echo "</fieldset>
        <div class=\"submit\"><input type=\"submit\" value=\"Save Settings\"/></div>
        </form>
        </div>";
    }
}

add_action('admin_menu', 'unt_livepress_admin');

?>

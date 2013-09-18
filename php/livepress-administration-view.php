<?php
function lp_plugins_url($path) {
    echo LP_PLUGIN_URL_BASE . $path;
}
function display_messages($messages, $type) {
    foreach ($messages[$type] as $msg) {
        echo '<div class="messages ' . esc_attr( $type ) . '"><p><strong>';
        echo $msg;
        echo '</strong></p></div>';
    }
}

function hide_unless($condition) {
    if (!$condition) {
        echo "display:none;";
    }
}

?>
<style type="text/css">
    #facebox .b { background:url(<?php lp_plugins_url("img/facebox/b.png") ?>); }
    #facebox .tl { background:url(<?php lp_plugins_url("img/facebox/tl.png") ?>); }
    #facebox .tr { background:url(<?php lp_plugins_url("img/facebox/tr.png") ?>); }
    #facebox .bl { background:url(<?php lp_plugins_url("img/facebox/bl.png") ?>); }
    #facebox .br { background:url(<?php lp_plugins_url("img/facebox/br.png") ?>); }
</style>
<script type="text/javascript">
    function get_twitter_avatar() {
        var $container = jQuery("#twitter_avatar_setting_container");
        var $avatar_container = $container.find('#twitter_avatar_preview');
        var $msg_span = $container.find('#twitter_avatar_message');
        var username_input = $container.find('#twitter_avatar_username')[0];
        var button = $container.find('#twitter_avatar_preview_button')[0];

        var success = function(url){
            $msg_span.html('');
            $avatar_container.attr('src', url).show();
        };

        var error = function(XMLHttpRequest) {
            if (XMLHttpRequest.status == 403) {
                $msg_span.text("Couldn't find account you gave us.");
                return;
            }
        }

        button.disabled = true;
        var params = {};
        params.action = 'get_twitter_avatar';
        params.username = username_input.value;
        $msg_span.html('Requesting avatar...');
        $msg_span.addClass("lp-spinner");
        
        jQuery.ajax({
            url: ajaxurl,
            data: params,
            format: "json",
            type: 'GET',
            error: error,
            success: success,
            complete: function(){
                button.disabled = false;
                $msg_span.removeClass("lp-spinner");
            }
        });
    }
</script>
<?php
    display_messages($messages, 'error');
    display_messages($messages, 'updated');
?>
<div class="wrap">
    <div class="col l">
        <div id="head-desc">
            <img src="<?php lp_plugins_url("img/logo.png") ?>" class="logo" alt="Livepress icon" />

            <?php if ($admin_view) { ?>
                <h2>LivePress Administrator Settings</h2>
            <?php } else { ?>
                <h2>LivePress Author Settings</h2>
            <?php } ?>

            <p class="desc">
                <strong>Use LivePress to update your blog in real-time.</strong>
                Additions to blog posts will appear for your readers without them refreshing the
                page. Add updates from within WordPress, or update remotely via Twitter &amp; Instant
                Messaging.
            </p>

        </div><!--/head-desc-->

        <?php if ($admin_view) { ?>
            <?php include_once(dirname(__FILE__) . '/administration-blocks/authentication.php'); ?>
        <?php } // end block admin view ?>

        <form method="post" action="">
          <div>
            <?php if ($admin_view) { ?>
                <div class="<?php if (!$authenticated) { echo "no_key_hidden"; } ?>">
                    <?php include_once(dirname(__FILE__) . '/administration-blocks/security.php'); ?>
                    <?php include_once(dirname(__FILE__) . '/administration-blocks/appearance.php'); ?>
                </div>
            <?php } // end block admin view ?>


            <?php if ($author_view && !$authenticated) { ?>
                <span class="desc">To use LivePress, your blog need a key code. Please contact the blog administrator</span>
            <?php } ?>

            <div class="<?php if (!$authenticated) { echo "no_key_hidden"; } ?>">
                <?php if ($admin_view)  { ?>
                    <?php include_once(dirname(__FILE__) . '/administration-blocks/twitter_setup.php'); ?>
                <?php } else { ?>
                    <?php wp_nonce_field('update-options'); ?>
                    <?php include_once(dirname(__FILE__) . '/administration-blocks/user_appearance.php'); ?>
                    <?php include_once(dirname(__FILE__) . '/administration-blocks/twitter_content.php'); ?>
                <?php } ?>
            </div>
            <div class="hr left wide"></div>
            <input type="hidden" name="action" value="update" />
            <p class="submit">
                <input type="submit" class="button-primary" value="<?php _e('Save Changes', 'livepress') ?>" />
            </p>
          </div>
        </form>
    </div><!--/col l-->
</div>

<div class="clear"></div>

<div id="twitter_commands" class="facebox">
    <h2 class="twitter">Twitter Commands</h2>

    <div class="tip_item tweet_container_side">
        <h6>To start a new post:</h6>
        <ul>
            <li>[TITLE] #lpon</li>
        </ul>
        <br />

        <span>
            Opens a new post with a title of any text that appears before #lpon. If you don't specify a title, the date will be used.
        </span>
    </div>

    <div class="tip_item border-l tweet_container_side">
        <h6>To end posts:</h6>
        <ul>
            <li>[FINAL TEXT] #lpoff</li>
        </ul>
        <br />
        <span>
            Anything after the command in the tweet won't be posted.
        </span>
    </div>
    <div class="clear"><!-- --></div>
</div>

<div id="im_commands" class="facebox">
    <h2 class="im">IM Commands</h2>

    <div class="tip_item">
        <h6>To start a new post</h6>
        <ul>
            <li>post [TITLE]</li>
            <li>livego [TITLE]</li>
        </ul>
        <br />

        <span>
            Opens a new post with [TITLE]<br />
            If you don't specify a title, the date will be used.
        </span>
    </div>

    <div class="tip_item border-l">
        <h6>To</h6>
        <ul>
            <li>See the help</li>
            <li>See the status</li>
            <li>List the recent posts</li>
            <li>End posts</li>
        </ul>
    </div>

    <div class="tip_item">
        <h6>Type this...</h6>
        <ul>
            <li>help</li>
            <li>status</li>
            <li>list</li>
            <li>close <em>or</em> livestop</li>
        </ul>
    </div>
    <div class="clear"><!-- --></div>
</div>


<?php if ($this->can_manage_options()): ?>
<div id="im_bots" class="facebox bots">
    <h2 class="bot">What is an IM (Instant Messaging) Bot?</h2>
    <p>An IM Bot is an instant messaging account that passes messages between your blog's authors and LivePress.  Authors send messages to the IM Bot to create new blog posts, post new updates to the blog, and access other features of LivePress.</p>
    <div class="tip_item">
        <h6>To set up an IM Bot:</h6>
        <ol>
            <li>Create a new account on the IM service(s) authors will post from. (AIM, Y! Messenger, Windows Live Messenger or Google Talk.)</li>
            <li>Register the IM Bot on the LivePress settings page.</li>
        </ol>
    </div>
    <div class="tip_item border-l">
        <h6>To use an IM Bot:</h6>
        <ul>
            <li>Send messages from your IM client to the IM Bot you've just registered. A detailed list of commands you can use to interact with LivePress can be found on the Author Setup tab.</li>
        </ul>
    </div>
    <div class="clear"></div>
</div>
<?php endif; ?>

<div class="block">
    <h3><span class="remote">Remote Settings</span></h3>
    <div class="block-content">
        <h4 class="wide">Allow remote posting from Twitter and Instant Messenger</h4>
        <label for="remote_post">
            <input type="checkbox" id="remote_post" name="remote_post"
            <?php if ($user_options['remote_post'])
                       echo 'checked="checked"'; ?> />
            Yes
        </label>
        <br />
        <div class="tabulation remote_post" style="<?php hide_unless($user_options['remote_post'] == "1"); ?>">
            <div class="left hr"></div>
            <h4 class="wide">Use this Twitter account to update my blog</h4>
            <div class="row twitter left">
                <label for="post_from_twitter_username" class="icon twitter_logo"></label>
                <input type="text" id="post_from_twitter_username"
                       name="post_from_twitter_username"
                       placeholder="Twitter Username"
                       value="<?php echo esc_attr( $user_options['post_from_twitter_username'] ); ?>" />

                <a class="link right" href="#twitter_commands"rel="facebox">How to post using Twitter</a>
            </div>

            <div class="left hr"></div>
        <?php include_once(dirname(__FILE__) . '/im_bots_author.php'); ?>
            <div class="clear"></div>
        </div>
    </div>
</div>

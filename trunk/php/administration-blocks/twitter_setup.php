<div class="block">
    <h3><span class="remote">Remote Settings</span></h3>
    <div class="block-content">
        <div id="twitter-autopost" class="row left">
            <label class="icon twitter_logo"></label>
            <label id="post_to_twitter_label" for="post_to_twitter">
                <input type="checkbox" id="post_to_twitter" name="post_to_twitter"
                           <?php if ($options['post_to_twitter'] == "true")
                                     echo 'checked="checked"'; ?> />
                Automatically post updates to Twitter
            </label>
            <div class="post_to_twitter_messages">
                <span id="post_to_twitter_message">
                    <?php if ($options['oauth_authorized_user']) :?>
                        Sending out alerts on Twitter account
                        <?php echo $options['oauth_authorized_user'].'.' ?>
                    <?php endif; ?>
                </span>
                <span style="display: none;" id="post_to_twitter_url"></span>
                <span style="<?php hide_unless($options['oauth_authorized_user']); ?>"
                      id="post_to_twitter_message_change_link">
                  <a href="#" id="lp-post-to-twitter-change" style="display: none">Click here</a> to change accounts.
                </span>
            </div>
        </div>
        
        <div class="left hr"></div>
        <?php include_once(dirname(__FILE__) . '/im_bots_admin.php'); ?>
    </div><!--/block-content-->
</div><!--/block-->

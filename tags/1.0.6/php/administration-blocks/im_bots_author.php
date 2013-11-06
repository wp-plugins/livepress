<h4 class="wide">Use these IM accounts to update my blog</h4>
<p class="left">
    Enter your IM user name in the appropiate space bellow. Click "Send test message" to test
    your connection to the IM Bot that passes messages on to LivePress:
</p>
<?php $enabled_services = array_keys($this->get_im_bots_set()); ?>
<?php foreach($this->IM_services as $im_service) {
    $class = 'bot_' . $im_service . "_test";
    $im_username_id = 'im_enabled_user_'.$im_service;
    ?>
    <div class="row left">
        <label class="icon <?php echo $im_service ?>"
               for="<?php echo $im_username_id ?>">
            <?php echo strtoupper($im_service) ?>
        </label>

        <input class="username" type="text" name="<?php echo esc_attr( $im_username_id ); ?>"
               id="<?php echo esc_attr( $im_username_id ); ?>"
               placeholder="Enter <?php echo $this->IM_services_label[$im_service] ?> Username"
               value="<?php echo esc_attr( $user_options[$im_username_id] ); ?>"
               <?php if (!in_array($im_service, $enabled_services)) echo "disabled=\"disabled\""; ?>
               />
               
        <?php if (in_array($im_service, $enabled_services)) { ?>
            <input type="button" id="<?php echo esc_attr( $im_username_id ); ?>_test_button"
                   class="im-users-test-message-button"
                   style="display:none;"
                   value="Send test message"
                   onclick="ImIntegration.send_test_message(
                       '<?php echo $im_username_id ?>',
                       '<?php echo $im_service ?>'
                   );" />
            
            <label for="im_send_comments_<?php echo $im_service?>" class="im_send_comments"
                <?php if ($options['disable_comments']) echo 'style="display: none;"' ?> >
                <input type="checkbox" class="im_send_comments"
                    id="im_send_comments_<?php echo $im_service?>"
                    name="im_send_comments_<?php echo $im_service?>"
                    <?php checked( $user_options["im_send_comments_{$im_service}"] ); ?> />
                Send comments on my posts to this IM account
            </label>
        <?php } else if ($admin_user) { ?>
            <a href="<?php echo esc_url( $admin_path ); ?>#manage_bots">Set up IM Bot</a>
        <?php } else { ?>
            Not currently enabled.
        <?php } ?>
        <span id="<?php echo esc_attr( $im_service ); ?>_message"></span>
    </div>
<?php } ?>
<p class="left">
    To post from instant messenger:
</p>
<table class="tbots">
    <?php $bots = $this->get_im_bots_set(); ?>
    <?php $enabled_services = array_keys($bots); ?>
    <?php foreach($this->IM_services as $im_service) { ?>
            <tr>
                <td>From <?php echo $this->IM_services_label[$im_service] ?></td>
                <td>
                <?php if (in_array($im_service, $enabled_services)) { ?>
                    Send messages to
                    <span class = "italicized"><?php echo $bots[$im_service]; ?></span>
                <?php } else { ?>
                    Not currently enabled
                <?php } ?>
                </td>
            </tr>
    <?php } ?>
</table>

<a href="#im_commands" class="link right" rel="facebox">How to post using IM</a>
<div class="left hr"></div>

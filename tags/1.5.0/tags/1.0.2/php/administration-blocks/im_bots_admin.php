<a name="manage_bots"></a>
<h4 class="wide">
    Allow authors to post using instant message
</h4>
<span class="left">
    Livepress provides a default Google Talk / Jabber bot for your blog.  We have provided a default username which you may change if you'd like.
</span>


<div class="row left">
    <span class="icon gtalk"></span>

    <span class="default_bot">
        Username:     <input type="text" class="blog_shortname"
           name="blog_shortname"
           id="blog_shortname"
           value="<?php echo esc_attr( $options['blog_shortname'] ); ?>"
           placeholder="Shortname"
           /> @blogs.<?php echo $config->get_option('JABBER_DOMAIN') ?>
    </span>

</div>

<span class="left">
    To allow authors to post to this blog from their IM clients in other IM networks,
    first set up <a href="#im_bots" rel="facebox">IM Bots</a> to pass messages between the blog's authors and LivePress.
    Next, have each author specify which IM accounts they will post from on the LivePress > Author Settings page.
</span>





<?php foreach($this->IM_services as $im_service) {
    if ($im_service == 'gtalk') {
        continue;
    }
    $class = 'bot_'.$im_service;
    $im_id = 'im_'.$im_service;
    $im_username_id = 'im_bot_username_'.$im_service;
    $im_password_id = 'im_bot_password_'.$im_service;
    ?>
<div class="row left">
    <label class="icon <?php echo $im_service ?>" for="<?php echo $im_username_id ?>">
        <?php echo strtoupper($im_service) ?>
    </label>

    <input type="text" class="<?php echo esc_attr( $class ); ?>"
           name="<?php echo esc_attr( $im_username_id ); ?>"
           id="<?php echo esc_attr( $im_username_id ); ?>"
           value="<?php echo esc_attr( $options[$im_username_id]  ); ?>"
           placeholder="Username"
           />
    <input type="password" class="<?php echo esc_attr( $class ); ?>"
           name="<?php echo esc_attr( $im_password_id ); ?>"
           id="<?php echo esc_attr( $im_password_id ); ?>"
           placeholder="Password"
           value="<?php echo esc_attr( $options[$im_password_id]  ); ?>"/>

    <?php if ($options[$im_username_id] && $options[$im_password_id]) : ?>
        <input type="button" id="cancel_<?php echo $im_service ?>" class="im_cancel" style="display:none;" value="<?php _e('cancel', 'livepress') ?>" />
        <input type="button" id="edit_<?php echo $im_service ?>" class="im_edit" style="display:none;" value="<?php _e('edit', 'livepress') ?>" />
        <input type="button" id="check_<?php echo $im_service ?>"
               class="im_check"
               value="<?php _e('check', 'livepress') ?>"
               style="display:none;"
               onclick="ImIntegration.check_status(
                   '<?php echo $im_service; ?>');"/>
        <span id="check_message_<?php echo $im_service ?>"></span>
    <?php endif; ?>
    <span id="<?php echo esc_attr( $im_username_id ); ?>_message">
        <a target="_blank" href="<?php echo esc_url( $this->IM_services_url[$im_service] ); ?>">Create a new <?php echo $this->IM_services_label[$im_service] ?> account</a>
    </span>



    <?php if (array_key_exists($im_service, $this->im_changed) && $this->im_changed[$im_service]) { ?>
        <script type="text/javascript">
            ImIntegration.check_status('<?php echo $im_service; ?>');
        </script>
    <?php } ?>
</div>
<?php } ?>

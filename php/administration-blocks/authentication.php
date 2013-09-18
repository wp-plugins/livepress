<div class="block auth">
    <h3><span class="authentication">Authentication</span></h3>
    <div class="block-content">
        <form method="post" action="">
            <div>
                <?php wp_nonce_field('update-options'); ?>
                <label class="left" for="api_key"><h4>Enter Your<br />Authorization Key</h4></label>
                <input type="text" id="api_key" name="api_key"
                       value="<?php echo esc_attr( $options['api_key'] ); ?>"/>
                <input type="submit" id="api_key_submit" class="button-primary"
                       value="<?php _e('check', 'livepress') ?>" />
                    <?php
                    if ($options['api_key'] && $options['error_api_key']) {
                        $api_key_status_class = 'invalid_api_key';
                        $api_key_status_text = 'Key not valid';
                    } elseif ($authenticated) {
                        $api_key_status_class = 'valid_api_key';
                        $api_key_status_text = 'Authenticated!';
                    } else {
                        $api_key_status_class = '';
                        $api_key_status_text = 'Found in your welcome email!';
                    }
                    ?>
                <span id="api_key_status" class="<?php echo esc_attr( $api_key_status_class ); ?>">
                        <?php echo $api_key_status_text ?>
                </span>
                <input type="hidden" name="action" value="update" />
            </div>
        </form>

        <?php if (!$authenticated) { ?>
            <p class="no_key">
                To use LivePress, you need an authorization key. Please visit
                <a href="http://livepress.com">http://livepress.com</a> 
                to get one
            </p>            
        <?php } ?>
    </div><!--/block-content-->
</div><!--/block-->


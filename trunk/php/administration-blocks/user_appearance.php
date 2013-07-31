<div class="block">
    <h3><span class="settings">Post Update Settings</span></h3>
    <div class="block-content">
        <h4 class="wide">Author's avatar settings</h4>
        <label for="avatar_wp">
            <input type="radio" id="avatar_wp" name="avatar_display" value="wp"
                <?php if ($options['include_avatar'] != "true")
                           echo 'disabled="disabled"'; ?>
                <?php checked( 'wp', $user_options['avatar_display'] ); ?> />
            Use WordPress (Gravatar)
        </label>
        <label for="avatar_twitter">
            <input type="radio" id="avatar_twitter" name="avatar_display"
                   value="twitter"
                       <?php if ($options['include_avatar'] != "true")
                           echo 'disabled="disabled"'; ?>
                       <?php checked( 'twitter', $user_options['avatar_display'] ); ?> />
            Use Twitter Avatar (if available)
            <div style="<?php hide_unless($user_options['avatar_display'] == 'twitter'); ?>"
                 class="lp-ap-twitter-avatar tabulation twitter_avatar_choice"
                 id="twitter_avatar_setting_container">
                <label for="twitter_avatar_username">
                    <input type="text" id="twitter_avatar_username"
                           name="twitter_avatar_username"
                           value="<?php echo esc_attr( $user_options['twitter_avatar_username'] ); ?>"
                           placeholder="twitter username" />

                    <input type="submit" id="twitter_avatar_preview_button" class="button-primary" value="Preview"/>
                    <br/>
                    <span id="twitter_avatar_message"></span>
                    <img id="twitter_avatar_preview"
                         style="<?php if (!empty($user_options['twitter_avatar_url'])) { echo "display:block;"; }; ?>"
                         src="<?php echo esc_url( $user_options['twitter_avatar_url'] )?>"
                         alt="Twitter avatar preview" />
                </label>
            </div>
        </label>
    </div><!--/block-content-->
</div><!--/block-->

<div class="block">
    <h3><span class="settings">Post Appearance &amp; Update Settings</span></h3>
    <div class="block-content">
        <h4 class="left" id="newUpdatePlacement">Place new updates on</h4>
        <br class="clear" />
        <div class="tabulation">
            <label title="feed_top">
                <input type="radio" id="feed_top" name="feed_order" value="top"
                   <?php if ($options['feed_order'] == "top")
                            echo 'checked="checked"'; ?>/>
                Top
            </label>

            <label title="feed_bottom">
                <input type="radio" id="feed_bottom" name="feed_order" value="bottom"
                    <?php if ($options['feed_order'] == "bottom")
                            echo 'checked="checked"'; ?> />
                Bottom
            </label>
        </div>
        
        <br class="clear" />
        <label>
            <input type="checkbox" id="disable_comments" name="disable_comments"
                <?php if ($options['disable_comments'] == "true") echo  'checked="checked"';  ?> />
            Disable comment features (set this if you use a third-party commenting system such as Disqus)
        </label>
        <label <?php if ($options['disable_comments'] == "true") echo  'style="display:none;"'; ?> >
            <input type="checkbox" id="comment_live_updates_default" name="comment_live_updates_default"
                <?php if ($options['comment_live_updates_default'] == "true") echo  "checked=\"checked\"";  ?> />
            Display new comment notifications on blog by default
        </label>
        <label>
            <input type="checkbox" id="sounds_default" name="sounds_default"
                <?php if ($options['sounds_default'] == "true") echo  "checked=\"checked\"";  ?> />
            Play sounds on blog by default
        </label>
        
        <div class="hr left"></div>
        <h4 class="wide left">Default Appearance</h4>
        <div class="inner-block">
            <label for="update_author">
                <input type="checkbox" id="update_author" name="update_author"
                    <?php if ($options['update_author'] == "true")
                               echo 'checked="checked"'; ?> />
                Include author's name with each update
            </label>
            <div class="tabulation author_name" style="<?php hide_unless($options['update_author'] == "true"); ?>">
                <label title="author_display_default">
                    <input type="radio" id="author_display_default"
                           name="author_display" value="default"
                               <?php if ($options['author_display'] == "default")
                                   echo 'checked="checked"'; ?>/>
                    Use WordPress Username
                </label>
                <label title="author_display_custom">
                    <input type="radio" id="author_display_custom" name="author_display"
                           value="custom"
                               <?php if ($options['author_display'] == "custom")
                                   echo 'checked="checked"'; ?> />
                    Use the following name:
                </label>
                <input type="text" id="author_display_custom_name"
                       name="author_display_custom_name"
                       value="<?php echo esc_attr( $options['author_display_custom_name'] ); ?>"/>
            </div>
        </div>
        <div class="inner-block">
            <label for="include_avatar">
                <input type="checkbox" id="include_avatar" name="include_avatar"
                    <?php if ($options['include_avatar'] == "true")
                               echo 'checked="checked"'; ?> />
                Include avatar with each update
            </label>
            <label for="timestamp">
                <input type="checkbox" id="timestamp" name="timestamp"
                    <?php if ($options['timestamp'] == "true")
                               echo 'checked="checked"'; ?> />
                Include timestamp with each update
            </label>
            <div class="tabulation timestamp" style="<?php hide_unless($options['timestamp'] == "true");  ?>">
                <label title="timestamp_24">
                    <input type="checkbox" id="timestamp_24" name="timestamp_24"
                           value="true"
                               <?php if ($options['timestamp_24'] == "true")
                                   echo 'checked="checked"'; ?> />
                    Use 24 hour time
                </label>
            </div>
            
        </div>
    </div><!--/block-content-->
</div><!--/block-->

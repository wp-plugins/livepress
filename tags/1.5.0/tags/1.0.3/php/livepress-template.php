<?php
add_action( 'livepress_widget', 'livepressTemplate' );
function livepressTemplate( $auto = false, $minutes_since_last = 0 ) {
	global $post;

	if ( 'enabled' !== get_option( 'livepress_globally_enabled', 'enabled' ) )
		return;

	$lp_active = get_post_meta( $post->ID, '_livepress_live_status', true );
	if( isset( $lp_active['live'] ) ) {
		$lp_active = (int) $lp_active['live'];
		$lp_status = $lp_active === 1 ? 'lp-on' : 'lp-off';
	} else {
		$lp_status = 'lp-off';
	}

    // Don't show the LivePress bar on front end if the post isn't live or LivePress disabled
    if ( 1 !== $lp_active || ! livepress_updater::instance()->has_livepress_enabled() )  
        return;

	$since_last = "updated $minutes_since_last minutes ago";
	if ( $minutes_since_last == 1 ) {
		$since_last = "updated 1 minute ago";
	} else if ( $minutes_since_last >= 60 ) {
		$since_last = "no recent updates";
	}

	$live = __( 'LIVE', 'livepress' );
	$about = __( 'Receive live updates to<br />this and other posts on<br />this site.', 'livepress' );
	$notifications = __( 'Notifications', 'livepress' );
	$updates = __( 'Live Updates', 'livepress' );
	$preferences = __( 'preferences', 'livepress' );
	$powered_by = __( 'powered by <a href="http://livepress.com">LivePress</a>', 'livepress' );

    static $called = 0;
    if ( $called++ ) return;
    $htmlTemplate = <<<HTML
        <div id="livepress">
            <div class="lp-bar">
            	<div class="lp-status $lp_status"><span class="status-title">$live</span></div>
                <div class="lp-updated"><span class="lp-updated-counter" data-min="$minutes_since_last">$since_last</span></div>
                <div class="lp-settings-button"></div>
                <div id="lp-settings">
	                <div class="lp-settings-short">
	                    <div class="lp-about">
	                    	$about
	                    </div>
	                </div>
	                <ul>
	                	<li>
	                		<p>
	                        	<input type="checkbox" id="lp-setting-sound" name="lp-setting-sound" checked="checked" />
	                        	<label for="lp-setting-sound">$notifications</label>
	                        </p>
	                    </li>
	                    <li>
	                    	<p>
	                        	<input type="checkbox" id="lp-setting-updates" name="lp-setting-updates" checked="checked" />
	                        	<label for="lp-setting-updates">$updates</label>
	                        </p>
	                    </li>
                	</ul>
                	<p class="powered-by">$powered_by</p>
            	</div>
            </div>
        </div>
HTML;


    $image_url = LP_PLUGIN_URL_BASE . "img/spin.gif";
    $htmlTemplate = str_replace("SPIN_IMAGE", $image_url, $htmlTemplate);

    $image_url = LP_PLUGIN_URL_BASE . "img/lp-bar-logo.png";
    $htmlTemplate = str_replace("LOGO_IMAGE", $image_url, $htmlTemplate);

    $image_url = LP_PLUGIN_URL_BASE . "img/lp-settings-close.gif";
    $htmlTemplate = str_replace("CLOSE_SETTINGS_IMAGE", $image_url, $htmlTemplate);

    $image_url = LP_PLUGIN_URL_BASE . "img/lp-bar-cogwheel.png";
    $htmlTemplate = str_replace("BAR_COG_IMAGE", $image_url, $htmlTemplate);

    $lp_update = livepress_updater::instance();
    $htmlTemplate = str_replace("<!--UPDATES_NUM-->",
            $lp_update->current_post_updates_count(), $htmlTemplate);

    if($auto)
        $htmlTemplate = str_replace('id="livepress"', 'id="livepress" class="auto"', $htmlTemplate);
    
    if (livepress_updater::instance()->is_comments_enabled()) {
        $htmlTemplate = str_replace(array("<!--COMMENTS-->","<!--/COMMENTS-->"), "", $htmlTemplate);
        $htmlTemplate = str_replace("<!--COMMENTS_NUM-->",
                $lp_update->current_post_comments_count(), $htmlTemplate);
    } else {
        $htmlTemplate = preg_replace("#<!--COMMENTS-->.*?<!--/COMMENTS-->#s", "", $htmlTemplate);
    }

    if ($auto) {
        return $htmlTemplate;
    } else {
        echo $htmlTemplate;
    }

}

add_action('livepress_update_box', 'livepressUpdateBox');
function livepressUpdateBox() {
    static $called=0;
    if($called++) return;
    if (livepress_updater::instance()->has_livepress_enabled()) {
        echo '<div id="lp-update-box"></div>';
    }
}

function livepressDashboardTemplate() {
    echo <<<EOT
        <div id="lp-switch-panel" class="editor-hidden">
            <a id="live-switcher" class="off preview button-secondary disconnected" style="display: none" title="Show or Hide the Real-Time Editor">Show</a>
            <h3>Real-Time Editor</h3>
            <span class="warning">Click “Show” to activate the Real-Time Editor and streamline your liveblogging workflow.</span>
        </div>
EOT;
}

?>

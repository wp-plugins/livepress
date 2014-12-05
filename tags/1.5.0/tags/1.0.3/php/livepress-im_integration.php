<?php
require_once 'livepress-config.php';

class ImIntegration {
    function __construct() {
        $this->options = get_option(livepress_administration::$options_name);
        $this->livepress_communication = new livepress_communication($this->options['api_key']);
    }

    //static function initialize_ajax() {
    static function initialize() {
        if (current_user_can("publish_posts")) {
            $im_integration = new ImIntegration();
            $im_integration->handle($_POST);
        }
    }

    static function static_subscribe_im_follower() {
        $im = new ImIntegration();
        if ( isset($_POST['user_name']) && isset($_POST['im_type']) && isset($_POST['post_id']) ) {
            $im->subscribe_im_follower($_POST);
        } else {
            die('Some params missing for subscribe_im_follower');
        }
    }

    function handle($params) {
        if (isset($params['im_integration_test_message'])) {
          $this->test_message($params);
        } else if ( isset($params['im_integration_check_status']) ){
          $this->check_status($params);
        }
    }

    function test_message($params) {
        $params['blogname'] = get_option('blogname');
        $code = $this->livepress_communication->send_to_livepress_test_message_request($params);
        echo $code;
        exit();
    }

    function check_status($params) {
        die($this->livepress_communication->check_im_status($params['im_service']));
    }

    function subscribe_im_follower($params) {
        $this->livepress_communication->subscribe_im_follower($params);
    }
}

?>

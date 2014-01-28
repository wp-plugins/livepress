<?php
require_once 'livepress-config.php';

class Collaboration {
    static function tablename() {
        global $wpdb;
        return $wpdb->prefix . "livepress_twitter_search";
    }

    static function install() {
        global $wpdb;
        $lts = self::tablename();

        $sql = "CREATE TABLE $lts (
                    post_id int not null,
                    user_id int not null,
                    term varchar(140) default '' not null,
                    UNIQUE KEY post_user_term (post_id,user_id,term),
                    KEY (term)
                );";
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }
    static function uninstall() {
        global $wpdb;
        $lts = self::tablename();
        $sql = "DROP TABLE $lts";
        $wpdb->query($sql);
    }

    static function termlist($post_id, $user_id) {
        global $wpdb;
        $lts = self::tablename();
        $sql = $wpdb->prepare("SELECT term FROM $lts WHERE post_id=%d AND user_id=%d", $post_id, $user_id);
        $dbterms = $wpdb->get_results($sql, ARRAY_N);
        $dbterms = array_map(create_function('$a', 'return $a[0];'), $dbterms);
        return $dbterms;
    }

    // Get twitter searches, that enabled for user/post
	static function get_searches($post_id, $user_id, $terms) {
		global $wpdb;
		$dbterms = self::termlist($post_id, $user_id);
		$result = $dbterms;
		if (true) {
			// If prefer to return subset of terms that present on LP side
			if (isset($terms))
				$result = array_intersect($dbterms, $terms);
		} else {
			// Do this if we decided to prefer re-subscribe in case of differences with LP
			$subscribe = array_diff($dbterms, $terms); // List of terms which we know for user, but not on LP side
			$options = get_option(livepress_administration::$options_name);
			$livepress_com = new livepress_communication($options['api_key']);
			$livepress_com->send_to_livepress_handle_twitter_search('add', $subscribe); // TODO: handle error somehow
			$result = $dbterms;
		}
		return $result;
	}

	static function add_search($post_id, $user_id, $term) {
        global $wpdb;
        $lts = self::tablename();
        $sql = $wpdb->prepare("INSERT INTO $lts(post_id, user_id, term) VALUES (%d, %d, %s)", $post_id, $user_id, $term);
        $wpdb->query($sql);
        $options = get_option(livepress_administration::$options_name);
        $livepress_com = new livepress_communication($options['api_key']);
        $res = json_decode($livepress_com->send_to_livepress_handle_twitter_search('add', $term));
        return $res != null && ($res->success || $res->errors == '');
    }
    static function del_search($post_id, $user_id, $term) {
        global $wpdb;
        $lts = self::tablename();
        $sql = $wpdb->prepare("DELETE FROM $lts WHERE post_id=%d AND user_id=%d AND term=%s", $post_id, $user_id, $term);
        $wpdb->query($sql);
        $sql = $wpdb->prepare("SELECT term FROM $lts WHERE term=%s LIMIT 1", $term);
        $is_term = $wpdb->get_var($sql);
        if ($is_term === NULL) {
            $options = get_option(livepress_administration::$options_name);
            $livepress_com = new livepress_communication($options['api_key']);
            $livepress_com->send_to_livepress_handle_twitter_search('remove', $term);// TODO: handle error somehow
            // But there error are not critical, since if we can't remove it from LP, it will just left as not-used-now search
        }
        return true;
    }
    static function clear_searches($post_id, $user_id) {
        global $wpdb;
        $lts = self::tablename();
        $dbterms = self::termlist($post_id, $user_id);
        $sql = $wpdb->prepare("DELETE FROM $lts WHERE post_id=%d AND user_id=%d", $post_id, $user_id);
        $wpdb->query($sql);
		$sql = "SELECT term FROM $lts WHERE term in (%s) LIMIT 1";
		$terms = array();
		foreach($dbterms as $term) {
			$terms[] = '"'. esc_sql($term).'"';
		}
		$sql = sprintf($sql, join(",",$terms));
        $leftterms = sizeof($dbterms)==0 ? array() : $leftterms = $wpdb->get_results($sql, ARRAY_N);
        $leftterms = array_map(create_function('$a', 'return $a[0];'), $leftterms);
		$remove = array_diff($dbterms, $leftterms);
        $options = get_option(livepress_administration::$options_name);
        $livepress_com = new livepress_communication($options['api_key']);
        $livepress_com->send_to_livepress_handle_twitter_search('remove', $remove);// TODO: handle error somehow
        // But there error are not critical, since if we can't remove it from LP, it will just left as not-used-now search
        return true;
    }

    static function twitter_search($action, $post_id, $user_id, $term) {
        switch($action) {
        case 'add':
            return self::add_search($post_id, $user_id, $term);
        case 'remove':
            return self::del_search($post_id, $user_id, $term);
        case 'clear':
            return self::clear_searches($post_id, $user_id);
        }
        return false;
    }

    static function comments_number() {
        $post = get_post(intval($_POST['post_id']));
        echo $post->comment_count;
        die;
    }

    static function return_live_edition_data() {
        $response = array();
        $response['comments'] = self::comments_of_post();
	    $response['guest_bloggers'] = array();

        $taf = self::tracked_and_followed();
	    if ( isset( $taf['guest_bloggers'] ) )
            $response['guest_bloggers'] = $taf['guest_bloggers'];
        $response['terms'] = $taf['terms'];
        return $response;
    }
    static function get_live_edition_data() {
        $response = self::return_live_edition_data();
        echo json_encode($response);
        die;
    }

    private static function tracked_and_followed() {
        global $current_user;
        $options = get_option(livepress_administration::$options_name);
        $communication = new livepress_communication($options['api_key']);

        $params = array('post_id' => $_REQUEST['post_id'], "format" => "json");
        $result = json_decode($communication->followed_tracked_twitter_accounts($params), true); // TODO: Handle errors
        $result['terms'] = self::get_searches($_REQUEST['post_id'], $current_user->ID, $result['terms']);
        return $result;
    }

    private static function comments_of_post() {
        $post_id = $_REQUEST['post_id'];

        $args = 'post_id=' . $post_id;
        $post_comments = get_comments($args);

        $comments = array();
        $comment_msg_id = get_post_meta($post_id, "_".PLUGIN_NAME."_comment_update", true);

        foreach ($post_comments as $c) {
          $avatar = get_avatar($c->comment_author_email, 30);
          $commentId = $c->comment_ID;
          $comment = array(
            'comment_id' => $commentId,
            'avatar_url' => $avatar,
            'author_url' => $c->comment_author_url,
            'author' => $c->comment_author,
            'status' => wp_get_comment_status($commentId),
            'content' => $c->comment_content,
            'comment_gmt' => $c->comment_date_gmt,
            'comment_url' => get_comment_link($c)
          );
          $comments[] = $comment;
        }
        $comments = array_reverse($comments);
        $env = array("comment_msg_id" => $comment_msg_id, "comments" => $comments);
        return $env;
    }
}

?>

<?php
/**
 * Everything comment related
 *
 * @package Livepress
 */

require_once 'livepress-config.php';
require_once 'livepress-javascript-config.php';
require_once 'livepress-communication.php';
require_once 'lp-wp-utils.php';

class lp_comment {
    public static $comments_template_path;
    public static $comments_template_tag = array(
        'start' => '<div id="post_comments_livepress">',
        'end'   => '</div>',
    );

    private $overridden_comments_count;

    private static $special_comments_template_file = "special_comments.php";

    private static $ajax_response_codes = array(
        'error'         => 404,
        'closed'        => 403,
        'pending'       => 202,
        'not_allowed'   => 401,
        'missing_fields'    => 400,
        'approved'      => 200,
        'spam'          => 405,
        'unapproved'    => 406,
        'flood'         => 407,
        'duplicate'     => 409,
    );

    // Global LP configuration options
    private $options;
    private $lp_com;

    function __construct($options) {
        $this->options = $options;
        $this->lp_com = new livepress_communication($this->options['api_key']);
    }

    /**
     * Attachs comment related code to WP actions and filters
     *
     * @param boolean $is_ajax_lp_comment_request
     */
    public function do_wp_binds($is_ajax_lp_comment_request) {
        // Send to livepress for diff everytime something changes in the comments list.
        add_action('comment_post', array(&$this, 'send_to_livepress_new_comment'));

        // TODO: fix those operations with comments
        // add_action('edit_comment', array(&$this, 'send_to_livepress_new_comment'));
        // add_action('delete_comment', array(&$this, 'send_to_livepress_new_comment'));
        // add_action('wp_set_comment_status', array(&$this, 'send_to_livepress_new_comment'));
        //add_action('comment_unapproved_to_approve', array(&$this, 'send_comment_if_approved'));
        add_action( 'transition_comment_status', array( &$this, 'send_comment_if_approved' ), 10, 3 );
        //add_action('wp_set_comment_status', array(&$this, 'send_comment_if_approved'));

        add_action('wp_ajax_post_comment',        array(&$this, 'post_comment'));
        add_action('wp_ajax_nopriv_post_comment', array(&$this, 'post_comment'));

        if ($is_ajax_lp_comment_request) {
            add_action('comment_duplicate_trigger', array(&$this, 'received_a_duplicate_comment'));
            add_action('comment_flood_trigger',     array(&$this, 'received_a_flood_comment'));
        } else {
            add_filter('comments_template', array(&$this, 'enclose_comments_in_div'));
        }
    }

    /**
     * Add comments needed by JS on frontend
     *
     * @param LivepressJavascriptConfig $ljsc
     * @param Post    $post                 current post
     * @param integer $page_active          the page of the pagination
     * @param integer $comments_per_page
     */
    public function js_config($ljsc, $post, $page_active, $comments_per_page) {
        $config = livepress_config::get_instance();

        if (isset($post->comment_count)) {
            $ljsc->new_value('comment_count', $post->comment_count, ConfigurationItem::$LITERAL);
        } else {
            $ljsc->new_value('comment_count', 0, ConfigurationItem::$LITERAL);
        }

        $pagination_on = ($config->get_host_option("page_comments") == "1");
        $ljsc->new_value('comment_pagination_is_on', $pagination_on, ConfigurationItem::$BOOLEAN);
        $ljsc->new_value('comment_page_number', $page_active, ConfigurationItem::$LITERAL);
        $ljsc->new_value('comment_pages_count', $comments_per_page, ConfigurationItem::$LITERAL);

        $comment_order = $config->get_host_option('comment_order');
        $ljsc->new_value('comment_order', $comment_order, ConfigurationItem::$STRING);

        $ljsc->new_value('disable_comments',
                $this->options['disable_comments'], ConfigurationItem::$BOOLEAN);
        $ljsc->new_value('comment_live_updates_default',
                $this->options['comment_live_updates_default'], ConfigurationItem::$BOOLEAN);

        if ( isset( $post->ID ) && $post->ID ) {
            $comment_msg_id = lp_wp_utils::get_from_post($post->ID, "comment_update", true);
            $ljsc->new_value('comment_msg_id', $comment_msg_id);
            $ljsc->new_value('can_edit_comments', current_user_can('edit_post', $post->ID),
                            ConfigurationItem::$BOOLEAN); // FIXME: global function
        }
    }

    // ============== Those methods are only public to be called from WP actions and filters

    /**
     * Change the comments template path to a special one from the plugin to enclose
     * the original one in HTML tags
     *
     * @param   string  Original comments template path
     *
     * @return  string  Special comments template path. See description.
     */
    public function enclose_comments_in_div($comments_template_path) {
        self::$comments_template_path = $comments_template_path;
        return dirname(__FILE__).'/'.self::$special_comments_template_file;
    }

    /**
     * Send to the livepress webservice a new message with the comment updates
     * if it was approved. This method will be called anytime a comment suffer
     * a status transition
     */
    public function send_comment_if_approved($new_status, $old_status, $comment) {
        if ($new_status == 'approved') {
            $this->send_to_livepress_new_comment($comment, $new_status);
        }
    }

    /**
     * Send to the livepress webservice a new message with the comment updates
     */
    public function send_to_livepress_new_comment($comment_id, $comment_status = '') {
        if (is_int($comment_id)) {
            $comment = get_comment($comment_id); // FIXME: global function
        } else {
            $comment = $comment_id;
            $comment_id = $comment->comment_ID;
        }
        if (!$comment_status) {
            $comment_status = wp_get_comment_status($comment_id); // FIXME: global function
        }

        $post = get_post($comment->comment_post_ID); // FIXME: global function

        $params = array(
            'content'     => $comment->comment_content,
            'comment_id'  => $comment_id,
            'comment_url' => get_comment_link($comment), // FIXME: global function
            'comment_gmt' => $comment->comment_date_gmt . "Z",
            'post_id'     => $comment->comment_post_ID,
            'post_title'  => $post->post_title,
            'post_link'   => get_permalink($post->ID), // FIXME: global function
            'author'      => $comment->comment_author,
            'author_url'  => $comment->comment_author_url,
            'avatar_url'  => get_avatar($comment->comment_author_email, 30), // FIXME: global function
        );
        if ($comment_status != 'approved') {
            try {
                $params = array_merge($params, array(
                    'status'       => $comment_status,
                    'author_email' => $comment->comment_author_email,
                ));

                $this->lp_com->send_to_livepress_new_created_comment($params);
            } catch (livepress_communication_exception $e) {
                $e->log("new comment");
            }
        } else {
            $old_uuid = lp_wp_utils::get_from_post($comment->comment_post_ID, "comment_update", TRUE);
            $new_uuid = $this->lp_com->new_uuid();
            lp_wp_utils::save_on_post($comment->comment_post_ID, "comment_update", $new_uuid);

            // Used to fake if the user is logged or not
            global $user_ID; // FIXME: global function
            $global_user_ID = $user_ID;
            $user_ID = NULL;
            if (current_user_can( 'edit_post', $post->ID )) { // FIXME: global function
                wp_set_current_user(NULL); // FIXME: global function
            }

            $comment_template_non_logged = $this->get_comment_list_templated($comment);
            $added_comment_template_non_logged = $this->get_comment_templated($comment, $post);
            $updated_counter_only_template = $this->get_comments_counter_templated($comment_id, $post);

            global $wp_query; // FIXME: global function
            $wp_query->rewind_comments();
            // current_user_can( 'edit_post', $post->ID ) should be TRUE
            $user_ID = $post->post_author;
            if (!current_user_can( 'edit_post', $post->ID )) { // FIXME: global function
                wp_set_current_user($post->post_author); // FIXME: global function
            }

            $comment_template = $this->get_comment_list_templated($comment);
            $added_comment_template = $this->get_comment_templated($comment, $post);
            $updated_counter_only_template_logged = $this->get_comments_counter_templated($comment_id, $post);

            try {
                $params = array_merge($params, array(
                    'post_author'    => get_the_author_meta("login", $post->post_author), // FIXME: global function
                    'old_template'   => $comment_template_non_logged['old'],
                    'new_template'   => $comment_template_non_logged['new'],
                    'comment_parent' => $comment->comment_parent,
                    'comment_html'   => $added_comment_template_non_logged,
                    'ajax_nonce'     => $this->options['ajax_nonce'],
                    'previous_uuid'  => $old_uuid,
                    'uuid'           => $new_uuid,
                    'old_template_logged' => $comment_template['old'],
                    'new_template_logged' => $comment_template['new'],
                    'comments_counter_only'        => $updated_counter_only_template,
                    'comments_counter_only_logged' => $updated_counter_only_template_logged,
                    'comment_html_logged'          => $added_comment_template,
                ));
                $this->lp_com->send_to_livepress_approved_comment($params);
            } catch (livepress_communication_exception $e) {
                $e->log("approved comment");
            }

            $user_ID = $global_user_ID; // Restore changed global $user_ID
        }
    }

    /**
     * Retrieves template of a single comment.
     *
     * @param WP_Comment $comment
     * @param WP_Post $post
     * @return String added comment template
     */
    private function get_comment_templated($comment, $post) {
        $curr_comment = $comment;
        $comments = livepress_post::all_approved_comments($comment->comment_post_ID);

        // get template of added comment only
        $selected = array($comment);
        while ($parent = $this->retrieve_parent_comment($curr_comment->comment_parent, $comments)) {
            $selected[] = $parent;
            $curr_comment = $parent;
        }

        $selected = array_reverse($selected);
        $view = $this->get_comments_list_template($selected, $post);
        $comment_node = $this->extract_comment_by_element_id($view, "comment-" . $comment->comment_ID);

        return $comment_node;
    }

    private function retrieve_parent_comment($parent_id, $comments) {
        foreach ($comments as $c) {
            if ($c->comment_ID == $parent_id) {
                return $c;
            }
        }
    }

    /**
     * Retrives html of comments count
     *
     * @param int     $comment_id
     * @param WP_Post $post
     * @return String updated counter html with amount of comments for given post
     */
    private function get_comments_counter_templated($comment_id, $post) {
        $comments = livepress_post::all_approved_comments(get_comment($comment_id)->comment_post_ID);

        // we want to pass this result to the diff server and get only counter update as a result
        // remove parsed comment from comments table
        for ($i = 0 ; $i < count($comments) ; $i++) {
            if ($comments[$i]->comment_ID == $comment_id) {
                unset($comments[$i]);
            }
        }
        $comments_with_updated_counter = $this->get_comments_list_template($comments, $post, count($comments) + 1);
        return $comments_with_updated_counter;
    }

    /**
     * Returns comment element node html
     *
     * @param String $view Html containing comments
     * @param String $element_id Id of comment
     * @return String html of comment
     */
    private function getElementById($dom, $id) {
        $xpath = new DOMXPath($dom);
        return $xpath->query("//*[@id='$id']")->item(0);
    }

    private function extract_comment_by_element_id($view, $element_id) {
        $dom = new DOMDocument('1.0', 'UTF-8');
        $dom->validateOnParse = true;
        $dom->formatOutput = true;
        @$parse_success = $dom->loadHTML('<?xml encoding="UTF-8"?>' . $view);

        if (!$parse_success) {
            // fix for encoding detection bug, as "UTF-8" passed to constructor is not enough. *sigh*.
            @$parse_success = $dom->loadHTML('<?xml encoding="UTF-8"?>' . $view);
        }

        $response = new DOMDocument('1.0', 'UTF-8');
        $response->formatOutput = true;
        $search = $this->getElementById($dom, $element_id);
        $searched = $search->parentNode;

        $imported = $response->importNode($searched, true);
        $response->appendChild($imported);

        return $response->saveHTML();
    }

    /**
     * Retrieves the comment template with and without $commen_id
     *
     * @param   WP_Comment $comment         The comment to be parsed.
     * @return  array   'new' => has the comment template with the $comment_id
     *                  'old' => comment template without it
     */
    private function get_comment_list_templated($local_comment) {
        // $comments - Fake comment list generation on old comments template
        global $post, $comments; // FIXME: global function

        $comments = livepress_post::all_approved_comments($local_comment->comment_post_ID);

        // When comment by XMLRPC the $post is empty, so get from the comment.
        if (!isset($post)) {
            $post = get_post($local_comment->comment_post_ID); // FIXME: global function
        }

        if ($local_comment->comment_approved == "0") {
            array_push($comments, $local_comment);
        }
        $comment_full_out = $this->get_comments_list_template($comments, $post);

        // remove parsed comment from comments table
        for ($i = 0 ; $i < count($comments) ; $i++) {
            if ($comments[$i]->comment_ID == $local_comment->comment_ID) {
                unset($comments[$i]);
            }
        }
        $comment_partial_out = $this->get_comments_list_template($comments, $post);

        return array('old' => $comment_partial_out, 'new' => $comment_full_out);
    }

    private function get_comments_list_template($comments, $post, $comments_count = null) {
        global $wp_query; // FIXME: global function
        // we store unmodified wp_query as the same object is used again later
        $original = clone $wp_query;

        // Fakes have_comments() that uses $wp_query->current_comment + 1 < $wp_query->comment_count
        if (!$comments_count) {
            $comments_count = count($comments);
        }

        if ($comments_count == 0) {
            $wp_query->current_comment = $comments_count;
        }
        $wp_query->comment_count = $comments_count;
        // Fakes comments_number()
        $post->comment_count = $comments_count;
        $this->add_overridden_comments_count_filter($comments_count);
        // Fakes wp_list_comments()
        $wp_query->comments = $comments;

        // Fakes $comments_by_type
        $wp_query->comments_by_type = &separate_comments($comments); // FIXME: global function
        $comments_by_type = &$wp_query->comments_by_type;
        // Hack for bad-written themes, which rely on globals instead of functions
        $GLOBALS["comments"] = &$comments;
        $GLOBALS["comment_count"] = &$comments_count;
        // Prints the template buffered
        ob_start();
        include(TEMPLATEPATH.'/comments.php'); // FIXME: global function
        $comments_template = ob_get_clean();
        unset($GLOBALS["comments"]); // FIXME: global function
        unset($GLOBALS["comment_count"]); // FIXME: global function
        remove_filter("get_comments_number", "overload_comments_number"); // FIXME: global function
        $wp_query = clone $original;
        return $comments_template;
    }

    private function add_overridden_comments_count_filter($count) {
        $this->overridden_comments_count = $count;
        add_filter("get_comments_number", array(&$this, "overload_comments_number")); // FIXME: global function
    }

    public function overload_comments_number($number) {
        $count = $this->overridden_comments_count;
        return $count;
    }

    /**
     * Receives an ajax request to post a comment, returns comment's state
     * Uses a lot of GLOBAL variables and functions
     */
    public function post_comment() {
        global $wpdb, $post;
        $comment_post_ID = (int) $_POST['comment_post_ID'];

        $status = $wpdb->get_row( $wpdb->prepare("SELECT post_status, comment_status FROM $wpdb->posts WHERE ID = %d",$comment_post_ID) );

        $post = get_post($comment_post_ID);

        if ( empty($status->comment_status) ) {
            do_action('comment_id_not_found', $comment_post_ID);
            $this->die_post_status_to_json('error');
        } elseif ( !comments_open($comment_post_ID) ) {
            do_action('comment_closed', $comment_post_ID);
            $this->die_post_status_to_json('closed');
        } elseif ( in_array($status->post_status, array('draft', 'pending') ) ) {
            $this->die_post_status_to_json('pending');
        }

        $comment_author       = ( isset($_POST['author']) )  ? trim(strip_tags($_POST['author'])) : null;
        $comment_author_email = ( isset($_POST['email']) )   ? trim($_POST['email']) : null;
        $comment_author_url   = ( isset($_POST['url']) )     ? trim($_POST['url']) : null;
        $comment_content      = ( isset($_POST['comment']) ) ? trim($_POST['comment']) : null;

        // If the user is logged in
        $user = wp_get_current_user();
        if ( $user->ID ) {
            if ( empty( $user->display_name ) )
                        $user->display_name   = $user->user_login;
            $comment_author       = esc_sql($user->display_name);
            $comment_author_email = esc_sql($user->user_email);
            $comment_author_url   = esc_sql($user->user_url);
            if ( current_user_can('unfiltered_html') ) {
                if ( wp_create_nonce('unfiltered-html-comment_' . $comment_post_ID) != $_POST['_wp_unfiltered_html_comment'] ) {
                    kses_remove_filters(); // start with a clean slate
                    kses_init_filters(); // set up the filters
                }
            }
        } else {
        if ( get_option('comment_registration') )
            $this->die_post_status_to_json('not_allowed');
        }

        $comment_type = '';

        if ( get_option('require_name_email') && !$user->ID ) {
            if ( 6 > strlen($comment_author_email) || '' == $comment_author )
                $this->die_post_status_to_json('missing_fields');
            elseif ( !is_email($comment_author_email))
                $this->die_post_status_to_json('missing_fields');
        }

        if ( '' == $comment_content )
            $this->die_post_status_to_json('missing_fields');

        $comment_parent = isset($_POST['comment_parent']) ? absint($_POST['comment_parent']) : 0;

        $commentdata = compact('comment_post_ID', 'comment_author', 'comment_author_email',
            'comment_author_url', 'comment_content', 'comment_type', 'comment_parent', 'user_ID');

        if (version_compare(get_bloginfo('version'), "3.0", "<")) {
            if ($this->is_duplicate_comment($commentdata)) {
                $this->received_a_duplicate_comment();
            }
        }

        $comment_id = wp_new_comment( $commentdata );

        $comment = get_comment($comment_id);
        if ( !$user->ID ) {
            setcookie('comment_author_' . COOKIEHASH, $comment->comment_author, time() + 30000000, COOKIEPATH, COOKIE_DOMAIN);
            setcookie('comment_author_email_' . COOKIEHASH, $comment->comment_author_email, time() + 30000000, COOKIEPATH, COOKIE_DOMAIN);
            setcookie('comment_author_url_' . COOKIEHASH, esc_url($comment->comment_author_url), time() + 30000000, COOKIEPATH, COOKIE_DOMAIN);
        }

        $this->die_post_status_to_json(wp_get_comment_status( $comment_id ));
    }

    /**
   * Check if the comment is a duplicate
   *
   * @uses $wpdb
   * @param array $commentdata Contains information on the comment
   * @return boolean Whether the comment is a duplicate or not
   */
    private function is_duplicate_comment($commentdata) {
        global $wpdb;
        extract($commentdata, EXTR_SKIP);

        // Simple duplicate check
        // expected_slashed ($comment_post_ID, $comment_author, $comment_author_email, $comment_content)
        $dupe = "SELECT comment_ID FROM $wpdb->comments WHERE comment_post_ID = '$comment_post_ID' AND comment_approved != 'trash' AND ( comment_author = '$comment_author' ";
        if ($comment_author_email) {
            $dupe .= "OR comment_author_email = '$comment_author_email' ";
        }
        $dupe .= ") AND comment_content = '$comment_content' LIMIT 1";
        return $wpdb->get_var($dupe);
    }

    /**
     * Comment marked as flood, gives an appropriate response if is an ajax request.
     */
    public function received_a_flood_comment() {
        $this->die_post_status_to_json('flood');
    }

    /**
     * Comment marked as duplicate, gives an appropriate response if is an ajax request.
     */
    public function received_a_duplicate_comment() {
        $this->die_post_status_to_json('duplicate');
    }

    /**
     * Dies with translated post status to JSON. Needs PHP 5.2 >=
     *
     * @param   string  $status A comment post status
     * @uses json_encode
     */
    private function die_post_status_to_json($status) {
        // Default code
        $code = 999;
        foreach (self::$ajax_response_codes as $status_name => $status_code) {
            if ($status == $status_name) {
                $code = $status_code;
            }
        }

        header("HTTP/1.0 200 OK");
        die(json_encode( array('msg'  => $status, 'code' => $code) ));
    }
}
?>

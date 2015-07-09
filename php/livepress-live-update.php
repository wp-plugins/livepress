<?php
require_once ( LP_PLUGIN_PATH . 'php/livepress-config.php' );

/**
 * A piece of post content
 *
 * @author fgiusti
 */
class LivePress_Live_Update {
	/** Tag used to mark the metainfo inside a live update */
	private static $metainfo_tag = 'div';
	/** Class of the tag used  to mark the metainfo inside a live update */
	private static $metainfo_class = 'livepress-meta';

	/**
	 * Instance.
	 *
	 * @static
	 * @access private
	 * @var null
	 */
	private static $instance = null;

	/**
	 * Instance.
	 *
	 * @static
	 * @return LivePress_Live_Update
	 */
	public static function instance() {
		if ( self::$instance == null ) {
			self::$instance = new LivePress_Live_Update();
		}
		return self::$instance;
	}

	/**
	 * Constructor.
	 *
	 * @access private
	 */
	private function __construct() {
		$this->options = get_option( LivePress_Administration::$options_name, array() );
		global $current_user;
		$this->user_options = get_user_option( LivePress_Administration::$options_name, $current_user->ID, false );

		add_shortcode( 'livepress_metainfo', array( $this, 'shortcode' ) );
		if ( is_admin() ) {
			// setup WYSIWYG editor
			$this->add_editor_button();
		}
	}

	/**
	 * Add Editor button.
	 *
	 * @access private
	 */
	private function add_editor_button() {
		// Don't bother doing this stuff if the current user lacks permissions
		if ( ! current_user_can( 'edit_posts' ) && ! current_user_can( 'edit_pages' ) ) {
			return; }

		// Add only in Rich Editor mode
		if ( get_user_option( 'rich_editing' ) == 'true' ) {
			add_filter( 'teeny_mce_buttons', array( $this, 'register_tinymce_button' ) );
			add_filter( 'mce_buttons', array( $this, 'register_tinymce_button' ) );
		}
	}

	/**
	 * Register TinyMCE buttons.
	 *
	 * @param array $buttons Buttons array.
	 * @return mixed
	 */
	public function register_tinymce_button( $buttons ) {
		array_push( $buttons, 'separator', 'livepress' );
		return $buttons;
	}

	/**
	 * LivePress metainfo shortcode callback.
	 *
	 * @param array $atts Shortcode attributes.
	 * @return string Shortcode contents.
	 */

	public function shortcode( $atts,  $content = null  ) {
		// Extract the attributes
		$atts = shortcode_atts( array(
			'authors'       => '',
			'author'        => '',
			'time'          => '',
			'avatar_url'    => null,
			'has_avatar'    => false,
			'timestamp'     => '',
			'update_header' => '',
			'avatar_block'  => ''
		), $atts );

		$authors        = esc_attr( $atts['authors'] . $atts['author'] );
		$time           = esc_attr( $atts['time'] );
		$avatar_url     = esc_url( $atts['avatar_url'] );
		$has_avatar     = ( true == $atts['has_avatar'] )?true:false;
		$timestamp      = esc_attr( $atts['timestamp'] );
		$update_header  = esc_attr( $atts['update_header'] );
		$avatar_block   = ( 'shown' == $atts['avatar_block'] )?true:false;

		$options  = $this->options;

		$template_elements = '';
		if ( array_key_exists( 'show', $options ) && null !== $options['show'] ){
			foreach ( $options['show'] as $show ){
				// "###AVATAR### ###AUTHOR###  ###TIME### 	###HEADER### ###TAGS###";
				if ( 'TAGS' !== $show ){
					$template_elements .= ' ###' . $show . '###';
				}
			}
		}else {
			$template_elements = '###AVATAR### ###AUTHOR###  ###TIME### ###HEADER###';
		}

		/**
		 * Filter Allows you to change the order of the elements and add to the meta info html.
		 *
		 * @since 1.3
		 *
		 * @param string  $order_template a set of ###replace### target.
		 *
		 */
		$metainfo = apply_filters( 'livepress_meta_info_template_order',$template_elements );

		$avatar = '';
		if ( $has_avatar || $avatar_url ) {
			if ( null == $avatar_url ) {
				$avatar = self::get_avatar_img_tag( $this->user_options['avatar_display'] );
			} else {
				$avatar = self::avatar_img_tag( $avatar_url );
			}
		}
		/**
		 * Filter Allows modification of the author avatar in livepress posts.
		 *
		 * @since 1.3
		 *
		 * @param string $avatar_html the HTML created to display an avatar.
		 * @param string $avatar_url  Url of the avatar to show.
		 * @param bool   $has_avatar  does this user have a local avatar.
		 *
		 */
		$metainfo = str_replace( '###AVATAR###', apply_filters( 'livepress_meta_info_template_author', $avatar, $avatar_url, $has_avatar ), $metainfo );

		$settings      = get_option( 'livepress' );

		$update_format = 'default';
		if ( isset( $settings['update_format'] ) ){
			$update_format = $settings['update_format'];
		}

		$author_info = '';
		if ( ! $avatar_block ) {
			if ( $authors ) {
				$author_info .= $this->format_author( $authors ) . ' ';
				if ( $time ) {
					$author_info .= ' <strong>|</strong> ';
				}
			}
		}
		/**
		 * Filter Allows modification of the author avatar in livepress posts.
		 *
		 * @since 1.3
		 *
		 * @param string $author_info the HTML created to display an avatar.
		 * @param string $author  Name of Author.
		 *
		 */
		$metainfo = str_replace( '###AUTHOR###', apply_filters( 'livepress_meta_info_template_author', $author_info, $authors ), $metainfo );

		/**
		 * Filter Allows you to change date format use in a livepress post meta.
		 *
		 * @since 1.2
		 *
		 * @param string $date_foramt_the date format in use
		 *
		 */
		$timestring = date( apply_filters( 'livepress_timestamp_time_format', 'g:i A' ), strtotime( $atts['timestamp'] ) + ( get_option( 'gmt_offset' ) * 3600 ) );

		$time_info  = '';
		if ( $time ) {

			if ( isset( $options['timestamp_format'] ) && 'timeof' === $options['timestamp_format'] ) {

				$time_info .= '<span class="livepress-update-header-timestamp">';
				$time_info .= str_replace( '###TIME###', $timestring, self::timestamp_html_template() ).' ';
				$time_info  = str_replace( '###TIMESTAMP###', $timestamp, $time_info );
				$time_info .= '</span>';
			} else {

				$time_info .= '<span class="livepress-update-header-timestamp">';
				$time_info .= str_replace( '###TIME###', $time, self::timestamp_html_template() ).' ';
				$time_info  = str_replace( '###TIMESTAMP###', $timestamp, $time_info );
				$time_info .= '</span>';
			}
		}

		/**
		 * Filter Allows you to change the order of the elements and add to teh meta info html.
		 *
		 * @since 1.3
		 *
		 * @param string $time_info the HTML created to display an avatar.
		 * @param string $timestring  timestring pass to date.
		 *
		 */
		$metainfo = str_replace( '###TIME###', apply_filters( 'livepress_meta_info_template_time', $time_info, $timestring ), $metainfo );

		$header = '';
		if ( $update_header ) {
			$metainfo = str_replace( 'livepress-update-header-timestamp', 'livepress-update-header-timestamp livepress-title-shown', $metainfo );
			$metainfo .= '<span class="livepress-update-header">' . wptexturize( urldecode( $update_header ) ) . '</span> ';
		}

		/**
		 * Filter Allows you to change the order of the elements and add to teh meta info html.
		 *
		 * @since 1.3
		 *
		 * @param string $header the HTML created to display an avatar.
		 * @param string $update_header  header content.
		 *
		 */
		$metainfo = str_replace( '###HEADER###', apply_filters( 'livepress_meta_info_template_header', $header, $update_header ), $metainfo );

		if ( $metainfo ) {
			/**
			 * Filter Allows you to adjust the class's on the livepress post content.
			 *
			 * @since 1.3
			 *
			 * @param array $metainfo_class class's for wraper.
			 * @param string $update_header  header content.
			 *
			 */
			$div_class = apply_filters( 'livepress_meta_info_template_header', array( self::$metainfo_class ) );
			if ( null != $content ){
				$metainfo = $metainfo . PHP_EOL . $content . PHP_EOL ;
			}

			$metainfo = '<'. self::$metainfo_tag .' class="'. implode( ', ', $div_class ) .'">'
				. $metainfo
				. '</'. self::$metainfo_tag .'>';
		}

		return $metainfo . PHP_EOL;
	}



	/**
	 * Add user options to shortcode.
	 *
	 * @param string $content Post content.
	 */
	public function fill_livepress_shortcodes( $content ) {

		global $post;
		$is_live = isset( $post ) ? LivePress_Updater::instance()->blogging_tools->get_post_live_status( $post->ID ) : false;
		if( ! $is_live ){
			return $content;
		}

		$options       = $this->options;

		$new_shortcode = PHP_EOL . PHP_EOL . '[livepress_metainfo';
		// do we have a short code

		$has_shortcode = ( false === strpos( $content, '[livepress_metainfo' ) ) ? false : true;

		preg_match( '/\[livepress_metainfo show_timestmp=.?"(.).?".*\]/s', $content, $show_timestmp );

		if ( ! empty( $show_timestmp[1] ) || ! $has_shortcode ) {
			$current_time_attr = ' time="'. $this->format_timestamp( current_time( 'timestamp' ) ) .'" ';

			if ( $options['timestamp'] ) {
				$new_shortcode   .= ' show_timestmp="1" ';
				if ( isset(  $this->custom_timestamp  ) ){
					$custom_timestamp = strtotime( $this->custom_timestamp );
					$new_shortcode   .= ' time="'. $this->format_timestamp( $custom_timestamp ) .'"';
					$new_shortcode   .= ' timestamp="'. date( 'c', $custom_timestamp ) .'"';
				} else {
					$new_shortcode   .= $current_time_attr;
					$new_shortcode   .= ' timestamp="'. date( 'c', current_time( 'timestamp', 1 ) ) .'"';
				}
			}
		}

		preg_match( '/\[livepress_metainfo.*authors=.?"(.*).?".?\]/', $content, $author_block );

		if ( empty($author_block) || 0 == strlen( $author_block[1] ) ) {
			$current_authors     = isset( $_POST['authors'] ) ? $_POST['authors'] : array();
			$custom_author_names = '';
			$separator           = '';
			foreach ( $current_authors as $author ) {
				$custom_author_names .= $separator . $author['text'];
				$separator = ' - ';
			}
		}else {
			$custom_author_names = $author_block[1];
		}

		$custom_names =  explode('\"',$custom_author_names); // remove any trailing \"
		if ( '' !== trim( $custom_names[0] ) ) {
			$authorname = $custom_names[0];
		} else {
			$authorname = self::get_author_display_name( $options );
		}

		if ( $authorname ) {
			$new_shortcode .= ' authors="' . $authorname . '"';
		}

		// look to see if we have an avatar and hide the author name if we have
		preg_match( '/\[livepress_metainfo.*avatar_block=.?"shown.?".*\]/', $content, $avatar_block );
		if ( ! empty( $avatar_block ) ) {
			$new_shortcode .= ' avatar_block="shown" ';
		}

		if ( $options['include_avatar'] ) {
			$new_shortcode .= ' has_avatar="1"';
			if ( isset($this->custom_avatar_url) ) {
				$new_shortcode .= ' avatar_url="'.$this->custom_avatar_url.'"';
			}
		}

		// Pass the update header thru to processed shortcode
		preg_match( '/.*update_header=.?"(.*).?".?\]/', $content, $update_header );

		if ( isset( $update_header[1] ) && 'undefined' !== $update_header[1] ) {
			$new_shortcode .= ' update_header="' . $update_header[1] . '"';
		}

		$new_shortcode .= ']' . PHP_EOL . PHP_EOL;

		// Replace empty livepress_metainfo with calculated one
		$content = preg_replace( '/\[livepress_metainfo[^\]]*]/', $new_shortcode,  $content . PHP_EOL );

		//unload the filter so it does run again
		remove_filter( 'content_save_pre', array( $this, 'fill_livepress_shortcodes' ), 5 );

		// Replace POSTTIME inside livepress_metainfo with current time
		if ( ! empty( $show_timestmp[1] ) ) {
			$content = preg_replace( '/(\[livepress_metainfo[^\]]*)POSTTIME([^\]]*\])/s', '$1'.$current_time_attr.'$2', $content );
		}

		return $content;
	}

	/**
	 * Set a custom author name to be used instead of the current author name.
	 *
	 * @param string $name The custom author name.
	 */
	public function use_custom_author_name( $name ) {
		$this->custom_author_name = $name;
	}

	/**
	 * Set a custom timestamp to be used instead of the current time.
	 *
	 * @param string $time Timestamp.
	 */
	public function use_custom_timestamp( $time ) {
		$this->custom_timestamp = $time;
	}

	/**
	 * Set a custom avatar url to be used instead of selected one.
	 *
	 * @param string $avatar_url Avatar URL.
	 */
	public function use_custom_avatar_url( $avatar_url ) {
		$this->custom_avatar_url = $avatar_url;
	}

	/**
	 * Return the formatted HTML for the author of the livepress update.
	 *
	 * @access private
	 *
	 * @param string $author The author display name.
	 * @return string HTML formatted author.
	 */
	private function format_author( $author ) {
		$config = LivePress_Config::get_instance();
		return str_replace( '###AUTHOR###', $author, $config->get_option( 'author_template' ) );
	}

	/**
	 * The HTML image tag for the avatar from WP or Twitter based on user configuration.
	 *
	 * @static
	 *
	 * @param string $from The source of the avatar, can be "twitter" or "native".
	 * @return string HTML image tag.
	 */
	public static function get_avatar_img_tag( $from ) {
		if( null === $from ){
			return;
		}

		global $user;
		$avatar_img_tag = get_avatar( $user->ID, 30 );
		if ( $from === 'twitter' && LivePress_Administration::twitter_avatar_url() ) {
			$avatar_img_tag = self::avatar_img_tag( LivePress_Administration::twitter_avatar_url() );
		}
		return $avatar_img_tag;
	}

	/**
	 * Avatar <img> tag.
	 *
	 * @static
	 *
	 * @param string $url Image source URL.
	 * @return string HTML img tag.
	 */
	public static function avatar_img_tag( $url ) {
		return "<img src='" . esc_url( $url ) ."' class='avatar avatar-30 photo avatar-default' height='30' width='30' />";
	}

	/**
	 * The author name choosen by the user to be displayed
	 *
	 * @static
	 *
	 * @param array $options author_display should be "custom" or "native". If "custom",
	 *                       author_display_custom_name should contain the name.
	 * @return string The name to be displayed or FALSE if something goes wrong.
	 */
	public static function get_author_display_name( $options ) {
		$author = false;
		if ( $options['author_display'] == 'custom' ) {
			$author = $options['author_display_custom_name'];
		} else {
			// TODO: decouple
			$user = wp_get_current_user();
			if ( $user->ID ) {
				if ( empty( $user->display_name ) ) {
					$author = $user->user_login;
				} else {
					$author = $user->display_name;
				}
			}
		}
		return $author;
	}

	/**
	 * Return the HTML for the timestamp.
	 *
	 * @access private
	 *
	 * @param int $timestamp Unix timestamp that defaults to current local time, if not given.
	 *
	 * @return string HTML formatted timestamp.
	 */
	private function format_timestamp( $timestamp = null ) {
		$config = LivePress_Config::get_instance();
		return date( $config->get_option( 'timestamp_template' ), $timestamp );
	}

	/**
	 * The user defined or default HTML template for the post timestamp.
	 *
	 * @static
	 *
	 * @return string HTML for the timestamp with ###TIME### where should go the formatted time.
	 */
	public static function timestamp_html_template() {
		$config = LivePress_Config::get_instance();
		return $config->get_option( 'timestamp_html_template' );
	}

	/**
	 * The timestamp template.
	 *
	 * @static
	 *
	 * @return string Timestamp to be formatted as PHP date() function.
	 */
	public static function timestamp_template() {
		$config = LivePress_Config::get_instance();
		return $config->get_option( 'timestamp_template' );
	}

	/**
	 * The author template.
	 *
	 * @static
	 *
	 * @return string Author template.
	 */
	public static function author_template() {
		$config = LivePress_Config::get_instance();
		return $config->get_option( 'author_template' );
	}
}

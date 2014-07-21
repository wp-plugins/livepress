<?php
class Configuration_Item {
	// Types
	public static $STRING   = 1;
	public static $LITERAL  = 2;
	public static $BOOLEAN  = 4;
	public static $BLOCK    = 8;
	public static $ENDBLOCK = 16;
	public static $ARRAY    = 32;

	/**
	 * Constructor.
	 *
	 * @param $name
	 * @param $value
	 * @param $type
	 */
	function __construct( $name, $value, $type ) {
		$this->name  = $name;
		$this->value = $value;
		$this->type  = $type;
	}

	/**
	 * Render a configuration item.
	 *
	 * @param $options
	 * @return string
	 */
	function render($options) {
		$value     = $this->value;
		$separator = ",";

		if (array_key_exists('disable_comma', $options)) {
			$separator = "";
		}

		switch ($this->type) {
			case self::$STRING:
				$value   = esc_js($value);
				$element = "{$this->name}: '$value'";
				break;

			case self::$LITERAL:
				$element = "{$this->name}: $value";
				break;

			case self::$BOOLEAN:
				if ($value) {
					$element = "{$this->name}: true";
				} else {
					$element = "{$this->name}: false";
				}
				break;

			case self::$BLOCK:
				$element = "{$this->name}: {";
				break;

			case self::$ENDBLOCK:
				$element = "}";
				break;

			case self::$ARRAY:
				$element = $this->name.': [';
				$first   = TRUE;
				foreach($value as $v) {
					$element .= $first ? '' : ',';
					$element .= "'".esc_js($v)."'";
					$first    = FALSE;
				}
				$element .= ']';
				break;

			default:
				$element = '';
		}

		if ($this->type != self::$BLOCK) {
			$element .= $separator;
		}

		return $element;
	}

}

class LivePress_JavaScript_Config {
	/**
	 * Constructor.
	 */
	function __construct() {
		$this->values = array();
		$this->buffer = array();
	}

	/**
	 * Add new configuration value.
	 *
	 * @param      $name
	 * @param      $value
	 * @param null $type
	 */
	function new_value($name, $value, $type = NULL ) {
		if ($type == NULL) {
			$type = Configuration_Item::$STRING;
		}
		$this->values[] = new Configuration_Item($name, $value, $type);
	}

	/**
	 * Flush.
	 */
	function flush() {
		$this->pre_header();
		$this->content();
		$this->pos_header();
		echo join( $this->buffer, "\n" );
	}

	/**
	 * LivePress.config content.
	 */
	private function content() {
		$this->buffer[] = "Livepress.Config = {";
		$values_size    = count($this->values);

		for ($i=0; $i < $values_size; $i++) {
			$options = array();

			// The last item of a JS object shouldn't have a comma to work on IE
			if ($i+1 == $values_size ) {
				$options = array( 'disable_comma' => true );
			}
			// The last item of a JS object shouldn't have a comma to work on IE
			if (isset($this->values[$i+1])) {
				$next = $this->values[$i+1];
				if ($next->type == Configuration_Item::$ENDBLOCK) {
					$options = array( 'disable_comma' => true );
				}
			}

			$value = $this->values[$i];
			$this->buffer[] = $value->render($options);
		}
		$this->buffer[] = "}";
	}

	/**
	 * Pre-Header output.
	 */
	private function pre_header() {
		$this->buffer[] = '<script type="text/javascript">';
		$this->buffer[] = 'if (typeof(Livepress) === "undefined") {';
		$this->buffer[] = '    Livepress = {};';
		$this->buffer[] = '}';
	}

	/**
	 * Post-Header output.
	 */
	private function pos_header() {
		$this->buffer[] = "</script>";
	}
}

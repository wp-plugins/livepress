<?php
/**
 * Reads a configuration file in LivePress! way.
 *
 * @author fgiusti
 */
class livepress_config_file {
	private $options = array();

	/**
	 * Reads the file to get the configuration options
	 *
	 * @param   string  $filepath   The path to the configuration file.
	 */
	function __construct($filepath) {
		if ( file_exists( $filepath ) ) {
			@ $fp = fopen($filepath, 'r');
			if ($fp !== FALSE) {
				while($line = fgets($fp)) {
					$pair = explode( "=", $line, 2 );
					if (count($pair) == 2) {
						$this->options[trim($pair[0])] = trim($pair[1]);
					} else {
						error_log("Invalid configuration on $filepath");
					}
				}
				fclose($fp);
			}
		}
	}

	/**
	 * Getter layer for options
	 *
	 * @param   string  $key    The desired option name
	 * @return  string          The option
	 */
	public function get_option($key) {
		if (!array_key_exists($key, $this->options)) {
			throw new livepress_invalid_option_exception();
		}
		return $this->options[$key];
	}

	/**
	 *  Getter.
	 *
	 * @return  array   All the options in the file
	 */
	public function get_options() {
		return $this->options;
	}
}

/**
 * The requested option don't exists.
 *
 */
class livepress_invalid_option_exception extends Exception {}
?>

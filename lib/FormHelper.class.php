<?php  if(!class_exists('FormHelper')):

/*
Copyright (c) 2009 Benedikt Forchhammer

This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
*/

/**
 * This class provides a collection of functions which ease the generation of form elements.
 */
class FormHelper {
	
	/** 
	 * Renders a set of choices/values inside a select element or a group of checkboxes/radio buttons.
	 *
	 * The $attributes parameter accepts the following values:
	 * - "multiple": If set to true the element allows the user to select multiple values (default: false)
	 * - "expanded": If set to true the choices are rendered as a set of radio buttons or checkboxes (if "multiple" is set to true). (default: false)
	 * - "id": Set this value to override the id which by default is generated from the $name parameter.
	 * - anything else is simply used rendered as an html attribute on the element (or wrapper div if expanded=true). You can e.g. specify "class" to add a css class name.
	 *
	 * @static
	 * @access public
	 * @param string $name The name of the form element.
	 * @param array $choices The array of choices. The array keys are used as form element values, the array values as labels.
	 * @param mixed $values The selected value of the element. Can be a string or an array of values.
	 * @param array $attributes Array of (html) attributes.
	 * @return string Html rendered form element.
	 */
	function choice($name, $choices, $values, $attributes=array()) {
		// make sure we have an array of choices
		if (!is_array($choices) || empty($choices)) {
			return "Sorry, no choices available.";
		}
		
		// make sure we have all values in an array.
		if (!is_array($values)) $values = array($values);
		
		// render in expanded mode?
		$expanded = isset($attributes['expanded']) && $attributes['expanded'] == true;
		
		// multiple value selection allowed?
		$multiple = isset($attributes['multiple']) && $attributes['multiple'] == true;

		// set up variables for tags and attributes.
		$wrapper_attributes = array();
		$row_attributes = array();		
				
		// id = either from $attributes['id'] or safe version of $name
		$wrapper_attributes['id'] = !empty($attributes['id']) ? $attributes['id'] : str_replace('--', '-', preg_replace('/[\W]/', '-', $name));
		
		if ($multiple) $name .= '[]';
				
		if ($expanded) {
			$row_attributes['name'] = $name;
			
			if ($multiple) {
				$row_attributes['type'] = 'checkbox';
			}
			else {
				$row_attributes['type'] = 'radio';
			}
		}
		else {
			$wrapper_attributes['name'] = $name;
						
			if ($multiple) {
				$wrapper_attributes['multiple'] = 'multiple';
				$_size = count($choices);
				$wrapper_attributes['size'] = $_size <= 5 ? '5' : ($_size > 10 ? '10' : $_size);
				unset($_size);
				
				// reset height, which is set to 2em on wordpress 2.6 default admin theme.
				if (empty($wrapper_attributes['style'])) $wrapper_attributes['style'] = '';
				$wrapper_attributes['style'] .= 'height: auto;';
			}
		}
		
		// filter out values which we set ourselves
		unset($attributes['name'], $attributes['id'], $attributes['multiple'], $attributes['expanded']);
		// add remaining $attributes values onto $wrapper_attributes
		$wrapper_attributes = array_merge($attributes, $wrapper_attributes);
		
		// return value
		$html = '<';
		$html .= $expanded ? 'div' : 'select';
		$html .= self::buildHtmlAttributes($wrapper_attributes);
		$html .= '>';
		
		foreach ($choices as $value => $label) {		
			$attr = self::buildHtmlAttributes($row_attributes);
			$attr .= ' value="'. $value .'"';
			
			$row = '';
			if ($expanded) {
				$row = '<label><input';
				if (in_array($value, $values)) $row .= ' checked="checked"';
				$row .= $attr;
				$row .= '/> ';
				$row .= $label;
				$row .= '</label><br/>';
			}
			else {
				$row = '<option';
				$row .= $attr;
				if (in_array($value, $values)) $row .= ' selected="selected"';			
				$row .= '>';
				$row .= $label;
				$row .= '</option>';
			}
			
			$html .= $row;
		}
		
		$html .= '</';
		$html .= $expanded ? 'div' : 'select';
		$html .= '>';
		
		return $html;
	}
	
	/**
	 * Renders a form input field
	 *
	 * The attributes parameter accepts any html properties plus the following:
	 * - "label": set this value to wrap the input field into a label with the given value in front of the input field.
	 *
	 * @static
	 * @access public
	 * @param string $type The type of the input field. (E.g. "text" or "hidden").
	 * @param string $name The name of the input field.
	 * @param string $value The value of the input field.
	 * @param array $attributes Array of (html) attributes.
	 * @return string Html rendered form element.
	 */
	function input($type, $name, $value, $attributes=array()) {
		$valid_types = array('text', 'hidden', 'password', 'submit');
		if (!in_array($type, $valid_types)) return '[Only types "text" and "hidden" are allowed in FormHelper::input()]';
		
		$attributes['type'] = $type;
		$attributes['id'] = !empty($attributes['id']) ? $attributes['id'] : str_replace('--', '-', preg_replace('/[\W]/', '-', $name));
		$attributes['name'] = $name;
		$attributes['value'] = $value;
		
		$label = '';
		if (isset($attributes['label'])) {
			$label = $attributes['label'] .' ';
			unset($attributes['label']);
		}
		
		$attr = self::buildHtmlAttributes($attributes);
		
		$html = '<input'.$attr.' />';
		if (!empty($label)) $html = '<label>'.$label.$html.'</label>';
		return $html;
	}
	/**
	 * Builds a string of html attributes from an associative array.
	 * 
	 * Example: 
	 * Array('title' => 'My title'); will be transformed into this string: [ title="My title"]
	 * 
	 * All attribute values are cleaned up using the function wp_specialchars().
	 *
	 * @static
	 * @access public
	 * @param $attributes Array of attributes
	 * @return string 
	 */
	function buildHtmlAttributes($attributes) {
		if (!is_array($attributes) || empty($attributes)) return '';
		
		$string = '';
		foreach ($attributes as $key => $value) {
			$string .= ' '. $key . '="'. wp_specialchars($value) .'"';
		}
		return $string;
	}
}


endif; ?>
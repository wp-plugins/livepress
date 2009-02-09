//resize the popup to fit form
function init() {
	tinyMCEPopup.resizeToInnerSize();
}
tinyMCEPopup.executeOnLoad('init();')

function insertAuthorAvatarsCode() {

/* jquery is not available... use document.forms[0].elements ? or alternatively something along the following lines...

    var roles_div = document.getElementById('roles');
    var roles = new Array();
    for (var i=0, c=roles_div.childNodes.length; i<c; i++) {
        var node = roles_div.childNodes[i];
        if (node.tagName == "label") {
            var input = node.childNodes[0];
            if (input.tagName == "input" && input.checked == true) {
                roles.push(input.value);
            }
        }
    }
    console.debug(roles_div, roles);
 */
    var tagtext = "";
    tagtext += "[authoravatars";

/*    if (roles.length > 0) {
        tagtext += " roles=" + roles.join(',');
    }*/
    
    tagtext += "]";

    if (window.tinyMCE) {
		window.tinyMCE.execInstanceCommand('content', 'mceInsertContent', false, tagtext);
		tinyMCEPopup.editor.execCommand('mceRepaint');
		tinyMCEPopup.close();
	}
	return;
}
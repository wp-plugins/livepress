/*! livepress -v1.3.4.2
 * http://livepress.com/
 * Copyright (c) 2015 LivePress, Inc.
 */
(function () {
    if( 'undefined' === typeof( LivepressConfig ) ){
        return;
    }
    var path = LivepressConfig.lp_plugin_url + 'tinymce/',
        config = LivepressConfig.PostMetainfo,
        Helper;

    Helper = (function () {
        this.ajaxAction = function (action, content, callback, additional) {
            return jQuery.ajax({
                type: "POST",
                url: LivepressConfig.site_url + '/wp-admin/admin-ajax.php',
                data: jQuery.extend({
                    action: action,
                    content: content,
                    post_id: LivepressConfig.post_id
                }, additional || {}),
                dataType: "json",
                success: callback,
                error: function (jqXHR, textStatus, errorThrown) {
                    callback.apply(jqXHR, [undefined, textStatus, errorThrown]);
                }
            });
        };

        /*
         * function: doStartEE
         * Request to plugin to process start EE
         */
        this.doStartEE = function (content, callback) {
            return this.ajaxAction('start_ee', content, callback);
        };

        /*
         * function: appendPostUpdate
         * request to append new post update
         */
        this.appendPostUpdate = function (content, callback, title) {
            var args = (title === undefined) ? {} : {title: title};
            args._ajax_nonce = jQuery('#livepress-nonces').data('append-nonce');
            return this.ajaxAction('append_post_update', content, callback, args);
        };

        /*
         * function: changePostUpdate
         * request to change particular post update
         */
        this.changePostUpdate = function (updateId, content, callback) {
            var nonce = jQuery('#livepress-nonces').data('change-nonce');
            return this.ajaxAction('change_post_update', content, callback, {update_id: updateId, _ajax_nonce: nonce});
        };

        /*
         * function: deletePostUpdate
         * request to remove particular post update
         */
        this.deletePostUpdate = function (updateId, callback) {
            var nonce = jQuery('#livepress-nonces').data('delete-nonce');
            return this.ajaxAction('delete_post_update', "", callback, {update_id: updateId, _ajax_nonce: nonce});
        };

        /*
         * function: getProcessedContent
         * returns from editor text, preprocessed like WP do
         */
        this.getProcessedContent = function (editor) {
            var originalContent = editor.getContent({format: 'raw'});
            var processed = switchEditors.pre_wpautop(originalContent);
            //if(processed !== "" && processed.substr(-1)!==">") processed += "\n\n";
            return processed;
        };

        /*
         * function: newMetainfoShortcode
         * Gets the metainfo shortcode
         */
        this.newMetainfoShortcode = function () {
            var metainfo = "\n[livepress_metainfo";

            if (config.author_display_name) {
                metainfo += ' authors="' + config.author_display_name + '"';
            }

            var d, utc, server_time;
            d = new Date();
            utc = d.getTime() + (d.getTimezoneOffset() * 60000); // Minutes to milisec
            server_time = utc + (3600000 * LivepressConfig.blog_gmt_offset); // Hours to milisec
            server_time = new Date(server_time);
            if (config.timestamp_template) {
                if (window.eeActive) {
                    metainfo += ' time="' + server_time.format(config.timestamp_template) + '"';
                } else {
                    metainfo += ' POSTTIME ';
                }
            }

            if (config.has_avatar) {
                metainfo += ' has_avatar="1"';
            }

            return metainfo + "]\n\n";
        };

        /*
         * function: hasMetainfoShortcode
         * tests is metainfo shortcode included in text,
         * also can check is text are only metainfo shortcode
         */
        var hasRegex = new RegExp("\\[livepress_metainfo[^\\]]*]");
        var onlyRegex = new RegExp("^\\s*\\[livepress_metainfo[^\\]]*]\\s*$");
        this.hasMetainfoShortcode = function (text) {
            return hasRegex.test(text);
        };
        this.hasMetainfoShortcodeOnly = function (text) {
            return onlyRegex.test(text);
        };

        return this;
    }.call({}));

})();

/* global tinymce, QTags */
// send html to the post editor
// do not support the  QTags editor
// copied from /wp-includes/js/media-editor.js

var wpActiveEditor;

window.send_to_editor = function (html) {

    if (window.LP_ActiveEditor) {
        wpActiveEditor = window.LP_ActiveEditor;
    }

    var editor = tinymce.get(wpActiveEditor);

    if (editor && !editor.isHidden()) {
        editor.execCommand('mceInsertContent', false, html);
    } else {
        // if this is the default editor then we need to find the textarea for it
        if ('content' === wpActiveEditor) {
            wpActiveEditor = jQuery('.livepress-newform textarea').attr('id');
        }
        document.getElementById(wpActiveEditor).value += html;
    }
    window.LP_ActiveEditor = null;

    // If the old thickbox remove function exists, call it
    if (window.tb_remove) {
        try {
            window.tb_remove();
        } catch (e) {
        }
    }
};


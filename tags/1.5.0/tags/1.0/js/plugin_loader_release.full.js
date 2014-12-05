/*! LivePress -v0.7.3 - 2013-07-16
 * http://livepress.com/
 * Copyright (c) 2013 LivePress, Inc.
 */
/*global Livepress, jQuery, document */
(function () {
	var lpEnabled = false;
	var lpLoad = function () {
		if (lpEnabled) {
			return;
		}
		lpEnabled = true;
		Livepress.CSSQueue = [];
		var mode = 'min';
		if (Livepress.Config.debug) {
			mode = 'full';
		}
		Livepress.JSQueue = [(jQuery === undefined ? 'jquery://' : ''), 'wpstatic://js/' + '/livepress-release.' + mode + '.js?v=' + Livepress.Config.ver];
		var loader = document.createElement('script');
		loader.setAttribute('id', 'LivePress-loader-script');
		loader.setAttribute('src', Livepress.Config.wpstatic_url + 'js/livepress_loader.' + mode + '.js?v=' + Livepress.Config.ver);
		loader.setAttribute('type', 'text/javascript');
		document.getElementsByTagName('head').item(0).appendChild(loader);
	};

	if (Livepress.Config.page_type === 'home' || Livepress.Config.page_type === 'single') {
		lpLoad();
	}
}());

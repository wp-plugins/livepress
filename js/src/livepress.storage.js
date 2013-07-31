/*global Livepress, Persist */
Livepress.storage = (function () {
	var storage = new Persist.Store('Livepress', {
		defer:    false,
		swf_path: Livepress.Config.lp_plugin_url + '/swf/persist.swf'
	});
	return {
		get: function (key, def) {
			var val = storage.get(key);
			return (val === null || val === undefined) ? def : val;
		},
		set: function (key, value) {
			return storage.set(key, value);
		}
	};
}());
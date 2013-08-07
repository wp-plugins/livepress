/*jslint vars:true */
/*global Livepress, soundManager, console */
Livepress.sounds = (function () {
	var soundsBasePath = 'http://static2.photophlow.com/photophlow/sounds/jerome/';
	var soundOn = true;

	soundManager.debugMode = false;
	soundManager.useFlashBlock = true;
	soundManager.url = Livepress.Config.lp_plugin_url + "/swf/";
	soundManager.useHTML5Audio = true;
	soundManager.flashLoadTimeout = 5000;
	soundManager.useFlashBlock = true;
	soundManager.useHighPerformance = true;

	var soundFiles = {
		commentAdded:              "vibes_04-04LR_02-01.mp3",
		firstComment:              "vibes_04-04LR_02-01.mp3",
		commentReplyToUserReceived:'vibes-short_09-08.mp3',
		commented:                 'vibes_04-04LR_02-01.mp3',
		newPost:                   'piano_w-pad_01-17M_01.mp3',
		postUpdated:               'piano_w-pad_01-16M_01-01.mp3'
	};

	// Hack to fail-safe when there is a problem playing the sounds
	var stubSound = { play:function () {
	} };

	var sounds = {}, soundName;
	for (soundName in soundFiles) {
		if (soundFiles.hasOwnProperty(soundName) && typeof(soundFiles[soundName]) === "string") {
			sounds[soundName] = stubSound;
		}
	}

	sounds.on = function () {
		soundOn = true;
	};

	sounds.off = function () {
		soundOn = false;
	};

	var LpSound = function (soundName, fileName) {
		var sound = soundManager.createSound({
			id: soundName,
			url:soundsBasePath + fileName
		});
		this.load = function () {
			sound.load();
		};
		this.play = function () {
			if (soundOn) {
				sound.play();
			}
		};
	};

	var createSounds = function () {
		var soundName;
		for (soundName in soundFiles) {
			if (soundFiles.hasOwnProperty(soundName) && typeof(soundFiles[soundName]) === "string") {
				sounds[soundName] = new LpSound(soundName, soundFiles[soundName]);
			}
		}
	};

	function loadSounds () {
		var soundName;
		for (soundName in soundFiles) {
			if (soundFiles.hasOwnProperty(soundName) && typeof(soundFiles[soundName].load) === "function") {
				sounds[soundName].load();
			}
		}
	}

	soundManager.onload = createSounds;

	sounds.load = function () {
		if (soundManager.supported()) {
			loadSounds();
		} else {
			soundManager.onload = function () {
				createSounds();
				loadSounds();
			};
		}
	};

	soundManager.onerror = function () {
		// time-out, no flash, weird Chrome load issue perhaps.. is user using Chrome?
		// let's try re-starting and see if it works. If not, no loss.
		soundManager.flashLoadTimeout = 0; // wait forever for flash this time..
		setTimeout(soundManager.reboot, 20); // and restart SM2 init process
		setTimeout(function () { // after 1.5 seconds..
			if (!soundManager.supported()) {
				// No luck, no sound - give up, etc.
				console.log('Sound manager error!');
			}
		}, 1500);
	};

	return sounds;
}());
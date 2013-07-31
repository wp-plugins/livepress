/*global module:false*/
module.exports = function ( grunt ) {

	// Project configuration.
	grunt.initConfig( {
		pkg: grunt.file.readJSON('package.json'),
		concat: {
			options: {
				stripBanners: true,
				banner: '/*! <%= pkg.name %> -v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
					' * http://livepress.com/\n' +
					' * Copyright (c) <%= grunt.template.today("yyyy") %> LivePress, Inc.\n' +
					' */\n'
			},
			admin_ui: {
				src: [
					'js/src/facebox.js',
					'js/src/jquery.placeholder.js',
					'js/src/admin_ui.js'
				],
				dest: 'js/admin_ui.full.js'
			},
			editor_plugin: {
				src: [
					'js/src/editor_plugin.js'
				],
				dest: 'js/editor_plugin_release.full.js'
			},
			dashboard_dyn: {
				src: [
					'js/src/livepress.js',
					'js/src/jquery.extensions.js',
					'js/src/php-date.js',
					'js/src/jquery.scrollTo.js',
					'js/src/jquery.color.js',
					'js/src/scroll-controller.js',
					'js/src/livepress.dommanipulator.js',
					'js/src/livepress.dashboard.js',
					'js/src/livepress.collaboration.js',
					'js/src/livepress.dashboard.comments.js',
					'js/src/twitter-text.js',
					'js/src/livepress.dashboard.twitter.js',
					'js/src/livepress.loader.js',
					'js/src/gears_init.js',
					'js/src/persist.js',
					'js/src/livepress.storage.js'
				],
				dest: 'js/dashboard-dyn.full.js'
			},
			livepress_admin: {
				src: [
					'js/src/livepress.js',
					'js/src/jquery.extensions.js',
					'js/src/php-date.js',
					'js/src/livepress.imintegration.js',
					'js/src/livepress.admin.js'
				],
				dest: 'js/admin/livepress-admin.full.js'
			},
			admin_bar: {
				src: ['js/src/livepress-admin-bar.js'],
				dest: 'js/livepress-admin-bar.full.js'
			},
			plugin_loader: {
				src: ['js/src/plugin_loader_release.js'],
				dest: 'js/plugin_loader_release.full.js'
			},
			livepress_release: {
				src: [
					'js/src/livepress.js',
					'js/src/jquery.extensions.js',
					'js/src/php-date.js',
					'js/src/jquery.scrollTo.js',
					'js/src/jquery.color.js',
					'js/src/jquery.gritter.js',
					'js/src/jquery.timeago.js',
					'js/src/livepress.ui.js',
					'js/src/soundmanager.js',
					'js/src/livepress.sounds.js',
					'js/src/scroll-controller.js',
					'js/src/livepress.dommanipulator.js',
					'js/src/gears_init.js',
					'js/src/persist.js',
					'js/src/livepress.storage.js',
					'js/src/livepress.ui.controller.js',
					'js/src/livepress.comment.js',
					'js/src/livepress.ui-start.js',
					'js/src/jquery.effects.js'
				],
				dest: 'js/livepress-release.full.js'
			},
			livepress_loader: {
				src: ['js/src/livepress_loader.js'],
				dest: 'js/livepress_loader.full.js'
			},
			pointer: {
				src: ['js/src/livepress-pointer.js'],
				dest: 'js/admin/livepress-pointer.full.js'
			}
		},
		jshint: {
			all: [
				'Gruntfile.js',
				'js/src/admin_ui.js',
				'js/src/livepress.js',
				'js/src/scroll-controller.js',
				'js/src/livepress.dommanipulator.js',
				'js/src/livepress.dashboard.js',
				'js/src/livepress.dashboard.comments.js',
				'js/src/livepress.dashboard.twitter.js',
				'js/src/livepress.collaboration.js',
				'js/src/livepress.loader.js',
				'js/src/livepress.storage.js',
				'js/src/scroll-controller.js',
				'js/src/livepress.imintegration.js',
				'js/src/livepress.admin.js',
				'js/src/livepress-admin-bar.js',
				'js/src/plugin_loader_release.js',
				'js/src/livepress.ui.js',
				'js/src/livepress.sounds.js',
				'js/src/livepress.ui.controller.js',
				'js/src/livepress.comment.js',
				'js/src/livepress.ui-start.js',
				'js/src/livepress_loader.js',
				'js/src/editor_plugin.js'
			],
			options: {
				curly:   true,
				eqeqeq:  true,
				immed:   true,
				latedef: true,
				newcap:  true,
				noarg:   true,
				sub:     true,
				undef:   true,
				boss:    true,
				eqnull:  true,
				browser: true,
				globals: {
					jQuery: true
				}
			}
		},
		uglify: {
			all: {
				files: {
					'js/admin_ui.min.js':                ['js/admin_ui.full.js'],
					'js/editor_plugin_release.min.js':   ['js/editor_plugin_release.full.js'],
					'js/dashboard-dyn.min.js':           ['js/dashboard-dyn.full.js'],
					'js/admin/livepress-admin.min.js':   ['js/admin/livepress-admin.full.js'],
					'js/livepress-admin-bar.min.js':     ['js/livepress-admin-bar.full.js'],
					'js/plugin_loader_release.min.js':   ['js/plugin_loader_release.full.js'],
					'js/livepress-release.min.js':       ['js/livepress-release.full.js'],
					'js/livepress_loader.min.js':        ['js/livepress_loader.full.js'],
					'js/admin/livepress-pointer.min.js': ['js/admin/livepress-pointer.full.js']
				},
				options: {
					banner: '/*! <%= pkg.name %> -v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
						' * http://livepress.com/\n' +
						' * Copyright (c) <%= grunt.template.today("yyyy") %> LivePress, Inc.\n' +
						' */\n',
					mangle: {
						except: ['jQuery', 'Livepress', 'OORTLE']
					}
				}
			}
		}
	} );

	// Load tasks
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');

	// Default task.
	grunt.registerTask( 'default', ['jshint', 'concat', 'uglify'] );

};
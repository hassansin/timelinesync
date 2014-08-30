'use strict';

module.exports = {
	app: {
		title: 'TimelineSync',
		description: 'TimelineSync',
		keywords: 'TimelineSync'
	},
	port: process.env.PORT || 3000,
	templateEngine: 'swig',
	sessionSecret: 'MEAN',
	sessionCollection: 'sessions',
	assets: {
		lib: {
			css: [
				'public/lib/mobile-angular-ui/dist/css/mobile-angular-ui-hover.min.css',
				'public/lib/mobile-angular-ui/dist/css/mobile-angular-ui-base.min.css',
				'public/lib/mobile-angular-ui/dist/css/mobile-angular-ui-desktop.min.css',
				'public/application.css'								
			],
			js: [
				'public/lib/angular/angular.js',
				'public/lib/angular-resource/angular-resource.js',
				'public/lib/angular-animate/angular-animate.js',
				'public/lib/angular-ui-router/release/angular-ui-router.js',
				'public/lib/angular-ui-utils/ui-utils.js',
				'public/lib/mobile-angular-ui/dist/js/mobile-angular-ui.min.js',
				/*'public/lib/angular-bootstrap/ui-bootstrap-tpls.js'*/
			]
		},
		css: [
			'public/modules/**/css/*.css'
		],
		js: [
			'public/config.js',
			'public/application.js',
			'public/modules/*/*.js',
			'public/modules/*/*[!tests]*/*.js'
		],
		tests: [
			'public/lib/angular-mocks/angular-mocks.js',
			'public/modules/*/tests/*.js'
		]
	}
};
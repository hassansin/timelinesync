'use strict';

module.exports = {
	db: process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || 'mongodb://localhost/mean',
	assets: {
		lib: {
			css: [
				'public/lib/mobile-angular-ui/dist/css/mobile-angular-ui-hover.min.css',
				'public/lib/mobile-angular-ui/dist/css/mobile-angular-ui-base.min.css',
				'public/lib/mobile-angular-ui/dist/css/mobile-angular-ui-desktop.min.css',
				'public/application.css'								
			],
			js: [
				'public/lib/angular/angular.min.js',
				'public/lib/angular-resource/angular-resource.min.js',
				'public/lib/angular-animate/angular-animate.min.js',
				'public/lib/angular-ui-router/release/angular-ui-router.min.js',
				'public/lib/angular-ui-utils/ui-utils.min.js',
				'public/lib/mobile-angular-ui/dist/js/mobile-angular-ui.min.js',
				/*'public/lib/angular-bootstrap/ui-bootstrap-tpls.min.js'*/
			]
		},
		css: 'public/dist/application.min.css',
		js: 'public/dist/application.min.js'
	},
	dropbox : {
		clientID: 'quk9uarfbckjpd9',
    clientSecret: 'l4stpf33aqoy226',
    callbackURL: 'https://timelinesync.com/auth/dropbox/callback'
	},
	facebook: {
		clientID: process.env.FACEBOOK_ID || 'APP_ID',
		clientSecret: process.env.FACEBOOK_SECRET || 'APP_SECRET',
		callbackURL: 'http://localhost:3000/auth/facebook/callback'
	},
	twitter: {
		clientID: process.env.TWITTER_KEY || 'CONSUMER_KEY',
		clientSecret: process.env.TWITTER_SECRET || 'CONSUMER_SECRET',
		callbackURL: 'http://localhost:3000/auth/twitter/callback'
	},
	google: {
		clientID: process.env.GOOGLE_ID || 'APP_ID',
		clientSecret: process.env.GOOGLE_SECRET || 'APP_SECRET',
		callbackURL: 'http://localhost:3000/auth/google/callback'
	},
	linkedin: {
		clientID: process.env.LINKEDIN_ID || 'APP_ID',
		clientSecret: process.env.LINKEDIN_SECRET || 'APP_SECRET',
		callbackURL: 'http://localhost:3000/auth/linkedin/callback'
	},
	github: {
		clientID: process.env.GITHUB_ID || 'APP_ID',
		clientSecret: process.env.GITHUB_SECRET || 'APP_SECRET',
		callbackURL: 'http://localhost:3000/auth/github/callback'
	},
	mailer: {
		from: process.env.MAILER_FROM || 'Timelinesync <no-reply@timelinesync.com>',
		options: {
			port: 587,
			host: 'timelinesync.com',			 	
			secure: false,
			maxConnections: 5,
    	maxMessages: 10,
    	debug: true,
			auth: {
				user: process.env.MAILER_EMAIL_ID || 'postmaster@timelinesync.com',
				pass: process.env.MAILER_PASSWORD || 'fnty8lPMtbbo'
			}			
		}
	}
};
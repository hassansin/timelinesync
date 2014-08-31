'use strict';

module.exports = {
	db: 'mongodb://localhost/mean-dev',
	app: {
		title: 'Timelinesync - Development Environment'
	},
	dropbox : {
		clientID: 'quk9uarfbckjpd9',
    clientSecret: 'l4stpf33aqoy226',
    callbackURL: 'http://localhost:3000/auth/dropbox/callback'
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
		from: process.env.MAILER_FROM || 'Timelinesync.com <no-reply@timelinesync.com>',
		options: {
			port: 587,
			host: 'timelinesync.com',			 										
			tls: {rejectUnauthorized: false},    	
			auth: {
				user: process.env.MAILER_EMAIL_ID || 'postmaster@timelinesync.com',
				pass: process.env.MAILER_PASSWORD || 'fnty8lPMtbbo'
			}			
		}
	}
};
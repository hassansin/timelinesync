'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport'),
	url = require('url'),
	DropboxStrategy = require('passport-dropbox-oauth2').Strategy,
	config = require('../config'),
	users = require('../../app/controllers/users');

module.exports = function() {
	// Use dropbox strategy
	passport.use(new DropboxStrategy({
			clientID: config.dropbox.clientID,
			clientSecret: config.dropbox.clientSecret,
			callbackURL: config.dropbox.callbackURL,
			passReqToCallback: true
		},		
		function(req,accessToken, refreshToken, profile, done) {						
			// Set the provider data and include tokens
			var providerData = profile._json;
			providerData.accessToken = accessToken;
			providerData.refreshToken = refreshToken;

			// Create the user OAuth profile
			var providerUserProfile = {				
				uid : profile.id,
				displayName: profile.displayName,
				email: profile.emails[0].value,				
				provider: 'dropbox',
				providerIdentifierField: 'id',
				providerData: providerData
			};			
			console.log(providerUserProfile);
			// Save the user OAuth profile
			users.saveOAuthUserProfile(req, providerUserProfile, done);
		}
	));
};
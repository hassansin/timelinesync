'use strict';

module.exports = function(app) {
	// Root routing
	var core = require('../../app/controllers/core');
	app.route('/').get(core.index);
	app.route('/manifest.webapp').get(function(req,res){
		var manifest = {
		  'name': 'Timelinesync.com',
		  'description': 'Timelinesync.com',
		  'launch_path': '/',
		  'icons': {
		    '128': '/modules/core/img/brand/log.png'
		  },
		  'developer': {
		    'name': 'hassansin',
		    'url': 'mailto:rezatxe@gmail.com'
		  },
		  'default_locale': 'en',
		  'fullscreen': true
		};
		res.json(manifest);
	});
};
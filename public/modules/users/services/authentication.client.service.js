'use strict';

// Authentication service for user variables
angular.module('users').factory('Authentication', [

	function() {
		var _this = this;		

		_this._data = {
			user: window.user,
			isDbConnected : window.user && window.user.additionalProvidersData && window.user.additionalProvidersData['dropbox']
		};
		return _this._data;
	}
]);
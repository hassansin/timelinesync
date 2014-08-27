'use strict';

// Authentication service for user variables
angular.module('users').factory('Authentication', [

	function() {
		var _this = this;		

		_this._data = {
			user: window.user			
		};
		_this._data['isDbConnected'] = function(){			
			return _this._data.user && _this._data.user.additionalProvidersData && _this._data.user.additionalProvidersData['dropbox'];
		} 
		return _this._data;
	}
]);
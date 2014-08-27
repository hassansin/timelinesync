'use strict';


angular.module('core').controller('TopController', ['$scope','$location', 'Authentication',
	function($scope,$location, Authentication) {
		// This provides Authentication context.
		$scope.authentication = Authentication;		
	}
]);

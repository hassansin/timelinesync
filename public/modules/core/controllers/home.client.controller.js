'use strict';


angular.module('core').controller('HomeController', ['$scope','$location', 'Authentication',
	function($scope,$location, Authentication) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
		
		//If user is not signed in then redirect to signin page
		if (!$scope.authentication.user) $location.path('/signin');
	}
]);
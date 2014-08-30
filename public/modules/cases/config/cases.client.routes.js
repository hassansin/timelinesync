'use strict';

// Setting up route
angular.module('cases').config(['$stateProvider',
	function($stateProvider) {
		// Articles state routing
		$stateProvider.
		state('listActivity', {
			url: '/activity/:caseId',
			templateUrl: 'modules/cases/views/list-activities.client.view.html'
		})
		.state('newCase',{
			url: '/new/case/{caseId:(?:[^/]+)?}',
			templateUrl: 'modules/cases/views/case-form.client.view.html'
		})
		.state('newActivity',{
			url: '/new/activity/:caseId/{activityId:(?:[^/]+)?}',
			templateUrl: 'modules/cases/views/activity-form.client.view.html'
		});
	}
]);
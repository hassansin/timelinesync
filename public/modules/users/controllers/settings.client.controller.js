'use strict';

angular.module('users').controller('SettingsController', ['$scope', '$http', '$location', 'Users', 'Authentication','$timeout','$filter','$stateParams','$rootScope','$state',
	function($scope, $http, $location, Users, Authentication,$timeout,$filter,$stateParams,$rootScope,$state) {
		$scope.user = Authentication.user;
		$scope.passwordDetails = {};
		
		// If user is not signed in then redirect back home
		if (!$scope.user) $location.path('/');		
		if ($state.$current.name==='profile' && !$scope.authentication.isDbAuthorized()) return $location.path('/settings/accounts');								
				
		Authentication.connectDropstore().then(function(data){						
			$scope.datastore = $scope.authentication.dropstore.datastore;					
			var info = $scope.datastore.getTable('info').query({type:'tlsUserProfile'});      
			$scope.userProfile = info.length?info[0].getFields(): {
				companyName:'',
				firstName:'',
				lastName:'',
				phone:'',
				email:'',
				invoiceBillingTerms: '',
				companyAddress1:'',
				companyAddress2:'',
				companyCity: '',
				companyState:'',
				companyZip:'',
				type:'tlsUserProfile'
			};      			
			$scope.userProfile = angular.extend($scope.userProfile,{firstName: $scope.user.firstName, email:$scope.user.email,lastName: $scope.user.lastName});			
			// Update a user profile
			$scope.updateUserProfile = function(isValid) {
				if (isValid){
					$scope.success = $scope.error = null;
					var user = new Users($scope.userProfile);					
		
					user.$update(function(response) {
						$scope.success = true;
						Authentication.user = response;
						//save to dropbox
						if(info.length && !angular.equals(info[0].getFields(),$scope.userProfile)){
		          info[0].update($scope.userProfile);
		        }else if(info.length===0){
		          $scope.datastore.getTable('info').insert($scope.userProfile);
		        }
					}, function(response) {
						$scope.error = response.data.message;
					});
				} else {
					$scope.submitted = true;
				}
			};
		});

		// Check if there are additional accounts 
		$scope.hasConnectedAdditionalSocialAccounts = function(provider) {
			for (var i in $scope.user.additionalProvidersData) {
				return true;
			}

			return false;
		};

		// Check if provider is already in use with current user
		$scope.isConnectedSocialAccount = function(provider) {
			return $scope.user.provider === provider || ($scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider]);
		};

		// Remove a user social account
		$scope.removeUserSocialAccount = function(provider) {
			$scope.success = $scope.error = null;

			$http.delete('/users/accounts', {
				params: {
					provider: provider
				}
			}).success(function(response) {
				// If successful show success message and clear form
				$scope.success = true;
				$scope.user = Authentication.user = response;
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		

		// Change user password		
		$scope.changeUserPassword = function() {
			$scope.success = $scope.error = null;			
			$http.post('/users/password', $scope.passwordDetails).success(function(response) {
				// If successful show success message and clear form
				$scope.success = true;
				$scope.passwordDetails = null;
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);

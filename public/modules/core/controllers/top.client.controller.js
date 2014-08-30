'use strict';


angular.module('core').controller('TopController', ['$scope','$location', 'Authentication','$sce',
	function($scope,$location, Authentication,$sce) {
		// This provides Authentication context.
		$scope.authentication = Authentication;		
		$scope.connectionStatus = $sce.trustAsHtml('<i class="fa fa-warning text-warning"></i> Disconnected');

		$scope.$on('dropstoreConnected',function(event){
			$scope.connectionStatus = $sce.trustAsHtml('<i class="fa fa-check-circle text-success"></i> Connected'); 		
		});		

		$scope.$on('syncStatusChanged',function(){
			$scope.datastore = $scope.authentication.dropstore.datastore;			
			if($scope.datastore.getSyncStatus().uploading){
				$scope.connectionStatus = $sce.trustAsHtml('<i class="fa fa-spinner fa-spin text-warning"></i> Synchronizing');      
      }
      else{
      	$scope.connectionStatus = $sce.trustAsHtml('<i class="fa fa-check-circle text-success"></i> Synchronized'); 
      }	          
		});

	}
]);

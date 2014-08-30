'use strict';

angular.module('core').controller('HomeController', ['$scope','$location', 'Authentication','$timeout','$filter',
	function($scope,$location, Authentication,$timeout,$filter) {
		// This provides Authentication context.
		$scope.authentication = Authentication;				

		//If user is not signed in then redirect to signin page
		if (!$scope.authentication.user) return $location.path('/signin');
		if (!$scope.authentication.isDbAuthorized()) return $location.path('/settings/accounts');										
		Authentication.connectDropstore().then(function(data){			
			$scope.datastore = $scope.authentication.dropstore.datastore;		
			$scope.cases =  $scope.datastore.getTable('cases').query();        			
	    $scope.orderProp = 'activity_date';
	    $scope.reverse = true;
	    $scope.keyword = '';
	    $scope.caseOrder = function(c){      
	      return c.get($scope.orderProp);
	    };
	    $scope.caseFilter = function(c){    
	      var kw = $scope.keyword.toLowerCase();
	      var date = $filter('date')(c.get('activity_date'),'MM/dd/yyyy');
	      var match = c.get('client').toLowerCase().match(kw) || c.get('case_no').match(kw) || c.get('first_name').toLowerCase().match(kw) || c.get('last_name').toLowerCase().match(kw) || date.match(kw);
	      return match && match.length;
	    };	   	   	   
	    //$scope.selectedCases = timelineService.getInvoiceItems(); //selected cases for invoice
	    $scope.authentication.dropstore.selectedCases = $scope.selectedCases = [];	    
	    $scope.addAllToSelection = function(event){
	      if(event.target.checked) {
	        angular.forEach($scope.cases,function(val,key){
	          $scope.selectedCases.push(val.getId());
	        });
	      }
	      else
	        $scope.selectedCases = [];
	    };
	    $scope.addToSelection = function (event,caseId){	    	
	    	if($scope.selectionMode){ //in selection mode enabled
	    		event.preventDefault(); //prevent href 
	    		if($scope.selectedCases.indexOf(caseId) >-1){	    			
	    			$scope.selectedCases.splice($scope.selectedCases.indexOf(caseId),1);	
	    		}
	    		else{
	    			$scope.selectedCases.push(caseId);     		    			
	    		}
	    	}
	      console.log($scope.selectedCases);
	    };
	    $scope.prepareInvoice = function (){
	      //timelineService.setInvoiceItems($scope.selectedCases);
	      if($scope.selectedCases.length){
	      	$location.path('/invoice');	
	      }
	      
	    };   	      
		});
	}
]);
'use strict';
/* global Dropbox:true */

angular.module('cases').controller('ActivityController', ['$scope','$location', 'Authentication','$timeout','$filter','$stateParams','$http',
	function($scope,$location, Authentication,$timeout,$filter,$stateParams,$http) {
		// This provides Authentication context.
		$scope.authentication = Authentication;				

		//If user is not signed in then redirect to signin page
		if (!$scope.authentication.user) return $location.path('/signin');
		if (!$scope.authentication.isDbAuthorized()) return $location.path('/settings/accounts');								
		
		Authentication.connectDropstore().then(function(data){			
			$scope.datastore = $scope.authentication.dropstore.datastore;					

			var activityTable = $scope.datastore.getTable('activities');        
      var caseTable = $scope.datastore.getTable('cases');
			$scope.caseId = $stateParams.caseId;  // current case id        	    			
      $scope.case = caseTable.get($scope.caseId);
      $scope.activities =  activityTable.query({caseId:$scope.caseId});            	    	    	    
	    $scope.dirtyActivites = $scope.authentication.dropstore.dirtyActivites; // activities that are not synced            
	    $scope.orderProp = 'activity_time';
	    $scope.reverse = false;    
	    $scope.activityOrder = function(a){      
	      return a.get($scope.orderProp);
	    };
	   
	    $scope.downloadAct = function(action){
	      var activities = $scope.datastore.getTable('activities').query({caseId:$scope.caseId});            
	      var c = $scope.datastore.getTable('cases').get($scope.caseId);
	      var data = {};
	      data.timezoneOffset = c.get('activity_date').getTimezoneOffset()*60;
	      data.id = c.getId();
	      data.case = c.getFields();
	      data.activities = [];
	      angular.forEach(activities, function(act, key) {
	        data.activities.push(act.getFields());
	      });
	      $http({
	        method  : 'POST',
	        url     : 'download.php',
	        data    : data,  // pass in data as strings
	        headers : { 'Content-Type': 'application/x-www-form-urlencoded' }  // set the headers so angular passing info as form data (not request payload)
	      })
	      .success(function(data) {        
	        if(data && data.success){          
	          if(action && action === '1'){
	            window.location.href='mailto:?subject='+ encodeURIComponent(data.title)+'&body=%0D%0A%0D%0A%0D%0A%0D%0A%0D%0A' + encodeURIComponent('Download from: '+data.url);          
	          }            
	          else if(action && action === '2'){            
	            var options = {
	              files: [                  
	                  {'url':data.url, 'filename': data.title+'.docx'}
	              ],
	              success: function () {
	                alert('Saved!');                
	              },
	              progress: function (progress) {},              
	              cancel: function () {},
	              error: function (errorMessage) {                
	                alert(errorMessage);                
	              }
	            };            
	            Dropbox.save(options);
	          }  
	          else {
	            //var iFrame = iElement.find("iframe");              
	            //iFrame.attr("src", data.url);
	            //$scope.downloadUrl = data.url;
	            //window.open(data.url, "Download", "width=360,height=200,resizable=yes,location=yes");            
	            window.location.href = data.url;
	          }
	            
	        }
	      });
	    };

	    $scope.$on('syncStatusChanged',function(event){            
	      if(!$scope.datastore.getSyncStatus().uploading){
	        $scope.authentication.dropstore.dirtyActivites = $scope.dirtyActivites = [];
	        $scope.$apply();
	      }
	    });

	    $scope.$on('recordChanged',function(event,recordsChanged){

	      var records = recordsChanged.affectedRecordsForTable('activities'),s_ndx,curr_record;	     
	      for(var ndx in records){
	        var record = records[ndx];
	        if(record.isDeleted()){
	          for(s_ndx in $scope.activities){
	            curr_record = $scope.activities[s_ndx];
	            if(curr_record.getId() === record.getId()){
	              $scope.activities.splice($scope.activities.indexOf(curr_record), 1);
	              //deleted task
	              break;
	            }
	          }
	        }
	        else{   
	          $scope.authentication.dropstore.dirtyActivites.push(records[ndx].getId());
	          var found= false;
	          //task is new or updated.
	          for(s_ndx in $scope.activities){
	            curr_record = $scope.activities[s_ndx];
	            if(curr_record.getId() === record.getId()){
	              $scope.activities[$scope.activities.indexOf(curr_record)] = record;
	              found = true;
	              //udpate task
	              break;
	            }
	          }
	          if(!found){            
	            $scope.activities.push(records[ndx]);
	          }
	        }
	      }
	    });       
		});
	}
])
.controller('NewCaseController', ['$scope','$location', 'Authentication','$timeout','$filter','$stateParams','$rootScope',
	function($scope,$location, Authentication,$timeout,$filter,$stateParams,$rootScope) {
		// This provides Authentication context.
		$scope.authentication = Authentication;				

		//If user is not signed in then redirect to signin page
		if (!$scope.authentication.user) return $location.path('/signin');
		if (!$scope.authentication.isDbAuthorized()) return $location.path('/settings/accounts');								
		
		Authentication.connectDropstore().then(function(data){			
			$scope.datastore = $scope.authentication.dropstore.datastore;					
			$scope.caseId = $stateParams.caseId;  // current case id        
      if($scope.caseId){
        var caseTable = $scope.datastore.getTable('cases');
        $scope.case_record = caseTable.get($scope.caseId);
        $scope.case = $scope.case_record.getFields();
        $scope.case.activity_date = $filter('date')($scope.case.activity_date,'yyyy-MM-dd');
      }
      else
        $scope.case = {};                         

			$scope.saveCase = function(c){      
	      c.activity_date = new Date(c.activity_date);
	      if(c.activity_date){        
	        if(!angular.equals($scope.case_record.getFields(),c))
	          $scope.case_record.update(c);        
	          $location.path('/activity/'+$scope.caseId);
	      }    
	    }; 
	    $scope.addCase = function(c){                  
	      c.activity_date = new Date(c.activity_date);
	      if(c.activity_date){        
	        $scope.datastore.getTable('cases').insert(c);      
	        $location.path('/');
	      }        
	    };
	    $scope.deleteCase = function(c){
	      var activities = $scope.datastore.getTable('activities').query({caseId:c.getId()});                            
	      angular.forEach(activities, function(value, key) {
	        value.deleteRecord();
	      });
	      c.deleteRecord();
	      $scope.isLoaded = false;
	      $rootScope.toggle('myOverlay', 'off');
	      $location.path('/');
	    };                      
		});
	}
])
.controller('NewActivityController', ['$scope','$location', 'Authentication','$timeout','$filter','$stateParams','$rootScope',
	function($scope,$location, Authentication,$timeout,$filter,$stateParams,$rootScope) {
		// This provides Authentication context.
		$scope.authentication = Authentication;				

		//If user is not signed in then redirect to signin page
		if (!$scope.authentication.user) return $location.path('/signin');
		if (!$scope.authentication.isDbAuthorized()) return $location.path('/settings/accounts');								
		
		Authentication.connectDropstore().then(function(data){			
			$scope.datastore = $scope.authentication.dropstore.datastore;					
			$scope.caseId = $stateParams.caseId;  // current case id                      
    	$scope.activityId = $stateParams.activityId;  // current case id                      
    	$scope.case_record = $scope.datastore.getTable('cases').get($scope.caseId);

      //find the last activity time
      var activities = $scope.datastore.getTable('activities').query({caseId:$scope.caseId});
      if(activities.length){
        $scope.last_activity_time = $filter('orderBy')(activities, function(a){      
          return a.get('activity_time');
        }, true).shift().get('activity_time');
        
        $scope.last_activity_time = $filter('date')($scope.last_activity_time,'hh:mm a');  
      }

      //if updating 
      if($scope.activityId){       
        $scope.activity_record = $scope.datastore.getTable('activities').get($scope.activityId);
        $scope.activity = $scope.activity_record.getFields();        
        $scope.activity.activity_time = $filter('date')($scope.activity.activity_time, 'hh:mm a');                
      }
      else{
        $scope.activity = {};
        $scope.activity.activity_time = $filter('date')(new Date(),'hh:mm a');
      }
    	$scope.saveActivity = function(a){            
	      var matched = a.activity_time.match(/(?:(\d{1,2})(\d{2})(am|pm))|(?:(\d+):(\d+)\s*(am|pm))/i);
	      if(matched){
	        matched = matched.filter(function(x){return x!==undefined;});
	      }      
	      if(matched && matched.length === 4){
	        var time = new Date($filter('date')($scope.case_record.get('activity_date'),'MM/dd/yyyy') + ' ' + matched[1]+':'+matched[2]+' '+matched[3]);        
	        if(time === 'Invalid Date'){
	          alert('Invalid Time');
	        }else{
	          a.activity_time = time;          
	          if(!angular.equals($scope.activity_record.getFields(),a))
	            $scope.activity_record.update(a);   
	          $location.path('/activity/'+$scope.caseId);
	        }        
	      }   
	      else{
	        alert('Invalid Time');
	      }                     
	    };    
	    $scope.addActivity = function(a){            
	      var matched = a.activity_time? a.activity_time.match(/(?:(\d{1,2})(\d{2})(am|pm))|(?:(\d+):(\d+)\s*(am|pm))/i):'';
	      if(matched){
	        matched = matched.filter(function(x){return x!==undefined;});
	      }      
	      if(matched && matched.length === 4){
	        var time = new Date($filter('date')($scope.case_record.get('activity_date'),'MM/dd/yyyy') + ' ' + matched[1]+':'+matched[2]+' '+matched[3]);
	        if(time === 'Invalid Date'){
	          alert('Invalid Time');          
	        }
	        else{
	          a.activity_time = time;        
	          a.caseId = $scope.caseId;
	          $scope.datastore.getTable('activities').insert(a);                
	          $location.path('/activity/'+$scope.caseId);
	        }
	      }                  
	    };
	    $scope.deleteActivity= function(a){   
	      $scope.activity_record.deleteRecord();
	      $scope.isLoaded = false;
	      $rootScope.toggle('myOverlay', 'off');
	      $location.path('/activity/'+$scope.caseId);
	    };    
	   
	    $scope.$on('syncStatusChanged',function(event){      
	      if(!$scope.datastore.getSyncStatus().uploading){
	        $scope.authentication.dropstore.dirtyActivites = [];
	        $scope.$apply();
	      }
	    });

	    $scope.$on('recordChanged',function(event,recordsChanged){      
	      var records = recordsChanged.affectedRecordsForTable('activities');
	      for(var ndx in records){
	        var record = records[ndx];
	        if(record.isDeleted()){
	          void 0;
	        }
	        else{   
	          $scope.authentication.dropstore.dirtyActivites.push(records[ndx].getId());          
	        }
	      }
	    });	                 	                
		});
	}
]);
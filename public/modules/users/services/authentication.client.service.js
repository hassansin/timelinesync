'use strict';

// Authentication service for user variables
angular.module('users').factory('Authentication', [
	'dropstoreClient', '$rootScope','$window','$q',
	function(dropstoreClient,$rootScope,$window,$q) {
		var _this = this;		
		
		_this._data = {
			user: window.user,
			dropstore: {}
		};
		_this._data.isDbAuthorized = function(){			
			//check if user has authorized dropbox
			if(_this._data.user && _this._data.user.additionalProvidersData && _this._data.user.additionalProvidersData.dropbox){
				var accessToken = _this._data.user.additionalProvidersData.dropbox.accessToken;
				return accessToken;								
			}			
		};

		_this._data.connectDropstore = function(){						
			//return if already connected
			if(_this._data.dropstore.c)
				return _this._data.dropstore.c;

			//lets connect to dropstore service			
			var _datastoreManager;
	    var client = new Dropbox.Client({key: 'quk9uarfbckjpd9',token:_this._data.isDbAuthorized()});    
	    var c = dropstoreClient.create(client)
	      .authenticate({interactive: false})
	      .then(function(datastoreManager){                                	        
	        _datastoreManager = datastoreManager;
	        return datastoreManager.openDefaultDatastore();
	      })      
	      .then(function(datastore){         	      	
	        _this._data.dropstore.datastore = datastore; 
	        _this._data.dropstore.dirtyActivites = []; // activities that are not synced            
	        _this._data.dropstore.datastoreManager = _datastoreManager;                       	       

	        /*============== Add broadcast events ===============*/

	        //0.
	        //$rootScope.$broadcast('dropstoreConnected');

	        //1.
	        $window.onbeforeunload = function (e) {
	          if (datastore && datastore.getSyncStatus().uploading) {
	            return 'You have pending changes that haven\'t been synchronized to the server.';
	          }
	        };  

	        //2.
	        _datastoreManager.SubscribeRecordsChanged(function(records){        
	          $rootScope.$broadcast('recordChanged',records);
	        });

	        //3.
	        _datastoreManager.SubscribeSyncStatusChanged(function(){        
	          $rootScope.$broadcast('syncStatusChanged');	          
	        });

	        //document.getElementById('status').innerHTML = '<i class="fa fa-info-circle text-success"></i> Connected';	       	        
	      })
	      .catch(function(err){             
	        /*if(err instanceof Dropbox.AuthError){
	          
	        }*/
	        //dropstoreClient._client.reset();
	        //$rootScope.$broadcast('loggedOut');
	        alert(err.toString() );        
	      });	 
	    _this._data.dropstore.c = c;
	    return c;
		};
		
		return _this._data;
	}
]);
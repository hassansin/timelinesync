'use strict';

angular.module('users')
  .factory('dropstoreClient',function($q,dropstoreDatastoreManager){
    var dropstoreServices = {};
    dropstoreServices.create = function(client){
      dropstoreServices._client = client;
      return dropstoreServices;
    };
    dropstoreServices.authenticate = function(options){
      var deferred = $q.defer();
      dropstoreServices._client.authenticate(options,function(err,res){       
        if(err){
          deferred.reject(err);
        }        
        else if(dropstoreServices._client.isAuthenticated()){
          deferred.resolve(dropstoreDatastoreManager(res));
        }
      });
      return deferred.promise;
    }
    return dropstoreServices;
  })
  .factory('dropstoreDatastoreManager', ['$q', function($q){
    return function(_client){
      var dropstoreDatastoreManagerService = {};
      dropstoreDatastoreManagerService._client = _client;
      dropstoreDatastoreManagerService._datastoreManager = dropstoreDatastoreManagerService._client.getDatastoreManager();

      dropstoreDatastoreManagerService.openDefaultDatastore = function(){
        var deferred = $q.defer();
        dropstoreDatastoreManagerService._datastoreManager.openDefaultDatastore(function(err,datastore){          
          if(err)
            deferred.reject(err);
          else{
            dropstoreDatastoreManagerService._datastore = datastore;
            deferred.resolve(datastore);
          }           
        })
        return deferred.promise;
      };
      dropstoreDatastoreManagerService.SubscribeRecordsChanged = function(callback){        
        dropstoreDatastoreManagerService._datastore.recordsChanged.addListener(callback);
        return callback;
      };
      dropstoreDatastoreManagerService.SubscribeSyncStatusChanged = function(callback){       
        dropstoreDatastoreManagerService._datastore.syncStatusChanged.addListener(callback);
        return callback;
      };
      dropstoreDatastoreManagerService.signOut = function(options,callback){        
        dropstoreDatastoreManagerService._client.signOut(options,function(err){                             
          return callback(err);
        });        
      }
      return dropstoreDatastoreManagerService;
    };    
  }])
  .directive('focusAndSelect',function($timeout){
    return {
      restrict: 'A',          
      link    : function(scope,element,attr){
        (function(e){
          $timeout(function(){
            e[0].select();
          },200);
        })(element);        
      }
    }
  })
  .directive('ngReallyClick', [function() {
      return {
          restrict: 'A',
          link: function(scope, element, attrs) {
              element.bind('click', function() {
                  var message = attrs.ngReallyMessage;
                  if (message && confirm(message)) {
                      scope.$apply(attrs.ngReallyClick);
                  }
              });
          }
      }
  }])  
  .directive('syncFocusWith', function ($timeout) {
    return function (scope, elem, attrs) {
      scope.$watch(attrs.syncFocusWith, function () {
        elem[0].focus();
      });
    };
  })
'use strict';
// Init the application configuration module for AngularJS application
var ApplicationConfiguration = function () {
    // Init module configuration options
    var applicationModuleName = 'mean';
    var applicationModuleVendorDependencies = [
        'ngResource',
        'ui.router',
        'mobile-angular-ui'
      ];
    // Add a new vertical module
    var registerModule = function (moduleName, dependencies) {
      // Create angular module
      angular.module(moduleName, dependencies || []);
      // Add the module to the AngularJS configuration file
      angular.module(applicationModuleName).requires.push(moduleName);
    };
    return {
      applicationModuleName: applicationModuleName,
      applicationModuleVendorDependencies: applicationModuleVendorDependencies,
      registerModule: registerModule
    };
  }();'use strict';
//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);
// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config([
  '$locationProvider',
  function ($locationProvider) {
    $locationProvider.hashPrefix('!');
  }
]);
//Then define the init function for starting up the application
angular.element(document).ready(function () {
  //Fixing facebook bug with redirect
  if (window.location.hash === '#_=_')
    window.location.hash = '#!';
  //Then init the app
  angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});'use strict';
// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('articles');'use strict';
// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('cases');'use strict';
// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('core');'use strict';
// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('users');'use strict';
// Configuring the Articles module
angular.module('articles').run([
  'Menus',
  function (Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', 'Articles', 'articles', 'dropdown', '/articles(/create)?');
    Menus.addSubMenuItem('topbar', 'articles', 'List Articles', 'articles');
    Menus.addSubMenuItem('topbar', 'articles', 'New Article', 'articles/create');
  }
]);'use strict';
// Setting up route
angular.module('articles').config([
  '$stateProvider',
  function ($stateProvider) {
    // Articles state routing
    $stateProvider.state('listArticles', {
      url: '/articles',
      templateUrl: 'modules/articles/views/list-articles.client.view.html'
    }).state('createArticle', {
      url: '/articles/create',
      templateUrl: 'modules/articles/views/create-article.client.view.html'
    }).state('viewArticle', {
      url: '/articles/:articleId',
      templateUrl: 'modules/articles/views/view-article.client.view.html'
    }).state('editArticle', {
      url: '/articles/:articleId/edit',
      templateUrl: 'modules/articles/views/edit-article.client.view.html'
    });
  }
]);'use strict';
angular.module('articles').controller('ArticlesController', [
  '$scope',
  '$stateParams',
  '$location',
  'Authentication',
  'Articles',
  function ($scope, $stateParams, $location, Authentication, Articles) {
    $scope.authentication = Authentication;
    $scope.create = function () {
      var article = new Articles({
          title: this.title,
          content: this.content
        });
      article.$save(function (response) {
        $location.path('articles/' + response._id);
        $scope.title = '';
        $scope.content = '';
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
    $scope.remove = function (article) {
      if (article) {
        article.$remove();
        for (var i in $scope.articles) {
          if ($scope.articles[i] === article) {
            $scope.articles.splice(i, 1);
          }
        }
      } else {
        $scope.article.$remove(function () {
          $location.path('articles');
        });
      }
    };
    $scope.update = function () {
      var article = $scope.article;
      article.$update(function () {
        $location.path('articles/' + article._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
    $scope.find = function () {
      $scope.articles = Articles.query();
    };
    $scope.findOne = function () {
      $scope.article = Articles.get({ articleId: $stateParams.articleId });
    };
  }
]);'use strict';
//Articles service used for communicating with the articles REST endpoints
angular.module('articles').factory('Articles', [
  '$resource',
  function ($resource) {
    return $resource('articles/:articleId', { articleId: '@_id' }, { update: { method: 'PUT' } });
  }
]);'use strict';  // Configuring the Cases module
               //
'use strict';
// Setting up route
angular.module('cases').config([
  '$stateProvider',
  function ($stateProvider) {
    // Articles state routing
    $stateProvider.state('listActivity', {
      url: '/activity/:caseId',
      templateUrl: 'modules/cases/views/list-activities.client.view.html'
    }).state('newCase', {
      url: '/new/case/{caseId:(?:[^/]+)?}',
      templateUrl: 'modules/cases/views/case-form.client.view.html'
    }).state('newActivity', {
      url: '/new/activity/:caseId/{activityId:(?:[^/]+)?}',
      templateUrl: 'modules/cases/views/activity-form.client.view.html'
    }).state('invoice', {
      url: '/invoice',
      templateUrl: 'modules/cases/views/invoice.client.view.html'
    });
  }
]);'use strict';
/* global Dropbox:true */
angular.module('cases').controller('ActivityController', [
  '$scope',
  '$location',
  'Authentication',
  '$timeout',
  '$filter',
  '$stateParams',
  '$http',
  function ($scope, $location, Authentication, $timeout, $filter, $stateParams, $http) {
    // This provides Authentication context.
    $scope.authentication = Authentication;
    //If user is not signed in then redirect to signin page
    if (!$scope.authentication.user)
      return $location.path('/signin');
    if (!$scope.authentication.isDbAuthorized())
      return $location.path('/settings/accounts');
    Authentication.connectDropstore().then(function (data) {
      $scope.datastore = $scope.authentication.dropstore.datastore;
      var activityTable = $scope.datastore.getTable('activities');
      var caseTable = $scope.datastore.getTable('cases');
      $scope.caseId = $stateParams.caseId;
      // current case id        	    			
      $scope.case = caseTable.get($scope.caseId);
      $scope.activities = activityTable.query({ caseId: $scope.caseId });
      $scope.dirtyActivites = $scope.authentication.dropstore.dirtyActivites;
      // activities that are not synced            
      $scope.orderProp = 'activity_time';
      $scope.reverse = false;
      $scope.activityOrder = function (a) {
        return a.get($scope.orderProp);
      };
      $scope.downloadAct = function (action) {
        var activities = $scope.datastore.getTable('activities').query({ caseId: $scope.caseId });
        var c = $scope.datastore.getTable('cases').get($scope.caseId);
        var data = {};
        data.timezoneOffset = c.get('activity_date').getTimezoneOffset() * 60;
        data.id = c.getId();
        data.case = c.getFields();
        data.activities = [];
        angular.forEach(activities, function (act, key) {
          data.activities.push(act.getFields());
        });
        $http({
          method: 'POST',
          url: 'download.php',
          data: data,
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function (data) {
          if (data && data.success) {
            if (action && action === '1') {
              window.location.href = 'mailto:?subject=' + encodeURIComponent(data.title) + '&body=%0D%0A%0D%0A%0D%0A%0D%0A%0D%0A' + encodeURIComponent('Download from: ' + data.url);
            } else if (action && action === '2') {
              var options = {
                  files: [{
                      'url': data.url,
                      'filename': data.title + '.docx'
                    }],
                  success: function () {
                    alert('Saved!');
                  },
                  progress: function (progress) {
                  },
                  cancel: function () {
                  },
                  error: function (errorMessage) {
                    alert(errorMessage);
                  }
                };
              Dropbox.save(options);
            } else {
              //var iFrame = iElement.find("iframe");              
              //iFrame.attr("src", data.url);
              //$scope.downloadUrl = data.url;
              //window.open(data.url, "Download", "width=360,height=200,resizable=yes,location=yes");            
              window.location.href = data.url;
            }
          }
        });
      };
      $scope.$on('syncStatusChanged', function (event) {
        if (!$scope.datastore.getSyncStatus().uploading) {
          $scope.authentication.dropstore.dirtyActivites = $scope.dirtyActivites = [];
          $scope.$apply();
        }
      });
      $scope.$on('recordChanged', function (event, recordsChanged) {
        var records = recordsChanged.affectedRecordsForTable('activities'), s_ndx, curr_record;
        for (var ndx in records) {
          var record = records[ndx];
          if (record.isDeleted()) {
            for (s_ndx in $scope.activities) {
              curr_record = $scope.activities[s_ndx];
              if (curr_record.getId() === record.getId()) {
                $scope.activities.splice($scope.activities.indexOf(curr_record), 1);
                //deleted task
                break;
              }
            }
          } else {
            $scope.authentication.dropstore.dirtyActivites.push(records[ndx].getId());
            var found = false;
            //task is new or updated.
            for (s_ndx in $scope.activities) {
              curr_record = $scope.activities[s_ndx];
              if (curr_record.getId() === record.getId()) {
                $scope.activities[$scope.activities.indexOf(curr_record)] = record;
                found = true;
                //udpate task
                break;
              }
            }
            if (!found) {
              $scope.activities.push(records[ndx]);
            }
          }
        }
      });
    });
  }
]).controller('NewCaseController', [
  '$scope',
  '$location',
  'Authentication',
  '$timeout',
  '$filter',
  '$stateParams',
  '$rootScope',
  function ($scope, $location, Authentication, $timeout, $filter, $stateParams, $rootScope) {
    // This provides Authentication context.
    $scope.authentication = Authentication;
    //If user is not signed in then redirect to signin page
    if (!$scope.authentication.user)
      return $location.path('/signin');
    if (!$scope.authentication.isDbAuthorized())
      return $location.path('/settings/accounts');
    Authentication.connectDropstore().then(function (data) {
      $scope.datastore = $scope.authentication.dropstore.datastore;
      $scope.caseId = $stateParams.caseId;
      // current case id        
      if ($scope.caseId) {
        var caseTable = $scope.datastore.getTable('cases');
        $scope.case_record = caseTable.get($scope.caseId);
        $scope.case = $scope.case_record.getFields();
        $scope.case.activity_date = $filter('date')($scope.case.activity_date, 'yyyy-MM-dd');
      } else
        $scope.case = {};
      $scope.saveCase = function (c) {
        c.activity_date = new Date(c.activity_date);
        if (c.activity_date) {
          if (!angular.equals($scope.case_record.getFields(), c))
            $scope.case_record.update(c);
          $location.path('/activity/' + $scope.caseId);
        }
      };
      $scope.addCase = function (c) {
        c.activity_date = new Date(c.activity_date);
        if (c.activity_date) {
          $scope.datastore.getTable('cases').insert(c);
          $location.path('/');
        }
      };
      $scope.deleteCase = function (c) {
        var activities = $scope.datastore.getTable('activities').query({ caseId: c.getId() });
        angular.forEach(activities, function (value, key) {
          value.deleteRecord();
        });
        c.deleteRecord();
        $scope.isLoaded = false;
        $rootScope.toggle('myOverlay', 'off');
        $location.path('/');
      };
    });
  }
]).controller('NewActivityController', [
  '$scope',
  '$location',
  'Authentication',
  '$timeout',
  '$filter',
  '$stateParams',
  '$rootScope',
  function ($scope, $location, Authentication, $timeout, $filter, $stateParams, $rootScope) {
    // This provides Authentication context.
    $scope.authentication = Authentication;
    //If user is not signed in then redirect to signin page
    if (!$scope.authentication.user)
      return $location.path('/signin');
    if (!$scope.authentication.isDbAuthorized())
      return $location.path('/settings/accounts');
    Authentication.connectDropstore().then(function (data) {
      $scope.datastore = $scope.authentication.dropstore.datastore;
      $scope.caseId = $stateParams.caseId;
      // current case id                      
      $scope.activityId = $stateParams.activityId;
      // current case id                      
      $scope.case_record = $scope.datastore.getTable('cases').get($scope.caseId);
      //find the last activity time
      var activities = $scope.datastore.getTable('activities').query({ caseId: $scope.caseId });
      if (activities.length) {
        $scope.last_activity_time = $filter('orderBy')(activities, function (a) {
          return a.get('activity_time');
        }, true).shift().get('activity_time');
        $scope.last_activity_time = $filter('date')($scope.last_activity_time, 'hh:mm a');
      }
      //if updating 
      if ($scope.activityId) {
        $scope.activity_record = $scope.datastore.getTable('activities').get($scope.activityId);
        $scope.activity = $scope.activity_record.getFields();
        $scope.activity.activity_time = $filter('date')($scope.activity.activity_time, 'hh:mm a');
      } else {
        $scope.activity = {};
        $scope.activity.activity_time = $filter('date')(new Date(), 'hh:mm a');
      }
      $scope.saveActivity = function (a) {
        var matched = a.activity_time.match(/(?:(\d{1,2})(\d{2})(am|pm))|(?:(\d+):(\d+)\s*(am|pm))/i);
        if (matched) {
          matched = matched.filter(function (x) {
            return x !== undefined;
          });
        }
        if (matched && matched.length === 4) {
          var time = new Date($filter('date')($scope.case_record.get('activity_date'), 'MM/dd/yyyy') + ' ' + matched[1] + ':' + matched[2] + ' ' + matched[3]);
          if (time === 'Invalid Date') {
            alert('Invalid Time');
          } else {
            a.activity_time = time;
            if (!angular.equals($scope.activity_record.getFields(), a))
              $scope.activity_record.update(a);
            $location.path('/activity/' + $scope.caseId);
          }
        } else {
          alert('Invalid Time');
        }
      };
      $scope.addActivity = function (a) {
        var matched = a.activity_time ? a.activity_time.match(/(?:(\d{1,2})(\d{2})(am|pm))|(?:(\d+):(\d+)\s*(am|pm))/i) : '';
        if (matched) {
          matched = matched.filter(function (x) {
            return x !== undefined;
          });
        }
        if (matched && matched.length === 4) {
          var time = new Date($filter('date')($scope.case_record.get('activity_date'), 'MM/dd/yyyy') + ' ' + matched[1] + ':' + matched[2] + ' ' + matched[3]);
          if (time === 'Invalid Date') {
            alert('Invalid Time');
          } else {
            a.activity_time = time;
            a.caseId = $scope.caseId;
            $scope.datastore.getTable('activities').insert(a);
            $location.path('/activity/' + $scope.caseId);
          }
        }
      };
      $scope.deleteActivity = function (a) {
        $scope.activity_record.deleteRecord();
        $scope.isLoaded = false;
        $rootScope.toggle('myOverlay', 'off');
        $location.path('/activity/' + $scope.caseId);
      };
      $scope.$on('syncStatusChanged', function (event) {
        if (!$scope.datastore.getSyncStatus().uploading) {
          $scope.authentication.dropstore.dirtyActivites = [];
          $scope.$apply();
        }
      });
      $scope.$on('recordChanged', function (event, recordsChanged) {
        var records = recordsChanged.affectedRecordsForTable('activities');
        for (var ndx in records) {
          var record = records[ndx];
          if (record.isDeleted()) {
            void 0;
          } else {
            $scope.authentication.dropstore.dirtyActivites.push(records[ndx].getId());
          }
        }
      });
    });
  }
]).controller('InvoiceController', [
  '$scope',
  '$location',
  'Authentication',
  '$timeout',
  '$filter',
  '$stateParams',
  '$rootScope',
  '$http',
  function ($scope, $location, Authentication, $timeout, $filter, $stateParams, $rootScope, $http) {
    // This provides Authentication context.
    $scope.authentication = Authentication;
    //If user is not signed in then redirect to signin page
    if (!$scope.authentication.user)
      return $location.path('/signin');
    if (!$scope.authentication.isDbAuthorized())
      return $location.path('/settings/accounts');
    if (!$scope.authentication.dropstore.selectedCases)
      return $location.path('/');
    Authentication.connectDropstore().then(function () {
      $scope.datastore = $scope.authentication.dropstore.datastore;
      var caseIds = $scope.authentication.dropstore.selectedCases;
      var data = [];
      var activityTable = $scope.datastore.getTable('activities');
      var caseTable = $scope.datastore.getTable('cases');
      var infoTable = $scope.datastore.getTable('info');
      var totalQuantity = 0;
      //loop through selected case ids
      angular.forEach(caseIds, function (id, key) {
        var caseFields = caseTable.get(id).getFields();
        //get case
        caseFields.full_name = caseFields.first_name + ' ' + caseFields.last_name;
        caseFields.id = id;
        var actList = activityTable.query({ caseId: id });
        // get all activities for this case
        var activities = [];
        var departureTime = 0;
        var arrivalTime = 0;
        //loop through activities
        angular.forEach(actList, function (act, key) {
          var actFields = act.getFields();
          activities.push(actFields);
          if (actFields.activity_type === 'Base D')
            departureTime = actFields.activity_time.getTime();
          if (actFields.activity_type === 'Base A')
            arrivalTime = actFields.activity_time.getTime();
        });
        data.push({
          'case': caseFields,
          'quantity': (arrivalTime - departureTime) / (1000 * 60 * 60),
          'unitCost': ''
        });
      });
      $scope.subTotal = function () {
        var total = 0;
        angular.forEach($scope.invoice.items, function (item, key) {
          total += item.quantity * item.unitCost;
        });
        return total;
      };
      $scope.removeItem = function (item) {
        $scope.invoice.items.splice($scope.invoice.items.indexOf(item), 1);
      };
      $scope.addItem = function () {
        $scope.invoice.items.push({
          'case': {},
          description: '',
          activities: [],
          quantity: 1,
          unitCost: ''
        });
      };
      $scope.downloadInvoice = function () {
        $http({
          method: 'POST',
          url: 'download_invoice.php',
          data: $scope.invoice,
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function (data) {
          //console.log(data);
          if (data && data.success) {
            //$document.find('body').append(angular.element('<iframe></iframe>').attr('src',data.url).attr('class','ng-hide'));              
            window.location.href = data.url;  //window.open(data.url);            
          }
        });
      };
      var info = infoTable.query({ type: 'tlsUserProfile' });
      info = info.length ? info[0].getFields() : {};
      //var invoiceNo = parseInt(info.lastInvoiceNo)? info.lastInvoiceNo.replace(parseInt(info.lastInvoiceNo),parseInt(info.lastInvoiceNo)+1) : '';
      $scope.invoice = {
        id: caseIds.sort().toString(),
        items: data,
        date: $filter('date')(new Date(), 'MMM dd, yyyy'),
        timezoneOffset: new Date().getTimezoneOffset(),
        phone: 'Phone: ' + info.phone,
        companyName: info.companyName || '',
        address: [
          info.companyAddress1,
          info.companyAddress2,
          info.state,
          info.zip
        ].filter(function (item) {
          return item;
        }).join(', '),
        invoiceNo: '',
        invoiceBillingTerms: info.invoiceBillingTerms || '',
        paid: 0
      };
    });
  }
]);'use strict';
// Setting up route
angular.module('core').config([
  '$stateProvider',
  '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {
    // Redirect to home view when route not found
    $urlRouterProvider.otherwise('/');
    // Home state routing
    $stateProvider.state('home', {
      url: '/',
      templateUrl: 'modules/core/views/home.client.view.html'
    });
  }
]);'use strict';
angular.module('core').controller('HeaderController', [
  '$scope',
  'Authentication',
  'Menus',
  function ($scope, Authentication, Menus) {
    $scope.authentication = Authentication;
    $scope.isCollapsed = false;
    $scope.menu = Menus.getMenu('topbar');
    $scope.toggleCollapsibleMenu = function () {
      $scope.isCollapsed = !$scope.isCollapsed;
    };
    // Collapsing the menu after navigation
    $scope.$on('$stateChangeSuccess', function () {
      $scope.isCollapsed = false;
    });
  }
]);'use strict';
angular.module('core').controller('HomeController', [
  '$scope',
  '$location',
  'Authentication',
  '$timeout',
  '$filter',
  function ($scope, $location, Authentication, $timeout, $filter) {
    // This provides Authentication context.
    $scope.authentication = Authentication;
    //If user is not signed in then redirect to signin page
    if (!$scope.authentication.user)
      return $location.path('/signin');
    if (!$scope.authentication.isDbAuthorized())
      return $location.path('/settings/accounts');
    Authentication.connectDropstore().then(function (data) {
      $scope.datastore = $scope.authentication.dropstore.datastore;
      $scope.cases = $scope.datastore.getTable('cases').query();
      $scope.orderProp = 'activity_date';
      $scope.reverse = true;
      $scope.keyword = '';
      $scope.caseOrder = function (c) {
        return c.get($scope.orderProp);
      };
      $scope.caseFilter = function (c) {
        var kw = $scope.keyword.toLowerCase();
        var date = $filter('date')(c.get('activity_date'), 'MM/dd/yyyy');
        var match = c.get('client').toLowerCase().match(kw) || c.get('case_no').match(kw) || c.get('first_name').toLowerCase().match(kw) || c.get('last_name').toLowerCase().match(kw) || date.match(kw);
        return match && match.length;
      };
      //$scope.selectedCases = timelineService.getInvoiceItems(); //selected cases for invoice
      $scope.authentication.dropstore.selectedCases = $scope.selectedCases = [];
      $scope.addAllToSelection = function (event) {
        if (event.target.checked) {
          angular.forEach($scope.cases, function (val, key) {
            $scope.selectedCases.push(val.getId());
          });
        } else
          $scope.selectedCases = [];
      };
      $scope.addToSelection = function (event, caseId) {
        if ($scope.selectionMode) {
          //in selection mode enabled
          event.preventDefault();
          //prevent href 
          if ($scope.selectedCases.indexOf(caseId) > -1) {
            $scope.selectedCases.splice($scope.selectedCases.indexOf(caseId), 1);
          } else {
            $scope.selectedCases.push(caseId);
          }
        }
        console.log($scope.selectedCases);
      };
      $scope.prepareInvoice = function () {
        //timelineService.setInvoiceItems($scope.selectedCases);
        if ($scope.selectedCases.length) {
          $location.path('/invoice');
        }
      };
    });
  }
]);'use strict';
angular.module('core').controller('TopController', [
  '$scope',
  '$location',
  'Authentication',
  '$sce',
  function ($scope, $location, Authentication, $sce) {
    // This provides Authentication context.
    $scope.authentication = Authentication;
    $scope.connectionStatus = $sce.trustAsHtml('<i class="fa fa-warning text-warning"></i> Disconnected');
    $scope.$on('dropstoreAuthenticated', function (event) {
      $scope.connectionStatus = $sce.trustAsHtml('<i class="fa fa-spinner fa-spin text-warning"></i> Connecting');
    });
    $scope.$on('dropstoreConnected', function (event) {
      $scope.connectionStatus = $sce.trustAsHtml('<i class="fa fa-check-circle text-success"></i> Connected');
    });
    $scope.$on('syncStatusChanged', function () {
      $scope.datastore = $scope.authentication.dropstore.datastore;
      if ($scope.datastore.getSyncStatus().uploading) {
        $scope.connectionStatus = $sce.trustAsHtml('<i class="fa fa-spinner fa-spin text-warning"></i> Synchronizing');
      } else {
        $scope.connectionStatus = $sce.trustAsHtml('<i class="fa fa-check-circle text-success"></i> Synchronized');
      }
    });
  }
]);'use strict';
//Menu service used for managing  menus
angular.module('core').service('Menus', [function () {
    // Define a set of default roles
    this.defaultRoles = ['*'];
    // Define the menus object
    this.menus = {};
    // A private function for rendering decision 
    var shouldRender = function (user) {
      if (user) {
        if (!!~this.roles.indexOf('*')) {
          return true;
        } else {
          for (var userRoleIndex in user.roles) {
            for (var roleIndex in this.roles) {
              if (this.roles[roleIndex] === user.roles[userRoleIndex]) {
                return true;
              }
            }
          }
        }
      } else {
        return this.isPublic;
      }
      return false;
    };
    // Validate menu existance
    this.validateMenuExistance = function (menuId) {
      if (menuId && menuId.length) {
        if (this.menus[menuId]) {
          return true;
        } else {
          throw new Error('Menu does not exists');
        }
      } else {
        throw new Error('MenuId was not provided');
      }
      return false;
    };
    // Get the menu object by menu id
    this.getMenu = function (menuId) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Return the menu object
      return this.menus[menuId];
    };
    // Add new menu object by menu id
    this.addMenu = function (menuId, isPublic, roles) {
      // Create the new menu
      this.menus[menuId] = {
        isPublic: isPublic || false,
        roles: roles || this.defaultRoles,
        items: [],
        shouldRender: shouldRender
      };
      // Return the menu object
      return this.menus[menuId];
    };
    // Remove existing menu object by menu id
    this.removeMenu = function (menuId) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Return the menu object
      delete this.menus[menuId];
    };
    // Add menu item object
    this.addMenuItem = function (menuId, menuItemTitle, menuItemURL, menuItemType, menuItemUIRoute, isPublic, roles, position) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Push new menu item
      this.menus[menuId].items.push({
        title: menuItemTitle,
        link: menuItemURL,
        menuItemType: menuItemType || 'item',
        menuItemClass: menuItemType,
        uiRoute: menuItemUIRoute || '/' + menuItemURL,
        isPublic: isPublic === null || typeof isPublic === 'undefined' ? this.menus[menuId].isPublic : isPublic,
        roles: roles === null || typeof roles === 'undefined' ? this.menus[menuId].roles : roles,
        position: position || 0,
        items: [],
        shouldRender: shouldRender
      });
      // Return the menu object
      return this.menus[menuId];
    };
    // Add submenu item object
    this.addSubMenuItem = function (menuId, rootMenuItemURL, menuItemTitle, menuItemURL, menuItemUIRoute, isPublic, roles, position) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Search for menu item
      for (var itemIndex in this.menus[menuId].items) {
        if (this.menus[menuId].items[itemIndex].link === rootMenuItemURL) {
          // Push new submenu item
          this.menus[menuId].items[itemIndex].items.push({
            title: menuItemTitle,
            link: menuItemURL,
            uiRoute: menuItemUIRoute || '/' + menuItemURL,
            isPublic: isPublic === null || typeof isPublic === 'undefined' ? this.menus[menuId].items[itemIndex].isPublic : isPublic,
            roles: roles === null || typeof roles === 'undefined' ? this.menus[menuId].items[itemIndex].roles : roles,
            position: position || 0,
            shouldRender: shouldRender
          });
        }
      }
      // Return the menu object
      return this.menus[menuId];
    };
    // Remove existing menu object by menu id
    this.removeMenuItem = function (menuId, menuItemURL) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Search for menu item to remove
      for (var itemIndex in this.menus[menuId].items) {
        if (this.menus[menuId].items[itemIndex].link === menuItemURL) {
          this.menus[menuId].items.splice(itemIndex, 1);
        }
      }
      // Return the menu object
      return this.menus[menuId];
    };
    // Remove existing menu object by menu id
    this.removeSubMenuItem = function (menuId, submenuItemURL) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Search for menu item to remove
      for (var itemIndex in this.menus[menuId].items) {
        for (var subitemIndex in this.menus[menuId].items[itemIndex].items) {
          if (this.menus[menuId].items[itemIndex].items[subitemIndex].link === submenuItemURL) {
            this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
          }
        }
      }
      // Return the menu object
      return this.menus[menuId];
    };
    //Adding the topbar menu
    this.addMenu('topbar');
  }]);'use strict';
// Config HTTP Error Handling
angular.module('users').config([
  '$httpProvider',
  function ($httpProvider) {
    // Set the httpProvider "not authorized" interceptor
    $httpProvider.interceptors.push([
      '$q',
      '$location',
      'Authentication',
      function ($q, $location, Authentication) {
        return {
          responseError: function (rejection) {
            switch (rejection.status) {
            case 401:
              // Deauthenticate the global user
              Authentication.user = null;
              // Redirect to signin page
              $location.path('signin');
              break;
            case 403:
              // Add unauthorized behaviour 
              break;
            }
            return $q.reject(rejection);
          }
        };
      }
    ]);
  }
]);'use strict';
// Setting up route
angular.module('users').config([
  '$stateProvider',
  function ($stateProvider) {
    // Users state routing
    $stateProvider.state('profile', {
      url: '/settings/profile',
      templateUrl: 'modules/users/views/settings/edit-profile.client.view.html'
    }).state('password', {
      url: '/settings/password',
      templateUrl: 'modules/users/views/settings/change-password.client.view.html'
    }).state('accounts', {
      url: '/settings/accounts',
      templateUrl: 'modules/users/views/settings/social-accounts.client.view.html'
    }).state('signup', {
      url: '/signup',
      templateUrl: 'modules/users/views/authentication/signup.client.view.html'
    }).state('signin', {
      url: '/signin',
      templateUrl: 'modules/users/views/authentication/signin.client.view.html'
    }).state('forgot', {
      url: '/password/forgot',
      templateUrl: 'modules/users/views/password/forgot-password.client.view.html'
    }).state('reset-invlaid', {
      url: '/password/reset/invalid',
      templateUrl: 'modules/users/views/password/reset-password-invalid.client.view.html'
    }).state('reset-success', {
      url: '/password/reset/success',
      templateUrl: 'modules/users/views/password/reset-password-success.client.view.html'
    }).state('reset', {
      url: '/password/reset/:token',
      templateUrl: 'modules/users/views/password/reset-password.client.view.html'
    });
  }
]);'use strict';
angular.module('users').controller('AuthenticationController', [
  '$scope',
  '$http',
  '$location',
  'Authentication',
  function ($scope, $http, $location, Authentication) {
    $scope.authentication = Authentication;
    // If user is signed in then redirect back home
    if ($scope.authentication.user)
      $location.path('/');
    $scope.signup = function () {
      $http.post('/auth/signup', $scope.credentials).success(function (response) {
        // If successful we assign the response to the global user model
        $scope.authentication.user = response;
        // And redirect to the index page
        $location.path('/');
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
    $scope.signin = function () {
      $http.post('/auth/signin', $scope.credentials).success(function (response) {
        // If successful we assign the response to the global user model
        $scope.authentication.user = response;
        // And redirect to the index page
        $location.path('/');
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);'use strict';
angular.module('users').controller('PasswordController', [
  '$scope',
  '$stateParams',
  '$http',
  '$location',
  'Authentication',
  function ($scope, $stateParams, $http, $location, Authentication) {
    $scope.authentication = Authentication;
    //If user is signed in then redirect back home
    if ($scope.authentication.user)
      $location.path('/');
    // Submit forgotten password account id
    $scope.askForPasswordReset = function () {
      $scope.success = $scope.error = null;
      $http.post('/auth/forgot', $scope.credentials).success(function (response) {
        // Show user success message and clear form
        $scope.credentials = null;
        $scope.success = response.message;
      }).error(function (response) {
        // Show user error message and clear form
        $scope.credentials = null;
        $scope.error = response.message;
      });
    };
    // Change user password
    $scope.resetUserPassword = function () {
      $scope.success = $scope.error = null;
      $http.post('/auth/reset/' + $stateParams.token, $scope.passwordDetails).success(function (response) {
        // If successful show success message and clear form
        $scope.passwordDetails = null;
        // Attach user profile
        Authentication.user = response;
        // And redirect to the index page
        $location.path('/password/reset/success');
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);'use strict';
angular.module('users').controller('SettingsController', [
  '$scope',
  '$http',
  '$location',
  'Users',
  'Authentication',
  '$timeout',
  '$filter',
  '$stateParams',
  '$rootScope',
  function ($scope, $http, $location, Users, Authentication, $timeout, $filter, $stateParams, $rootScope) {
    $scope.user = Authentication.user;
    $scope.passwordDetails = {};
    // If user is not signed in then redirect back home
    if (!$scope.user)
      $location.path('/');
    Authentication.connectDropstore().then(function (data) {
      $scope.datastore = $scope.authentication.dropstore.datastore;
      var info = $scope.datastore.getTable('info').query({ type: 'tlsUserProfile' });
      $scope.userProfile = info.length ? info[0].getFields() : {
        companyName: '',
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        invoiceBillingTerms: '',
        companyAddress1: '',
        companyAddress2: '',
        companyCity: '',
        companyState: '',
        companyZip: '',
        type: 'tlsUserProfile'
      };
      $scope.userProfile = angular.extend($scope.userProfile, {
        firstName: $scope.user.firstName,
        email: $scope.user.email,
        lastName: $scope.user.lastName
      });
      // Update a user profile
      $scope.updateUserProfile = function (isValid) {
        if (isValid) {
          $scope.success = $scope.error = null;
          var user = new Users($scope.userProfile);
          user.$update(function (response) {
            $scope.success = true;
            Authentication.user = response;
            //save to dropbox
            if (info.length && !angular.equals(info[0].getFields(), $scope.userProfile)) {
              info[0].update($scope.userProfile);
            } else if (info.length === 0) {
              $scope.datastore.getTable('info').insert($scope.userProfile);
            }
          }, function (response) {
            $scope.error = response.data.message;
          });
        } else {
          $scope.submitted = true;
        }
      };
    });
    // Check if there are additional accounts 
    $scope.hasConnectedAdditionalSocialAccounts = function (provider) {
      for (var i in $scope.user.additionalProvidersData) {
        return true;
      }
      return false;
    };
    // Check if provider is already in use with current user
    $scope.isConnectedSocialAccount = function (provider) {
      return $scope.user.provider === provider || $scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider];
    };
    // Remove a user social account
    $scope.removeUserSocialAccount = function (provider) {
      $scope.success = $scope.error = null;
      $http.delete('/users/accounts', { params: { provider: provider } }).success(function (response) {
        // If successful show success message and clear form
        $scope.success = true;
        $scope.user = Authentication.user = response;
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
    // Change user password		
    $scope.changeUserPassword = function () {
      $scope.success = $scope.error = null;
      $http.post('/users/password', $scope.passwordDetails).success(function (response) {
        // If successful show success message and clear form
        $scope.success = true;
        $scope.passwordDetails = null;
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);'use strict';
/* global Dropbox:true */
// Authentication service for user variables
angular.module('users').factory('Authentication', [
  'dropstoreClient',
  '$rootScope',
  '$window',
  '$q',
  function (dropstoreClient, $rootScope, $window, $q) {
    var _this = this;
    _this._data = {
      user: window.user,
      dropstore: {}
    };
    _this._data.isDbAuthorized = function () {
      //check if user has authorized dropbox
      if (_this._data.user && _this._data.user.additionalProvidersData && _this._data.user.additionalProvidersData.dropbox) {
        var accessToken = _this._data.user.additionalProvidersData.dropbox.accessToken;
        return accessToken;
      }
    };
    _this._data.connectDropstore = function () {
      //return if already connected
      if (_this._data.dropstore.datastore)
        return _this._data.dropstore.c;
      //lets connect to dropstore service			
      var _datastoreManager;
      var client = new Dropbox.Client({
          key: $window.dropboxAppId,
          token: _this._data.isDbAuthorized()
        });
      var c = dropstoreClient.create(client).authenticate({ interactive: false }).then(function (datastoreManager) {
          $rootScope.$broadcast('dropstoreAuthenticated');
          _datastoreManager = datastoreManager;
          return datastoreManager.openDefaultDatastore();
        }).then(function (datastore) {
          _this._data.dropstore.datastore = datastore;
          _this._data.dropstore.dirtyActivites = [];
          // activities that are not synced            
          _this._data.dropstore.datastoreManager = _datastoreManager;
          /*============== Add broadcast events ===============*/
          //0.
          $rootScope.$broadcast('dropstoreConnected');
          //1.
          $window.onbeforeunload = function (e) {
            if (datastore && datastore.getSyncStatus().uploading) {
              return 'You have pending changes that haven\'t been synchronized to the server.';
            }
          };
          //2.
          _datastoreManager.SubscribeRecordsChanged(function (records) {
            $rootScope.$broadcast('recordChanged', records);
          });
          //3.
          _datastoreManager.SubscribeSyncStatusChanged(function () {
            $rootScope.$broadcast('syncStatusChanged');
          });  //document.getElementById('status').innerHTML = '<i class="fa fa-info-circle text-success"></i> Connected';	       	        
        }).catch(function (err) {
          /*if(err instanceof Dropbox.AuthError){
	          
	        }*/
          //dropstoreClient._client.reset();
          //$rootScope.$broadcast('loggedOut');
          alert(err.toString());
        });
      _this._data.dropstore.c = c;
      return c;
    };
    return _this._data;
  }
]);'use strict';
angular.module('users').factory('dropstoreClient', [
  '$q',
  'dropstoreDatastoreManager',
  function ($q, dropstoreDatastoreManager) {
    var dropstoreServices = {};
    dropstoreServices.create = function (client) {
      dropstoreServices._client = client;
      return dropstoreServices;
    };
    dropstoreServices.authenticate = function (options) {
      var deferred = $q.defer();
      dropstoreServices._client.authenticate(options, function (err, res) {
        if (err) {
          deferred.reject(err);
        } else if (dropstoreServices._client.isAuthenticated()) {
          deferred.resolve(dropstoreDatastoreManager(res));
        }
      });
      return deferred.promise;
    };
    return dropstoreServices;
  }
]).factory('dropstoreDatastoreManager', [
  '$q',
  function ($q) {
    return function (_client) {
      var dropstoreDatastoreManagerService = {};
      dropstoreDatastoreManagerService._client = _client;
      dropstoreDatastoreManagerService._datastoreManager = dropstoreDatastoreManagerService._client.getDatastoreManager();
      dropstoreDatastoreManagerService.openDefaultDatastore = function () {
        var deferred = $q.defer();
        dropstoreDatastoreManagerService._datastoreManager.openDefaultDatastore(function (err, datastore) {
          if (err)
            deferred.reject(err);
          else {
            dropstoreDatastoreManagerService._datastore = datastore;
            deferred.resolve(datastore);
          }
        });
        return deferred.promise;
      };
      dropstoreDatastoreManagerService.SubscribeRecordsChanged = function (callback) {
        dropstoreDatastoreManagerService._datastore.recordsChanged.addListener(callback);
        return callback;
      };
      dropstoreDatastoreManagerService.SubscribeSyncStatusChanged = function (callback) {
        dropstoreDatastoreManagerService._datastore.syncStatusChanged.addListener(callback);
        return callback;
      };
      dropstoreDatastoreManagerService.signOut = function (options, callback) {
        dropstoreDatastoreManagerService._client.signOut(options, function (err) {
          return callback(err);
        });
      };
      return dropstoreDatastoreManagerService;
    };
  }
]).directive('focusAndSelect', function ($timeout) {
  return {
    restrict: 'A',
    link: function (scope, element, attr) {
      (function (e) {
        $timeout(function () {
          e[0].select();
        }, 200);
      }(element));
    }
  };
}).directive('ngReallyClick', [function () {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        element.bind('click', function () {
          var message = attrs.ngReallyMessage;
          if (message && confirm(message)) {
            scope.$apply(attrs.ngReallyClick);
          }
        });
      }
    };
  }]).directive('syncFocusWith', function ($timeout) {
  return function (scope, elem, attrs) {
    scope.$watch(attrs.syncFocusWith, function () {
      elem[0].focus();
    });
  };
});'use strict';
// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', [
  '$resource',
  function ($resource) {
    return $resource('users', {}, { update: { method: 'PUT' } });
  }
]);
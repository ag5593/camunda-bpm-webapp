'use strict';

var fs = require('fs');

var template = fs.readFileSync(__dirname + '/users.html', 'utf8');
var searchConfig = JSON.parse(fs.readFileSync(__dirname + '/users-search-plugin-config.json', 'utf8'));

var angular = require('camunda-commons-ui/vendor/angular');

var Controller = ['$scope', '$location', 'search', 'UserResource', 'page', function($scope, $location, search, UserResource, pageService) {

  $scope.searchConfig = angular.copy(searchConfig);
  $scope.onSearchChange = updateView;

  function updateView(query, pages) {
    var page = pages.current,
        count = pages.size,
        firstResult = (page - 1) * count;

    var pagingParams = {
      firstResult: firstResult,
      maxResults: count
    };

    var params = angular.extend({}, query, pagingParams);

    $scope.userList = null;
    $scope.loadingState = 'LOADING';

    return UserResource.count(query).$promise.then(function(data) {
      var total = data.count;

      return UserResource.query(params).$promise.then(function(data) {
        $scope.userList = data;
        $scope.loadingState = data.length ? 'LOADED' : 'EMPTY';

        return total;
      });
    });
  }

  $scope.availableOperations = {};
  UserResource.OPTIONS().$promise.then(function(response) {
    angular.forEach(response.links, function(link) {
      $scope.availableOperations[link.rel] = true;
    });
  });

  $scope.$root.showBreadcrumbs = true;

  pageService.titleSet('Users');

  pageService.breadcrumbsClear();

  pageService.breadcrumbsAdd({
    label: 'Users',
    href: '#/users/'
  });
}];

module.exports = [ '$routeProvider', function($routeProvider) {
  $routeProvider.when('/users', {
    template: template,
    controller: Controller,
    authentication: 'required',
    reloadOnSearch: false
  });
}];

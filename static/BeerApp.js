var app = angular.module('e-commerce', ['ui.router', 'ngCookies']);

app.factory("Commerce_api", function factoryFunction($http, $cookies, $rootScope){
  var service = {};
  service.displayBeer = function(name){
    return $http({
      url: '/beer/' + name
    });
  };
});

app.controller('HomeController', function($scope, Commerce_api, $cookies, $rootScope){
  $scope.name = 'Budweiser';
    Commerce_api.displayBeer($scope.name).success(function(results){
      $scope.results = results;
      console.log("Here", $scope.results);
    });
});

app.config(function($stateProvider, $urlRouterProvider){
  $stateProvider
    .state({
      name : 'home',
      url : '/home',
      templateUrl: 'index.html',
      controller: 'HomeController'
  });
});

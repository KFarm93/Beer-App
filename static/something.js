var app = angular.module('BeerApp', ['ui.router', 'ngCookies']);

app.factory("BeerAPI", function factoryFunction($http, $cookies, $rootScope){
  var service = {};
  $cookies.put('page_count', 0);
  $cookies.put('beer_page_count', 0);
  service.displayBeer = function(page_num){
    return $http({
      url: '/beer/' + page_num
    });
  };

  service.displayBreweries = function(page_num){
    return $http({
      url: '/breweries/' + page_num
    });
  };

  return service;
});

app.controller('BeerController', function($scope, BeerAPI, $cookies, $rootScope, $stateParams){
  $scope.beerSearch = function() {
    var beer_page_count = $cookies.get('beer_page_count');
    if (beer_page_count === 0) {
      $cookies.put('beer_page_num', 1);
    }
    else if (beer_page_count > 0) {
      $cookies.put('beer_page_num', $scope.beer_page_num);
    }
      BeerAPI.displayBeer($cookies.get('beer_page_num')).success(function(results){
        $scope.results = results.data;
        $cookies.put('beer_page_count', 1);
      });
  };
  $scope.beerSearch($scope.beer_page_num);
});

app.controller('BreweryController', function($scope, BeerAPI, $cookies, $rootScope, $stateParams){

    $scope.brewerySearch = function() {
      var page_count = $cookies.get('page_count');
      if (page_count === 0) {
        $cookies.put('page_num', 1);
      }
      else if (page_count > 0) {
        $cookies.put('page_num', $scope.page_num);
      }

      BeerAPI.displayBreweries($cookies.get('page_num')).success(function(results){
        $scope.results = results.data;
        $cookies.put('page_count', 1);
      });
    };
    $scope.brewerySearch($scope.page_num);
});

app.config(function($stateProvider, $urlRouterProvider){
  $stateProvider
    .state({
      name : 'home',
      url : '/home',
      templateUrl: 'frontpage.html',
      controller: 'HomeController'
    })
    .state({
      name: 'breweries',
      url: '/breweries',
      templateUrl: 'breweries.html',
      controller: 'BreweryController'
    })
    .state({
      name: 'beers',
      url: '/beers',
      templateUrl: 'beers.html',
      controller: 'BeerController'
    })
    .state({
      name: 'beer',
      url: '/beer',
      template: 'beer.html',
      controller: 'BeerController'
    });
});

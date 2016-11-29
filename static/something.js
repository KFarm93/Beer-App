var app = angular.module('BeerApp', ['ui.router', 'ngCookies']);

app.factory("BeerAPI", function factoryFunction($http, $cookies, $rootScope){
  var service = {};
  $cookies.put('page_count', 0);
  $cookies.put('beer_page_count', 0);
  service.displayBeers = function(page_num){
    return $http({
      url: '/beers/' + page_num
    });
  };

  service.displayBreweries = function(page_num){
    return $http({
      url: '/breweries/' + page_num
    });
  };

  service.displayBeer = function(beer_name) {
    return $http({
      url: '/beer/' + beer_name
    });
  };
  return service;
});

app.controller('BeersController', function($scope, BeerAPI, $cookies, $rootScope, $stateParams){
  $scope.beerSearch = function() {
    var beer_page_count = $cookies.get('beer_page_count');
    if (beer_page_count === 0) {
      $cookies.put('beer_page_num', 1);
    }
    else if (beer_page_count > 0) {
      $cookies.put('beer_page_num', $scope.beer_page_num);
    }
      BeerAPI.displayBeers($cookies.get('beer_page_num')).success(function(results){
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

app.controller('BeerController', function($scope, BeerAPI, $cookies, $rootScope, $stateParams) {
    var beer_name = $stateParams.beer_name;
    console.log($stateParams.beer_name);
    BeerAPI.displayBeer(beer_name).success(function(results) {
      $scope.results = results;
      console.log($scope.results);
    });
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
      controller: 'BeersController'
    })
    .state({
      name: 'beer',
      url: '/beer/{beer_name}',
      templateUrl: 'beer.html',
      controller: 'BeerController'
    });
});

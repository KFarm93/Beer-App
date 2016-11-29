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

  service.displayResults = function(search_term) {
    return $http({
      url: '/beer/' + search_term
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

app.controller('SearchController', function($scope, BeerAPI, $cookies, $rootScope, $stateParams) {
    $scope.search_term = $stateParams.search_term;
    console.log($scope.search_term);
    BeerAPI.displayResults($scope.search_term).success(function(results) {
      $scope.results = results.data;
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
      name: 'results',
      url: '/search/{search_term}',
      templateUrl: 'results.html',
      controller: 'SearchController'
    });
});

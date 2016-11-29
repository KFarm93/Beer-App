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
      url: '/search/' + search_term
    });
  };
  service.signUp = function(userInfo) {
   var url = '/user/signup';
     return $http({
       method: 'POST',
       url: url,
       data: userInfo
     });
  };

  service.userLogin = function(username, password) {
     return $http ({
       url: '/user/login',
       method: "POST",
       data: {
         username: username,
         password: password
       }
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

app.controller('SignUpController', function($scope, $state, BeerAPI, $rootScope) {
 $scope.submit = function() {
   var userInfo = {
     'username': $scope.username,
     'email': $scope.email,
     'first_name': $scope.firstname,
     'last_name': $scope.lastname,
     'password': $scope.pass1,
     'password2': $scope.pass2
   };
   console.log('check1');
   BeerAPI.signUp(userInfo).success(function() {
     console.log(userInfo);
     console.log('got to signUp service');
     $state.go('home');
   });
 };
});

app.controller('LoginController', function($scope, BeerAPI, $state, $cookies, $rootScope){
  $scope.submitEnterSite = function() {
   BeerAPI.userLogin($scope.username, $scope.pass1).success(function(response) {
     console.log('in userlogin factoryFunction');
     $scope.loginFail = false;
     $cookies.put('token', response.auth_token.token);
     $cookies.put('customer_id', response.user.id);
     $cookies.put('username', response.user.username);

     $rootScope.logState = true;
     $rootScope.user_name = $cookies.get('username');
     var redirect_to_prod = $cookies.getObject('redirect');

     if (redirect_to_prod) {
       $state.go('individual_product', {'product_id': $cookies.get('product_id')});
       // $cookies.remove('product_id');
       $cookies.putObject('redirect', false);
     }
     else {
       $state.go('home');
     }

   }).error(function(){
     console.log('failed');
     $scope.loginFail = true;
   });

 };
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
    })
    .state({
      name : 'signup',
      url : '/user/signup',
      templateUrl : 'signup.html',
      controller : 'SignUpController'
    })
    .state({
      name : 'login',
      url : '/user/login',
      templateUrl: 'login.html',
      controller: 'LoginController'
    });
});

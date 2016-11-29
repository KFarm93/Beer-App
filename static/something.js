var app = angular.module('BeerApp', ['ui.router', 'ngCookies']);

app.factory("BeerAPI", function factoryFunction($http, $cookies, $rootScope){
  var service = {};

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
  // service.getDetails = function(id, type, name) {
  //   return $http ({
  //     url : '/ind_result',
  //     params: {
  //       id: id,
  //       type: type,
  //       name: name
  //     }
  //   });
  // };
  return service;
});

app.service('productDetails', function() {
  var productData = {};
  this.saveData = function(data) {
    this.productData = data;
  };
  this.getData = function(){
    return this.productData;
  };
});

// Test controller
app.controller('BeersController', function($scope, BeerAPI, $cookies, $rootScope, $stateParams, productDetails, $state){
  $scope.beerSearch = function() {
      BeerAPI.displayBeers($scope.beer_page_num).success(function(results){
        $scope.results = results.data;
        $cookies.put('beer_page_num', $scope.beer_page_num);
        $scope.getBeerDetails = function(result) {
            productDetails.saveData({
              object: result
            });
          $state.go('details');
        };
      });
  };
  $scope.beerSearch($cookies.get('beer_page_num'));
});

app.controller('BreweryController', function($scope, BeerAPI, $cookies, $rootScope, $stateParams, productDetails, $state){

    $scope.brewerySearch = function() {
      BeerAPI.displayBreweries($scope.page_num).success(function(results){
        $scope.results = results.data;
        $cookies.put('page_num', $scope.page_num);
        $scope.getBeerDetails = function(result) {
            productDetails.saveData({
              object: result
            });
          $state.go('details');
        };
      });
    };
    $scope.brewerySearch($cookies.get('page_num'));
});

app.controller('SearchController', function($scope, BeerAPI, $cookies, $rootScope, $stateParams, $state, productDetails) {
    $scope.search_term = $stateParams.search_term;
    console.log($scope.search_term);
    BeerAPI.displayResults($scope.search_term).success(function(results) {
      console.log(results);
      $scope.results = results.data;
      $scope.getBeerDetails = function(result) {
          productDetails.saveData({
            object: result
          });
        $state.go('details');
      };
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

app.controller('BeerDetailsController', function($scope, BeerAPI, $state, $stateParams, productDetails) {
  var data = productDetails.getData();
  $scope.details = data.object;
  console.log($scope.details);
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
    })
    .state({
      name : 'details',
      url : '/details',
      templateUrl: 'details.html',
      controller: 'BeerDetailsController'
  });
});

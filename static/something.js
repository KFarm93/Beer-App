var app = angular.module('BeerApp', ['ui.router', 'ngCookies']);

// app.run(function($rootScope, $cookies, $state) {
//
// });

app.factory("BeerAPI", function factoryFunction($http, $cookies, $rootScope, $state, productDetails){
  $rootScope.user_name = $cookies.get('username');
  if ($rootScope.user_name) {
    $rootScope.logState = true;
  }


  $rootScope.searchFunction = function(searched, filter) {
    if (filter === "both") {
    $state.go('results', {search_term: searched});
    }
    else if (filter === "beers") {
      $state.go('beerResults', {search_term: searched});
    }
    else {
      $state.go('breweryResults', {search_term: searched});
    }
  };

  $rootScope.logOut = function() {
    $cookies.remove('username');
    $cookies.remove('users_id');
    $cookies.remove('token');
    $rootScope.user_name = '';
    $rootScope.logState = false;
    $state.go('home');
  };

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
      url: '/search/both/' + search_term
    });
  };

  service.displayBeerResults = function(search_term) {
    return $http({
      url: '/search/beers/' + search_term
    });
  };

  service.displayBreweriesResults = function(search_term) {
    return $http({
      url: '/search/breweries/' + search_term
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

   service.cellar = function(details, user_id){
     return $http({
       url : '/user/cellar',
       method : "POST",
       data : {
         details: details,
         user_id: user_id
       }
     });
   };

   service.users = function() {
     console.log('check');
     return $http({
       url: '/members'
      //  method: 'GET',
     })
   }

  return service;
});

app.service('productDetails', function($rootScope, $cookies) {
  var productData = {};
  this.saveData = function(data) {
    this.productData = data;

    if (data.object.type === 'brewery') {
      $cookies.putObject('beer', data.object);
    }

    else {
      if (data.object.breweries) {
        $cookies.putObject('brewery', data.object.breweries);
      }
      data.object.breweries[0] = undefined;
      if (!data.object.labels) {
        data.object.labels = {large: 'iStock_beer.jpg'};
        $cookies.putObject('beer', data.object);
      }

      if (!data.object.description) {
        data.object.description = 'Sorry, no description available.';
      }
      $cookies.putObject('beer', data.object);
    }

  };
  this.getData = function(){
    return this.productData;
  };
});

// Test controller

app.controller('HomeController', function($scope, BeerAPI, $cookies, $rootScope){
  //  $scope.name = 'Budweiser';
  //    BeerAPI.displayBeer($scope.name).success(function(results){
  //      $scope.results = results;
  //      console.log("Here", $scope.results);
  //    });

 });

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
    if ($scope.filter === "both") {
      BeerAPI.displayResults($scope.search_term).success(function(results) {
      $scope.results = results.data;
      $scope.getBeerDetails = function(result) {
          productDetails.saveData({
            object: result
          });
        $state.go('details');
      };
    });
  }
  else if ($scope.filter === "beers") {
    BeerAPI.displayBeerResults($scope.search_term).success(function(results) {
    $scope.results = results.data;
    $scope.getBeerDetails = function(result) {
        productDetails.saveData({
          object: result
        });
      $state.go('details');
    };
  });
}
  else {
    BeerAPI.displayBreweriesResults($scope.search_term).success(function(results) {
    $scope.results = results.data;
    $scope.getBeerDetails = function(result) {
        productDetails.saveData({
          object: result
        });
      $state.go('details');
    };
  });
  }
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
   BeerAPI.signUp(userInfo).success(function() {
     $state.go('home');
   });
 };
});

app.controller('LoginController', function($scope, BeerAPI, $state, $cookies, $rootScope){
  $scope.loginFail = false;
  $scope.submitEnterSite = function() {
   BeerAPI.userLogin($scope.username, $scope.pass1).success(function(response) {
     $scope.loginFail = false;
     $cookies.put('token', response.auth_token.token);
     $cookies.put('users_id', response.users.id);
     $cookies.put('username', response.users.username);
     $rootScope.logState = true;
     $rootScope.user_name = $cookies.get('username');
     $state.go('home');


   }).error(function(){
     $scope.username = '';
     $scope.pass1 = '';
     $scope.loginFail = true;
   });
 };
});

app.controller('BeerDetailsController', function($scope, BeerAPI, $state, $stateParams, productDetails, $rootScope, $cookies) {
  $scope.details = $cookies.getObject('beer');
  $scope.brewery = $cookies.getObject('brewery');
  $scope.finalObject = $cookies.getObject('beer');
  $scope.finalObject.breweries = $scope.brewery;
  $scope.cellar = function(){
    BeerAPI.cellar($scope.finalObject, $cookies.get('users_id')).success(function() {
    });
  };
});

app.controller('UsersController', function($scope, BeerAPI, $state, $stateParams, productDetails, $rootScope, $cookies) {
  BeerAPI.users().success(function(results) {
    console.log(results);
    $scope.users = results;
  })
  $scope.userDetails = function() {
    console.log("click check");

  }
})

app.config(function($stateProvider, $urlRouterProvider){
  $stateProvider
    .state({
      name : 'home',
      url : '/home',
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
      url: '/search/both/{search_term}',
      templateUrl: 'results.html',
      controller: 'SearchController'
    })
    .state({
      name: 'breweryResults',
      url: '/search/breweries/{search_term}',
      templateUrl: 'results.html',
      controller: 'SearchController'
    })
    .state({
      name: 'beerResults',
      url: '/search/beers/{search_term}',
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
      name :'users',
      url :'/members',
      templateUrl: 'users.html',
      controller : 'UsersController'
    })
    .state({
      name : 'details',
      url : '/details',
      templateUrl: 'details.html',
      controller: 'BeerDetailsController'
  });
});

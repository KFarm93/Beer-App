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
     console.log(details);
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
    });
  };

    service.userBeers = function(user_id) {
      console.log(user_id);
      return $http({
        url: '/user/beer/' + user_id
      });
    };

    service.justGiveMeTheShitIWant = function(user_id) {
      return $http({
        url: '/user/beerIDandName/' + user_id
      });
    };

    service.trade = function(user_id_one, user_id_two, beer_user_one, beer_user_two) {
      return $http({
        url: '/user/trade',
        method: 'POST',
        data: {
          user_id_one: user_id_one,
          user_id_two: user_id_two,
          beer_user_one: beer_user_one,
          beer_user_two: beer_user_two
        }
      });
    };

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
        console.log(data.object.breweries);
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

app.controller('UserProfController', function($scope, BeerAPI, $cookies, $state) {
  BeerAPI.userBeers($cookies.get('users_id')).success(function(results) {
    $scope.userCellar = results;
    $scope.getBeerDetails = function(result) {
      $cookies.putObject('beer', result);
      $state.go('detailsFromCellar');
    };
  });
});

app.controller('BeerDetailsController', function($scope, BeerAPI, $state, $stateParams, productDetails, $rootScope, $cookies) {
  $scope.details = $cookies.getObject('beer');
  $scope.brewery = $cookies.getObject('brewery');
  $scope.finalObject = $cookies.getObject('beer');
  $scope.finalObject.breweries = $scope.brewery;
  $scope.cellar = function(){
    // if ($cookies.get('checkCellarCookie')) {
    //   alert('You already have this beer in your cellar.');
    // }
    // else {
    //   $cookies.put('checkCellarCookie');
    //   BeerAPI.cellar($scope.finalObject, $cookies.get('users_id')).success(function() {
    //   });
    //   $rootScope.beerAdded = true;
    // }
    //
    // console.log($scope.finalObject);

    if ($cookies.get('checkCellarCookie') === $scope.finalObject) {
      alert('You already have this beer in your cellar.');
    }
    else {
      $cookies.put('checkCellarCookie', $scope.finalObject);
      BeerAPI.cellar($scope.finalObject, $cookies.get('users_id')).success(function() {
      });
    }
  };
});

app.controller('UsersController', function($scope, BeerAPI, $state, $stateParams, productDetails, $rootScope, $cookies) {
  BeerAPI.users().success(function(results) {
    $scope.users = results;
  });
  $scope.userDetails = function(user) {
    $cookies.putObject('user', user);
    $state.go('userDetails');

  };
});

app.controller('UserDetailsController', function($scope, BeerAPI, $state, $cookies, productDetails) {
  $scope.user = $cookies.getObject('user');
  BeerAPI.userBeers($scope.user.id).success(function(results) {
    $scope.results = results;
    console.log("not in beerDetails: ", $scope.result);
    $scope.returnBeers = true;
    $scope.getBeerDetails = function(result) {
      $cookies.putObject('beer', result);
      $state.go('detailsFromCellar');
    };
    if ($scope.results === "This user doesn't have any beer in their cellar. :(") {
      $scope.returnBeers = false;
    }
  });

  $scope.tradeBeer = function(result) {
    $cookies.putObject('beerTrade', result);
    $cookies.put('user_id_two', $scope.user.id);
    $state.go('trade');
  };
});

app.controller('DetailsFromCellarController', function($scope, $cookies, $state) {
  $scope.deets = $cookies.getObject('beer');

  $scope.cellar = function() {
    $state.go('userDetails');
  };
});

app.controller('TradeController', function($scope, $cookies, BeerAPI) {
  console.log($cookies.get('users_id'));
  console.log($cookies.getObject('beerTrade'));
  $scope.beer_user_two = $cookies.getObject('beerTrade');
  console.log($cookies.get('user_id_two'));
  BeerAPI.justGiveMeTheShitIWant($cookies.get('users_id')).success(function(results) {
    $scope.user_one_beercellar = results;
  });

  $scope.user_id_one = $cookies.get('users_id');
  $scope.user_id_two = $cookies.get('user_id_two');

  $scope.initiateTrade = function() {
    BeerAPI.trade($scope.user_id_one, $scope.user_id_two, $scope.beer_user_one, $scope.beer_user_two.beer_id).success(function(results) {
      console.log(results);
    });
  };
});

app.config(function($stateProvider, $urlRouterProvider){
  $stateProvider
    .state({
      name: 'home',
      url: '/home',
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
      name: 'signup',
      url: '/user/signup',
      templateUrl: 'signup.html',
      controller: 'SignUpController'
    })
    .state({
      name: 'login',
      url: '/user/login',
      templateUrl: 'login.html',
      controller: 'LoginController'
    })
    .state({
      name: 'user_profile',
      url: '/user/profile',
      templateUrl: 'user_profile.html',
      controller: 'UserProfController'
    })
    .state({
      name:'users',
      url:'/members',
      templateUrl: 'users.html',
      controller: 'UsersController'
    })
    .state({
      name: 'details',
      url: '/details',
      templateUrl: 'details.html',
      controller: 'BeerDetailsController'
  })
    .state({
      name: 'userDetails',
      url: '/user/details',
      templateUrl: 'profile.html',
      controller: 'UserDetailsController'
    })
    .state({
      name: 'detailsFromCellar',
      url: '/cellar/details',
      templateUrl: 'details-from-cellar.html',
      controller: 'DetailsFromCellarController'
    })
    .state({
      name: 'trade',
      url: '/trade/',
      templateUrl: 'trade.html',
      controller: 'TradeController'
    });
});

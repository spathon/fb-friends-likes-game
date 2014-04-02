

var app = angular.module('knowYourFriends', [
  'ngRoute',
  'facebook',
  'knowYourFriends.game',
  'knowYourFriends.socket'
]);


app.config(['FacebookProvider', function(FacebookProvider) {
     FacebookProvider.init('461616480550980');
}]);


// Routes
app.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', {templateUrl: 'partial/home', controller: 'HomeCtrl'});
  $routeProvider.when('/play', {templateUrl: 'partial/play', controller: 'PlayCtrl'});
  $routeProvider.when('/stats', {templateUrl: 'partial/stats', controller: 'StatsCtrl'});
  $routeProvider.otherwise({redirectTo: '/'});
}]);

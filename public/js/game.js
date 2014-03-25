
var game = angular.module('knowYourFriends.game', []).
  factory('Game', function ($q, $rootScope, Facebook){
    return {
      _friends: false,
      friends: function(){
        var q = $q.defer();
        if(this._friends){
          q.resolve(this._friends);
        }else{
          var self = this;
          FB.api('/me/friends', function(res){
            self._friends = res;
            q.resolve(res);
          });
        }
        return q.promise;
      },
      likes: function(user){
        var q = $q.defer();
        var self = this;
        FB.api('/'+ user.id +'/likes', { limit: 100 }, function(res){
          q.resolve(res);
        });
        return q.promise;
      }
    }
  });


game.factory('GameData', function (){
    return {
      friends: {}
    };
  });



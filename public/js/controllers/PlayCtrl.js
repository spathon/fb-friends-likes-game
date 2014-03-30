// TODO: handle errors in callbacks and FB responses

function PlayCtrl($scope, $rootScope, Facebook, $location, Game, $q, $timeout, socket){

  // Check login status
  Facebook.getLoginStatus(function(response) {
    socket.emit('FB', response);
    if(response.status == 'connected') {
      // Start the game
      $scope.me();
      $scope.start();
    }
    else {
      // Redirect to startpage if not logged in
      $location.path('/');
    }
  });

  $scope.loadMsg = 'Loading...';
  $rootScope.modalMsg = false;

  $scope.start = function() {

    // Reset the view
    $scope.final_like = false;
    $scope.final_friends = [{},{}];

    // Get friends
    $scope.loadMsg = 'Gathering friends...';
    Game.getFriends().then(function(resp){

      console.log('Init..');
      Game.friends = [];

      var friends_count = resp.data.length;

      Game.all_friends = resp.data;
      // retrive random friend index
      var friend_one_index = _.random(0, friends_count-1),
          friend_two_index = _.random(0, friends_count-1);

      // Prevent both friends to be the same person
      while(friend_one_index == friend_two_index){
        friend_two_index = _.random(0, friends_count-1);
      }
      Game.friends.push(Game.all_friends[friend_one_index]);
      Game.friends.push(Game.all_friends[friend_two_index]);

      // Show status message
      $scope.loadMsg = friends_count +' friends gathered. Selecting 2 random friends...';

      // Gather likes
      var likes = $scope.getALike();
    });
  };

  $scope.getALike = function(){

    // Get the users likes (promise)
    var friend_one_likes_promise = Game.likes(Game.friends[0]),
        friend_two_likes_promise = Game.likes(Game.friends[1]);

    // Wait for the likes to load
    $q.all([friend_one_likes_promise, friend_two_likes_promise]).then(function(res) {

      // If any like request is undefined retart
      if(_.isUndefined(res[0].data) || _.isUndefined(res[1].data)){
        $scope.start();
        return;
      }

      // Set the likes on the friend variable
      Game.friends[0].likes = res[0].data;
      Game.friends[1].likes = res[1].data;

      console.log(Game.friends[0].name, Game.friends[0].likes.length);
      console.log(Game.friends[1].name, Game.friends[1].likes.length);

      // If one of them don't have any likes start over
      // TODO: think if one have 0 use it anyway
      if(Game.friends[0].likes.length == 0 || Game.friends[1].likes.length == 0){
        return $scope.start();
      }

      $scope.loadMsg = 'Trying to figure out if one of them likes somthing the other don\'t.';

      // Find one unique like
      $scope.findOneUniqueLike();
    });
  };


  $scope.findOneUniqueLike = function(){

    // get one of the user on random to be correct
    $scope.correct = _.random(0,1);
    $scope.wrong = ($scope.correct === 1) ? 0 : 1;
    var likes = Game.friends[$scope.correct].likes,
        opposite_likes = Game.friends[$scope.wrong].likes;

    $scope.the_like = false; // The unique like to show

    //console.log('Init', likes.length);
    //console.log('Likes: ', likes, opposite_likes);
    while(!$scope.the_like){

      // If no like was unique restart
      if(!likes.length) {
        $scope.start();
        break;
      }

      // Get a random like
      var random_like_index = _.random(0,likes.length -1);
          random_like = likes[random_like_index];

      // Remove the like from the like array
      likes = _.without(likes, random_like);
      //console.log('Num:', likes.length);

      // Check if the like exist in the other friends like list
      alsoLiked = _.find(opposite_likes, function(obj){ return ( obj.id == random_like.id ); });
      //console.log('Also: ', alsoLiked);

      // if it's a match set it and exit the loop
      if(!alsoLiked){
        $scope.the_like = random_like;
      }
    }

    // If no like was found
    if(!$scope.the_like){
      $scope.start();
    }else{
      $timeout($scope.letsPlay, 100, true);
    }

  }

  $scope.letsPlay = function(){
    console.log('The like: ', $scope.the_like);
    // console.log('Friends: ', Game.friends);

    $scope.final_like = $scope.the_like;
    $scope.final_friends = Game.friends;
  };



  $scope.guess = function(value){

    socket.emit('guess', {
      user: $scope.user,
      friends: $scope.final_friends,
      like: $scope.final_like,
      correct: $scope.correct,
      answer: value
    });


    if($scope.correct == value){
      $rootScope.modalMsg = { type: 'right', msg: 'Yay, correct!' };

      // update the right count
      $scope.guesses.right++;
    }else{
      $rootScope.modalMsg = { type: 'wrong', msg: 'To bad, wrong answer!' };
    }

    // Update the total count
    $scope.guesses.total++;

    $scope.start();

    $timeout(function(){
      $rootScope.modalMsg = false;
    }, 1000, true);
  };


  $scope.me = function(){
    Facebook.api('/me', function(response) {
      $scope.$apply(function() {
        // Here you could re-check for user status (just in case)
        $scope.user = response;
      });
    });
  }

}

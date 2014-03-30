

function HomeCtrl($scope, Facebook, $location){
  console.log('Yay');

  // Has the login button been pressed?
  $scope.isLoggingIn = false;

  // Here, usually you should watch for when Facebook is ready and loaded
  $scope.$watch(function() {
    return Facebook.isReady(); // This is for convenience, to notify if Facebook is loaded and ready to go.
  }, function(newVal) {
    $scope.facebookReady = true; // You might want to use this to disable/show/hide buttons and else
  });

  // Try to login the user to facebook
  $scope.login = function(){
    if($scope.isLoggingIn) return false;

    $scope.isLoggingIn = true;
    console.log('Click, login...');
    Facebook.login(function(response){
      if (response.authResponse) {
        console.log('Welcome! Lets play.... ');

        // on login go to play
        $location.path( "/play" );
      } else {
        $scope.isLoggingIn = false;
        console.log('User cancelled login or did not fully authorize.');
      }
    }, {scope: 'email,user_likes,friends_likes,publish_actions'});
  };

}

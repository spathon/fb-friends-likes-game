

function MainCtrl($scope, socket){

  $scope.guesses = {};
  $scope.guesses.total = 0;
  $scope.guesses.right = 0;

  socket.on('guesses', function (data){
    $scope.guesses.total = data.total;
    $scope.guesses.right = data.right;
  });
}

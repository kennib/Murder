angular.module('murder', ['murderdata', 'murderstats', 'murdergraph', 'murdermaps']).
  config(function($routeProvider) {
    $routeProvider.
      when('/', {controller:MurderStats, templateUrl:'home.html'}).
      when('/scoreboard', {controller:MurderStats, templateUrl:'scoreboard.html'}).
      when('/murdergraph', {controller:MurderStats, templateUrl:'murdergraph.html'}).
      when('/graph', {redirectTo:'/murdergraph'}).
      when('/murdermap', {controller:MurderStats, templateUrl:'murdermap.html'}).
      when('/map', {redirectTo:'/murdermap'}).
      when('/lodgekill', {controller:LodgeCtrl, templateUrl:'lodgekill.html'}).
      when('/lodge', {redirectTo:'/lodgekill'}).
      when('/verifykills', {controller:VerifyCtrl, templateUrl:'verifykills.html'}).
      when('/verify', {redirectTo:'/verifykills'}).
      otherwise({redirectTo:'/'});
  });
  

function MurderStats($scope, murders, players) {
  $scope.players = players;
  $scope.murders = murders;
  $scope.aliveCount = function() {
    return $scope.players.length - $scope.murders.length;
  };
};

function LodgeCtrl($scope, $filter,
                   UnverifiedMurder, players) {
  $scope.players = players;
  $scope.killIcons = killIcons;

  // List of lodged kills
  $scope.lodgedKills = [];

  // Datetime selector
  $scope.datetime = new Date();
  $scope.date = $filter('date')($scope.datetime, 'yyyy-MM-dd');
  $scope.time = $filter('date')($scope.datetime, 'HH:mm');

  // Function to update datetime
  $scope.updateDatetime = function() {
    $scope.datetime = new Date($scope.date+' '+$scope.time);
  };

  $scope.submitKill = function() {
    new UnverifiedMurder().save({
      // Kill data
      datetime: $scope.datetime.valueOf(),
      murderer: $scope.murderer,
      victim: $scope.victim,
      loc: $scope.loc,
      latlng: new Parse.GeoPoint({
        latitude: $scope.murderMarker.getPosition().lat(),
        longitude: $scope.murderMarker.getPosition().lng()
      }),
      // Extra kill data
      killIcon: $scope.killIcon,
      witnesses: $scope.witnesses,
      activity: $scope.activity,
      comment: $scope.comment
    }, {
      success: function(kill) {
        console.log("Kill lodged");
        $scope.lodgedKills.push(kill.attributes);
        $scope.$apply();
      },
      error: function(murder, error) {
        console.log("Error, did not lodge Kill:", error);
      }
    });
  };

  $scope.returnHome = function() {
    $scope.submitKill();
    location = '#/';
  };
};

VerifyCtrl = function($scope, Murder,
                      UnverifiedMurder, unverifiedMurders) {
  $scope.unverifiedMurders = unverifiedMurders;

  // Display if the user is logged in
  var user = Parse.User.current(); 
  if (user && user.get("username") == "ncss")
    $scope.loggedin = true;

  // Function to log in
  $scope.login = function(username, password) {
    Parse.User.logIn(username, password, {
      success: function(user) {
        console.log("Logged in");
        $scope.loggedin = true;
        $scope.$apply();
      },
      error: function(user, error) {
        console.log(error);
        $scope.loggedin = false;
      }
    });
  }

  $scope.verify = function(kill) {
    // Get the unverified murder
    var query = new Parse.Query(UnverifiedMurder);
    query.get(kill.objectId, {
      success: function(ukill) {
        console.log("Fetched unverified kill", ukill);
        
        // Get equivalent verified murder 
        var query = new Parse.Query(Murder);
        query.equalTo('murderer', ukill.attributes.murderer);
        query.equalTo('victim', ukill.attributes.victim);
        query.find({
          success: function(vkills) {
            if (vkills[0] != undefined) {
              var vkill = vkills[0];
              console.log("Found equivalent verified kill", vkill);

              // Update kill
              vkill.attributes = ukill.attributes;
            } else {
              // No previous equivalent verified kill
              // use the kill just verified
              vkill = new Murder();
              
              // Increment murderer's kill tally
              var query = new Parse.Query(Player);
              query.equalTo('name', ukill.attributes.murderer);
              query.first({
                success: function(player) {
                  player.increment('kills');
                  player.save();
                },
              });

              // Set victim as not alive
              var query = new Parse.Query(Player);
              query.equalTo('name', ukill.attributes.victim);
              query.first({
                success: function(player) {
                  player.set('alive', false);
                  player.save();
                }
              });

           }

            // Save the unverified murder to the
            // verified murder list
            vkill.save(ukill.attributes, {
              success: function(vkill) {
                console.log("Verified the kill", vkill);
                ukill.destroy();
                kill.verified = 'verified';
                $scope.$apply();
              },
              error: function(vkill, error) {
                console.log(error);
              }
            });
          },
          error: function(vkill, error) {
            console.log(error);
          }
        });
      },
      error: function(ukill, error) {
        console.log(error);
      }
    });
  };
};
